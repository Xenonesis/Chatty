"""
Background tasks for automatic conversation processing.
"""
from django.utils import timezone
from datetime import timedelta
from .models import Conversation, Message
from .ai_service import AIService
from .intelligence_service import IntelligenceService


class BackgroundTaskService:
    """Service for handling background tasks like auto-summarization."""
    
    @staticmethod
    def auto_summarize_conversations():
        """
        Automatically summarize conversations that meet criteria:
        - Active conversations with no activity for 30+ minutes
        - Ended conversations without summaries
        """
        ai_service = AIService()
        
        # Find conversations needing summarization
        thirty_minutes_ago = timezone.now() - timedelta(minutes=30)
        
        # Active conversations with no recent activity
        inactive_conversations = Conversation.objects.filter(
            status='active',
            ai_summary__isnull=True
        ).exclude(
            messages__timestamp__gte=thirty_minutes_ago
        ).distinct()
        
        # Ended conversations without summaries
        ended_without_summary = Conversation.objects.filter(
            status='ended',
            ai_summary__isnull=True
        )
        
        conversations_to_summarize = list(inactive_conversations) + list(ended_without_summary)
        
        for conversation in conversations_to_summarize:
            messages = Message.objects.filter(conversation=conversation).order_by('timestamp')
            
            if not messages.exists() or messages.count() < 2:
                continue
            
            try:
                # Generate summary
                conversation_history = [
                    {"sender": msg.sender, "content": msg.content}
                    for msg in messages
                ]
                
                summary = ai_service.generate_summary(conversation_history)
                conversation.ai_summary = summary
                
                # Extract metadata
                topics = ai_service.extract_key_topics(conversation_history)
                conversation.metadata = {
                    **conversation.metadata,
                    'topics': topics,
                    'message_count': len(conversation_history),
                    'duration_seconds': conversation.get_duration(),
                    'auto_summarized': True,
                    'summarized_at': timezone.now().isoformat()
                }
                
                conversation.save()
                
                # Analyze for intelligence
                intelligence_service = IntelligenceService()
                intelligence_service.analyze_conversation(conversation.id)
                
                print(f"Auto-summarized conversation {conversation.id}")
                
            except Exception as e:
                print(f"Failed to auto-summarize conversation {conversation.id}: {str(e)}")
                continue
    
    @staticmethod
    def cleanup_old_conversations(days: int = 90):
        """
        Archive or cleanup very old conversations.
        
        Args:
            days: Number of days after which to consider conversations old
        """
        cutoff_date = timezone.now() - timedelta(days=days)
        
        old_conversations = Conversation.objects.filter(
            start_timestamp__lt=cutoff_date,
            status='ended'
        )
        
        # Mark as archived in metadata instead of deleting
        for conv in old_conversations:
            conv.metadata['archived'] = True
            conv.metadata['archived_at'] = timezone.now().isoformat()
            conv.save()
    
    @staticmethod
    def analyze_user_patterns():
        """
        Periodically analyze user patterns across all conversations.
        """
        intelligence_service = IntelligenceService()
        intelligence_service.analyze_all_user_conversations()
