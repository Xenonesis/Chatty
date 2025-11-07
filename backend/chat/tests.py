"""
Tests for chat application.
"""
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APITestCase
from rest_framework import status
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
