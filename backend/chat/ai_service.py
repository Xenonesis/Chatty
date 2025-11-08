"""
AI Service for handling LLM interactions and conversation intelligence.
"""
import os
from typing import List, Dict, Any
from django.conf import settings


class AIService:
    """
    Unified AI service that supports multiple LLM providers.
    Handles chat completions, summarization, and conversation analysis.
    """
    
    def __init__(self, provider: str = None, model: str = None):
        self.provider = provider or settings.AI_PROVIDER
        self.model = model or settings.AI_MODEL  # Use user's model if provided
        self._initialize_client()
    
    def _initialize_client(self):
        """Initialize the appropriate AI client based on provider."""
        if self.provider == 'openai':
            import openai
            api_key = getattr(settings, 'OPENAI_API_KEY', '')
            if not api_key:
                raise ValueError("OpenAI API key not configured. Please set it in AI Settings.")
            self.client = openai.OpenAI(api_key=api_key)
        elif self.provider == 'anthropic':
            import anthropic
            api_key = getattr(settings, 'ANTHROPIC_API_KEY', '')
            if not api_key:
                raise ValueError("Anthropic API key not configured. Please set it in AI Settings.")
            self.client = anthropic.Anthropic(api_key=api_key)
        elif self.provider == 'google':
            import google.generativeai as genai
            api_key = getattr(settings, 'GOOGLE_API_KEY', '')
            if not api_key:
                raise ValueError("Google API key not configured. Please set it in AI Settings.")
            genai.configure(api_key=api_key)
            self.client = genai.GenerativeModel(self.model)
        elif self.provider == 'openrouter':
            import openai
            api_key = getattr(settings, 'OPENROUTER_API_KEY', '')
            if not api_key:
                raise ValueError("OpenRouter API key not configured. Please set it in AI Settings.")
            print(f"Initializing OpenRouter with API key: {api_key[:10]}...")
            self.client = openai.OpenAI(
                base_url='https://openrouter.ai/api/v1',
                api_key=api_key
            )
        elif self.provider == 'lmstudio':
            import openai
            base_url = getattr(settings, 'LM_STUDIO_BASE_URL', 'http://localhost:1234/v1')
            api_key = getattr(settings, 'LM_STUDIO_API_KEY', 'lm-studio')
            self.client = openai.OpenAI(
                base_url=base_url,
                api_key=api_key
            )
        elif self.provider == 'ollama':
            import openai
            base_url = getattr(settings, 'OLLAMA_BASE_URL', 'http://localhost:11434')
            self.client = openai.OpenAI(
                base_url=f"{base_url}/v1",
                api_key='ollama'  # Ollama doesn't need a real API key
            )
        else:
            raise ValueError(f"Unsupported AI provider: {self.provider}")
    
    def generate_response(self, messages: List[Dict[str, str]]) -> str:
        """
        Generate AI response for a conversation.
        
        Args:
            messages: List of message dicts with 'role' and 'content'
        
        Returns:
            AI response text
        """
        try:
            if self.provider in ['openai', 'openrouter', 'lmstudio', 'ollama']:
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=messages,
                    temperature=0.7,
                    max_tokens=2000
                )
                return response.choices[0].message.content
            
            elif self.provider == 'anthropic':
                # Convert messages format for Claude
                system_msg = next((m['content'] for m in messages if m['role'] == 'system'), None)
                user_messages = [m for m in messages if m['role'] != 'system']
                
                response = self.client.messages.create(
                    model=self.model,
                    max_tokens=2000,
                    system=system_msg if system_msg else "",
                    messages=user_messages
                )
                return response.content[0].text
            
            elif self.provider == 'google':
                # Convert messages to Gemini format
                prompt = "\n".join([f"{m['role']}: {m['content']}" for m in messages])
                response = self.client.generate_content(prompt)
                return response.text
            
        except Exception as e:
            return f"Error generating response: {str(e)}"
    
    def generate_summary(self, conversation_history: List[Dict[str, str]]) -> str:
        """
        Generate a summary of a conversation.
        
        Args:
            conversation_history: List of messages in the conversation
        
        Returns:
            Summary text
        """
        # Prepare conversation text
        conversation_text = "\n".join([
            f"{msg['sender']}: {msg['content']}" 
            for msg in conversation_history
        ])
        
        summary_prompt = [
            {
                "role": "system",
                "content": "You are a helpful assistant that summarizes conversations concisely."
            },
            {
                "role": "user",
                "content": f"Please provide a concise summary of the following conversation, "
                          f"highlighting key topics, decisions, and action items:\n\n{conversation_text}"
            }
        ]
        
        return self.generate_response(summary_prompt)
    
    def analyze_sentiment(self, text: str) -> Dict[str, Any]:
        """
        Analyze sentiment and tone of text.
        
        Args:
            text: Text to analyze
        
        Returns:
            Dictionary with sentiment analysis results
        """
        prompt = [
            {
                "role": "system",
                "content": "You are a sentiment analysis expert. Respond with JSON only."
            },
            {
                "role": "user",
                "content": f"Analyze the sentiment and tone of this text. "
                          f"Respond with JSON containing 'sentiment' (positive/negative/neutral), "
                          f"'tone' (professional/casual/friendly/etc), and 'confidence' (0-1):\n\n{text}"
            }
        ]
        
        try:
            response = self.generate_response(prompt)
            # Simple parsing - in production, use proper JSON extraction
            import json
            return json.loads(response)
        except:
            return {"sentiment": "neutral", "tone": "unknown", "confidence": 0.5}
    
    def extract_key_topics(self, conversation_history: List[Dict[str, str]]) -> List[str]:
        """
        Extract key topics from a conversation.
        
        Args:
            conversation_history: List of messages
        
        Returns:
            List of key topics
        """
        conversation_text = "\n".join([
            f"{msg['sender']}: {msg['content']}" 
            for msg in conversation_history
        ])
        
        prompt = [
            {
                "role": "system",
                "content": "You are an expert at identifying key topics. Return a comma-separated list only."
            },
            {
                "role": "user",
                "content": f"Extract 3-5 key topics from this conversation as a comma-separated list:\n\n{conversation_text}"
            }
        ]
        
        response = self.generate_response(prompt)
        return [topic.strip() for topic in response.split(',')]
    
    def query_conversations(self, query: str, conversations_data: List[Dict]) -> str:
        """
        Answer questions about past conversations.
        
        Args:
            query: User's question
            conversations_data: Relevant conversation data
        
        Returns:
            AI response with answer
        """
        # Format conversation data for context
        context = ""
        for conv in conversations_data:
            context += f"\n\nConversation {conv['id']} (Started: {conv['start_timestamp']}):\n"
            if conv.get('ai_summary'):
                context += f"Summary: {conv['ai_summary']}\n"
            if conv.get('messages'):
                context += "Messages:\n"
                for msg in conv['messages'][:10]:  # Limit to recent messages
                    context += f"  {msg['sender']}: {msg['content'][:200]}\n"
        
        prompt = [
            {
                "role": "system",
                "content": "You are a helpful assistant that answers questions about past conversations. "
                          "Use the provided conversation data to give accurate, specific answers."
            },
            {
                "role": "user",
                "content": f"Question: {query}\n\nConversation Data:{context}\n\n"
                          f"Please answer the question based on the conversation data provided."
            }
        ]
        
        return self.generate_response(prompt)
    
    def semantic_search(self, query: str, conversations: List[Dict]) -> List[Dict]:
        """
        Search conversations by semantic meaning.
        
        Args:
            query: Search query
            conversations: List of conversations to search
        
        Returns:
            Ranked list of relevant conversations
        """
        # Simplified semantic search - in production, use embeddings
        query_lower = query.lower()
        results = []
        
        for conv in conversations:
            score = 0
            # Check title
            if conv.get('title') and query_lower in conv['title'].lower():
                score += 3
            
            # Check summary
            if conv.get('ai_summary') and query_lower in conv['ai_summary'].lower():
                score += 2
            
            # Check messages
            for msg in conv.get('messages', []):
                if query_lower in msg['content'].lower():
                    score += 1
            
            if score > 0:
                results.append({**conv, 'relevance_score': score})
        
        # Sort by relevance
        results.sort(key=lambda x: x['relevance_score'], reverse=True)
        return results[:10]  # Return top 10
