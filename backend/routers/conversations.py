from fastapi import APIRouter, HTTPException, Body, Depends
from database import get_database
from models import ConversationModel, CreateConversationRequest, MessageModel
from services.gemini import gemini_service
from typing import List
from bson import ObjectId

router = APIRouter()

@router.post("/api/conversations", response_model=ConversationModel)
async def create_conversation(request: CreateConversationRequest, db = Depends(get_database)):
    conversation = request.dict()
    new_conversation = await db.conversations.insert_one(conversation)
    created_conversation = await db.conversations.find_one({"_id": new_conversation.inserted_id})
    return parse_json(created_conversation)

@router.get("/api/conversations", response_model=List[dict])
async def list_conversations(db = Depends(get_database)):
    conversations = await db.conversations.find().sort("created_at", -1).to_list(100)
    # Enrich with latest message snippet if needed, for simplicity just returning conversation data
    # In a real app we'd aggregate the last message.
    result = []
    for conv in conversations:
        # Fetch last message for snippet
        last_message = await db.messages.find_one(
            {"conversation_id": str(conv["_id"])},
            sort=[("created_at", -1)]
        )
        
        conv_data = parse_json(conv)
        conv_data["snippet"] = last_message["original_text"] if last_message else "No messages yet"
        conv_data["id"] = conv_data["_id"] # Map _id to id for frontend convenience if needed
        result.append(conv_data)
    return result

@router.get("/api/conversations/{conversation_id}/messages", response_model=List[MessageModel])
async def get_messages(conversation_id: str, db = Depends(get_database)):
    messages = await db.messages.find({"conversation_id": conversation_id}).sort("created_at", 1).to_list(1000)
    return [parse_json(msg) for msg in messages]

@router.post("/api/conversations/{conversation_id}/summary")
async def generate_summary(conversation_id: str, db = Depends(get_database)):
    messages = await db.messages.find({"conversation_id": conversation_id}).sort("created_at", 1).to_list(1000)
    
    if not messages:
        return {"summary": "No messages to summarize."}
        
    conversation_text = ""
    for msg in messages:
        role = msg.get("sender_role", "Unknown")
        text = msg.get("original_text", "[Audio Message]")
        conversation_text += f"{role}: {text}\n"
        
    summary = await gemini_service.generate_summary(conversation_text)
    return {"summary": summary}

def parse_json(data):
    if not data: return None
    data["_id"] = str(data["_id"])
    return data
