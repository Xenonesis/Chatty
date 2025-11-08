"""
Intelligence models for storing AI-learned patterns from user interactions.
"""
from django.db import models
from django.utils import timezone
import json


class UserIntelligence(models.Model):
    """
    Stores learned intelligence about user behavior and preferences.
    Each user gets their own intelligence profile.
    """
    CATEGORY_CHOICES = [
        ('preference', 'User Preference'),
        ('pattern', 'Behavior Pattern'),
        ('topic', 'Topic Interest'),
        ('style', 'Communication Style'),
        ('context', 'Contextual Learning'),
    ]
    
    user_id = models.CharField(max_length=255, db_index=True)  # User identifier
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, db_index=True)
    key = models.CharField(max_length=255)  # e.g., "preferred_response_length", "favorite_topics"
    value = models.JSONField()  # Flexible storage for any learned data
    confidence = models.FloatField(default=0.5)  # 0.0 to 1.0, how confident the AI is
    learned_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    source_conversations = models.JSONField(default=list)  # IDs of conversations this was learned from
    metadata = models.JSONField(default=dict)  # Additional context
    
    class Meta:
        ordering = ['-confidence', '-updated_at']
        indexes = [
            models.Index(fields=['user_id', 'category']),
            models.Index(fields=['user_id', 'key']),
            models.Index(fields=['-confidence']),
        ]
        unique_together = ['user_id', 'category', 'key']
    
    def __str__(self):
        return f"{self.user_id} - {self.category}: {self.key}"
    
    def update_confidence(self, adjustment):
        """Adjust confidence level based on new evidence."""
        self.confidence = max(0.0, min(1.0, self.confidence + adjustment))
        self.updated_at = timezone.now()
        self.save()


class ConversationInsight(models.Model):
    """
    Stores insights extracted from individual conversations.
    """
    conversation_id = models.IntegerField(unique=True, db_index=True)
    user_id = models.CharField(max_length=255, db_index=True)
    
    # Behavioral insights
    avg_message_length = models.IntegerField(default=0)
    response_time_pattern = models.JSONField(default=dict)  # Time of day preferences
    question_types = models.JSONField(default=list)  # Types of questions asked
    topics_discussed = models.JSONField(default=list)
    sentiment_pattern = models.JSONField(default=dict)  # positive, neutral, negative counts
    
    # Interaction patterns
    conversation_length = models.IntegerField(default=0)  # Number of messages
    session_duration = models.FloatField(default=0.0)  # In seconds
    follow_up_questions = models.IntegerField(default=0)
    clarification_requests = models.IntegerField(default=0)
    
    # Preferences detected
    prefers_detailed_responses = models.BooleanField(null=True)
    prefers_code_examples = models.BooleanField(null=True)
    prefers_step_by_step = models.BooleanField(null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user_id', '-created_at']),
        ]
    
    def __str__(self):
        return f"Insights for conversation {self.conversation_id}"


class LearningEvent(models.Model):
    """
    Tracks specific learning events for audit and improvement.
    """
    EVENT_TYPES = [
        ('pattern_detected', 'Pattern Detected'),
        ('preference_learned', 'Preference Learned'),
        ('behavior_changed', 'Behavior Changed'),
        ('insight_generated', 'Insight Generated'),
    ]
    
    user_id = models.CharField(max_length=255, db_index=True)
    event_type = models.CharField(max_length=30, choices=EVENT_TYPES)
    description = models.TextField()
    data = models.JSONField(default=dict)
    confidence = models.FloatField(default=0.5)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user_id', '-timestamp']),
            models.Index(fields=['event_type']),
        ]
    
    def __str__(self):
        return f"{self.event_type} - {self.user_id} at {self.timestamp}"
