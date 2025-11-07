"""
Admin configuration for chat models.
"""
from django.contrib import admin
from .models import Conversation, Message


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    """Admin interface for Conversation model."""
    list_display = ['id', 'title', 'status', 'start_timestamp', 'end_timestamp', 'message_count']
    list_filter = ['status', 'start_timestamp']
    search_fields = ['title', 'ai_summary']
    readonly_fields = ['start_timestamp', 'end_timestamp']
    
    def message_count(self, obj):
        return obj.get_message_count()
    message_count.short_description = 'Messages'


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    """Admin interface for Message model."""
    list_display = ['id', 'conversation', 'sender', 'timestamp', 'content_preview']
    list_filter = ['sender', 'timestamp']
    search_fields = ['content']
    readonly_fields = ['timestamp']
    
    def content_preview(self, obj):
        return obj.content[:100] + '...' if len(obj.content) > 100 else obj.content
    content_preview.short_description = 'Content'
