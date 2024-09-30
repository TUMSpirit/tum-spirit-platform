from fastapi import APIRouter, Depends, File, Form, UploadFile, HTTPException
from typing import Annotated, Any, List, Optional, Union
from pydantic import AfterValidator, BaseModel, Field, PlainSerializer, WithJsonSchema
from pymongo import MongoClient
from bson import ObjectId, json_util
from datetime import datetime
from app.src.routers.auth import get_current_user, User
from fastapi.responses import JSONResponse, StreamingResponse
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
collection = db['user_settings']

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

# Pydantic model for user settings without aliases
class UserSettings(BaseModel):
    user_id: PyObjectId
    is_first_login: Optional[bool] = True
    statistics_active: Optional[bool] = False
    test_success: Optional[bool] = False
    trigger_tki_test: Optional[bool] = False  # New flag for TKI test
    trigger_neoffi_test: Optional[bool] = False  # New flag for TKI test


    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True  # Required for the _id 
        json_encoders = {ObjectId: str}
        
    # Model for updating user settings
class UserSettingsUpdate(BaseModel):
    is_first_login: Optional[bool] = None
    statistics_active: Optional[bool] = False
    test_success: Optional[bool] = None
    trigger_tki_test: Optional[bool] = None
    trigger_neoffi_test: Optional[bool] = False  # New flag for TKI test
 

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        
        
# Helper function to get user settings
def get_user_settings(user_id: str):
    user_settings = collection.find_one({"user_id": ObjectId(user_id)})
    if not user_settings:
        raise HTTPException(status_code=404, detail="User settings not found")
    return user_settings

# Helper function to update user settings
def update_user_settings(user_id: str, settings: UserSettingsUpdate):
    existing_settings = collection.find_one({"user_id": ObjectId(user_id)})
    
    if not existing_settings:
        raise HTTPException(status_code=404, detail="User settings not found")
    
    # Prepare the updated fields
    update_data = {k: v for k, v in settings.dict(exclude_unset=True).items() if v is not None}
    
    # Update the user settings in the database
    result = collection.update_one(
        {"user_id": ObjectId(user_id)},
        {"$set": update_data}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User settings not updated")
    
    # Return the updated settings
    updated_settings = collection.find_one({"user_id": ObjectId(user_id)})
    return updated_settings


# Route to get user settings
@router.get("/get-settings", response_model=UserSettings, tags=["settings"])
async def fetch_user_settings(current_user: Annotated[User, Depends(get_current_user)]):
    settings = get_user_settings(current_user["_id"])
    return settings

@router.post("/update-settings", response_model=UserSettings, tags=["settings"])
async def update_settings(
    settings: UserSettingsUpdate,
    current_user: Annotated[User, Depends(get_current_user)]
):
    updated_settings = update_user_settings(current_user["_id"], settings)
    return updated_settings


@router.post("/trigger-tki-test", tags=["settings"])
async def trigger_tki_test():
    result = collection.update_many(
        {},  # Empty filter to match all documents
        {"$set": {"trigger_tki_test": True}}
    )
    return {"message": "TKI test trigger flag set for all users", "modified_count": result.modified_count}

# Route to reset TKI test flag after the test is done
@router.post("/reset-tki-test", tags=["settings"])
async def reset_tki_test(user: User = Depends(get_current_user)):
    collection.update_one({"user_id": ObjectId(user.id)}, {"$set": {"trigger_tki_test": False}})
    return {"message": "TKI test trigger flag reset"}
