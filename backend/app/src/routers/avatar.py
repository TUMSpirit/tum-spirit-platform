from mailbox import Message
from fastapi import APIRouter, Body, Depends, File, Form, UploadFile, HTTPException
from typing import Annotated, Any, Dict, List, Optional, Union
from pydantic import AfterValidator, BaseModel, Field, PlainSerializer, WithJsonSchema
from pymongo import MongoClient
from bson import ObjectId, json_util
from datetime import datetime, timedelta, timezone
from app.src.routers.auth import get_current_user, User
from fastapi.responses import StreamingResponse
from app.src.routers.auth import get_distinct_team_ids
from app.src.routers.notification import add_notification
import io
from dotenv import load_dotenv
import os
from app.config import MONGO_DB,MONGO_URI


# Load environment variables from a .env file
#load_dotenv()

# Create a router
router = APIRouter()

# Connect to MongoDB
client = MongoClient(MONGO_URI)
db = client[MONGO_DB]
chat_collection= db['chat']
calendar_collection = db['calendar']
kanban_collection = db['kanban']

def validate_object_id(v: Any) -> ObjectId:
    if isinstance(v, ObjectId):
        return v
    if ObjectId.is_valid(v):
        return ObjectId(v)
    raise ValueError("Invalid ObjectId")


PyObjectId = Annotated[
    Union[str, ObjectId],
    AfterValidator(validate_object_id),
    PlainSerializer(lambda x: str(x), return_type=str),
    WithJsonSchema({"type": "string"}, mode="serialization"),
]

class Message(BaseModel):
    teamId: PyObjectId
    content: str
    senderId: str
    timestamp: datetime
    replyingTo: Optional[str] = None
    reactions: Optional[Dict[str, str]] = Field(default_factory=dict)
    isGif: Optional[bool] = False
    privateChatId: Optional[str] = None

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True  # required for the _id
        json_encoders = {ObjectId: str}
            
@router.post("/avatar/broadcast-message", tags=["avatar"])
def broadcast_message(content: str, current_user: User = Depends(get_current_user)):
    try:
        teams = get_distinct_team_ids()  # Assuming you have a teams collection
        messages = []
        
        for teamId in teams:
            message = {
                "teamId": ObjectId(teamId),
                "content": content,
                "senderId": 'Spirit',
                "timestamp": datetime.now(timezone.utc),
                "replyingTo": None,
                "reactions": None,
                "isGif": None,
                "privateChatId": None
            }
            result = chat_collection.insert_one(message)
            messages.append(result.inserted_id)
        
        return {"message": "Broadcast successful", "message_ids": [str(m) for m in messages]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/avatar/create-calendar-entry", tags=["avatar"])
def create_calendar_entry(title: str, date: datetime = Body(...), current_user: User = Depends(get_current_user)):
    try:
        teams = get_distinct_team_ids()  # Assuming you have a teams collection
        events = []
        
        for teamId in teams:
            event = {
              #  'title': title,
               # 'startDate': startDate,
                #'endDate': endDate,
                #'color': "B29DD9",
                #'allDay': false,
                #'isOnSite': calendar_entry.isOnSite,
                #'room': calendar_entry.room,
                #'remoteLink': calendar_entry.remoteLink,
                #'textArea': calendar_entry.textArea,
                #'isMilestone': calendar_entry.isMilestone,
                #'files': calendar_entry.files,
                #'users': calendar_entry.users,  # Convert ObjectId to str
                'timestamp': datetime.now()
            }
            result = chat_collection.insert_one(event)
            events.append(result.inserted_id)
        
        return {"message": "Calendar entry created", "message_ids": [str(m) for m in events]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/avatar/create-kanban-card", tags=["avatar"])
def create_kanban_card(
    title: str,
    description: str,
    priority: str = "",
    deadline: int = 0,
    tags: List = [],
    milestone: str = "",
    current_user: User = Depends(get_current_user)):
    
    try:
        teams = get_distinct_team_ids()  # Assuming you have a teams collection
        cards = []
        for teamId in teams:
            card = {
                'team_id': teamId,
                'title': title,
                'column': "backlog",  # Assuming "title" is also the name of the column (adjust if needed)
                'description': description,
                'priority': priority,
                'deadline': deadline,
                'tags': tags,
                'milestone': milestone,
                'shadredUsers': [],
                'createdBy': 'Spirit',
                'timestamp': datetime.now()  # Associate the card with the provided board ID
                 # Track which user created the card
            }
            result = kanban_collection.insert_one(card)
            cards.append(result.inserted_id)
        
        return {"message": "Kanban card created", "message_ids": [str(m) for m in cards]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))