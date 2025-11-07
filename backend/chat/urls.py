"""
URL patterns for chat API.
"""
from django.urls import path
from . import views

urlpatterns = [
    # Conversation endpoints
    path('conversations/', views.ConversationListView.as_view(), name='conversation-list'),
    path('conversations/<int:pk>/', views.ConversationDetailView.as_view(), name='conversation-detail'),
    path('conversations/<int:pk>/end/', views.end_conversation, name='conversation-end'),
    
    # Message endpoints
    path('messages/send/', views.send_message, name='message-send'),
    
    # Intelligence endpoints
    path('intelligence/query/', views.query_intelligence, name='intelligence-query'),
    path('conversations/search/', views.search_conversations, name='conversation-search'),
]
