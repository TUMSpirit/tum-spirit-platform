from fastapi import APIRouter, Depends, File, Form, UploadFile, HTTPException
from typing import Annotated, Any, List, Optional, Union
from pydantic import AfterValidator, BaseModel, Field, PlainSerializer, WithJsonSchema
from pymongo import MongoClient
from bson import ObjectId, json_util
from datetime import datetime
from app.src.routers.auth import get_current_user, User
from fastapi.responses import StreamingResponse
from app.src.routers.notification import add_notification
import io
from dotenv import load_dotenv
import os
from app.config import MONGO_DB,MONGO_URI


# Load environment variables from a .env file
#load_dotenv()

# Create a router
router = APIRouter()


# MongoDB credentials and database info
#MONGO_USER = os.getenv("MONGO_USER")
#MONGO_PASSWORD = os.getenv("MONGO_PASSWORD")
#MONGO_HOST = os.getenv("MONGO_HOST")
#MONGO_PORT = os.getenv("MONGO_PORT")
#MONGO_DB = os.getenv("MONGO_DB")

# Connection string
#MONGO_URI = os.getenv("MONGO_URI")


# Connect to MongoDB
client = MongoClient(MONGO_URI)
db = client[MONGO_DB]
collection = db['calendar']
file_collection = db['files']

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

class FileReference(BaseModel):
    file_id: PyObjectId
    filename: str
    
    class Config:
        arbitrary_types_allowed = True

