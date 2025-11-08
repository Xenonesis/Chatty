#!/usr/bin/env python
"""
Integration test for all API endpoints using Django test client
"""
import os
import sys
import django

# Setup Django environment
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.test import Client
from chat.models import Conversation, Message
import json

def run_integration_tests():
    """Run integration tests for all new API endpoints"""
    print("\n" + "="*70)
    print("INTEGRATION API TESTS")
    print("="*70)
    
    client = Client()
    results = {}
    
    # Get or create test data
    conversation = Conversation.objects.filter(title__contains="Test").first()
    if not conversation:
        conversation = Conversation.objects.create(title="Integration Test Conversation")
        Message.objects.create(conversation=conversation, sender='user', content='Test message 1')
        Message.objects.create(conversation=conversation, sender='ai', content='Test response 1')
    
    conv_id = conversation.id
    message = Message.objects.filter(conversation=conversation).first()
    msg_id = message.id if message else None
    
    print(f"\n📝 Using conversation ID: {conv_id}")
    print(f"📝 Using message ID: {msg_id}")
    
    # Test 1: Export JSON
    print("\n" + "-"*70)
    print("TEST 1: Export JSON")
    print("-"*70)
    try:
        response = client.get(f'/api/conversations/{conv_id}/export/json/')
        if response.status_code == 200:
            print(f"✅ PASSED - Status: {response.status_code}")
            print(f"   Content-Type: {response.get('Content-Type')}")
            results['export_json'] = True
        else:
            print(f"❌ FAILED - Status: {response.status_code}")
            results['export_json'] = False
    except Exception as e:
        print(f"❌ FAILED - Error: {str(e)}")
        results['export_json'] = False
    
    # Test 2: Export Markdown
    print("\n" + "-"*70)
    print("TEST 2: Export Markdown")
    print("-"*70)
    try:
        # Follow redirects (301 to trailing slash)
        response = client.get(f'/api/conversations/{conv_id}/export/markdown', follow=True)
        if response.status_code == 200:
            print(f"✅ PASSED - Status: {response.status_code}")
            print(f"   Content-Type: {response.get('Content-Type')}")
            results['export_markdown'] = True
        else:
            print(f"❌ FAILED - Status: {response.status_code}")
            results['export_markdown'] = False
    except Exception as e:
        print(f"❌ FAILED - Error: {str(e)}")
        results['export_markdown'] = False
    
    # Test 3: Export PDF
    print("\n" + "-"*70)
    print("TEST 3: Export PDF")
    print("-"*70)
    try:
        # Follow redirects (301 to trailing slash)
        response = client.get(f'/api/conversations/{conv_id}/export/pdf', follow=True)
        if response.status_code == 200:
            print(f"✅ PASSED - Status: {response.status_code}")
            print(f"   Content-Type: {response.get('Content-Type')}")
            print(f"   Content-Length: {len(response.content)} bytes")
            results['export_pdf'] = True
        else:
            print(f"❌ FAILED - Status: {response.status_code}")
            results['export_pdf'] = False
    except Exception as e:
        print(f"❌ FAILED - Error: {str(e)}")
        results['export_pdf'] = False
    
    # Test 4: Create Share Link
    print("\n" + "-"*70)
    print("TEST 4: Create Share Link")
    print("-"*70)
    share_token = None
    try:
        response = client.post(
            f'/api/conversations/{conv_id}/share/',
            data=json.dumps({'expiry_days': 7}),
            content_type='application/json'
        )
        if response.status_code == 201:
            data = json.loads(response.content)
            share_token = data.get('share_token')
            print(f"✅ PASSED - Status: {response.status_code}")
            print(f"   Token: {share_token[:30]}...")
            print(f"   URL: {data.get('share_url')}")
            results['create_share'] = True
        else:
            print(f"❌ FAILED - Status: {response.status_code}")
            print(f"   Response: {response.content.decode()}")
            results['create_share'] = False
    except Exception as e:
        print(f"❌ FAILED - Error: {str(e)}")
        import traceback
        traceback.print_exc()
        results['create_share'] = False
    
    # Test 5: Get Shared Conversation
    print("\n" + "-"*70)
    print("TEST 5: Get Shared Conversation")
    print("-"*70)
    if share_token:
        try:
            response = client.get(f'/api/shared/{share_token}/')
            if response.status_code == 200:
                data = json.loads(response.content)
                print(f"✅ PASSED - Status: {response.status_code}")
                print(f"   Title: {data['conversation']['title']}")
                print(f"   Messages: {len(data['messages'])}")
                results['get_shared'] = True
            else:
                print(f"❌ FAILED - Status: {response.status_code}")
                results['get_shared'] = False
        except Exception as e:
            print(f"❌ FAILED - Error: {str(e)}")
            results['get_shared'] = False
    else:
        print("⚠️  SKIPPED - No share token available")
        results['get_shared'] = False
    
    # Test 6: Toggle Bookmark
    print("\n" + "-"*70)
    print("TEST 6: Toggle Bookmark")
    print("-"*70)
    if msg_id:
        try:
            response = client.post(f'/api/messages/{msg_id}/bookmark/')
            if response.status_code == 200:
                data = json.loads(response.content)
                print(f"✅ PASSED - Status: {response.status_code}")
                print(f"   Message ID: {data['message_id']}")
                print(f"   Is Bookmarked: {data['is_bookmarked']}")
                results['toggle_bookmark'] = True
            else:
                print(f"❌ FAILED - Status: {response.status_code}")
                results['toggle_bookmark'] = False
        except Exception as e:
            print(f"❌ FAILED - Error: {str(e)}")
            results['toggle_bookmark'] = False
    else:
        print("⚠️  SKIPPED - No message ID available")
        results['toggle_bookmark'] = False
    
    # Test 7: Add Reaction
    print("\n" + "-"*70)
    print("TEST 7: Add Reaction")
    print("-"*70)
    if msg_id:
        try:
            response = client.post(
                f'/api/messages/{msg_id}/react/',
                data=json.dumps({'reaction': 'heart'}),
                content_type='application/json'
            )
            if response.status_code == 200:
                data = json.loads(response.content)
                print(f"✅ PASSED - Status: {response.status_code}")
                print(f"   Message ID: {data['message_id']}")
                print(f"   Reactions: {data['reactions']}")
                results['add_reaction'] = True
            else:
                print(f"❌ FAILED - Status: {response.status_code}")
                results['add_reaction'] = False
        except Exception as e:
            print(f"❌ FAILED - Error: {str(e)}")
            results['add_reaction'] = False
    else:
        print("⚠️  SKIPPED - No message ID available")
        results['add_reaction'] = False
    
    # Test 8: Reply to Message
    print("\n" + "-"*70)
    print("TEST 8: Reply to Message (Threading)")
    print("-"*70)
    if msg_id:
        try:
            response = client.post(
                f'/api/messages/{msg_id}/reply/',
                data=json.dumps({'content': 'API test reply', 'sender': 'user'}),
                content_type='application/json'
            )
            if response.status_code == 201:
                data = json.loads(response.content)
                print(f"✅ PASSED - Status: {response.status_code}")
                print(f"   Reply ID: {data['id']}")
                print(f"   Parent Message: {data.get('parent_message')}")
                results['reply_message'] = True
            else:
                print(f"❌ FAILED - Status: {response.status_code}")
                results['reply_message'] = False
        except Exception as e:
            print(f"❌ FAILED - Error: {str(e)}")
            results['reply_message'] = False
    else:
        print("⚠️  SKIPPED - No message ID available")
        results['reply_message'] = False
    
    # Test 9: Analytics Trends
    print("\n" + "-"*70)
    print("TEST 9: Analytics Trends")
    print("-"*70)
    try:
        response = client.get('/api/analytics/trends/?days=30')
        if response.status_code == 200:
            data = json.loads(response.content)
            print(f"✅ PASSED - Status: {response.status_code}")
            print(f"   Total Conversations: {data['summary']['total_conversations']}")
            print(f"   Total Messages: {data['summary']['total_messages']}")
            print(f"   Bookmarked: {data['summary']['bookmarked_messages']}")
            results['analytics_trends'] = True
        else:
            print(f"❌ FAILED - Status: {response.status_code}")
            results['analytics_trends'] = False
    except Exception as e:
        print(f"❌ FAILED - Error: {str(e)}")
        results['analytics_trends'] = False
    
    # Test 10: Conversation Stats
    print("\n" + "-"*70)
    print("TEST 10: Conversation Stats")
    print("-"*70)
    try:
        response = client.get(f'/api/conversations/{conv_id}/stats/')
        if response.status_code == 200:
            data = json.loads(response.content)
            print(f"✅ PASSED - Status: {response.status_code}")
            print(f"   Total Messages: {data['message_counts']['total']}")
            print(f"   User Messages: {data['message_counts']['user']}")
            print(f"   AI Messages: {data['message_counts']['ai']}")
            results['conversation_stats'] = True
        else:
            print(f"❌ FAILED - Status: {response.status_code}")
            results['conversation_stats'] = False
    except Exception as e:
        print(f"❌ FAILED - Error: {str(e)}")
        results['conversation_stats'] = False
    
    # Summary
    print("\n" + "="*70)
    print("TEST SUMMARY")
    print("="*70)
    
    total = len(results)
    passed = sum(1 for v in results.values() if v)
    
    for test_name, passed_test in results.items():
        status = "✅ PASSED" if passed_test else "❌ FAILED"
        print(f"  {test_name.upper().replace('_', ' ')}: {status}")
    
    print("\n" + "="*70)
    print(f"RESULTS: {passed}/{total} tests passed ({passed/total*100:.1f}%)")
    print("="*70)
    
    if passed == total:
        print("\n🎉 ALL API ENDPOINTS WORKING PERFECTLY!")
        return 0
    else:
        print(f"\n⚠️  {total - passed} test(s) failed")
        return 1

if __name__ == "__main__":
    sys.exit(run_integration_tests())
