from typing import Annotated, Any, List, Optional, Union
from fastapi import APIRouter, Depends
from pydantic import AfterValidator, BaseModel, Field, PlainSerializer, WithJsonSchema
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
from fastapi import HTTPException

from app.src.routers.auth import get_current_user, User


# Create a router
router = APIRouter()


# Retrieve MongoDB credentials and database info
MONGO_USER = "root"
MONGO_PASSWORD = "example"
MONGO_HOST = "mongo"
MONGO_PORT = "27017"
MONGO_DB = "TUMSpirit"

# connection string
MONGO_URI = "mongodb://root:example@mongo:27017/mydatabase?authSource=admin"


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
    teamId: PyObjectId
    title: Optional[str] = ""
    description: Optional[str] = ""
    type: Optional[str] = ""

    class Config:
            allow_population_by_field_name = True
            arbitrary_types_allowed = True #required for the _id 
            json_encoders = {ObjectId: str}


class NotificationCreate(BaseModel):
    teamId: PyObjectId
    title: Optional[str] = ""
    description: Optional[str] = ""
    type: Optional[str] = ""

    class Config:
            allow_population_by_field_name = True
            arbitrary_types_allowed = True #required for the _id 
            json_encoders = {ObjectId: str}

class Notification(NotificationCreate):
    id: PyObjectId

    class Config:
            populate_by_name = True
            arbitrary_types_allowed = True #required for the _id 
            json_encoders = {ObjectId: str}

@router.post("/calendar/create-notification", response_model=NotificationCreate, tags=["notification"])
def add_notification(notification: NotificationCreate, current_user: User = Depends(get_current_user)):
    try:

        record = {
            'teamId': notification.teamId,
            'title': notification.title,
            'description': notification.description,
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
        entries = collection.find()
        return entries
          # Print the results
        #output = list(result)
       # total_entries = collection.count_documents(query)
        # Return the ID of the inserted record
      

    except Exception as e:
        # If something goes wrong, raise an HTTP exception
        raise HTTPException(status_code=500, detail=str(e))