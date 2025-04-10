from fastapi import APIRouter, Depends, HTTPException
from typing import Annotated, Any, List, Optional, Union
from pydantic import BaseModel, Field, AfterValidator, PlainSerializer, WithJsonSchema
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
from app.src.routers.auth import get_current_user, is_admin, User
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
project_collection = db['projects']
milestone_collection = db['milestones']
team_collection = db['teams']

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

# Project Model
class Project(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    name: str
    description: Optional[str] = None
    start_date: datetime
    created_at: datetime = Field(default_factory=datetime.now)

class ProjectCreate(BaseModel):
    name: str
    description: Optional[str]
    start_date: datetime
    
    # Project Model
#class ProjectJoint(BaseModel):
 #   id: Optional[str] = Field(None, alias="_id")
  #  name: str
   # description: Optional[str] = None
    #created_at: datetime = Field(default_factory=datetime.now)
    #milestones: List[Milestone] = []  # List of milestones
# Create a new project
@router.post("/create-project", response_model=ProjectCreate, tags=["projects"])
def create_project(project: ProjectCreate, current_user: Annotated[User, Depends(is_admin)]):
    project_data = project.model_dump()
    project_data['created_at'] = datetime.now()
    result =  project_collection.insert_one(project_data)
    if result.inserted_id:
        return {**project.model_dump(), "_id": str(result.inserted_id)}
    raise HTTPException(status_code=400, detail="Error creating project")


@router.get("/get-project-by-teamid", tags=["projects"])
def get_project_by_team(current_user: Annotated[User, Depends(get_current_user)]):
    """
    Fetch the project and milestones based on the current user's team.
    """
    # Fetch the team by team_id
    team = team_collection.find_one({"_id": ObjectId(current_user["team_id"])})
    
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    # Fetch the project_id from the team
    project_id = team.get("project_id")
    if not project_id:
        raise HTTPException(status_code=404, detail="Team does not have an associated project")

    # Fetch the project document
    project = db['projects'].find_one({"_id": ObjectId(project_id)})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Fetch the milestones associated with the project_id
    milestones = list(milestone_collection.find({"project_id": ObjectId(project_id)}))

    # Convert milestones' _id to string
    milestones_data = [
        {
            "title": milestone.get("title"),
            "date": milestone.get("date"),
            "details": milestone.get("details")
        }
        for milestone in milestones
    ]

    # Return the project and associated milestones
    return {
        "id": str(project["_id"]),
        "name": project.get("name"),
        "team_name": team.get("name"),
        "description": project.get("description"),
        "start_date": project.get("start_date"),
        "created_at": project.get("created_at", datetime.now()),
        "milestones": milestones_data
    }


# Get all projects with their milestones
@router.get("/get-all-projects", response_model=List[ProjectCreate], tags=["projects"])
def get_all_projects( current_user: Annotated[User, Depends(is_admin)]):
    projects = project_collection.find()
    for project in projects:
        milestones = milestone_collection.find({"project_id": str(project["_id"])}).to_list(length=100)
        project["milestones"] = milestones
    return projects