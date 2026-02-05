from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Response, Depends
from fastapi.responses import StreamingResponse
from database import get_database, get_fs
from models import MessageModel, CreateMessageRequest
from services.gemini import gemini_service
from bson import ObjectId
import io

router = APIRouter()

@router.post("/api/messages/text", response_model=MessageModel)
async def send_text_message(request: CreateMessageRequest, db = Depends(get_database)):
    # Fetch conversation to know languages
    conversation = await db.conversations.find_one({"_id": ObjectId(request.conversation_id)})
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
        
    target_lang = conversation["patient_language"] if request.sender_role == "doctor" else conversation["doctor_language"]
    
    translated_text = await gemini_service.translate_text(request.text, target_lang)
    
    message_data = {
        "conversation_id": request.conversation_id,
        "sender_role": request.sender_role,
        "original_text": request.text,
        "translated_text": translated_text,
        "audio_url": None
    }
    
    new_message = await db.messages.insert_one(message_data)
    created_message = await db.messages.find_one({"_id": new_message.inserted_id})
    
    return parse_json(created_message)

@router.post("/api/messages/audio", response_model=MessageModel)
async def send_audio_message(
    conversation_id: str = Form(...),
    sender_role: str = Form(...),
    file: UploadFile = File(...),
    db = Depends(get_database),
    fs = Depends(get_fs)
):
    try:
        # Upload to GridFS
        grid_in = fs.open_upload_stream(
            file.filename,
            metadata={"contentType": file.content_type}
        )
        await grid_in.write(await file.read())
        await grid_in.close()
        
        file_id = str(grid_in._id)
        audio_url = f"/api/audio/{file_id}"
        
        message_data = {
            "conversation_id": conversation_id,
            "sender_role": sender_role,
            "original_text": "[Audio Message]", # Placeholder or implement STT if out of scope
            "translated_text": None,
            "audio_url": audio_url
        }
        
        new_message = await db.messages.insert_one(message_data)
        created_message = await db.messages.find_one({"_id": new_message.inserted_id})
        
        return parse_json(created_message)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/audio/{file_id}")
async def stream_audio(file_id: str, fs = Depends(get_fs)):
    try:
        if not ObjectId.is_valid(file_id):
             raise HTTPException(status_code=400, detail="Invalid file ID")
             
        grid_out = await fs.open_download_stream(ObjectId(file_id))
        
        return StreamingResponse(
            grid_out,
            media_type=grid_out.metadata.get("contentType", "audio/mpeg")
        )
    except Exception as e:
        raise HTTPException(status_code=404, detail="Audio file not found")

@router.get("/api/search")
async def search_messages(conversation_id: str, keyword: str, db = Depends(get_database)):
    query = {
        "conversation_id": conversation_id,
        "$or": [
            {"original_text": {"$regex": keyword, "$options": "i"}},
            {"translated_text": {"$regex": keyword, "$options": "i"}}
        ]
    }
    messages = await db.messages.find(query).to_list(50)
    return [parse_json(msg) for msg in messages]

def parse_json(data):
    if not data: return None
    data["_id"] = str(data["_id"])
    return data
