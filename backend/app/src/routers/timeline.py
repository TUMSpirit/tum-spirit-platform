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
collection = db['timeline']


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


class MilestoneModel(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    title: Optional[str] = ""
    deadline: datetime
    details: Optional[str] = ""

    class Config:
            populate_by_name = True
            arbitrary_types_allowed = True #required for the _id 
            json_encoders = {ObjectId: str}

class MilenstoneCreate(BaseModel):
    title: str
    deadline: datetime
    details: Optional[str] = ""

class Milestone(MilenstoneCreate):
    id: PyObjectId

    class Config:
            populate_by_name = True
            arbitrary_types_allowed = True #required for the _id 
            json_encoders = {ObjectId: str}
            
            
# Methode zur Berechnung des Fortschritts
def calculate_progress(iso_datetime: str) -> int:
    try:
        milestone_time = datetime.fromisoformat(iso_datetime)
        now = datetime.now()  # Aktuelle Zeit
        total_duration = (milestone_time - now).total_seconds()
        elapsed_time = (now - now).total_seconds()
        progress_percent = min((elapsed_time / total_duration) * 100, 100)
        return int(progress_percent)  # Rückgabe des Fortschritts als Ganzzahl
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid ISO datetime format")


@router.post("/calendar/create-milestone", response_model=MilenstoneCreate, tags=["timeline"])
def add_milestone(milestone: MilenstoneCreate, current_user: User = Depends(get_current_user)):
    try:
        record = {
            'title': milestone.title,
            'details': milestone.details,
            'deadline': milestone.deadline,
            'timestamp': datetime.now()
        }

        result = collection.insert_one(record)

        return {"id": str(result.inserted_id), **record}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/timeline/get-milestones", response_model=List[Milestone], tags=["timeline"])
def getBoard(current_user: Annotated[User, Depends(get_current_user)],
):
    try:
        # Create a record with a random ID (ObjectId) and a timestamp
        # Inserting the record into the database
        query = {"team_id":current_user["team_id"]}
        items = []
        for item in collection.find():
            items.append(MilestoneModel(**item))

        #print(items)
        return items
          # Print the results
        #output = list(result)
       # total_entries = collection.count_documents(query)
        # Return the ID of the inserted record
      

    except Exception as e:
        # If something goes wrong, raise an HTTP exception
        raise HTTPException(status_code=500, detail=str(e))