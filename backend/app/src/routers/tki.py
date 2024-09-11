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

# Load environment variables from a .env file
# load_dotenv()

# Create a router
router = APIRouter()

# Connect to MongoDB
client = MongoClient(MONGO_URI)
db = client[MONGO_DB]
collection = db['tki_results']

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

# TKI Result Schema
class TKIResult(BaseModel):
    appreciation: int
    contact: int
    highStandards: int
    influence: int
    informationSharing: int
    participativeSafety: int
    reflection: int
    security: int
    supportForInnovation: int
    synergy: int
    taskOrientation: int
    vision: int

@router.post("/tki/save", tags=["tki"])
async def save_tki_result(result: TKIResult, current_user: Annotated[User, Depends(get_current_user)]):
    try:
        # Add user_id and timestamp to the result
        result_data = result.model_dump()  # Using model_dump instead of dict()
        result_data['user_id'] = current_user["_id"]
        result_data['submittedAt'] = datetime.now()

        # Save the result to MongoDB
        collection.insert_one(result_data)
        return {"message": "TKI successfully saved"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving TKI results: {e}")
