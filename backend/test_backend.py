import requests
import json
import os

BASE_URL = "http://127.0.0.1:8000"

def log(msg, data=None):
    print(msg)
    if data:
        print(json.dumps(data, indent=2))
    print("-" * 40)

def test_api():
    # 1. Create Conversation
    print("Testing Create Conversation...")
    res = requests.post(f"{BASE_URL}/api/conversations", json={
        "doctor_language": "English",
        "patient_language": "Spanish"
    })
    if res.status_code != 200:
        print(f"Failed to create conversation: {res.text}")
        return
    
    conversation = res.json()
    conv_id = conversation["_id"]
    log("Created Conversation:", conversation)
    
    # 2. Send Text Message
    print("Testing Send Text Message...")
    res = requests.post(f"{BASE_URL}/api/messages/text", json={
        "conversation_id": conv_id,
        "sender_role": "patient",
        "text": "Me duele la cabeza"
    })
    message = res.json()
    log("Sent Message (Patient):", message)
    
    # 3. Get Messages
    print("Testing Get Messages...")
    res = requests.get(f"{BASE_URL}/api/conversations/{conv_id}/messages")
    messages = res.json()
    log(f"Fetched {len(messages)} messages:", messages)
    
    # 4. Search
    print("Testing Search...")
    res = requests.get(f"{BASE_URL}/api/search?conversation_id={conv_id}&keyword=head")
    results = res.json()
    log(f"Search Results (keyword 'head'):", results)
    
    # 5. List Conversations
    print("Testing List Conversations...")
    res = requests.get(f"{BASE_URL}/api/conversations")
    conversations = res.json()
    log(f"Listed {len(conversations)} conversations", conversations[0] if conversations else None)

    print("\nSUCCESS: All basic tests passed!")

if __name__ == "__main__":
    try:
        test_api()
    except Exception as e:
        print(f"Test failed: {e}")
        print("Make sure the backend is running: uvicorn main:app --reload")
