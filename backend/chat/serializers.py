"""
Serializers for chat models.
"""
from rest_framework import serializers
from .models import Conversation, Message


class MessageSerializer(serializers.ModelSerializer):
    """Serializer for Message model."""
    
    class Meta:
        model = Message
        fields = ['id', 'conversation', 'content', 'sender', 'timestamp']
        read_only_fields = ['id', 'timestamp']


class ConversationListSerializer(serializers.ModelSerializer):
    """Serializer for listing conversations with basic metadata."""
    message_count = serializers.IntegerField(source='get_message_count', read_only=True)
    duration = serializers.FloatField(source='get_duration', read_only=True)
    
    class Meta:
        model = Conversation
        fields = [
            'id', 'title', 'start_timestamp', 'end_timestamp', 
            'status', 'message_count', 'duration', 'metadata'
        ]
        read_only_fields = ['id', 'start_timestamp', 'end_timestamp']


class ConversationDetailSerializer(serializers.ModelSerializer):
    """Serializer for detailed conversation view including all messages."""
    messages = MessageSerializer(many=True, read_only=True)
    message_count = serializers.IntegerField(source='get_message_count', read_only=True)
    duration = serializers.FloatField(source='get_duration', read_only=True)
    
    class Meta:
        model = Conversation
        fields = [
            'id', 'title', 'start_timestamp', 'end_timestamp',
            'status', 'ai_summary', 'metadata', 'messages',
            'message_count', 'duration'
        ]
        read_only_fields = ['id', 'start_timestamp', 'end_timestamp', 'ai_summary']


class ConversationCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new conversations."""
    
    class Meta:
        model = Conversation
        fields = ['title', 'metadata']


class MessageCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new messages."""
    
    class Meta:
        model = Message
        fields = ['conversation', 'content', 'sender']
    
    def validate_conversation(self, value):
        """Ensure conversation is active."""
        if value.status != 'active':
            raise serializers.ValidationError("Cannot add messages to an ended conversation.")
        return value
