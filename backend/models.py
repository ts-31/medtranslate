from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")

class ConversationModel(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)
    doctor_language: str
    patient_language: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
    }

class MessageModel(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)
    conversation_id: str
    sender_role: str  # "doctor" or "patient"
    original_text: Optional[str] = None
    translated_text: Optional[str] = None
    audio_url: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
    }

class CreateConversationRequest(BaseModel):
    doctor_language: str
    patient_language: str

class CreateMessageRequest(BaseModel):
    conversation_id: str
    sender_role: str
    text: str
