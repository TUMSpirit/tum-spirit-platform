from mailbox import Message
from fastapi import APIRouter, Body, Depends, File, Form, UploadFile, HTTPException
from typing import Annotated, Any, Dict, List, Optional, Union
from pydantic import AfterValidator, BaseModel, Field, PlainSerializer, WithJsonSchema
from pymongo import MongoClient
from bson import ObjectId, json_util
from datetime import datetime, timedelta, timezone
from app.src.routers.auth import is_admin, User
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
file_collection = db['files']
teams_collection = db['teams']


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
def broadcast_message(
    content: str, 
    project_id: Optional[str] = None,  # Allow project_id as an optional field
    current_user: User = Depends(is_admin)
):
    try:
        # If a project_id is provided, filter teams by that project ID from the teams collection
        if project_id:
            # Convert the provided project_id to an ObjectId
            project_object_id = ObjectId(project_id)

            # Fetch teams associated with the given project_id
            teams_filtered = teams_collection.find({"project_id": project_object_id})
            team_ids = [team["team_id"] for team in teams_filtered]
            print(f"Filtered team IDs for project {project_id}: {team_ids}")  # Debug log

            if not team_ids:
                raise HTTPException(status_code=404, detail="404: No teams found for the specified project")
        else:
            # If no project_id is provided, use all teams from the teams collection
            teams_filtered = teams_collection.find({})
            team_ids = [team["team_id"] for team in teams_filtered]
            print(f"No project_id provided, using all team IDs: {team_ids}")  # Debug log

        messages = []

        # Broadcast the message to the relevant teams
        for team_id in team_ids:
            message = {
                "teamId": ObjectId(team_id),
                "content": content,
                "senderId": 'Spirit',  # Avatar name as the sender
                "timestamp": datetime.now(timezone.utc),
                "replyingTo": None,
                "reactions": {},  # Set reactions to an empty object
                "isGif": False,  # Set isGif to boolean false
                "privateChatId": None
            }
            result = chat_collection.insert_one(message)
            messages.append(result.inserted_id)

        return {"message": "Broadcast successful", "message_ids": [str(m) for m in messages]}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


#@router.post("/avatar/create-calendar-entry", tags=["avatar"])
#def create_calendar_entry(title: str, date: datetime = Body(...), current_user: User = Depends(is_admin)):
 #   try:
  #      teams = get_distinct_team_ids()  # Assuming you have a teams collection
   ##     events = []
        
     #   for teamId in teams:
      #      event = {
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
       #         'timestamp': datetime.now()
        #    }
         #   result = chat_collection.insert_one(event)
          #  events.append(result.inserted_id)
        
        #return {"message": "Calendar entry created", "message_ids": [str(m) for m in events]}
    #except Exception as e:
     #   raise HTTPException(status_code=500, detail=str(e))


@router.post("/avatar/create-kanban-card", tags=["avatar"])
def create_kanban_card(
    title: str,
    description: str,
    priority: str = "",
    deadline: int = 0,
    milestone: str = "",
    current_user: User = Depends(is_admin)):
    
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
                'tags': [],
                'milestone': milestone,
                'sharedUsers': [],
                'created_by': 'Spirit',
                'timestamp': datetime.now()  # Associate the card with the provided board ID
                 # Track which user created the card
            }
            result = kanban_collection.insert_one(card)
            cards.append(result.inserted_id)
        
        return {"message": "Kanban card created", "message_ids": [str(m) for m in cards]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/avatar/upload-document-avatar", tags=["avatar"])
async def upload_document_for_teams(
    files: List[UploadFile], 
    project_id: Optional[str] = None,  # Single project_id as an optional field
    current_user: User = Depends(is_admin)
):
    if not files:
        raise HTTPException(status_code=400, detail="File is required")

    try:
        file = files[0]
        file_data = await file.read()
        file_size = len(file_data)  # Calculate file size in bytes

        # Fetch all team IDs from the user collection
        all_team_ids = get_distinct_team_ids()
        print(f"Fetched team IDs from users collection: {all_team_ids}")  # Debug log

        # If a project_id is provided, filter teams by that project ID from teams collection
        if project_id:
            # Fetch teams associated with the given project_id
            teams_filtered = teams_collection.find({"project_id": project_id, "team_id": {"$in": all_team_ids}})
            team_ids = [team["team_id"] for team in teams_filtered]
            print(f"Filtered team IDs for project {project_id}: {team_ids}")  # Debug log

            if not team_ids:
                raise HTTPException(status_code=404, detail="404: No teams found for the specified project")
        else:
            team_ids = all_team_ids  # If no project_id, use all teams
            print(f"No project_id provided, using all team IDs: {team_ids}")  # Debug log

        uploaded_files = []

        for team_id in team_ids:
            file_record = {
                "team_id": team_id,
                "filename": file.filename,
                "contentType": file.content_type,
                "fileData": file_data,
                "size": file_size,  # Store file size
                "uploaded_by": 'Spirit',  # Avatar name as uploader
                "timestamp": datetime.now(timezone.utc)
            }

            result = file_collection.insert_one(file_record)
            uploaded_files.append(str(result.inserted_id))

        return {"message": "Files uploaded", "file_ids": uploaded_files}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
