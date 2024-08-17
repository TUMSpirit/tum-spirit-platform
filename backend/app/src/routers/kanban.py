from fastapi import APIRouter, Depends
from typing import Annotated, Any, List, Optional, Union
from pydantic import AfterValidator, BaseModel, Field, PlainSerializer, WithJsonSchema
from pymongo import MongoClient
from bson import ObjectId, json_util
from datetime import datetime
from fastapi import HTTPException
from app.src.routers.auth import get_current_user, User
from app.src.routers.notification import add_notification
from app.config import MONGO_DB,MONGO_URI


# Create a router
router = APIRouter()

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
    team_id: PyObjectId
    column: Optional[str] = ""
    title: Optional[str] = ""
    description: Optional[str] = ""
    priority: Optional[str] = ""
    deadline: Optional[int] = 0
    tags: Optional[List] = []
    milestone: str


    class Config:
            populate_by_name = True
            arbitrary_types_allowed = True #required for the _id 
            json_encoders = {ObjectId: str}
            
            
class TaskColumnUpdate(BaseModel):
    column: str



class TaskCreate(BaseModel):
    title: str
    column: str
    description: Optional[str] = ""
    priority: str
    deadline: int
    tags: List
    milestone: str

class Task(TaskCreate):
    id: PyObjectId

    class Config:
            populate_by_name = True
            arbitrary_types_allowed = True #required for the _id 
            json_encoders = {ObjectId: str}


# Define a route to insert a record into the database
@router.post("/kanban/create-task", response_model=TaskModel, tags=["kanban"])
def insert_task(task_entry: TaskCreate, current_user: Annotated[User, Depends(get_current_user)]):
    try:
        # Create a record with a random ID (ObjectId) and a timestamp
        record = {
            'team_id': current_user["team_id"],
            'title': task_entry.title,
            'column': task_entry.column,
            'description': task_entry.description,
            'priority': task_entry.priority,
            'deadline': task_entry.deadline,
            'tags':task_entry.tags,
            'milestone':task_entry.milestone,
            'timestamp': datetime.now()
        }
        # Inserting the record into the database
        result = collection.insert_one(record)
        
        notification = {
            'team_id': current_user["team_id"],
            'title': "Kanban",
            'description': current_user["username"] + " created a Kanban Card in '" +task_entry.column+"'",
            'type': "kanban_added",
            'timestamp': datetime.now()
        }
        add_notification(notification)
        # Return the ID of the inserted record
        return {"id": str(result.inserted_id), **record}
    except Exception as e:
        # If something goes wrong, raise an HTTP exception
        raise HTTPException(status_code=500, detail=str(e))
    
    # Define a route to insert a record into the database

@router.put("/kanban/update-task/{task_id}", response_model=TaskModel, tags=["kanban"])
def update_task(task_id: str, task_entry: TaskCreate, current_user: Annotated[User, Depends(get_current_user)]):
    try:
        existing_entry = collection.find_one({"_id": ObjectId(task_id)})
        if not existing_entry:
            raise HTTPException(status_code=404, detail="Entry not found or not authorized")

        
        # Create a record with a random ID (ObjectId) and a timestamp
        update_record = {
            'title': task_entry.title,
            'column': task_entry.column,
            'description': task_entry.description,
            'priority': task_entry.priority,
            'deadline': task_entry.deadline,
            'tags':task_entry.tags,
            'milestone':task_entry.milestone,
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


@router.put("/kanban/update-task/{task_id}/column", response_model=TaskModel, tags=["kanban"])
def update_task_column(task_id: str, column: TaskColumnUpdate, current_user: Annotated[User, Depends(get_current_user)]):
    try:
        existing_entry = collection.find_one({"_id": ObjectId(task_id)})
        if not existing_entry:
            raise HTTPException(status_code=404, detail="Task not found")

        # Update the 'column' field only
        result = collection.update_one(
            {"_id": ObjectId(task_id)},
            {"$set": {"column": column.column, "timestamp": datetime.now()}}
        )

        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Task not found")

        # Retrieve and return the updated task
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

        notification = {
            'team_id': current_user["team_id"],
            'title': "Kanban",
            'description': current_user["username"] + " deleted a Kanban Card",
            'type': "kanban_deleted",
            'timestamp': datetime.now()
        }
        add_notification(notification)
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Entry not found")

        return {"message": "Entry deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/kanban/get-tasks", response_model=List[TaskModel], tags=["kanban"])
def get_tasks(current_user: Annotated[User, Depends(get_current_user)],
):
    try:
        # Create a record with a random ID (ObjectId) and a timestamp
        # Inserting the record into the database
        query = {"team_id": current_user["team_id"]}
        entries = collection.find(query)
        return entries
        #print(items)
          # Print the results
        #output = list(result)
       # total_entries = collection.count_documents(query)
        # Return the ID of the inserted record
      

    except Exception as e:
        # If something goes wrong, raise an HTTP exception
        raise HTTPException(status_code=500, detail=str(e))
