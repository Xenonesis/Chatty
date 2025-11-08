"""
API views for intelligence functionality.
"""
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Count, Avg

from .intelligence_service import IntelligenceService
from .intelligence_models import UserIntelligence, ConversationInsight, LearningEvent


@api_view(['POST'])
def analyze_conversation_intelligence(request, conversation_id):
    """
    POST: Analyze a conversation and extract intelligence
    
    Request body:
    {
        "user_id": str (optional, defaults to "default_user")
    }
    
    Returns:
    {
        "insight": ConversationInsight data,
        "learned": List of new intelligence learned
    }
    """
    user_id = request.data.get('user_id', 'default_user')
    
    service = IntelligenceService(user_id=user_id)
    insight = service.analyze_conversation(conversation_id)
    
    if not insight:
        return Response(
            {"error": "Conversation not found or has no messages"},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Get recent learning events for this conversation
    recent_events = LearningEvent.objects.filter(
        user_id=user_id,
        data__source_conversation=conversation_id
    )[:10]
    
    return Response({
        "insight": {
            "conversation_id": insight.conversation_id,
            "avg_message_length": insight.avg_message_length,
            "topics_discussed": insight.topics_discussed,
            "question_types": insight.question_types,
            "conversation_length": insight.conversation_length,
            "session_duration": insight.session_duration,
            "preferences": {
                "detailed_responses": insight.prefers_detailed_responses,
                "code_examples": insight.prefers_code_examples,
                "step_by_step": insight.prefers_step_by_step,
            }
        },
        "learned": [
            {
                "event_type": event.event_type,
                "description": event.description,
                "confidence": event.confidence,
                "timestamp": event.timestamp.isoformat()
            }
            for event in recent_events
        ]
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
def get_user_intelligence(request):
    """
    GET: Get complete intelligence profile for a user
    
    Query params:
    - user_id: str (optional, defaults to "default_user")
    
    Returns:
    {
        "profile": User intelligence profile,
        "stats": Statistics about learned intelligence
    }
    """
    user_id = request.GET.get('user_id', 'default_user')
    
    service = IntelligenceService(user_id=user_id)
    profile = service.get_user_profile()
    
    # Get statistics
    intelligence_count = UserIntelligence.objects.filter(user_id=user_id).count()
    high_confidence_count = UserIntelligence.objects.filter(
        user_id=user_id,
        confidence__gte=0.7
    ).count()
    
    insights_count = ConversationInsight.objects.filter(user_id=user_id).count()
    learning_events_count = LearningEvent.objects.filter(user_id=user_id).count()
    
    return Response({
        "profile": profile,
        "stats": {
            "total_intelligence_records": intelligence_count,
            "high_confidence_records": high_confidence_count,
            "conversations_analyzed": insights_count,
            "learning_events": learning_events_count
        }
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
def get_personalized_context(request):
    """
    GET: Get personalized context string for AI prompts
    
    Query params:
    - user_id: str (optional, defaults to "default_user")
    
    Returns:
    {
        "context": str,
        "confidence": float
    }
    """
    user_id = request.GET.get('user_id', 'default_user')
    
    service = IntelligenceService(user_id=user_id)
    context = service.get_personalized_context()
    
    # Calculate average confidence
    avg_confidence = UserIntelligence.objects.filter(
        user_id=user_id
    ).aggregate(avg=Avg('confidence'))['avg'] or 0.0
    
    return Response({
        "context": context,
        "confidence": round(avg_confidence, 2)
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
def get_learning_history(request):
    """
    GET: Get learning event history
    
    Query params:
    - user_id: str (optional, defaults to "default_user")
    - limit: int (optional, defaults to 50)
    - event_type: str (optional, filter by event type)
    
    Returns:
    {
        "events": List of learning events
    }
    """
    user_id = request.GET.get('user_id', 'default_user')
    limit = int(request.GET.get('limit', 50))
    event_type = request.GET.get('event_type')
    
    events = LearningEvent.objects.filter(user_id=user_id)
    
    if event_type:
        events = events.filter(event_type=event_type)
    
    events = events[:limit]
    
    return Response({
        "events": [
            {
                "id": event.id,
                "event_type": event.event_type,
                "description": event.description,
                "data": event.data,
                "confidence": event.confidence,
                "timestamp": event.timestamp.isoformat()
            }
            for event in events
        ]
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
def analyze_all_conversations(request):
    """
    POST: Analyze all user conversations to build intelligence
    
    Request body:
    {
        "user_id": str (optional, defaults to "default_user")
    }
    
    Returns:
    {
        "analyzed": int,
        "intelligence_updated": bool
    }
    """
    user_id = request.data.get('user_id', 'default_user')
    
    service = IntelligenceService(user_id=user_id)
    service.analyze_all_user_conversations()
    
    return Response({
        "analyzed": True,
        "intelligence_updated": True,
        "message": "All conversations analyzed and intelligence updated"
    }, status=status.HTTP_200_OK)


@api_view(['DELETE'])
def reset_user_intelligence(request):
    """
    DELETE: Reset all intelligence for a user
    
    Request body:
    {
        "user_id": str (optional, defaults to "default_user")
    }
    
    Returns:
    {
        "deleted": int
    }
    """
    user_id = request.data.get('user_id', 'default_user')
    
    # Delete all intelligence records
    intelligence_deleted = UserIntelligence.objects.filter(user_id=user_id).delete()[0]
    insights_deleted = ConversationInsight.objects.filter(user_id=user_id).delete()[0]
    events_deleted = LearningEvent.objects.filter(user_id=user_id).delete()[0]
    
    return Response({
        "deleted": {
            "intelligence_records": intelligence_deleted,
            "insights": insights_deleted,
            "learning_events": events_deleted
        }
    }, status=status.HTTP_200_OK)
