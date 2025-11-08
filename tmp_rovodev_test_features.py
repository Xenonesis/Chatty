#!/usr/bin/env python
"""
Comprehensive test script for all new features
"""
import os
import sys
import django

# Setup Django environment
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from chat.models import Conversation, Message
from chat.export_service import ExportService
from chat.sharing_service import SharingService
from chat.analytics_service import AnalyticsService
from django.utils import timezone
from datetime import timedelta

def test_database_schema():
    """Test 1: Verify database schema has new fields"""
    print("\n" + "="*70)
    print("TEST 1: Database Schema Verification")
    print("="*70)
    
    # Check Message model fields
    message_fields = [f.name for f in Message._meta.get_fields()]
    
    required_fields = ['reactions', 'is_bookmarked', 'bookmarked_at', 'parent_message']
    
    print("\n✓ Checking Message model fields:")
    all_present = True
    for field in required_fields:
        if field in message_fields:
            print(f"  ✅ {field} - Present")
        else:
            print(f"  ❌ {field} - MISSING")
            all_present = False
    
    if all_present:
        print("\n✅ TEST 1 PASSED: All required fields present")
    else:
        print("\n❌ TEST 1 FAILED: Some fields missing")
    
    return all_present

def test_create_test_data():
    """Test 2: Create test conversation and messages"""
    print("\n" + "="*70)
    print("TEST 2: Create Test Data")
    print("="*70)
    
    try:
        # Create test conversation
        conversation = Conversation.objects.create(
            title="Feature Test Conversation",
            status="active"
        )
        print(f"\n✅ Created conversation (ID: {conversation.id})")
        
        # Create test messages
        messages = []
        message_contents = [
            ("user", "Hello, I need help with testing features."),
            ("ai", "I'd be happy to help you test all the features!"),
            ("user", "Can you explain the analytics dashboard?"),
            ("ai", "The analytics dashboard shows conversation trends, message statistics, and engagement metrics. You can view data for different time periods."),
            ("user", "That's very helpful, thank you!"),
            ("ai", "You're welcome! Feel free to ask if you need more information."),
        ]
        
        for sender, content in message_contents:
            msg = Message.objects.create(
                conversation=conversation,
                sender=sender,
                content=content
            )
            messages.append(msg)
            print(f"  ✅ Created {sender} message (ID: {msg.id})")
        
        print(f"\n✅ TEST 2 PASSED: Created {len(messages)} test messages")
        return conversation, messages
        
    except Exception as e:
        print(f"\n❌ TEST 2 FAILED: {str(e)}")
        return None, None

