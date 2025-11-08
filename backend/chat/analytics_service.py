"""
Service for conversation analytics and trends.
"""
from datetime import datetime, timedelta
from django.db.models import Count, Avg, Q, Sum
from django.db.models.functions import TruncDate, TruncHour
from .models import Conversation, Message


class AnalyticsService:
    """Service for generating conversation analytics and trends."""
    
    @staticmethod
    def get_conversation_trends(days: int = 30) -> dict:
        """
        Get conversation trends over time.
        
        Args:
            days: Number of days to analyze
            
        Returns:
            dict: Analytics data including trends, stats, and insights
        """
        start_date = datetime.now() - timedelta(days=days)
        
        # Daily conversation counts
        daily_conversations = (
            Conversation.objects
            .filter(start_timestamp__gte=start_date)
            .annotate(date=TruncDate('start_timestamp'))
            .values('date')
            .annotate(count=Count('id'))
            .order_by('date')
        )
        
        # Daily message counts
        daily_messages = (
            Message.objects
            .filter(timestamp__gte=start_date)
            .annotate(date=TruncDate('timestamp'))
            .values('date')
            .annotate(count=Count('id'))
            .order_by('date')
        )
        
        # Hourly activity pattern (last 7 days)
        week_ago = datetime.now() - timedelta(days=7)
        hourly_activity = (
            Message.objects
            .filter(timestamp__gte=week_ago)
            .annotate(hour=TruncHour('timestamp'))
            .values('hour')
            .annotate(count=Count('id'))
            .order_by('hour')
        )
        
        # Message distribution by sender
        sender_distribution = (
            Message.objects
            .filter(timestamp__gte=start_date)
            .values('sender')
            .annotate(count=Count('id'))
        )
        
        # Average messages per conversation
        conversations = Conversation.objects.filter(start_timestamp__gte=start_date)
        total_conversations = conversations.count()
        total_messages = Message.objects.filter(
            conversation__in=conversations
        ).count()
        
        avg_messages_per_conversation = (
            total_messages / total_conversations if total_conversations > 0 else 0
        )
        
        # Conversation status distribution
        status_distribution = (
            Conversation.objects
            .filter(start_timestamp__gte=start_date)
            .values('status')
            .annotate(count=Count('id'))
        )
        
        # Most active days
        most_active_days = (
            Message.objects
            .filter(timestamp__gte=start_date)
            .annotate(date=TruncDate('timestamp'))
            .values('date')
            .annotate(count=Count('id'))
            .order_by('-count')[:5]
        )
        
        # Bookmarked messages count
        bookmarked_count = Message.objects.filter(
            is_bookmarked=True,
            timestamp__gte=start_date
        ).count()
        
        # Average conversation duration (for ended conversations)
        ended_conversations = conversations.filter(
            status='ended',
            end_timestamp__isnull=False
        )
        
        avg_duration_seconds = 0
        if ended_conversations.exists():
            durations = [conv.get_duration() for conv in ended_conversations]
            avg_duration_seconds = sum(durations) / len(durations)
        
        return {
            'period': {
                'start_date': start_date.isoformat(),
                'end_date': datetime.now().isoformat(),
                'days': days,
            },
            'summary': {
                'total_conversations': total_conversations,
                'total_messages': total_messages,
                'avg_messages_per_conversation': round(avg_messages_per_conversation, 2),
                'avg_conversation_duration_seconds': round(avg_duration_seconds, 2),
                'bookmarked_messages': bookmarked_count,
            },
            'trends': {
                'daily_conversations': [
                    {
                        'date': item['date'].isoformat(),
                        'count': item['count']
                    }
                    for item in daily_conversations
                ],
                'daily_messages': [
                    {
                        'date': item['date'].isoformat(),
                        'count': item['count']
                    }
                    for item in daily_messages
                ],
                'hourly_activity': [
                    {
                        'hour': item['hour'].isoformat(),
                        'count': item['count']
                    }
                    for item in hourly_activity
                ],
            },
            'distributions': {
                'by_sender': [
                    {
                        'sender': item['sender'],
                        'count': item['count']
                    }
                    for item in sender_distribution
                ],
                'by_status': [
                    {
                        'status': item['status'],
                        'count': item['count']
                    }
                    for item in status_distribution
                ],
            },
            'insights': {
                'most_active_days': [
                    {
                        'date': item['date'].isoformat(),
                        'count': item['count']
                    }
                    for item in most_active_days
                ],
            }
        }
    
    @staticmethod
    def get_conversation_stats(conversation_id: int) -> dict:
        """Get detailed statistics for a specific conversation."""
        try:
            conversation = Conversation.objects.get(id=conversation_id)
            messages = Message.objects.filter(conversation=conversation)
            
            user_messages = messages.filter(sender='user')
            ai_messages = messages.filter(sender='ai')
            
            # Calculate word counts
            total_user_words = sum(len(msg.content.split()) for msg in user_messages)
            total_ai_words = sum(len(msg.content.split()) for msg in ai_messages)
            
            # Reaction statistics
            total_reactions = {}
            for msg in messages:
                for reaction, count in msg.reactions.items():
                    total_reactions[reaction] = total_reactions.get(reaction, 0) + count
            
            return {
                'conversation_id': conversation_id,
                'title': conversation.title,
                'duration_seconds': conversation.get_duration(),
                'message_counts': {
                    'total': messages.count(),
                    'user': user_messages.count(),
                    'ai': ai_messages.count(),
                },
                'word_counts': {
                    'user': total_user_words,
                    'ai': total_ai_words,
                    'total': total_user_words + total_ai_words,
                },
                'bookmarked_messages': messages.filter(is_bookmarked=True).count(),
                'reactions': total_reactions,
                'status': conversation.status,
            }
        except Conversation.DoesNotExist:
            return None
