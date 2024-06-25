from fastapi import APIRouter, Depends
from typing import Annotated, Any, List, Optional, Union
from pydantic import AfterValidator, BaseModel, Field, PlainSerializer, WithJsonSchema
from pymongo import MongoClient
from bson import ObjectId, json_util
from datetime import datetime
from fastapi import HTTPException
from app.src.routers.auth import get_current_user, User


# Create a router
router = APIRouter()


# Retrieve MongoDB credentials and database info
MONGO_USER = "root"
MONGO_PASSWORD = "example"
MONGO_HOST = "mongo"
MONGO_PORT = "27017"
MONGO_DB = "TUMSpirit"

# connection string
MONGO_URI = "mongodb://root:example@mongo:27017/mydatabase?authSource=admin"


# Connect to MongoDB
client = MongoClient(MONGO_URI)
db = client[MONGO_DB]
collection = db['kanban']


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


class TaskModel(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    teamId: PyObjectId
    column: Optional[str] = ""
    title: Optional[str] = ""
    description: Optional[str] = ""
    priority: Optional[str] = ""
    deadline: Optional[int] = 0
    tags: Optional[List] = []


    class Config:
            populate_by_name = True
            arbitrary_types_allowed = True #required for the _id 
            json_encoders = {ObjectId: str}


class TaskCreate(BaseModel):
    teamId: PyObjectId
    title: str
    column: str
    description: Optional[str] = ""
    priority: str
    deadline: int
    tags: List
    
    class Config:
            allow_population_by_field_name = True
            arbitrary_types_allowed = True #required for the _id 
            json_encoders = {ObjectId: str}

class Task(TaskCreate):
    id: PyObjectId

    class Config:
            allow_population_by_field_name = True
            arbitrary_types_allowed = True #required for the _id 
            json_encoders = {ObjectId: str}


# Define a route to insert a record into the database
@router.post("/kanban/create-task", response_model=TaskCreate, tags=["kanban"])
def insert_task(task_entry: TaskCreate, current_user: Annotated[User, Depends(get_current_user)]):
    try:
        # Create a record with a random ID (ObjectId) and a timestamp
        record = {
            'teamId': task_entry.teamId,
            'title': task_entry.title,
            'column': task_entry.column,
            'description': task_entry.description,
            'priority': task_entry.priority,
            'deadline': task_entry.deadline,
            'tags':task_entry.tags,
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

@router.put("/kanban/update-task/{task_id}", response_model=TaskCreate, tags=["kanban"])
def update_task(task_id: str, task_entry: TaskCreate, current_user: Annotated[User, Depends(get_current_user)]):
    try:
        existing_entry = collection.find_one({"_id": ObjectId(task_id)})
        if not existing_entry:
            raise HTTPException(status_code=404, detail="Entry not found or not authorized")

        
        # Create a record with a random ID (ObjectId) and a timestamp
        update_record = {
            'teamId': task_entry.teamId,
            'title': task_entry.title,
            'column': task_entry.column,
            'description': task_entry.description,
            'priority': task_entry.priority,
            'deadline': task_entry.deadline,
            'tags':task_entry.tags,
            'timestamp': datetime.now()
        }
        # Inserting the record into the database
        
          # Update-Anfrage an die MongoDB
        result = collection.update_one(
            {"_id": ObjectId(task_id)},
            {"$set": update_record}
        )
        # Return the ID of the inserted record
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Entry not found")

        updated_entry = collection.find_one({"_id": ObjectId(task_id)})
        return TaskModel(**updated_entry)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


    
    # Define a route to insert a record into the database
@router.delete("/kanban/delete-task/{task_id}", response_model=dict, tags=["kanban"])
def delete_task(task_id: str, current_user: Annotated[User, Depends(get_current_user)]):
    try:
        # Überprüfen, ob der Eintrag existiert und der aktuelle Benutzer berechtigt ist
        existing_entry = collection.find_one({"_id": ObjectId(task_id)})
        if not existing_entry:
            raise HTTPException(status_code=404, detail="Entry not found or not authorized")

        # Löschen des Eintrags aus der MongoDB
        result = collection.delete_one({"_id": ObjectId(task_id)})

        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Entry not found")

        return {"message": "Entry deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/kanban/get-tasks", response_model=List[Task], tags=["kanban"])
def get_tasks(current_user: Annotated[User, Depends(get_current_user)],
):
    try:
        # Create a record with a random ID (ObjectId) and a timestamp
        # Inserting the record into the database
        query = {"team_id":current_user["team_id"]}
        items = []
        for item in collection.find():
            items.append(TaskModel(**item))

        #print(items)
        return items
          # Print the results
        #output = list(result)
       # total_entries = collection.count_documents(query)
        # Return the ID of the inserted record
      

    except Exception as e:
        # If something goes wrong, raise an HTTP exception
        raise HTTPException(status_code=500, detail=str(e))
