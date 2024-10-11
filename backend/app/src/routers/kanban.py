from fastapi import APIRouter, Depends
from typing import Annotated, Any, List, Optional, Union
from pydantic import AfterValidator, BaseModel, Field, PlainSerializer, WithJsonSchema
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
from fastapi import HTTPException
from app.src.routers.auth import get_current_user, User
from app.src.routers.notification import add_notification
from app.config import MONGO_DB, MONGO_URI

# Create a router
router = APIRouter()

# Connect to MongoDB
client = MongoClient(MONGO_URI)
db = client[MONGO_DB]
collection = db['kanban']
archived_collection = db['archived_kanban']  # New collection for archived tasks
comments_collection = db['kanban_comments']  # New collection for comments


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
    sharedUsers: List[PyObjectId]
    created_by: str

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True  # Required for the _id 
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
    sharedUsers: List[PyObjectId]
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True  # Required for the _id 
        json_encoders = {ObjectId: str}

class Task(TaskCreate):
    id: PyObjectId

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True  # Required for the _id 
        json_encoders = {ObjectId: str}
        
        
class CommentModel(BaseModel):
    id: PyObjectId = Field(alias="_id")
    task_id: PyObjectId
    user_id: PyObjectId
    username: str
    avatar_color: str
    content: str
    timestamp: datetime
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True  # Required for the _id 
        json_encoders = {ObjectId: str}

class CreateComment(BaseModel):
    content: str

# Route to archive a task by moving it to the archived_kanban collection
@router.put("/kanban/archive-task/{task_id}", response_model=TaskModel, tags=["kanban"])
def archive_task(task_id: str, current_user: Annotated[User, Depends(get_current_user)]):
    try:
        task = collection.find_one({"_id": ObjectId(task_id), "team_id": current_user["team_id"]})
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")

        # Insert the task into the archived collection
        archived_collection.insert_one(task)
        # Remove the task from the original collection
        collection.delete_one({"_id": ObjectId(task_id)})

        notification = {
            'team_id': current_user["team_id"],
            'title': "Kanban",
            'description': f"{current_user['username']} archived a Kanban Card",
            'type': "kanban_deleted",
            'timestamp': datetime.now()
        }
        add_notification(notification)

        return TaskModel(**task)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Route to restore an archived task by moving it back to the kanban collection
@router.put("/kanban/restore-task/{task_id}", response_model=TaskModel, tags=["kanban"])
def restore_task(task_id: str, current_user: Annotated[User, Depends(get_current_user)]):
    try:
        archived_task = archived_collection.find_one({"_id": ObjectId(task_id), "team_id": current_user["team_id"]})
        if not archived_task:
            raise HTTPException(status_code=404, detail="Archived task not found")

        # Insert the task back into the original collection
        collection.insert_one(archived_task)
        # Remove the task from the archived collection
        archived_collection.delete_one({"_id": ObjectId(task_id)})

        notification = {
            'team_id': current_user["team_id"],
            'title': "Kanban",
            'description': f"{current_user['username']} restored a Kanban Card",
            'type': "kanban_added",
            'timestamp': datetime.now()
        }
        add_notification(notification)

        return TaskModel(**archived_task)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Route to get all archived tasks
@router.get("/kanban/get-archived-tasks", response_model=List[TaskModel], tags=["kanban"])
def get_archived_tasks(current_user: Annotated[User, Depends(get_current_user)]):
    try:
        query = {"team_id": current_user["team_id"]}
        archived_tasks = list(archived_collection.find(query))
        return [TaskModel(**task) for task in archived_tasks]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    

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
            'sharedUsers':task_entry.sharedUsers,
            'created_by': current_user["username"],
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
            'sharedUsers':task_entry.sharedUsers,
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
    
    
# Route to add a new comment to a task
@router.post("/kanban/{task_id}/comments", response_model=CommentModel, tags=["kanban"])
def add_comment(task_id: str, comment: CreateComment, current_user: Annotated[User, Depends(get_current_user)]):
    try:
        task = collection.find_one({"_id": ObjectId(task_id), "team_id": ObjectId(current_user["team_id"])})
        
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")

        new_comment = {
            "task_id": ObjectId(task_id),
            "user_id": ObjectId(current_user["_id"]),
            "username": current_user["username"],
            "avatar_color": "#000",#current_user["avatar_color"]
            "content": comment.content,
            "timestamp": datetime.now(),
        }
        result = comments_collection.insert_one(new_comment)

        return CommentModel(**new_comment, id=str(result.inserted_id))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Route to get all comments for a specific task
@router.get("/kanban/{task_id}/comments", response_model=List[CommentModel], tags=["kanban"])
def get_task_comments(task_id: str, current_user: Annotated[User, Depends(get_current_user)]):
    try:
        task = collection.find_one({"_id": ObjectId(task_id), "team_id": ObjectId(current_user["team_id"])})
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")

        query = {"task_id": ObjectId(task_id)}
        comments = list(comments_collection.find(query))
        return [CommentModel(**comment, id=str(comment["_id"])) for comment in comments]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/kanban/comments/{comment_id}")
def update_comment(comment_id: str, content: dict, current_user: Annotated[User, Depends(get_current_user)]):
    try:
        comment = comments_collection.find_one({"_id": ObjectId(comment_id), "user_id": current_user["_id"]})
        if not comment:
            raise HTTPException(status_code=404, detail="Comment not found or unauthorized.")

        # Update the comment content
        comments_collection.update_one(
            {"_id": ObjectId(comment_id)},
            {"$set": {"content": content['content']}}
        )

        return {"message": "Comment updated successfully."}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



# Route to delete a comment by its ID
@router.delete("/kanban/comments/{comment_id}", response_model=dict, tags=["kanban"])
def delete_comment(comment_id: str, current_user: Annotated[User, Depends(get_current_user)]):
    try:
        comment = comments_collection.find_one({"_id": ObjectId(comment_id), "user_id": ObjectId(current_user["_id"])})
        if not comment:
            raise HTTPException(status_code=404, detail="Comment not found or you are not authorized to delete this comment")

        comments_collection.delete_one({"_id": ObjectId(comment_id)})
        return {"message": "Comment deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
