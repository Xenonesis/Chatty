"""
API views for chat functionality.
"""
from rest_framework import status, generics
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Q
from django.conf import settings
from django.http import HttpResponse

from .models import Conversation, Message
from .serializers import (
    ConversationListSerializer,
    ConversationDetailSerializer,
    ConversationCreateSerializer,
    MessageSerializer,
    MessageCreateSerializer
)
from .ai_service import AIService
from .intelligence_service import IntelligenceService
from .export_service import ExportService
from .sharing_service import SharingService
from .analytics_service import AnalyticsService


class ConversationListView(generics.ListCreateAPIView):
    """
    GET: List all conversations with basic metadata
    POST: Create a new conversation
    """
    
    def get_queryset(self):
        """Filter conversations by user_id."""
        user_id = self.request.query_params.get('user_id', 'default_user')
        return Conversation.objects.filter(user_id=user_id)
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ConversationCreateSerializer
        return ConversationListSerializer
    
    def perform_create(self, serializer):
        """Create a new conversation with auto-generated title if needed."""
        user_id = self.request.data.get('user_id', 'default_user')
        conversation = serializer.save(user_id=user_id)
        if not conversation.title:
            conversation.title = f"Conversation {conversation.id}"
            conversation.save()


class ConversationDetailView(generics.RetrieveDestroyAPIView):
    """
    GET: Retrieve detailed conversation including all messages
    DELETE: Delete a conversation and all its messages
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
    model = request.data.get('model')  # Get user's selected model
    
    print(f"Parsed - conversation_id: {conversation_id}, content: '{content}', provider: {provider}, model: {model}")
    
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
    
    # Verify user message was saved
    if not user_message.id:
        return Response(
            {"error": "Failed to save user message to database"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    print(f"User message saved with ID: {user_message.id}")
    
    # Get user intelligence for personalization
    user_id = request.data.get('user_id', 'default_user')
    intelligence_service = IntelligenceService(user_id=user_id)
    personalized_context = intelligence_service.get_personalized_context()
    
    # Prepare conversation history for AI
    previous_messages = Message.objects.filter(conversation=conversation).order_by('timestamp')
    messages_for_ai = []
    
    # Add system message with personalized context
    system_content = "You are a helpful, friendly AI assistant. Provide clear and concise responses."
    if personalized_context:
        system_content += f"\n\nUser context: {personalized_context}"
    
    messages_for_ai.append({
        "role": "system",
        "content": system_content
    })
    
    # Add conversation history
    for msg in previous_messages:
        messages_for_ai.append({
            "role": "user" if msg.sender == "user" else "assistant",
            "content": msg.content
        })
    
    # Generate AI response with error handling
    try:
        # Debug: Print current settings
        print(f"Provider: {provider}, Model: {model}")
        print(f"OPENROUTER_API_KEY in settings: {hasattr(settings, 'OPENROUTER_API_KEY')}")
        if hasattr(settings, 'OPENROUTER_API_KEY'):
            print(f"OPENROUTER_API_KEY value: {settings.OPENROUTER_API_KEY[:10] if settings.OPENROUTER_API_KEY else 'None'}...")
        
        ai_service = AIService(provider=provider, model=model)
        ai_response = ai_service.generate_response(messages_for_ai)
    except Exception as e:
        print(f"AI service error: {str(e)}")
        import traceback
        traceback.print_exc()
        # Still save a fallback AI message to maintain conversation integrity
        ai_response = f"I apologize, but I encountered an error generating a response: {str(e)}"
    
    # Create AI message
    ai_message = Message.objects.create(
        conversation=conversation,
        content=ai_response,
        sender='ai'
    )
    
    # Verify AI message was saved
    if not ai_message.id:
        return Response(
            {"error": "Failed to save AI message to database"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    print(f"AI message saved with ID: {ai_message.id}")
    
    # Double-check messages were persisted
    saved_user_message = Message.objects.filter(id=user_message.id).first()
    saved_ai_message = Message.objects.filter(id=ai_message.id).first()
    
    if not saved_user_message or not saved_ai_message:
        return Response(
            {"error": "Messages were not properly persisted to database"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    # Analyze conversation for intelligence (async in background would be better)
    # Only analyze every 3 messages to reduce overhead
    if conversation.get_message_count() % 3 == 0:
        try:
            intelligence_service.analyze_conversation(conversation.id)
        except Exception as e:
            print(f"Intelligence analysis error: {str(e)}")
            # Don't fail the request if intelligence fails
    
    return Response({
        "user_message": MessageSerializer(user_message).data,
        "ai_message": MessageSerializer(ai_message).data
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
def generate_summary(request, pk):
    """
    POST: Generate a summary for an active conversation without ending it
    
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
    
    # Generate summary
    messages = Message.objects.filter(conversation=conversation).order_by('timestamp')
    
    if not messages.exists():
        return Response(
            {"error": "Cannot generate summary for conversation with no messages"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
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
    POST: Query AI about past conversations with semantic search
    
    Request body:
    {
        "query": str,
        "search_keywords": str (optional),
        "user_id": str (optional)
    }
    
    Returns:
    {
        "answer": str,
        "relevant_conversations": List[Conversation]
    }
    """
    from .vector_search_service import VectorSearchService
    
    query = request.data.get('query')
    search_keywords = request.data.get('search_keywords', '')
    user_id = request.data.get('user_id', 'default_user')
    
    if not query:
        return Response(
            {"error": "query is required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Use vector search for semantic matching
    vector_search = VectorSearchService()
    search_results = vector_search.semantic_search(query, user_id=user_id, limit=10)
    
    # Apply additional keyword filter if provided
    if search_keywords:
        keyword_lower = search_keywords.lower()
        search_results = [
            r for r in search_results
            if (r['title'] and keyword_lower in r['title'].lower()) or
               (r['ai_summary'] and keyword_lower in r['ai_summary'].lower())
        ]
    
    # Get conversation objects
    conversation_ids = [r['id'] for r in search_results[:10]]
    conversations = Conversation.objects.filter(id__in=conversation_ids)
    
    # Prepare conversation data for AI
    conversations_data = []
    for conv in conversations:
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
    - user_id: user ID to filter conversations (optional)
    
    Returns:
    {
        "results": List[Conversation]
    }
    """
    from .vector_search_service import VectorSearchService
    
    query = request.GET.get('q', '')
    use_semantic = request.GET.get('semantic', 'false').lower() == 'true'
    user_id = request.GET.get('user_id', 'default_user')
    
    if not query:
        return Response(
            {"error": "query parameter 'q' is required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if use_semantic:
        # Use vector-based semantic search
        vector_search = VectorSearchService()
        search_results = vector_search.semantic_search(query, user_id=user_id, limit=20)
        
        # Get conversation objects
        result_ids = [r['id'] for r in search_results]
        conversations = Conversation.objects.filter(id__in=result_ids)
        
        # Preserve order from search results
        conversations_dict = {conv.id: conv for conv in conversations}
        conversations = [conversations_dict[rid] for rid in result_ids if rid in conversations_dict]
        
    else:
        # Keyword search
        conversations = Conversation.objects.filter(user_id=user_id).filter(
            Q(title__icontains=query) |
            Q(ai_summary__icontains=query) |
            Q(messages__content__icontains=query)
        ).distinct()
    
    return Response({
        "results": ConversationListSerializer(conversations, many=True).data
    }, status=status.HTTP_200_OK)


def export_conversation(request, pk, format):
    """
    GET: Export conversation in specified format (json, markdown, pdf)
    
    Returns: File download
    """
    # Don't use @api_view decorator to avoid REST Framework's content negotiation
    # which only supports JSON by default
    
    if request.method != 'GET':
        return HttpResponse(
            '{"error": "Method not allowed"}',
            status=405,
            content_type='application/json'
        )
    
    try:
        conversation = Conversation.objects.get(id=pk)
    except Conversation.DoesNotExist:
        return HttpResponse(
            '{"error": "Conversation not found"}',
            status=404,
            content_type='application/json'
        )
    
    export_service = ExportService()
    
    if format == 'json':
        content = export_service.export_to_json(conversation)
        response = HttpResponse(content, content_type='application/json')
        response['Content-Disposition'] = f'attachment; filename="conversation_{pk}.json"'
        return response
    
    elif format == 'markdown':
        content = export_service.export_to_markdown(conversation)
        response = HttpResponse(content, content_type='text/markdown')
        response['Content-Disposition'] = f'attachment; filename="conversation_{pk}.md"'
        return response
    
    elif format == 'pdf':
        try:
            pdf_buffer = export_service.export_to_pdf(conversation)
            response = HttpResponse(pdf_buffer.getvalue(), content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="conversation_{pk}.pdf"'
            return response
        except Exception as e:
            return HttpResponse(
                f'{{"error": "Failed to generate PDF: {str(e)}"}}',
                status=500,
                content_type='application/json'
            )
    
    elif format == 'md':
        # Support 'md' as an alias for 'markdown'
        content = export_service.export_to_markdown(conversation)
        response = HttpResponse(content, content_type='text/markdown')
        response['Content-Disposition'] = f'attachment; filename="conversation_{pk}.md"'
        return response
    
    else:
        return HttpResponse(
            f'{{"error": "Unsupported format: {format}. Use json, markdown, md, or pdf."}}',
            status=400,
            content_type='application/json'
        )


@api_view(['POST'])
def create_share_link(request, pk):
    """
    POST: Create a shareable link for a conversation
    
    Request body:
    {
        "expiry_days": int (optional, default: 7)
    }
    
    Returns:
    {
        "share_token": str,
        "share_url": str,
        "expires_at": str
    }
    """
    try:
        conversation = Conversation.objects.get(id=pk)
    except Conversation.DoesNotExist:
        return Response(
            {"error": "Conversation not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    
    expiry_days = request.data.get('expiry_days', 7)
    
    sharing_service = SharingService()
    share_data = sharing_service.create_share_link(conversation.id, expiry_days)
    
    return Response(share_data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def get_shared_conversation(request, token):
    """
    GET: Retrieve a shared conversation by token
    
    Returns: Conversation data or 404 if not found/expired
    """
    sharing_service = SharingService()
    conversation_data = sharing_service.get_shared_conversation(token)
    
    if not conversation_data:
        return Response(
            {"error": "Shared conversation not found or has expired"},
            status=status.HTTP_404_NOT_FOUND
        )
    
    return Response(conversation_data, status=status.HTTP_200_OK)


@api_view(['POST'])
def toggle_bookmark(request, pk):
    """
    POST: Toggle bookmark status for a message
    
    Returns: Updated message with bookmark status
    """
    try:
        message = Message.objects.get(id=pk)
    except Message.DoesNotExist:
        return Response(
            {"error": "Message not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    
    message.is_bookmarked = not message.is_bookmarked
    if message.is_bookmarked:
        message.bookmarked_at = timezone.now()
    else:
        message.bookmarked_at = None
    message.save()
    
    return Response({
        "message_id": message.id,
        "is_bookmarked": message.is_bookmarked,
        "bookmarked_at": message.bookmarked_at.isoformat() if message.bookmarked_at else None
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
def add_reaction(request, pk):
    """
    POST: Add a reaction to a message
    
    Request body:
    {
        "reaction": str (e.g., "thumbs_up", "heart", "laugh")
    }
    
    Returns: Updated message with reactions
    """
    try:
        message = Message.objects.get(id=pk)
    except Message.DoesNotExist:
        return Response(
            {"error": "Message not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    
    reaction = request.data.get('reaction')
    if not reaction:
        return Response(
            {"error": "reaction is required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Update reaction count
    reactions = message.reactions or {}
    reactions[reaction] = reactions.get(reaction, 0) + 1
    message.reactions = reactions
    message.save()
    
    return Response({
        "message_id": message.id,
        "reactions": message.reactions
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
def reply_to_message(request, pk):
    """
    POST: Create a threaded reply to a message
    
    Request body:
    {
        "content": str,
        "sender": str ("user" or "ai")
    }
    
    Returns: Created reply message
    """
    try:
        parent_message = Message.objects.get(id=pk)
    except Message.DoesNotExist:
        return Response(
            {"error": "Parent message not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    
    content = request.data.get('content')
    sender = request.data.get('sender', 'user')
    
    if not content:
        return Response(
            {"error": "content is required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Create reply message
    reply = Message.objects.create(
        conversation=parent_message.conversation,
        content=content,
        sender=sender,
        parent_message=parent_message
    )
    
    return Response(MessageSerializer(reply).data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def get_analytics_trends(request):
    """
    GET: Get conversation analytics and trends
    
    Query params:
    - days: number of days to analyze (default: 30)
    
    Returns: Analytics data
    """
    days = int(request.GET.get('days', 30))
    
    analytics_service = AnalyticsService()
    trends = analytics_service.get_conversation_trends(days)
    
    return Response(trends, status=status.HTTP_200_OK)


@api_view(['GET'])
def get_conversation_stats(request, pk):
    """
    GET: Get detailed statistics for a specific conversation
    
    Returns: Conversation statistics
    """
    analytics_service = AnalyticsService()
    stats = analytics_service.get_conversation_stats(pk)
    
    if not stats:
        return Response(
            {"error": "Conversation not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    
    return Response(stats, status=status.HTTP_200_OK)
