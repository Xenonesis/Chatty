#!/usr/bin/env python
"""
Test API endpoints for all new features
"""
import os
import sys
import django

# Setup Django environment
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.test import RequestFactory, Client
from django.contrib.auth.models import AnonymousUser
from chat.models import Conversation, Message
from chat import views
import json

def test_api_endpoints():
    """Test all API endpoints"""
    print("\n" + "="*70)
    print("API ENDPOINTS TEST")
    print("="*70)
    
    client = Client()
    factory = RequestFactory()
    results = {}
    
    # Get or create test conversation with messages
    conversation = Conversation.objects.filter(title="Feature Test Conversation").first()
    if not conversation:
        print("\n⚠️  No test conversation found. Creating one...")
        conversation = Conversation.objects.create(title="API Test Conversation")
        Message.objects.create(conversation=conversation, sender='user', content='Test message 1')
        Message.objects.create(conversation=conversation, sender='ai', content='Test response 1')
    
    conv_id = conversation.id
    messages = Message.objects.filter(conversation=conversation)
    msg_id = messages.first().id if messages.exists() else None
    
    print(f"\n📝 Using conversation ID: {conv_id}")
    print(f"📝 Using message ID: {msg_id}")
    
    # Test 1: Export JSON endpoint
    print("\n" + "-"*70)
    print("TEST 1: Export JSON Endpoint")
    print("-"*70)
    try:
        request = factory.get(f'/api/conversations/{conv_id}/export/json/')
        request.user = AnonymousUser()
        response = views.export_conversation(request, conv_id, 'json')
        if response.status_code == 200:
            print("✅ Export JSON endpoint works")
            print(f"   Content-Type: {response.get('Content-Type')}")
            results['export_json'] = True
        else:
            print(f"❌ Export JSON failed with status {response.status_code}")
            results['export_json'] = False
    except Exception as e:
        print(f"❌ Export JSON error: {str(e)}")
        results['export_json'] = False
    
    # Test 2: Export Markdown endpoint
    print("\n" + "-"*70)
    print("TEST 2: Export Markdown Endpoint")
    print("-"*70)
    try:
        request = factory.get(f'/api/conversations/{conv_id}/export/markdown/')
        request.user = AnonymousUser()
        response = views.export_conversation(request, conv_id, 'markdown')
        if response.status_code == 200:
            print("✅ Export Markdown endpoint works")
            print(f"   Content-Type: {response.get('Content-Type')}")
            results['export_markdown'] = True
        else:
            print(f"❌ Export Markdown failed with status {response.status_code}")
            results['export_markdown'] = False
    except Exception as e:
        print(f"❌ Export Markdown error: {str(e)}")
        results['export_markdown'] = False
    
    # Test 3: Export PDF endpoint
    print("\n" + "-"*70)
    print("TEST 3: Export PDF Endpoint")
    print("-"*70)
    try:
        request = factory.get(f'/api/conversations/{conv_id}/export/pdf/')
        request.user = AnonymousUser()
        response = views.export_conversation(request, conv_id, 'pdf')
        if response.status_code == 200:
            print("✅ Export PDF endpoint works")
            print(f"   Content-Type: {response.get('Content-Type')}")
            results['export_pdf'] = True
        else:
            print(f"❌ Export PDF failed with status {response.status_code}")
            results['export_pdf'] = False
    except Exception as e:
        print(f"❌ Export PDF error: {str(e)}")
        results['export_pdf'] = False
    
    # Test 4: Create Share Link endpoint
    print("\n" + "-"*70)
    print("TEST 4: Create Share Link Endpoint")
    print("-"*70)
    try:
        request = factory.post(
            f'/api/conversations/{conv_id}/share/',
            data=json.dumps({'expiry_days': 7}),
            content_type='application/json'
        )
        request.user = AnonymousUser()
        response = views.create_share_link(request, conv_id)
        response.render()  # Render the response before accessing content
        if response.status_code == 201:
            data = json.loads(response.content)
            print("✅ Create share link endpoint works")
            print(f"   Token: {data.get('share_token', 'N/A')[:30]}...")
            print(f"   URL: {data.get('share_url', 'N/A')}")
            results['create_share'] = True
            share_token = data.get('share_token')
        else:
            print(f"❌ Create share link failed with status {response.status_code}")
            results['create_share'] = False
            share_token = None
    except Exception as e:
        print(f"❌ Create share link error: {str(e)}")
        import traceback
        traceback.print_exc()
        results['create_share'] = False
        share_token = None
    
    # Test 5: Get Shared Conversation endpoint
    print("\n" + "-"*70)
    print("TEST 5: Get Shared Conversation Endpoint")
    print("-"*70)
    if share_token:
        try:
            request = factory.get(f'/api/shared/{share_token}/')
            request.user = AnonymousUser()
            response = views.get_shared_conversation(request, share_token)
            response.render()
            if response.status_code == 200:
                data = json.loads(response.content)
                print("✅ Get shared conversation endpoint works")
                print(f"   Title: {data['conversation']['title']}")
                print(f"   Messages: {len(data['messages'])}")
                results['get_shared'] = True
            else:
                print(f"❌ Get shared conversation failed with status {response.status_code}")
                results['get_shared'] = False
        except Exception as e:
            print(f"❌ Get shared conversation error: {str(e)}")
            import traceback
            traceback.print_exc()
            results['get_shared'] = False
    else:
        print("⚠️  Skipping (no share token from previous test)")
        results['get_shared'] = False
    
    # Test 6: Toggle Bookmark endpoint
    print("\n" + "-"*70)
    print("TEST 6: Toggle Bookmark Endpoint")
    print("-"*70)
    if msg_id:
        try:
            request = factory.post(f'/api/messages/{msg_id}/bookmark/')
            request.user = AnonymousUser()
            response = views.toggle_bookmark(request, msg_id)
            response.render()
            if response.status_code == 200:
                data = json.loads(response.content)
                print("✅ Toggle bookmark endpoint works")
                print(f"   Message ID: {data['message_id']}")
                print(f"   Is Bookmarked: {data['is_bookmarked']}")
                results['toggle_bookmark'] = True
            else:
                print(f"❌ Toggle bookmark failed with status {response.status_code}")
                results['toggle_bookmark'] = False
        except Exception as e:
            print(f"❌ Toggle bookmark error: {str(e)}")
            import traceback
            traceback.print_exc()
            results['toggle_bookmark'] = False
    else:
        print("⚠️  Skipping (no message ID)")
        results['toggle_bookmark'] = False
    
    # Test 7: Add Reaction endpoint
    print("\n" + "-"*70)
    print("TEST 7: Add Reaction Endpoint")
    print("-"*70)
    if msg_id:
        try:
            request = factory.post(
                f'/api/messages/{msg_id}/react/',
                data=json.dumps({'reaction': 'thumbs_up'}),
                content_type='application/json'
            )
            request.user = AnonymousUser()
            response = views.add_reaction(request, msg_id)
            response.render()
            if response.status_code == 200:
                data = json.loads(response.content)
                print("✅ Add reaction endpoint works")
                print(f"   Message ID: {data['message_id']}")
                print(f"   Reactions: {data['reactions']}")
                results['add_reaction'] = True
            else:
                print(f"❌ Add reaction failed with status {response.status_code}")
                results['add_reaction'] = False
        except Exception as e:
            print(f"❌ Add reaction error: {str(e)}")
            import traceback
            traceback.print_exc()
            results['add_reaction'] = False
    else:
        print("⚠️  Skipping (no message ID)")
        results['add_reaction'] = False
    
    # Test 8: Reply to Message endpoint
    print("\n" + "-"*70)
    print("TEST 8: Reply to Message Endpoint")
    print("-"*70)
    if msg_id:
        try:
            request = factory.post(
                f'/api/messages/{msg_id}/reply/',
                data=json.dumps({'content': 'Test reply', 'sender': 'user'}),
                content_type='application/json'
            )
            request.user = AnonymousUser()
            response = views.reply_to_message(request, msg_id)
            response.render()
            if response.status_code == 201:
                data = json.loads(response.content)
                print("✅ Reply to message endpoint works")
                print(f"   Reply ID: {data['id']}")
                print(f"   Parent Message: {data.get('parent_message', 'N/A')}")
                results['reply_message'] = True
            else:
                print(f"❌ Reply to message failed with status {response.status_code}")
                results['reply_message'] = False
        except Exception as e:
            print(f"❌ Reply to message error: {str(e)}")
            import traceback
            traceback.print_exc()
            results['reply_message'] = False
    else:
        print("⚠️  Skipping (no message ID)")
        results['reply_message'] = False
    
    # Test 9: Analytics Trends endpoint
    print("\n" + "-"*70)
    print("TEST 9: Analytics Trends Endpoint")
    print("-"*70)
    try:
        request = factory.get('/api/analytics/trends/?days=30')
        request.user = AnonymousUser()
        response = views.get_analytics_trends(request)
        response.render()
        if response.status_code == 200:
            data = json.loads(response.content)
            print("✅ Analytics trends endpoint works")
            print(f"   Total Conversations: {data['summary']['total_conversations']}")
            print(f"   Total Messages: {data['summary']['total_messages']}")
            print(f"   Bookmarked Messages: {data['summary']['bookmarked_messages']}")
            results['analytics_trends'] = True
        else:
            print(f"❌ Analytics trends failed with status {response.status_code}")
            results['analytics_trends'] = False
    except Exception as e:
        print(f"❌ Analytics trends error: {str(e)}")
        import traceback
        traceback.print_exc()
        results['analytics_trends'] = False
    
    # Test 10: Conversation Stats endpoint
    print("\n" + "-"*70)
    print("TEST 10: Conversation Stats Endpoint")
    print("-"*70)
    try:
        request = factory.get(f'/api/conversations/{conv_id}/stats/')
        request.user = AnonymousUser()
        response = views.get_conversation_stats(request, conv_id)
        response.render()
        if response.status_code == 200:
            data = json.loads(response.content)
            print("✅ Conversation stats endpoint works")
            print(f"   Total Messages: {data['message_counts']['total']}")
            print(f"   User Messages: {data['message_counts']['user']}")
            print(f"   AI Messages: {data['message_counts']['ai']}")
            results['conversation_stats'] = True
        else:
            print(f"❌ Conversation stats failed with status {response.status_code}")
            results['conversation_stats'] = False
    except Exception as e:
        print(f"❌ Conversation stats error: {str(e)}")
        import traceback
        traceback.print_exc()
        results['conversation_stats'] = False
    
    # Print summary
    print("\n" + "="*70)
    print("API ENDPOINTS TEST SUMMARY")
    print("="*70)
    
    total = len(results)
    passed = sum(1 for v in results.values() if v)
    
    for test_name, passed_test in results.items():
        status = "✅ PASSED" if passed_test else "❌ FAILED"
        print(f"  {test_name.upper().replace('_', ' ')}: {status}")
    
    print("\n" + "="*70)
    print(f"RESULTS: {passed}/{total} endpoints passed ({passed/total*100:.1f}%)")
    print("="*70)
    
    return passed == total

if __name__ == "__main__":
    success = test_api_endpoints()
    if success:
        print("\n🎉 ALL API ENDPOINTS WORKING!")
        sys.exit(0)
    else:
        print("\n⚠️  Some API endpoints need attention")
        sys.exit(1)