class FileEntry(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    filename: str
    contentType: str
    timestamp: datetime
    size: int
    
    class Config:
            populate_by_name = True
            arbitrary_types_allowed = True #required for the _id
            json_encoders = {ObjectId: str}

class CalendarEntry(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    title: str
    startDate: str
    endDate: str
    color: str
    allDay: bool
    isOnSite: bool
    room: str
    remoteLink: str
    textArea: str
    isMilestone: bool
    files: List[PyObjectId]
    users: List[PyObjectId]

    class Config:
            populate_by_name = True
            arbitrary_types_allowed = True #required for the _id
            json_encoders = {ObjectId: str}
            

class CreateCalendarEntry(BaseModel):
    title: str
    startDate: str
    endDate: str
    color: str
    allDay: bool
    isOnSite: bool
    room: str
    remoteLink: str
    textArea: str
    isMilestone: bool
    files: Optional[List[PyObjectId]] = []
    users: List[PyObjectId]
    
    class Config:
            populate_by_name = True
            arbitrary_types_allowed = True #required for the _id
            json_encoders = {ObjectId: str}



@router.post("/calendar/add-entry", response_model=CreateCalendarEntry, tags=["calendar"])
def add_calendar_entry(calendar_entry: CreateCalendarEntry, current_user: User = Depends(get_current_user)):
    try:

        record = {
            'title': calendar_entry.title,
            'startDate': calendar_entry.startDate,
            'endDate': calendar_entry.endDate,
            'color': calendar_entry.color,
            'allDay': calendar_entry.allDay,
            'isOnSite': calendar_entry.isOnSite,
            'room': calendar_entry.room,
            'remoteLink': calendar_entry.remoteLink,
            'textArea': calendar_entry.textArea,
            'isMilestone': calendar_entry.isMilestone,
            'files': calendar_entry.files,
            'users': calendar_entry.users,  # Convert ObjectId to str
            'timestamp': datetime.now()
        }

        result = collection.insert_one(record)


        notification = {
            'team_id': current_user["team_id"],
            'title': "Calendar",
            'description': current_user["username"] + " added a Calendar Entry",
            'type': "calendar_added",
            'timestamp': datetime.now()
        }
        add_notification(notification)
        
        return {"id": str(result.inserted_id), **record}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/calendar/get-entries", response_model=List[CalendarEntry], tags=["calendar"])
def get_calendar_entries(current_user: User = Depends(get_current_user)):
    try:
            print('Hello')

            print('currID: ', current_user['_id'])
            # Convert current user id to string
            #current_user_id_str = str(current_user.id)
            query = {"users": current_user['_id']}
            entries = collection.find(query)
            return entries
    except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
        
    
@router.get("/files/get-files", response_model=List[FileEntry], tags=["files"])
async def get_file(current_user: User = Depends(get_current_user)):
    try:
            # Convert current user id to string
            #current_user_id_str = str(current_user.id)
            query = {"team_id": current_user['team_id']}
            entries = file_collection.find(query)
            return entries
    except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    

@router.get("/files/{file_id}", tags=["files"])
async def get_file(file_id: str, current_user: User = Depends(get_current_user)):
    try:
        file_record = file_collection.find_one({"_id": ObjectId(file_id)})
        if not file_record:
            raise HTTPException(status_code=404, detail="File not found")

        # Extract file data and content type
        file_data = file_record["fileData"]
        content_type = file_record["contentType"]
        filename = file_record["filename"]

        # Return the file as a streaming response
        return StreamingResponse(io.BytesIO(file_data), media_type=content_type, headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/calendar/update-entry/{entry_id}", response_model=CreateCalendarEntry, tags=["calendar"])
def update_calendar_entry(entry_id: str, calendar_entry: CreateCalendarEntry, current_user: User = Depends(get_current_user)):
    try:

        # Überprüfen, ob der Eintrag existiert und der aktuelle Benutzer berechtigt ist
        existing_entry = collection.find_one({"_id": ObjectId(entry_id), "users": current_user['_id']})
        if not existing_entry:
            raise HTTPException(status_code=404, detail="Entry not found or not authorized")

        update_fields = {
            'title': calendar_entry.title,
            'startDate': calendar_entry.startDate,
            'endDate': calendar_entry.endDate,
            'color': calendar_entry.color,
            'allDay': calendar_entry.allDay,
            'isOnSite': calendar_entry.isOnSite,
            'room': calendar_entry.room,
            'remoteLink': calendar_entry.remoteLink,
            'textArea': calendar_entry.textArea,
            'isMilestone': calendar_entry.isMilestone,
            'files': calendar_entry.files,
            'users': calendar_entry.users,  # Liste von ObjectIds
            'timestamp': datetime.now()
        }


        # Update-Anfrage an die MongoDB
        result = collection.update_one(
            {"_id": ObjectId(entry_id)},
            {"$set": update_fields}
        )

        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Entry not found")

        updated_entry = collection.find_one({"_id": ObjectId(entry_id)})
        return CalendarEntry(**updated_entry)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@router.delete("/calendar/delete-entry/{entry_id}", response_model=dict, tags=["calendar"])
def delete_calendar_entry(entry_id: str, current_user: User = Depends(get_current_user)):
    try:
        # Überprüfen, ob der Eintrag existiert und der aktuelle Benutzer berechtigt ist
        existing_entry = collection.find_one({"_id": ObjectId(entry_id), "users": current_user['_id']})
        if not existing_entry:
            raise HTTPException(status_code=404, detail="Entry not found or not authorized")

        # Löschen des Eintrags aus der MongoDB
        result = collection.delete_one({"_id": ObjectId(entry_id)})
        
        notification = {
            'team_id': current_user["team_id"],
            'title': "Calendar",
            'description': current_user["username"] + " deleted a Calendar Entry",
            'type': "calendar_deleted",
            'timestamp': datetime.now()
        }
        add_notification(notification)

        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Entry not found")

        return {"message": "Entry deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/files/upload", response_model=FileReference, tags=["files"])
async def upload_file(files: List[UploadFile], current_user: User = Depends(get_current_user)):
    if not files:
        raise HTTPException(status_code=400, detail="File is required")

    try:
        file = files[0]
        file_data = await file.read()
        file_size = len(file_data)  # Calculate file size in bytes

        file_record = {
            "team_id": current_user["team_id"],
            "filename": file.filename,
            "contentType": file.content_type,
            "fileData": file_data,
            "size": file_size,  # Store file size
            "timestamp": datetime.now()
        }

        result = file_collection.insert_one(file_record)
        file_ref = FileReference(file_id=str(result.inserted_id), filename=file.filename)
        return file_ref
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/files/delete/{file_id}", tags=["files"])
async def delete_file(file_id: str, current_user: User = Depends(get_current_user)):
    try:
        result = file_collection.delete_one({"_id": ObjectId(file_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="File not found")
        return {"detail": "File successfully deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/files/download/{file_id}", tags=["files"])
async def download_file(file_id: str, current_user: User = Depends(get_current_user)):
    try:
        # Validate ObjectId
        if not ObjectId.is_valid(file_id):
            raise HTTPException(status_code=400, detail="Invalid file ID format")

        # Retrieve file record from the database
        file_record = file_collection.find_one({"_id": ObjectId(file_id)})
        if not file_record:
            raise HTTPException(status_code=404, detail="File not found")

        # Extract file data and content type
        file_data = file_record.get("fileData")
        content_type = file_record.get("contentType")
        filename = file_record.get("filename")

        # Check if required fields are present
        if file_data is None or content_type is None or filename is None:
            raise HTTPException(status_code=500, detail="File metadata missing")

        # Return the file as a streaming response
        return StreamingResponse(
            io.BytesIO(file_data),
            media_type=content_type,
            headers={"Content-Disposition": f'attachment; filename="{filename}"'}
        )
    except Exception as e:
        # Enhanced logging
        print(f"Error downloading file {file_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))