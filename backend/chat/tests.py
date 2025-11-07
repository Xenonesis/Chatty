"""
Tests for chat application.
"""
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APITestCase
from rest_framework import status
from unittest.mock import patch, MagicMock
from django.conf import settings
from .models import Conversation, Message


class ConversationModelTest(TestCase):
    """Test cases for Conversation model."""
    
    def setUp(self):
        self.conversation = Conversation.objects.create(
            title="Test Conversation",
            status="active"
        )
    
    def test_conversation_creation(self):
        """Test that a conversation is created correctly."""
        self.assertEqual(self.conversation.title, "Test Conversation")
        self.assertEqual(self.conversation.status, "active")
        self.assertIsNotNone(self.conversation.start_timestamp)
    
    def test_get_message_count(self):
        """Test message count calculation."""
        Message.objects.create(
            conversation=self.conversation,
            content="Hello",
            sender="user"
        )
        Message.objects.create(
            conversation=self.conversation,
            content="Hi there!",
            sender="ai"
        )
        self.assertEqual(self.conversation.get_message_count(), 2)


class ConversationAPITest(APITestCase):
    """Test cases for Conversation API endpoints."""
    
    def test_create_conversation(self):
        """Test creating a new conversation via API."""
        response = self.client.post('/api/conversations/', {
            'title': 'New Conversation'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Conversation.objects.count(), 1)
    
    def test_list_conversations(self):
        """Test listing all conversations."""
        Conversation.objects.create(title="Test 1")
        Conversation.objects.create(title="Test 2")
        
        response = self.client.get('/api/conversations/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
    
    def test_get_conversation_detail(self):
        """Test retrieving conversation details."""
        conversation = Conversation.objects.create(title="Test")
        Message.objects.create(
            conversation=conversation,
            content="Test message",
            sender="user"
        )
        
        response = self.client.get(f'/api/conversations/{conversation.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['messages']), 1)
    
    @patch('chat.views.AIService')
    def test_send_message_success(self, mock_ai_service):
        """Test sending a message successfully."""
        # Mock the AI service response
        mock_instance = MagicMock()
        mock_instance.generate_response.return_value = "Hello! How can I help you?"
        mock_ai_service.return_value = mock_instance
        
        conversation = Conversation.objects.create(title="Test", status="active")
        
        response = self.client.post('/api/messages/send/', {
            'conversation_id': conversation.id,
            'content': 'Hello, AI!'
        }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('user_message', response.data)
        self.assertIn('ai_message', response.data)
        self.assertEqual(response.data['user_message']['content'], 'Hello, AI!')
    
    def test_send_message_missing_conversation_id(self):
        """Test sending a message without conversation_id."""
        response = self.client.post('/api/messages/send/', {
            'content': 'Hello, AI!'
        }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
        self.assertEqual(response.data['error'], 'conversation_id and content are required')
    
    def test_send_message_missing_content(self):
        """Test sending a message without content."""
        conversation = Conversation.objects.create(title="Test", status="active")
        
        response = self.client.post('/api/messages/send/', {
            'conversation_id': conversation.id
        }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
    
    def test_send_message_empty_content(self):
        """Test sending a message with empty/whitespace content."""
        conversation = Conversation.objects.create(title="Test", status="active")
        
        response = self.client.post('/api/messages/send/', {
            'conversation_id': conversation.id,
            'content': '   '
        }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
    
    def test_send_message_to_ended_conversation(self):
        """Test sending a message to an ended conversation."""
        conversation = Conversation.objects.create(title="Test", status="ended")
        
        response = self.client.post('/api/messages/send/', {
            'conversation_id': conversation.id,
            'content': 'Hello, AI!'
        }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
    
    def test_send_message_nonexistent_conversation(self):
        """Test sending a message to a nonexistent conversation."""
        response = self.client.post('/api/messages/send/', {
            'conversation_id': 99999,
            'content': 'Hello, AI!'
        }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn('error', response.data)


class AIProviderSettingsTest(APITestCase):
    """Test AI provider settings endpoints."""
    
    def test_get_configured_providers_with_all_configured(self):
        """Test getting configured providers when all providers are configured."""
        with patch.object(settings, 'OPENAI_API_KEY', 'test-openai-key'), \
             patch.object(settings, 'ANTHROPIC_API_KEY', 'test-anthropic-key'), \
             patch.object(settings, 'GOOGLE_API_KEY', 'test-google-key'), \
             patch.object(settings, 'LM_STUDIO_BASE_URL', 'http://localhost:1234/v1'):
            
            response = self.client.get('/api/settings/ai/providers/')
            
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertIn('providers', response.data)
            self.assertIn('current_provider', response.data)
            
            providers = response.data['providers']
            self.assertEqual(len(providers), 4)
            
            provider_ids = [p['id'] for p in providers]
            self.assertIn('openai', provider_ids)
            self.assertIn('anthropic', provider_ids)
            self.assertIn('google', provider_ids)
            self.assertIn('lmstudio', provider_ids)
    
    def test_get_configured_providers_with_none_configured(self):
        """Test getting configured providers when none are configured."""
        with patch.object(settings, 'OPENAI_API_KEY', ''), \
             patch.object(settings, 'ANTHROPIC_API_KEY', ''), \
             patch.object(settings, 'GOOGLE_API_KEY', ''), \
             patch.object(settings, 'LM_STUDIO_BASE_URL', ''):
            
            response = self.client.get('/api/settings/ai/providers/')
            
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertIn('providers', response.data)
            
            providers = response.data['providers']
            self.assertEqual(len(providers), 0)
            self.assertIsNone(response.data['current_provider'])
    
    def test_get_configured_providers_with_only_openai(self):
        """Test getting configured providers when only OpenAI is configured."""
        with patch.object(settings, 'OPENAI_API_KEY', 'test-openai-key'), \
             patch.object(settings, 'ANTHROPIC_API_KEY', ''), \
             patch.object(settings, 'GOOGLE_API_KEY', ''), \
             patch.object(settings, 'LM_STUDIO_BASE_URL', ''), \
             patch.object(settings, 'AI_PROVIDER', 'openai'), \
             patch.object(settings, 'AI_MODEL', 'gpt-4'):
            
            response = self.client.get('/api/settings/ai/providers/')
            
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            
            providers = response.data['providers']
            self.assertEqual(len(providers), 1)
            self.assertEqual(providers[0]['id'], 'openai')
            self.assertEqual(providers[0]['name'], 'OpenAI (GPT-4, GPT-3.5)')
            self.assertEqual(providers[0]['model'], 'gpt-4')
            self.assertEqual(response.data['current_provider'], 'openai')
    
    def test_get_configured_providers_with_lmstudio_only(self):
        """Test getting configured providers when only LM Studio is configured."""
        with patch.object(settings, 'OPENAI_API_KEY', ''), \
             patch.object(settings, 'ANTHROPIC_API_KEY', ''), \
             patch.object(settings, 'GOOGLE_API_KEY', ''), \
             patch.object(settings, 'LM_STUDIO_BASE_URL', 'http://localhost:1234/v1'), \
             patch.object(settings, 'AI_PROVIDER', 'lmstudio'), \
             patch.object(settings, 'AI_MODEL', 'local-model'):
            
            response = self.client.get('/api/settings/ai/providers/')
            
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            
            providers = response.data['providers']
            self.assertEqual(len(providers), 1)
            self.assertEqual(providers[0]['id'], 'lmstudio')
            self.assertEqual(providers[0]['name'], 'LM Studio (Local)')
            self.assertEqual(providers[0]['model'], 'local-model')
            self.assertEqual(response.data['current_provider'], 'lmstudio')
