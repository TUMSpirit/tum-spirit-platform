from fastapi import APIRouter, Depends, HTTPException
from typing import Annotated, Any, Optional, Union
from pydantic import BaseModel, Field, AfterValidator, PlainSerializer, WithJsonSchema
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
from app.src.routers.auth import get_current_user, User
from dotenv import load_dotenv
import os
from app.config import MONGO_DB, MONGO_URI

# Load environment variables from a .env file if necessary
# load_dotenv()

# Create a router
router = APIRouter()

# Connect to MongoDB
client = MongoClient(MONGO_URI)
db = client[MONGO_DB]
collection = db['neoffi_results']

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

# NEO-FFI Result Schema
class NEOFFIResult(BaseModel):
    Neuroticism: int
    Extraversion: int
    Openness: int
    Agreeableness: int
    Conscientiousness: int
    time_taken: Optional[int] = None  # Time taken to complete the test in seconds
    #raw_scores: dict  # If you want to store item-wise scores, use a dict {item_number: score}
    # Optional meta fields
    #additional_notes: Optional[str] = None
    
@router.post("/neoffi/save", tags=["neoffi"])
async def save_neoffi_result(result: NEOFFIResult, current_user: Annotated[User, Depends(get_current_user)]):
    try:
        # Add user_id and timestamp to the result
        result_data = result.model_dump()  # Using model_dump instead of dict()
        result_data['user_id'] = current_user["_id"]
        result_data['submittedAt'] = datetime.now()

        # Store the time_taken field if provided
        if result.time_taken:
            result_data['time_taken'] = result.time_taken

        # Save the result to MongoDB
        collection.insert_one(result_data)
        return {"message": "NEO-FFI successfully saved"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving NEO-FFI results: {e}")
