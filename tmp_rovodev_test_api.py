"""
Quick test script to verify the send_message endpoint fix
"""
import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_send_message():
    print("Testing send_message endpoint...")
    
    # Test 1: Create a conversation first
    print("\n1. Creating a conversation...")
    response = requests.post(f"{BASE_URL}/conversations/", json={"title": "Test Conversation"})
    if response.status_code == 201:
        conversation_id = response.json()['id']
        print(f"✓ Conversation created with ID: {conversation_id}")
    else:
        print(f"✗ Failed to create conversation: {response.status_code}")
        print(response.text)
        return
    
    # Test 2: Send a valid message
    print("\n2. Sending a valid message...")
    response = requests.post(f"{BASE_URL}/messages/send/", json={
        "conversation_id": conversation_id,
        "content": "Hello, AI!"
    })
    if response.status_code == 201:
        print("✓ Message sent successfully")
        print(f"   User message: {response.json()['user_message']['content']}")
        print(f"   AI response: {response.json()['ai_message']['content']}")
    else:
        print(f"✗ Failed to send message: {response.status_code}")
        print(f"   Error: {response.json()}")
    
    # Test 3: Missing conversation_id
    print("\n3. Testing missing conversation_id...")
    response = requests.post(f"{BASE_URL}/messages/send/", json={
        "content": "Hello, AI!"
    })
    if response.status_code == 400:
        print(f"✓ Correctly rejected: {response.json()['error']}")
    else:
        print(f"✗ Unexpected response: {response.status_code}")
    
    # Test 4: Missing content
    print("\n4. Testing missing content...")
    response = requests.post(f"{BASE_URL}/messages/send/", json={
        "conversation_id": conversation_id
    })
    if response.status_code == 400:
        print(f"✓ Correctly rejected: {response.json()['error']}")
    else:
        print(f"✗ Unexpected response: {response.status_code}")
    
    # Test 5: Empty/whitespace content
    print("\n5. Testing empty/whitespace content...")
    response = requests.post(f"{BASE_URL}/messages/send/", json={
        "conversation_id": conversation_id,
        "content": "   "
    })
    if response.status_code == 400:
        print(f"✓ Correctly rejected: {response.json()['error']}")
    else:
        print(f"✗ Unexpected response: {response.status_code}")
    
    print("\n" + "="*50)
    print("All tests completed!")

if __name__ == "__main__":
    try:
        test_send_message()
    except requests.exceptions.ConnectionError:
        print("✗ Could not connect to backend server.")
        print("  Make sure the backend is running on http://localhost:8000")
    except Exception as e:
        print(f"✗ Error during testing: {e}")