def test_reactions(messages):
    """Test 3: Message Reactions"""
    print("\n" + "="*70)
    print("TEST 3: Message Reactions")
    print("="*70)
    
    if not messages:
        print("❌ No messages to test")
        return False
    
    try:
        # Add reactions to first message
        message = messages[0]
        message.reactions = {'thumbs_up': 3, 'heart': 2, 'laugh': 1}
        message.save()
        
        # Verify
        message.refresh_from_db()
        print(f"\n✅ Added reactions to message {message.id}")
        print(f"  Reactions: {message.reactions}")
        
        if message.reactions == {'thumbs_up': 3, 'heart': 2, 'laugh': 1}:
            print("\n✅ TEST 3 PASSED: Reactions stored correctly")
            return True
        else:
            print("\n❌ TEST 3 FAILED: Reactions not stored correctly")
            return False
            
    except Exception as e:
        print(f"\n❌ TEST 3 FAILED: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_bookmarking(messages):
    """Test 4: Message Bookmarking"""
    print("\n" + "="*70)
    print("TEST 4: Message Bookmarking")
    print("="*70)
    
    if not messages:
        print("❌ No messages to test")
        return False
    
    try:
        # Bookmark second message
        message = messages[1]
        message.is_bookmarked = True
        message.bookmarked_at = timezone.now()
        message.save()
        
        # Verify
        message.refresh_from_db()
        print(f"\n✅ Bookmarked message {message.id}")
        print(f"  is_bookmarked: {message.is_bookmarked}")
        print(f"  bookmarked_at: {message.bookmarked_at}")
        
        if message.is_bookmarked and message.bookmarked_at:
            print("\n✅ TEST 4 PASSED: Bookmarking works correctly")
            return True
        else:
            print("\n❌ TEST 4 FAILED: Bookmarking not working")
            return False
            
    except Exception as e:
        print(f"\n❌ TEST 4 FAILED: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_threading(messages):
    """Test 5: Message Threading"""
    print("\n" + "="*70)
    print("TEST 5: Message Threading")
    print("="*70)
    
    if not messages or len(messages) < 2:
        print("❌ Not enough messages to test")
        return False
    
    try:
        # Create a reply to first message
        parent = messages[0]
        reply = Message.objects.create(
            conversation=parent.conversation,
            sender='user',
            content='This is a reply to the first message',
            parent_message=parent
        )
        
        # Verify
        reply.refresh_from_db()
        print(f"\n✅ Created reply message (ID: {reply.id})")
        print(f"  Parent message ID: {reply.parent_message.id}")
        print(f"  Parent content: {reply.parent_message.content[:50]}...")
        
        # Check replies relationship
        replies = parent.replies.all()
        print(f"  Parent has {replies.count()} replies")
        
        if reply.parent_message == parent and replies.count() > 0:
            print("\n✅ TEST 5 PASSED: Threading works correctly")
            return True
        else:
            print("\n❌ TEST 5 FAILED: Threading not working")
            return False
            
    except Exception as e:
        print(f"\n❌ TEST 5 FAILED: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_export_service(conversation):
    """Test 6: Export Service"""
    print("\n" + "="*70)
    print("TEST 6: Export Service (JSON, Markdown, PDF)")
    print("="*70)
    
    if not conversation:
        print("❌ No conversation to test")
        return False
    
    try:
        export_service = ExportService()
        
        # Test JSON export
        print("\n📄 Testing JSON export...")
        json_data = export_service.export_to_json(conversation)
        print(f"  ✅ JSON export generated ({len(json_data)} characters)")
        
        # Test Markdown export
        print("\n📝 Testing Markdown export...")
        md_data = export_service.export_to_markdown(conversation)
        print(f"  ✅ Markdown export generated ({len(md_data)} characters)")
        
        # Test PDF export
        print("\n📑 Testing PDF export...")
        pdf_buffer = export_service.export_to_pdf(conversation)
        pdf_size = len(pdf_buffer.getvalue())
        print(f"  ✅ PDF export generated ({pdf_size} bytes)")
        
        if json_data and md_data and pdf_size > 0:
            print("\n✅ TEST 6 PASSED: All export formats work")
            return True
        else:
            print("\n❌ TEST 6 FAILED: Some exports failed")
            return False
            
    except Exception as e:
        print(f"\n❌ TEST 6 FAILED: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_sharing_service(conversation):
    """Test 7: Sharing Service"""
    print("\n" + "="*70)
    print("TEST 7: Sharing Service")
    print("="*70)
    
    if not conversation:
        print("❌ No conversation to test")
        return False
    
    try:
        sharing_service = SharingService()
        
        # Create share link
        print("\n🔗 Creating share link...")
        share_data = sharing_service.create_share_link(conversation.id, expiry_days=7)
        print(f"  ✅ Share link created")
        print(f"  Token: {share_data['share_token']}")
        print(f"  URL: {share_data['share_url']}")
        print(f"  Expires: {share_data['expires_at']}")
        
        # Retrieve shared conversation
        print("\n📖 Retrieving shared conversation...")
        shared_data = sharing_service.get_shared_conversation(share_data['share_token'])
        
        if shared_data:
            print(f"  ✅ Retrieved shared conversation")
            print(f"  Title: {shared_data['conversation']['title']}")
            print(f"  Messages: {len(shared_data['messages'])}")
            print("\n✅ TEST 7 PASSED: Sharing service works")
            return True
        else:
            print("\n❌ TEST 7 FAILED: Could not retrieve shared conversation")
            return False
            
    except Exception as e:
        print(f"\n❌ TEST 7 FAILED: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_analytics_service(conversation):
    """Test 8: Analytics Service"""
    print("\n" + "="*70)
    print("TEST 8: Analytics Service")
    print("="*70)
    
    if not conversation:
        print("❌ No conversation to test")
        return False
    
    try:
        analytics_service = AnalyticsService()
        
        # Test conversation trends
        print("\n📊 Testing conversation trends...")
        trends = analytics_service.get_conversation_trends(days=30)
        print(f"  ✅ Trends retrieved")
        print(f"  Total conversations: {trends['summary']['total_conversations']}")
        print(f"  Total messages: {trends['summary']['total_messages']}")
        print(f"  Bookmarked messages: {trends['summary']['bookmarked_messages']}")
        
        # Test conversation stats
        print(f"\n📈 Testing conversation stats for ID {conversation.id}...")
        stats = analytics_service.get_conversation_stats(conversation.id)
        
        if stats:
            print(f"  ✅ Stats retrieved")
            print(f"  Total messages: {stats['message_counts']['total']}")
            print(f"  User messages: {stats['message_counts']['user']}")
            print(f"  AI messages: {stats['message_counts']['ai']}")
            print(f"  Bookmarked: {stats['bookmarked_messages']}")
            print(f"  Reactions: {stats['reactions']}")
            print("\n✅ TEST 8 PASSED: Analytics service works")
            return True
        else:
            print("\n❌ TEST 8 FAILED: Could not retrieve stats")
            return False
            
    except Exception as e:
        print(f"\n❌ TEST 8 FAILED: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Run all tests"""
    print("\n" + "="*70)
    print("COMPREHENSIVE FEATURE TEST SUITE")
    print("="*70)
    print("Testing all backend implementations and database schema...")
    
    results = {}
    
    # Test 1: Database Schema
    results['schema'] = test_database_schema()
    
    # Test 2: Create Test Data
    conversation, messages = test_create_test_data()
    results['test_data'] = (conversation is not None and messages is not None)
    
    if conversation and messages:
        # Test 3: Reactions
        results['reactions'] = test_reactions(messages)
        
        # Test 4: Bookmarking
        results['bookmarking'] = test_bookmarking(messages)
        
        # Test 5: Threading
        results['threading'] = test_threading(messages)
        
        # Test 6: Export Service
        results['export'] = test_export_service(conversation)
        
        # Test 7: Sharing Service
        results['sharing'] = test_sharing_service(conversation)
        
        # Test 8: Analytics Service
        results['analytics'] = test_analytics_service(conversation)
    
    # Print summary
    print("\n" + "="*70)
    print("TEST SUMMARY")
    print("="*70)
    
    total_tests = len(results)
    passed_tests = sum(1 for v in results.values() if v)
    
    for test_name, passed in results.items():
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"  {test_name.upper()}: {status}")
    
    print("\n" + "="*70)
    print(f"RESULTS: {passed_tests}/{total_tests} tests passed ({passed_tests/total_tests*100:.1f}%)")
    print("="*70)
    
    if passed_tests == total_tests:
        print("\n🎉 ALL TESTS PASSED! All features are working correctly.")
        return 0
    else:
        print(f"\n⚠️  {total_tests - passed_tests} test(s) failed. Please review errors above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
