"""
Database models for the chat application.
"""
from django.db import models
from django.utils import timezone
from .intelligence_models import UserIntelligence, ConversationInsight, LearningEvent


class Conversation(models.Model):
    """
    Model representing a conversation session between user and AI.
    """
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('ended', 'Ended'),
    ]
    
    user_id = models.CharField(max_length=255, default='default_user', db_index=True)
    title = models.CharField(max_length=255, blank=True, null=True)
    start_timestamp = models.DateTimeField(auto_now_add=True)
    end_timestamp = models.DateTimeField(blank=True, null=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')
    ai_summary = models.TextField(blank=True, null=True)
    metadata = models.JSONField(default=dict, blank=True)
    
    class Meta:
        ordering = ['-start_timestamp']
        indexes = [
            models.Index(fields=['-start_timestamp']),
            models.Index(fields=['status']),
            models.Index(fields=['user_id', '-start_timestamp']),
        ]
    
    def __str__(self):
        return f"Conversation {self.id}: {self.title or 'Untitled'}"
    
    def get_duration(self):
        """Calculate conversation duration in seconds."""
        if self.end_timestamp:
            return (self.end_timestamp - self.start_timestamp).total_seconds()
        return (timezone.now() - self.start_timestamp).total_seconds()
    
    def get_message_count(self):
        """Get total number of messages in this conversation."""
        return self.messages.count()


class Message(models.Model):
    """
    Model representing a single message in a conversation.
    """
    SENDER_CHOICES = [
        ('user', 'User'),
        ('ai', 'AI'),
    ]
    
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    content = models.TextField()
    sender = models.CharField(max_length=10, choices=SENDER_CHOICES)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    # New fields for reactions and bookmarking
    reactions = models.JSONField(default=dict, blank=True)  # {'thumbs_up': 5, 'heart': 2, etc.}
    is_bookmarked = models.BooleanField(default=False)
    bookmarked_at = models.DateTimeField(blank=True, null=True)
    
    # New field for threading/branching
    parent_message = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='replies'
    )
    
    class Meta:
        ordering = ['timestamp']
        indexes = [
            models.Index(fields=['conversation', 'timestamp']),
            models.Index(fields=['sender']),
            models.Index(fields=['is_bookmarked']),
        ]
    
    def __str__(self):
        return f"{self.sender}: {self.content[:50]}"
