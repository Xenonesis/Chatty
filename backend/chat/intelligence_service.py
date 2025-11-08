"""
Intelligence service for learning from user behavior and conversations.
"""
from typing import List, Dict, Any
from django.db.models import Avg, Count
from django.utils import timezone
from datetime import timedelta
import re

from .models import Conversation, Message
from .intelligence_models import UserIntelligence, ConversationInsight, LearningEvent


class IntelligenceService:
    """Service for analyzing and learning from user interactions."""
    
    def __init__(self, user_id: str = "default_user"):
        self.user_id = user_id
    
    def analyze_conversation(self, conversation_id: int) -> ConversationInsight:
        """
        Analyze a conversation and extract insights.
        """
        try:
            conversation = Conversation.objects.get(id=conversation_id)
            messages = Message.objects.filter(conversation=conversation).order_by('timestamp')
            
            if not messages.exists():
                return None
            
            # Get or create insight record
            insight, created = ConversationInsight.objects.get_or_create(
                conversation_id=conversation_id,
                user_id=self.user_id
            )
            
            # Analyze message patterns
            user_messages = messages.filter(sender='user')
            ai_messages = messages.filter(sender='ai')
            
            # Calculate metrics
            # Calculate average message length manually
            if user_messages.exists():
                total_length = sum(len(msg.content) for msg in user_messages)
                insight.avg_message_length = total_length // user_messages.count()
            else:
                insight.avg_message_length = 0
            
            insight.conversation_length = messages.count()
            insight.session_duration = conversation.get_duration()
            
            # Analyze question types
            insight.question_types = self._extract_question_types(user_messages)
            
            # Extract topics
            insight.topics_discussed = self._extract_topics(messages)
            
            # Detect preferences
            insight.prefers_detailed_responses = self._prefers_detailed(user_messages, ai_messages)
            insight.prefers_code_examples = self._prefers_code_examples(user_messages)
            insight.prefers_step_by_step = self._prefers_step_by_step(user_messages)
            
            # Count follow-ups and clarifications
            insight.follow_up_questions = self._count_follow_ups(user_messages)
            insight.clarification_requests = self._count_clarifications(user_messages)
            
            insight.save()
            
            # Learn from this conversation
            self._learn_from_insights(insight)
            
            return insight
            
        except Conversation.DoesNotExist:
            return None
    
    def _extract_question_types(self, messages) -> List[str]:
        """Identify types of questions asked."""
        question_types = []
        
        patterns = {
            'how_to': r'\bhow (do|can|to|would)\b',
            'what_is': r'\bwhat (is|are|was|were)\b',
            'why': r'\bwhy\b',
            'when': r'\bwhen\b',
            'where': r'\bwhere\b',
            'explain': r'\b(explain|describe|tell me about)\b',
            'compare': r'\b(compare|difference|versus|vs)\b',
            'troubleshoot': r'\b(error|problem|issue|fix|debug)\b',
        }
        
        for msg in messages:
            content_lower = msg.content.lower()
            for q_type, pattern in patterns.items():
                if re.search(pattern, content_lower):
                    question_types.append(q_type)
        
        return list(set(question_types))
    
    def _extract_topics(self, messages) -> List[str]:
        """Extract main topics from conversation."""
        # Simple keyword extraction (can be enhanced with NLP)
        tech_keywords = {
            'python', 'javascript', 'react', 'django', 'api', 'database',
            'frontend', 'backend', 'css', 'html', 'typescript', 'node',
            'sql', 'mongodb', 'docker', 'kubernetes', 'aws', 'git'
        }
        
        topics = set()
        for msg in messages:
            words = set(msg.content.lower().split())
            topics.update(words & tech_keywords)
        
        return list(topics)
    
    def _prefers_detailed(self, user_messages, ai_messages) -> bool:
        """Detect if user prefers detailed responses."""
        if not user_messages.exists() or not ai_messages.exists():
            return None
        
        # Check for follow-up questions asking for more detail
        detail_requests = sum(
            1 for msg in user_messages
            if any(phrase in msg.content.lower() for phrase in [
                'more detail', 'elaborate', 'explain more', 'tell me more',
                'can you expand', 'go deeper'
            ])
        )
        
        return detail_requests > len(user_messages) * 0.2
    
    def _prefers_code_examples(self, user_messages) -> bool:
        """Detect if user prefers code examples."""
        code_requests = sum(
            1 for msg in user_messages
            if any(phrase in msg.content.lower() for phrase in [
                'example', 'code', 'show me', 'sample', 'snippet',
                'how to implement', 'demo'
            ])
        )
        
        return code_requests > len(user_messages) * 0.3
    
    def _prefers_step_by_step(self, user_messages) -> bool:
        """Detect if user prefers step-by-step instructions."""
        step_requests = sum(
            1 for msg in user_messages
            if any(phrase in msg.content.lower() for phrase in [
                'step by step', 'steps', 'guide', 'tutorial',
                'walk me through', 'how do i'
            ])
        )
        
        return step_requests > len(user_messages) * 0.25
    
    def _count_follow_ups(self, user_messages) -> int:
        """Count follow-up questions."""
        follow_up_phrases = ['also', 'and', 'what about', 'how about', 'additionally']
        return sum(
            1 for msg in user_messages
            if any(phrase in msg.content.lower()[:50] for phrase in follow_up_phrases)
        )
    
    def _count_clarifications(self, user_messages) -> int:
        """Count clarification requests."""
        clarification_phrases = ['what do you mean', 'clarify', 'i don\'t understand', 'confused']
        return sum(
            1 for msg in user_messages
            if any(phrase in msg.content.lower() for phrase in clarification_phrases)
        )
    
    def _learn_from_insights(self, insight: ConversationInsight):
        """Update user intelligence based on conversation insights."""
        
        # Learn topic interests
        if insight.topics_discussed:
            self._update_intelligence(
                category='topic',
                key='favorite_topics',
                value=insight.topics_discussed,
                confidence_adjustment=0.05,
                source_conversation=insight.conversation_id
            )
        
        # Learn response preferences
        if insight.prefers_detailed_responses is not None:
            self._update_intelligence(
                category='preference',
                key='detailed_responses',
                value=insight.prefers_detailed_responses,
                confidence_adjustment=0.1,
                source_conversation=insight.conversation_id
            )
        
        if insight.prefers_code_examples is not None:
            self._update_intelligence(
                category='preference',
                key='code_examples',
                value=insight.prefers_code_examples,
                confidence_adjustment=0.1,
                source_conversation=insight.conversation_id
            )
        
        if insight.prefers_step_by_step is not None:
            self._update_intelligence(
                category='preference',
                key='step_by_step',
                value=insight.prefers_step_by_step,
                confidence_adjustment=0.1,
                source_conversation=insight.conversation_id
            )
        
        # Learn communication style
        self._update_intelligence(
            category='style',
            key='avg_message_length',
            value=insight.avg_message_length,
            confidence_adjustment=0.05,
            source_conversation=insight.conversation_id
        )
    
    def _update_intelligence(self, category: str, key: str, value: Any,
                            confidence_adjustment: float, source_conversation: int):
        """Update or create intelligence record."""
        intelligence, created = UserIntelligence.objects.get_or_create(
            user_id=self.user_id,
            category=category,
            key=key,
            defaults={
                'value': value,
                'confidence': 0.5,
                'source_conversations': [source_conversation]
            }
        )
        
        if not created:
            # Update existing intelligence
            if isinstance(value, list) and isinstance(intelligence.value, list):
                # Merge lists
                intelligence.value = list(set(intelligence.value + value))
            else:
                intelligence.value = value
            
            # Add source conversation
            if source_conversation not in intelligence.source_conversations:
                intelligence.source_conversations.append(source_conversation)
            
            intelligence.update_confidence(confidence_adjustment)
        
        # Log learning event
        LearningEvent.objects.create(
            user_id=self.user_id,
            event_type='preference_learned' if category == 'preference' else 'pattern_detected',
            description=f"Learned {key} from conversation {source_conversation}",
            data={'category': category, 'key': key, 'value': value},
            confidence=intelligence.confidence
        )
    
    def get_user_profile(self) -> Dict[str, Any]:
        """Get complete intelligence profile for user."""
        intelligence_records = UserIntelligence.objects.filter(user_id=self.user_id)
        
        profile = {
            'user_id': self.user_id,
            'preferences': {},
            'patterns': {},
            'topics': {},
            'styles': {},
            'contexts': {},
            'last_updated': None
        }
        
        # Map category to profile key
        category_map = {
            'preference': 'preferences',
            'pattern': 'patterns',
            'topic': 'topics',
            'style': 'styles',
            'context': 'contexts'
        }
        
        for record in intelligence_records:
            category_key = category_map.get(record.category, record.category + 's')
            profile[category_key][record.key] = {
                'value': record.value,
                'confidence': record.confidence,
                'learned_at': record.learned_at.isoformat(),
                'updated_at': record.updated_at.isoformat()
            }
            
            if not profile['last_updated'] or record.updated_at.isoformat() > profile['last_updated']:
                profile['last_updated'] = record.updated_at.isoformat()
        
        return profile
    
    def get_personalized_context(self) -> str:
        """Generate context string for AI based on learned intelligence."""
        profile = self.get_user_profile()
        
        context_parts = []
        
        # Add preferences
        if profile['preferences']:
            prefs = []
            for key, data in profile['preferences'].items():
                if data['confidence'] > 0.6 and data['value']:
                    prefs.append(f"prefers {key.replace('_', ' ')}")
            if prefs:
                context_parts.append(f"User {', '.join(prefs)}.")
        
        # Add topics
        if profile['topics'].get('favorite_topics'):
            topics_data = profile['topics']['favorite_topics']
            if topics_data['confidence'] > 0.5:
                topics = topics_data['value'][:5]  # Top 5
                context_parts.append(f"User is interested in: {', '.join(topics)}.")
        
        # Add style
        if profile['styles'].get('avg_message_length'):
            length_data = profile['styles']['avg_message_length']
            avg_len = length_data['value']
            if avg_len < 50:
                context_parts.append("User prefers concise communication.")
            elif avg_len > 200:
                context_parts.append("User provides detailed context in messages.")
        
        return " ".join(context_parts) if context_parts else ""
    
    def analyze_all_user_conversations(self):
        """Analyze all conversations for this user to build intelligence."""
        # This would need a way to identify user's conversations
        # For now, analyze recent conversations
        recent_conversations = Conversation.objects.filter(
            status='ended'
        ).order_by('-end_timestamp')[:20]
        
        for conv in recent_conversations:
            self.analyze_conversation(conv.id)
