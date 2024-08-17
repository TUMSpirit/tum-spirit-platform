from typing import Annotated, Any, List, Optional, Union
from fastapi import APIRouter, Depends
from pydantic import AfterValidator, BaseModel, Field, PlainSerializer, WithJsonSchema
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
from fastapi import HTTPException
from app.src.routers.auth import get_current_user, User
from app.config import MONGO_DB,MONGO_URI



# Create a router
router = APIRouter()

# Connect to MongoDB
client = MongoClient(MONGO_URI)
db = client[MONGO_DB]
collection = db['team']


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


class TeamModel(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    project: str
    name: str
    members: List[PyObjectId]
    
    class Config:
            populate_by_name = True
            arbitrary_types_allowed = True #required for the _id 
            json_encoders = {ObjectId: str}

class TeamCreate(BaseModel):
    project: str
    name: str
    members: List[PyObjectId]
    
    class Config:
            populate_by_name = True
            arbitrary_types_allowed = True #required for the _id 
            json_encoders = {ObjectId: str}

class Team(TeamCreate):
    id: PyObjectId

    class Config:
            populate_by_name = True
            arbitrary_types_allowed = True #required for the _id 
            json_encoders = {ObjectId: str}


# Define a route to insert a record into the database
@router.post("/team/create-team", response_model=TeamCreate, tags=["team"])
def create_team_entry(team_entry: TeamCreate, current_user: Annotated[User, Depends(get_current_user)]):
    try:
        # Create a record with a random ID (ObjectId) and a timestamp
        record = {
            'project': team_entry.project,
            'name': team_entry.name,
            'members': team_entry.members,
            'timestamp': datetime.now()
        }
        # Inserting the record into the database
        result = collection.insert_one(record)
        # Return the ID of the inserted record
        return {"id": str(result.inserted_id), **record}
    except Exception as e:
        # If something goes wrong, raise an HTTP exception
        raise HTTPException(status_code=500, detail=str(e))

# Define a route to insert a record into the database
@router.delete("/team/delete-team/{team_id}", response_model=dict, tags=["team"])
def delete_team_entry(team_id: str, current_user: Annotated[User, Depends(get_current_user)]):
   try:
        # Überprüfen, ob der Eintrag existiert und der aktuelle Benutzer berechtigt ist
        existing_entry = collection.find_one({"_id": ObjectId(team_id)})
        if not existing_entry:
            raise HTTPException(status_code=404, detail="Entry not found or not authorized")

        # Löschen des Eintrags aus der MongoDB
        result = collection.delete_one({"_id": ObjectId(team_id)})

        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Entry not found")
        
        return {"message": "Entry deleted successfully"}
   except Exception as e:
       
        raise HTTPException(status_code=500, detail=str(e))