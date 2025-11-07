"""
API views for chat functionality.
"""
from rest_framework import status, generics
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Q

from .models import Conversation, Message
from .serializers import (
    ConversationListSerializer,
    ConversationDetailSerializer,
    ConversationCreateSerializer,
    MessageSerializer,
    MessageCreateSerializer
)
from .ai_service import AIService


class ConversationListView(generics.ListCreateAPIView):
    """
    GET: List all conversations with basic metadata
    POST: Create a new conversation
    """
    queryset = Conversation.objects.all()
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ConversationCreateSerializer
        return ConversationListSerializer
    
    def perform_create(self, serializer):
        """Create a new conversation with auto-generated title if needed."""
        conversation = serializer.save()
        if not conversation.title:
            conversation.title = f"Conversation {conversation.id}"
            conversation.save()


class ConversationDetailView(generics.RetrieveAPIView):
    """
    GET: Retrieve detailed conversation including all messages
    """
    queryset = Conversation.objects.all()
    serializer_class = ConversationDetailSerializer


@api_view(['POST'])
def send_message(request):
    """
    POST: Send a message and get AI response
    
    Request body:
    {
        "conversation_id": int,
        "content": str,
        "provider": str (optional)
    }
    
    Returns:
    {
        "user_message": Message,
        "ai_message": Message
    }
    """
    # Debug logging
    print(f"Received request data: {request.data}")
    
    conversation_id = request.data.get('conversation_id')
    content = request.data.get('content')
    provider = request.data.get('provider')
    
    print(f"Parsed - conversation_id: {conversation_id}, content: '{content}', provider: {provider}")
    
    if conversation_id is None or not content or not str(content).strip():
        return Response(
            {"error": "conversation_id and content are required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        conversation = Conversation.objects.get(id=conversation_id)
    except Conversation.DoesNotExist:
        return Response(
            {"error": "Conversation not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    
    if conversation.status != 'active':
        return Response(
            {"error": "Cannot send messages to an ended conversation"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Create user message
    user_message = Message.objects.create(
        conversation=conversation,
        content=content,
        sender='user'
    )
    
    # Prepare conversation history for AI
    previous_messages = Message.objects.filter(conversation=conversation).order_by('timestamp')
    messages_for_ai = []
    
    # Add system message
    messages_for_ai.append({
        "role": "system",
        "content": "You are a helpful, friendly AI assistant. Provide clear and concise responses."
    })
    
    # Add conversation history
    for msg in previous_messages:
        messages_for_ai.append({
            "role": "user" if msg.sender == "user" else "assistant",
            "content": msg.content
        })
    
    # Generate AI response
    ai_service = AIService(provider=provider)
    ai_response = ai_service.generate_response(messages_for_ai)
    
    # Create AI message
    ai_message = Message.objects.create(
        conversation=conversation,
        content=ai_response,
        sender='ai'
    )
    
    return Response({
        "user_message": MessageSerializer(user_message).data,
        "ai_message": MessageSerializer(ai_message).data
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
def end_conversation(request, pk):
    """
    POST: End a conversation and generate summary
    
    Returns:
    {
        "conversation": ConversationDetail,
        "summary": str
    }
    """
    try:
        conversation = Conversation.objects.get(id=pk)
    except Conversation.DoesNotExist:
        return Response(
            {"error": "Conversation not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    
    if conversation.status == 'ended':
        return Response(
            {"error": "Conversation is already ended"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Update conversation status
    conversation.status = 'ended'
    conversation.end_timestamp = timezone.now()
    
    # Generate summary
    messages = Message.objects.filter(conversation=conversation).order_by('timestamp')
    conversation_history = [
        {"sender": msg.sender, "content": msg.content}
        for msg in messages
    ]
    
    ai_service = AIService()
    summary = ai_service.generate_summary(conversation_history)
    conversation.ai_summary = summary
    
    # Extract and store metadata
    topics = ai_service.extract_key_topics(conversation_history)
    conversation.metadata = {
        **conversation.metadata,
        'topics': topics,
        'message_count': len(conversation_history),
        'duration_seconds': conversation.get_duration()
    }
    
    conversation.save()
    
    return Response({
        "conversation": ConversationDetailSerializer(conversation).data,
        "summary": summary
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
def query_intelligence(request):
    """
    POST: Query AI about past conversations
    
    Request body:
    {
        "query": str,
        "search_keywords": str (optional)
    }
    
    Returns:
    {
        "answer": str,
        "relevant_conversations": List[Conversation]
    }
    """
    query = request.data.get('query')
    search_keywords = request.data.get('search_keywords', '')
    
    if not query:
        return Response(
            {"error": "query is required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Get relevant conversations
    conversations = Conversation.objects.filter(status='ended')
    
    # Apply keyword filter if provided
    if search_keywords:
        conversations = conversations.filter(
            Q(title__icontains=search_keywords) |
            Q(ai_summary__icontains=search_keywords) |
            Q(messages__content__icontains=search_keywords)
        ).distinct()
    
    # Prepare conversation data for AI
    conversations_data = []
    for conv in conversations[:10]:  # Limit to 10 most recent
        messages = Message.objects.filter(conversation=conv).order_by('timestamp')
        conversations_data.append({
            'id': conv.id,
            'title': conv.title,
            'start_timestamp': conv.start_timestamp.isoformat(),
            'ai_summary': conv.ai_summary,
            'messages': [
                {'sender': msg.sender, 'content': msg.content}
                for msg in messages
            ]
        })
    
    # Get AI response
    ai_service = AIService()
    answer = ai_service.query_conversations(query, conversations_data)
    
    return Response({
        "answer": answer,
        "relevant_conversations": ConversationListSerializer(conversations[:5], many=True).data
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
def search_conversations(request):
    """
    GET: Search conversations by keywords or semantic meaning
    
    Query params:
    - q: search query
    - semantic: use semantic search (true/false)
    
    Returns:
    {
        "results": List[Conversation]
    }
    """
    query = request.GET.get('q', '')
    use_semantic = request.GET.get('semantic', 'false').lower() == 'true'
    
    if not query:
        return Response(
            {"error": "query parameter 'q' is required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    conversations = Conversation.objects.all()
    
    if use_semantic:
        # Semantic search using AI
        conversations_data = []
        for conv in conversations:
            messages = Message.objects.filter(conversation=conv).order_by('timestamp')
            conversations_data.append({
                'id': conv.id,
                'title': conv.title,
                'ai_summary': conv.ai_summary,
                'messages': [
                    {'sender': msg.sender, 'content': msg.content}
                    for msg in messages
                ]
            })
        
        ai_service = AIService()
        results = ai_service.semantic_search(query, conversations_data)
        
        # Get conversation objects
        result_ids = [r['id'] for r in results]
        conversations = Conversation.objects.filter(id__in=result_ids)
        
    else:
        # Keyword search
        conversations = conversations.filter(
            Q(title__icontains=query) |
            Q(ai_summary__icontains=query) |
            Q(messages__content__icontains=query)
        ).distinct()
    
    return Response({
        "results": ConversationListSerializer(conversations, many=True).data
    }, status=status.HTTP_200_OK)
