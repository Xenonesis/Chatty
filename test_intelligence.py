#!/usr/bin/env python
"""
Test script for the Intelligence System
Run this after starting the backend to verify intelligence features work.
"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from chat.models import Conversation, Message
from chat.intelligence_service import IntelligenceService
from chat.intelligence_models import UserIntelligence, ConversationInsight, LearningEvent

def create_test_conversation():
    """Create a test conversation with sample messages."""
    print("Creating test conversation...")
    
    # Create conversation
    conv = Conversation.objects.create(
        title="Test Intelligence Conversation",
        status='active'
    )
    
    # Add sample messages
    messages = [
        ("user", "How do I use React hooks? I need a step-by-step guide with code examples."),
        ("ai", "Here's a step-by-step guide to using React hooks:\n\nStep 1: Import useState\n```javascript\nimport { useState } from 'react';\n```"),
        ("user", "Can you explain more about useEffect?"),
        ("ai", "useEffect is a hook that lets you perform side effects..."),
        ("user", "What about custom hooks? Show me an example."),
        ("ai", "Custom hooks let you extract component logic into reusable functions..."),
    ]
    
    for sender, content in messages:
        Message.objects.create(
            conversation=conv,
            sender=sender,
            content=content
        )
    
    print(f"✓ Created conversation {conv.id} with {len(messages)} messages")
    return conv

def test_intelligence_analysis():
    """Test intelligence analysis on a conversation."""
    print("\n" + "="*60)
    print("TESTING INTELLIGENCE SYSTEM")
    print("="*60)
    
    # Create test data
    conv = create_test_conversation()
    
    # Initialize intelligence service
    print("\nInitializing Intelligence Service...")
    service = IntelligenceService(user_id="test_user")
    
    # Analyze conversation
    print(f"\nAnalyzing conversation {conv.id}...")
    insight = service.analyze_conversation(conv.id)
    
    if insight:
        print("✓ Analysis complete!")
        print(f"\n📊 Conversation Insights:")
        print(f"  - Average message length: {insight.avg_message_length}")
        print(f"  - Conversation length: {insight.conversation_length} messages")
        print(f"  - Topics discussed: {', '.join(insight.topics_discussed)}")
        print(f"  - Question types: {', '.join(insight.question_types)}")
        print(f"\n🎯 Detected Preferences:")
        print(f"  - Prefers detailed responses: {insight.prefers_detailed_responses}")
        print(f"  - Prefers code examples: {insight.prefers_code_examples}")
        print(f"  - Prefers step-by-step: {insight.prefers_step_by_step}")
    else:
        print("✗ Analysis failed")
        return False
    
    # Get user profile
    print("\n📋 User Intelligence Profile:")
    profile = service.get_user_profile()
    
    print(f"  User ID: {profile['user_id']}")
    print(f"  Last Updated: {profile['last_updated']}")
    
    if profile['preferences']:
        print(f"\n  Preferences:")
        for key, data in profile['preferences'].items():
            print(f"    - {key}: {data['value']} (confidence: {data['confidence']:.2f})")
    
    if profile['topics']:
        print(f"\n  Topics:")
        for key, data in profile['topics'].items():
            print(f"    - {key}: {data['value']} (confidence: {data['confidence']:.2f})")
    
    # Get personalized context
    print("\n🤖 Personalized AI Context:")
    context = service.get_personalized_context()
    print(f"  \"{context}\"")
    
    # Check database records
    print("\n💾 Database Records:")
    intelligence_count = UserIntelligence.objects.filter(user_id="test_user").count()
    insights_count = ConversationInsight.objects.filter(user_id="test_user").count()
    events_count = LearningEvent.objects.filter(user_id="test_user").count()
    
    print(f"  - Intelligence records: {intelligence_count}")
    print(f"  - Conversation insights: {insights_count}")
    print(f"  - Learning events: {events_count}")
    
    # Show learning events
    print("\n📚 Recent Learning Events:")
    events = LearningEvent.objects.filter(user_id="test_user").order_by('-timestamp')[:5]
    for event in events:
        print(f"  - [{event.event_type}] {event.description} (confidence: {event.confidence:.2f})")
    
    print("\n" + "="*60)
    print("✓ ALL TESTS PASSED!")
    print("="*60)
    
    # Cleanup
    print("\nCleaning up test data...")
    conv.delete()
    UserIntelligence.objects.filter(user_id="test_user").delete()
    ConversationInsight.objects.filter(user_id="test_user").delete()
    LearningEvent.objects.filter(user_id="test_user").delete()
    print("✓ Cleanup complete")
    
    return True

if __name__ == "__main__":
    try:
        success = test_intelligence_analysis()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n✗ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
