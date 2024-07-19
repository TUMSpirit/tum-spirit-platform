from typing import Annotated, Any, Dict, List, Optional, Union
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from pydantic import AfterValidator, BaseModel, Field, PlainSerializer, WithJsonSchema
from ..language_helpers.analyze_chat import analyze_chat, analyze_chat2
from ..language_helpers.api.sentiment import get_sentiment, get_big5, get_big5_team

from app.src.routers.auth import get_current_user, User

from datetime import datetime, timedelta
from pymongo.errors import ConnectionFailure
from app.src.utils.db import get_db

router = APIRouter()

metadata_collection = get_db("chat_metadata")

def convert_objectid(item: Any) -> Any:
    if isinstance(item, dict):
        return {k: convert_objectid(v) for k, v in item.items()}
    elif isinstance(item, list):
        return [convert_objectid(i) for i in item]
    elif isinstance(item, ObjectId):
        return str(item)
    else:
        return item

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




class AveragePredictionsResponse(BaseModel):
    start_date: str
    end_date: str
    average_predictions: Dict[str, float]

def calculate_average(predictions_list: List[Dict[str, float]]) -> Dict[str, float]:
    if not predictions_list:
        return []
    
    sum_predictions = {key: 0.0 for key in predictions_list[0]}
    count = len(predictions_list)
    
    for predictions in predictions_list:
        for key, value in predictions.items():
            sum_predictions[key] += value
    
    avg_predictions = [round(value / count, 1) for value in sum_predictions.values()]
    return avg_predictions

## Scheduler method, that gets triggered to create new metadata
@router.get("/language/analyze", tags=["language"])
def predict():    
    return analyze_chat()

@router.get("/language/analyze-demo", tags=["language"])
def predictdemo(input:str):    
    return analyze_chat2(input)

@router.get("/language/get-big5-data", tags=["language"])
async def big5(current_user: Annotated[User, Depends(get_current_user)], startDate:datetime=None, endDate:datetime=None):
    try:
        if startDate is None:
            startDate = datetime.now() - timedelta(days=30)
        if endDate is None:
            endDate = datetime.now()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use ISO format (YYYY-MM-DD).")
    
  # MongoDB query
    documents = metadata_collection.find({
        "timestamp": {
            "$gte": startDate,
            "$lte": endDate
        }
    })

    # Processing logic
    predictions_list = []
    for document in documents:
        ocean = document["metadata"]["OCEAN"]
        predictions = {key: value["predicton_s"] for key, value in ocean.items()}
        predictions_list.append(predictions)

    # Calculate average predictions
    if predictions_list:
        avg_predictions = calculate_average(predictions_list)
    else:
        avg_predictions = []

    # Return response
    response_data = avg_predictions
    return response_data

@router.get("/language/get-big5-team-data", tags=["language"])
async def big5team(current_user: Annotated[User, Depends(get_current_user)], startDate:datetime=None, endDate:datetime=None):
    try:
        if startDate is None:
            startDate = datetime.now() - timedelta(days=30)
        if endDate is None:
            endDate = datetime.now()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use ISO format (YYYY-MM-DD).")
    
  # MongoDB query
    documents = metadata_collection.find({
        "timestamp": {
            "$gte": startDate,
            "$lte": endDate
        }
    })

    # Processing logic
    predictions_list = []
    for document in documents:
        ocean = document["metadata"]["OCEAN"]
        predictions = {key: value["predicton_s"] for key, value in ocean.items()}
        predictions_list.append(predictions)

    # Calculate average predictions
    if predictions_list:
        avg_predictions = calculate_average(predictions_list)
    else:
        avg_predictions = []

    # Return response
    response_data = avg_predictions
    return response_data


@router.get("/language/get-sentiment", tags=["language"])
async def sentiment(current_user: Annotated[User, Depends(get_current_user)], startDate:datetime=None, endDate:datetime=None):
    filter_by = {"sender_id": current_user["_id"]}

    # filter start & end Date
    if startDate and endDate:
        filter_by["timestamp"] = {"$gt": startDate, "$lt": endDate}
    

    result = metadata_collection.find(
        filter_by, 
        {"_id": 0, "metadata": {"sentiment": 1}, "timestamp": 1})
    result_list = [{"date": entry["timestamp"], "sentiment": entry["metadata"]["sentiment"]} for entry in result]

    return result_list
    



@router.get("/language/get-chat-timeline", tags=["language"])
async def sentiment(current_user: Annotated[User, Depends(get_current_user)], startDate:datetime=None, endDate:datetime=None):
    return get_sentiment(current_user.id, startDate, endDate)

@router.get("/language/get-language-analysis", tags=["language"])
async def sentiment(current_user: Annotated[User, Depends(get_current_user)], startDate:datetime=None, endDate:datetime=None):
    return get_sentiment(current_user.id, startDate, endDate)

@router.get("/language/get-messages-per-day", tags=["language"])
async def sentiment(current_user: Annotated[User, Depends(get_current_user)], startDate:datetime=None, endDate:datetime=None):
    return get_sentiment(current_user.id, startDate, endDate)


@router.get("/language/get-task-logs", tags=["kanban_metadata"])
async def sentiment(current_user: Annotated[User, Depends(get_current_user)], startDate:datetime=None, endDate:datetime=None):
    return get_sentiment(current_user.id, startDate, endDate)

@router.get("/language/get-task-metrics", tags=["kanban_metadata"])
async def sentiment(current_user: Annotated[User, Depends(get_current_user)], startDate:datetime=None, endDate:datetime=None):
    return get_sentiment(current_user.id, startDate, endDate)




