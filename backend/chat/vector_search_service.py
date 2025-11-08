"""
Vector-based semantic search service using embeddings.
"""
import numpy as np
from typing import List, Dict, Any, Optional
from django.conf import settings
from .models import Conversation, Message


class VectorSearchService:
    """
    Service for embedding-based semantic search.
    Uses OpenAI embeddings or falls back to simpler methods.
    """
    
    def __init__(self, provider: str = None):
        self.provider = provider or getattr(settings, 'AI_PROVIDER', 'openai')
        self._initialize_embeddings()
    
    def _initialize_embeddings(self):
        """Initialize embedding client based on provider."""
        try:
            if self.provider == 'openai':
                import openai
                api_key = getattr(settings, 'OPENAI_API_KEY', '')
                if api_key:
                    self.client = openai.OpenAI(api_key=api_key)
                    self.embedding_model = 'text-embedding-3-small'
                    self.enabled = True
                else:
                    self.enabled = False
            elif self.provider == 'openrouter':
                # OpenRouter supports embeddings through OpenAI-compatible API
                import openai
                api_key = getattr(settings, 'OPENROUTER_API_KEY', '')
                if api_key:
                    self.client = openai.OpenAI(
                        base_url='https://openrouter.ai/api/v1',
                        api_key=api_key
                    )
                    self.embedding_model = 'text-embedding-3-small'
                    self.enabled = True
                else:
                    self.enabled = False
            else:
                # Fallback to keyword-based search
                self.enabled = False
        except Exception as e:
            print(f"Failed to initialize embeddings: {str(e)}")
            self.enabled = False
    
    def get_embedding(self, text: str) -> Optional[List[float]]:
        """
        Get embedding vector for text.
        
        Args:
            text: Text to embed
        
        Returns:
            Embedding vector or None if unavailable
        """
        if not self.enabled:
            return None
        
        try:
            response = self.client.embeddings.create(
                model=self.embedding_model,
                input=text
            )
            return response.data[0].embedding
        except Exception as e:
            print(f"Failed to get embedding: {str(e)}")
            return None
    
    def cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        """Calculate cosine similarity between two vectors."""
        vec1_np = np.array(vec1)
        vec2_np = np.array(vec2)
        
        dot_product = np.dot(vec1_np, vec2_np)
        norm1 = np.linalg.norm(vec1_np)
        norm2 = np.linalg.norm(vec2_np)
        
        if norm1 == 0 or norm2 == 0:
            return 0.0
        
        return dot_product / (norm1 * norm2)
    
    def semantic_search(self, query: str, user_id: str = 'default_user', 
                       limit: int = 10) -> List[Dict[str, Any]]:
        """
        Perform semantic search across conversations.
        
        Args:
            query: Search query
            user_id: User ID to filter conversations
            limit: Maximum number of results
        
        Returns:
            List of conversations with relevance scores
        """
        # Get query embedding
        query_embedding = self.get_embedding(query)
        
        if not query_embedding:
            # Fallback to keyword search
            return self._keyword_search(query, user_id, limit)
        
        # Get all conversations for user
        conversations = Conversation.objects.filter(user_id=user_id)
        
        results = []
        for conv in conversations:
            # Create conversation text for embedding
            conv_text = self._get_conversation_text(conv)
            
            # Get conversation embedding
            conv_embedding = self.get_embedding(conv_text)
            
            if conv_embedding:
                # Calculate similarity
                similarity = self.cosine_similarity(query_embedding, conv_embedding)
                
                if similarity > 0.3:  # Threshold for relevance
                    results.append({
                        'conversation': conv,
                        'relevance_score': similarity,
                        'id': conv.id,
                        'title': conv.title,
                        'ai_summary': conv.ai_summary,
                        'start_timestamp': conv.start_timestamp.isoformat(),
                        'message_count': conv.get_message_count()
                    })
        
        # Sort by relevance
        results.sort(key=lambda x: x['relevance_score'], reverse=True)
        
        return results[:limit]
    
    def _get_conversation_text(self, conversation: Conversation) -> str:
        """
        Get representative text for a conversation.
        
        Args:
            conversation: Conversation object
        
        Returns:
            Combined text from title, summary, and recent messages
        """
        parts = []
        
        if conversation.title:
            parts.append(f"Title: {conversation.title}")
        
        if conversation.ai_summary:
            parts.append(f"Summary: {conversation.ai_summary}")
        
        # Get recent messages
        messages = Message.objects.filter(
            conversation=conversation
        ).order_by('-timestamp')[:5]
        
        if messages:
            msg_texts = [f"{msg.sender}: {msg.content[:200]}" for msg in messages]
            parts.append("Recent messages: " + " ".join(msg_texts))
        
        return " ".join(parts)
    
    def _keyword_search(self, query: str, user_id: str, limit: int) -> List[Dict[str, Any]]:
        """
        Fallback keyword-based search when embeddings are unavailable.
        
        Args:
            query: Search query
            user_id: User ID to filter conversations
            limit: Maximum number of results
        
        Returns:
            List of conversations with relevance scores
        """
        from django.db.models import Q
        
        query_lower = query.lower()
        conversations = Conversation.objects.filter(user_id=user_id)
        
        results = []
        for conv in conversations:
            score = 0
            
            # Check title
            if conv.title and query_lower in conv.title.lower():
                score += 3
            
            # Check summary
            if conv.ai_summary and query_lower in conv.ai_summary.lower():
                score += 2
            
            # Check messages
            messages = Message.objects.filter(conversation=conv)
            for msg in messages:
                if query_lower in msg.content.lower():
                    score += 1
            
            if score > 0:
                results.append({
                    'conversation': conv,
                    'relevance_score': score / 10.0,  # Normalize
                    'id': conv.id,
                    'title': conv.title,
                    'ai_summary': conv.ai_summary,
                    'start_timestamp': conv.start_timestamp.isoformat(),
                    'message_count': conv.get_message_count()
                })
        
        results.sort(key=lambda x: x['relevance_score'], reverse=True)
        return results[:limit]
    
    def index_conversation(self, conversation_id: int):
        """
        Pre-compute and store embedding for a conversation.
        This can be used for faster search in production.
        
        Args:
            conversation_id: ID of conversation to index
        """
        try:
            conversation = Conversation.objects.get(id=conversation_id)
            conv_text = self._get_conversation_text(conversation)
            embedding = self.get_embedding(conv_text)
            
            if embedding:
                # Store embedding in metadata
                conversation.metadata['embedding'] = embedding
                conversation.metadata['embedding_updated'] = conversation.start_timestamp.isoformat()
                conversation.save()
                
                return True
        except Exception as e:
            print(f"Failed to index conversation {conversation_id}: {str(e)}")
        
        return False
