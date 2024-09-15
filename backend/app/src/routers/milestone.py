from fastapi import APIRouter, Depends, HTTPException
from typing import Annotated, Any, List, Optional, Union
from pydantic import BaseModel, Field, AfterValidator, PlainSerializer, WithJsonSchema
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
from app.src.routers.auth import is_admin, User
from dotenv import load_dotenv
import os
from app.config import MONGO_DB, MONGO_URI

# Load environment variables from a .env file
# load_dotenv()

# Create a router
router = APIRouter()

# Connect to MongoDB
client = MongoClient(MONGO_URI)
db = client[MONGO_DB]
milestone_collection = db['milestones']

# Validate ObjectId
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

class Milestone(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    title: str
    date: datetime
    details: Optional[str] = None
    project_id: PyObjectId
    
    class Config:
            populate_by_name = True
            arbitrary_types_allowed = True #required for the _id 
            json_encoders = {ObjectId: str}
    
class MilestoneCreate(BaseModel):
    title: str
    date: datetime
    details: Optional[str] = None
    



@router.post("/create-milestones", response_model=List[MilestoneCreate], tags=["projects"])
def create_milestones(
    project_id: str,
    milestones: List[MilestoneCreate],
    current_user: Annotated[User, Depends(is_admin)]
):
    """
    Bulk creates milestones for a specific project ID.
    """
    if not ObjectId.is_valid(project_id):
        raise HTTPException(status_code=400, detail="Invalid project ID")

    # Prepare milestone data for insertion
    milestone_data_list = []
    for milestone in milestones:
        milestone_data = milestone.model_dump()
        milestone_data['project_id'] = ObjectId(project_id)  # Associate milestone with the project
        milestone_data_list.append(milestone_data)

    # Insert the milestones in bulk
    result = milestone_collection.insert_many(milestone_data_list)

    # Verify insertion and return the inserted milestones with their IDs
    if result.inserted_ids:
        # Append the inserted _id values to the response
        return [
            {**milestone.model_dump(), "_id": str(inserted_id)}
            for milestone, inserted_id in zip(milestones, result.inserted_ids)
        ]
    
    raise HTTPException(status_code=400, detail="Error creating milestones")