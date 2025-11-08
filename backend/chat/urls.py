"""
URL patterns for chat API.
"""
from django.urls import path
from . import views
from .views_api_settings import manage_ai_settings, get_configured_providers, fetch_models
from . import intelligence_views

urlpatterns = [
    # Conversation endpoints
    path('conversations/', views.ConversationListView.as_view(), name='conversation-list'),
    path('conversations/<int:pk>/', views.ConversationDetailView.as_view(), name='conversation-detail'),
    path('conversations/<int:pk>/end/', views.end_conversation, name='conversation-end'),
    path('conversations/<int:pk>/generate-summary/', views.generate_summary, name='conversation-generate-summary'),
    
    # Message endpoints
    path('messages/send/', views.send_message, name='message-send'),
    
    # Intelligence endpoints (legacy)
    path('intelligence/query/', views.query_intelligence, name='intelligence-query'),
    path('conversations/search/', views.search_conversations, name='conversation-search'),
    
    # User Intelligence endpoints (new)
    path('intelligence/user/', intelligence_views.get_user_intelligence, name='user-intelligence'),
    path('intelligence/context/', intelligence_views.get_personalized_context, name='personalized-context'),
    path('intelligence/history/', intelligence_views.get_learning_history, name='learning-history'),
    path('intelligence/analyze/<int:conversation_id>/', intelligence_views.analyze_conversation_intelligence, name='analyze-conversation'),
    path('intelligence/analyze-all/', intelligence_views.analyze_all_conversations, name='analyze-all'),
    path('intelligence/reset/', intelligence_views.reset_user_intelligence, name='reset-intelligence'),
    
    # AI Settings endpoint
    path('settings/ai/', manage_ai_settings, name='ai-settings'),
    path('settings/ai/providers/', get_configured_providers, name='configured-providers'),
    path('settings/ai/fetch-models/', fetch_models, name='fetch-models'),
]
