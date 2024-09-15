from typing import Annotated, Any, List, Optional, Union
from fastapi import APIRouter, Depends
from pydantic import AfterValidator, BaseModel, Field, PlainSerializer, WithJsonSchema
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime, timezone
from fastapi import HTTPException
from app.src.routers.auth import get_current_user, User
from app.config import SECRET_KEY, MONGO_USER,MONGO_PASSWORD,MONGO_HOST,MONGO_PORT,MONGO_DB,MONGO_URI



# Create a router
router = APIRouter()


# Connect to MongoDB
client = MongoClient(MONGO_URI)
db = client[MONGO_DB]
collection = db['notification']


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


class NotificationModel(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    team_id: PyObjectId
    title: Optional[str] = ""
    description: Optional[str] = ""
    type: Optional[str] = ""
    timestamp: datetime

    class Config:
            populate_by_name = True
            arbitrary_types_allowed = True #required for the _id 
            json_encoders = {ObjectId: str}


class NotificationCreate(BaseModel):
    team_id: PyObjectId
    title: Optional[str] = ""
    description: Optional[str] = ""
    type: Optional[str] = ""

    class Config:
            populate_by_name = True
            arbitrary_types_allowed = True #required for the _id 
            json_encoders = {ObjectId: str}

class Notification(NotificationCreate):
    id: PyObjectId

    class Config:
            populate_by_name = True
            arbitrary_types_allowed = True #required for the _id 
            json_encoders = {ObjectId: str}


def add_notification(record):
    try:
        collection.insert_one(record)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/calendar/create-notification", response_model=NotificationCreate, tags=["notification"])
def create_notification(notification: NotificationCreate, current_user: User = Depends(get_current_user)):
    try:

        record = {
            'team_id': current_user["team_id"],
            'title': notification.title,
            'description': current_user["username"] + notification.description,
            'type': notification.type,
            'timestamp': datetime.now()
        }

        result = collection.insert_one(record)

        return {"id": str(result.inserted_id), **record}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/notification/get-notifications", response_model=List[NotificationModel], tags=["notification"])
def getBoard(current_user: Annotated[User, Depends(get_current_user)],
):
    try:
        # Create a record with a random ID (ObjectId) and a timestamp
        # Inserting the record into the database
        query = {"team_id":current_user["team_id"]}
        entries = collection.find(query)
        return entries
          # Print the results
        #output = list(result)
       # total_entries = collection.count_documents(query)
        # Return the ID of the inserted record
      

    except Exception as e:
        # If something goes wrong, raise an HTTP exception
        raise HTTPException(status_code=500, detail=str(e))