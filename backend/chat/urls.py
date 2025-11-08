"""
URL patterns for chat API.
"""
from django.urls import path
from . import views
from .views_api_settings import manage_ai_settings, get_configured_providers, fetch_models

urlpatterns = [
    # Conversation endpoints
    path('conversations/', views.ConversationListView.as_view(), name='conversation-list'),
    path('conversations/<int:pk>/', views.ConversationDetailView.as_view(), name='conversation-detail'),
    path('conversations/<int:pk>/end/', views.end_conversation, name='conversation-end'),
    path('conversations/<int:pk>/generate-summary/', views.generate_summary, name='conversation-generate-summary'),
    
    # Message endpoints
    path('messages/send/', views.send_message, name='message-send'),
    
    # Intelligence endpoints
    path('intelligence/query/', views.query_intelligence, name='intelligence-query'),
    path('conversations/search/', views.search_conversations, name='conversation-search'),
    
    # AI Settings endpoint
    path('settings/ai/', manage_ai_settings, name='ai-settings'),
    path('settings/ai/providers/', get_configured_providers, name='configured-providers'),
    path('settings/ai/fetch-models/', fetch_models, name='fetch-models'),
]
