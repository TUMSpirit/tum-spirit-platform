from fastapi import APIRouter, Depends, HTTPException
from typing import Annotated, Any, List, Optional, Union
from pydantic import BaseModel, Field, AfterValidator, PlainSerializer, WithJsonSchema
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
from app.src.routers.auth import get_current_user, User
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
project_collection = db['clicks']


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

class ClickData(BaseModel):
    home: Optional[int] = Field(0, description="Total clicks on the home menu")
    calendar: Optional[int] = Field(0, description="Total clicks on the calendar menu")
    statistics: Optional[int] = Field(0, description="Total clicks on the statistics menu")
    chat: Optional[int] = Field(0, description="Total clicks on the chat menu")
    kanban: Optional[int] = Field(0, description="Total clicks on the kanban menu")
    team: Optional[int] = Field(0, description="Total clicks on the team menu")
    documents: Optional[int] = Field(0, description="Total clicks on the documents menu")
    last_updated: datetime = Field(default_factory=datetime.now, description="Timestamp of the last click update")

# Project Model

@router.post("/track-clicks", summary="Track User Clicks")
async def track_user_clicks(
    click_data: ClickData,
    current_user: Annotated[User, Depends(get_current_user)] # Assuming you want to track clicks per user
):
    """
    This endpoint will receive batched clicks data from the frontend.
    It will create or update the user's total click counts in the 'clicks' collection.
    """
    try:
        # Find existing click data for the user
        existing_click_data = project_collection.find_one({"user_id": current_user["_id"]})

        if existing_click_data:
            # If data exists, update it by incrementing the counts
            updated_data = {
                "$inc": {
                    "home": click_data.home,
                    "calendar": click_data.calendar,
                    "statistics": click_data.statistics,
                    "chat": click_data.chat,
                    "kanban": click_data.kanban,
                    "team": click_data.team,
                    "documents": click_data.documents,
                },
                "$set": {"last_updated": datetime.now()}  # Update timestamp
            }
            project_collection.update_one({"user_id": current_user["_id"]}, updated_data)
        else:
            # If data doesn't exist, create a new record
            new_click_data = click_data.model_dump()
            new_click_data["user_id"] = current_user["_id"]
            new_click_data["last_updated"] = datetime.now()
            project_collection.insert_one(new_click_data)

        return {"message": "Click data updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating click data: {str(e)}")