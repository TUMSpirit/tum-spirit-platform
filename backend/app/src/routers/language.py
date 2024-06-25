from typing import Annotated, Any, List, Optional, Union
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from pydantic import AfterValidator, BaseModel, Field, PlainSerializer, WithJsonSchema

#from app.src.routers.auth import User, get_current_user

from ..language_helpers.analyze_chat import analyze_chat
from ..language_helpers.api.sentiment import get_sentiment, get_sentiment2

from app.src.routers.auth import get_current_user, User

from datetime import datetime

router = APIRouter()

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


class MetadataModel(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    team_id: PyObjectId
    column: Optional[str] = ""
    title: Optional[str] = ""
    description: Optional[str] = ""
    priority: Optional[str] = ""
    deadline: Optional[int] = 0
    tags: Optional[List] = []


    class Config:
            allow_population_by_field_name = True
            arbitrary_types_allowed = True #required for the _id 
            json_encoders = {ObjectId: str}


class MetadataCreate(BaseModel):
    title: str
    column: str
    description: Optional[str] = ""
    priority: str
    deadline: int
    tags: List

class Metadata(MetadataCreate):
    id: PyObjectId

    class Config:
            populate_by_name = True
            arbitrary_types_allowed = True #required for the _id 
            json_encoders = {ObjectId: str}

## Scheduler method, that gets triggered to create new metadata
@router.get("/language/analyze", tags=["language"])
def predict():    
    return analyze_chat()

#sentiment2 is working, first not!!
@router.get("/language/sentiment", tags=["language"])
async def sentiment(current_user: Annotated[User, Depends(get_current_user)], startDate:datetime=None, endDate:datetime=None):
    return get_sentiment(current_user.id, startDate, endDate)


@router.get("/language/sentiment2", tags=["language"], response_model=List[dict])
async def sentiment(startDate:datetime=None, endDate:datetime=None):
    return get_sentiment2(startDate, endDate)


#@router.get("/language/get-chat-metadata", tags=["language"], response_model=List[dict])
#async def get_chat_metadata(startDate:datetime=None, endDate:datetime=None):
  #  return get_sentiment2(startDate, endDate)