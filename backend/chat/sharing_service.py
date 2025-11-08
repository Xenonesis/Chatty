"""
Service for sharing conversations with unique links.
"""
import uuid
from datetime import datetime, timedelta
from django.core.cache import cache
from .models import Conversation, Message


class SharingService:
    """Service for creating shareable conversation links."""
    
    SHARE_CACHE_PREFIX = "shared_conversation:"
    DEFAULT_EXPIRY_DAYS = 7
    
    @staticmethod
    def create_share_link(conversation_id: int, expiry_days: int = DEFAULT_EXPIRY_DAYS) -> dict:
        """
        Create a shareable link for a conversation.
        
        Returns:
            dict: {
                'share_token': str,
                'share_url': str,
                'expires_at': str (ISO format),
            }
        """
        # Generate unique token
        share_token = str(uuid.uuid4())
        
        # Calculate expiry
        expires_at = datetime.now() + timedelta(days=expiry_days)
        
        # Store in cache
        cache_key = f"{SharingService.SHARE_CACHE_PREFIX}{share_token}"
        cache_data = {
            'conversation_id': conversation_id,
            'created_at': datetime.now().isoformat(),
            'expires_at': expires_at.isoformat(),
        }
        
        # Store with TTL (time to live)
        cache.set(cache_key, cache_data, timeout=expiry_days * 24 * 60 * 60)
        
        return {
            'share_token': share_token,
            'share_url': f"/shared/{share_token}",
            'expires_at': expires_at.isoformat(),
        }
    
    @staticmethod
    def get_shared_conversation(share_token: str) -> dict:
        """
        Retrieve a shared conversation by token.
        
        Returns:
            dict: Conversation data or None if not found/expired
        """
        cache_key = f"{SharingService.SHARE_CACHE_PREFIX}{share_token}"
        cache_data = cache.get(cache_key)
        
        if not cache_data:
            return None
        
        conversation_id = cache_data.get('conversation_id')
        
        try:
            conversation = Conversation.objects.get(id=conversation_id)
            messages = Message.objects.filter(conversation=conversation).order_by('timestamp')
            
            return {
                'conversation': {
                    'id': conversation.id,
                    'title': conversation.title,
                    'start_timestamp': conversation.start_timestamp.isoformat(),
                    'end_timestamp': conversation.end_timestamp.isoformat() if conversation.end_timestamp else None,
                    'status': conversation.status,
                    'summary': conversation.ai_summary,
                },
                'messages': [
                    {
                        'id': msg.id,
                        'sender': msg.sender,
                        'content': msg.content,
                        'timestamp': msg.timestamp.isoformat(),
                    }
                    for msg in messages
                ],
                'share_metadata': {
                    'created_at': cache_data.get('created_at'),
                    'expires_at': cache_data.get('expires_at'),
                }
            }
        except Conversation.DoesNotExist:
            return None
    
    @staticmethod
    def revoke_share_link(share_token: str) -> bool:
        """
        Revoke a share link.
        
        Returns:
            bool: True if revoked successfully, False otherwise
        """
        cache_key = f"{SharingService.SHARE_CACHE_PREFIX}{share_token}"
        return cache.delete(cache_key) > 0
