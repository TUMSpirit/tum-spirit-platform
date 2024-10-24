from fastapi import APIRouter, Depends
from typing import Annotated, Any, List, Optional, Union
from pydantic import AfterValidator, BaseModel, Field, PlainSerializer, WithJsonSchema
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
from fastapi import HTTPException
from fastapi.encoders import jsonable_encoder
from app.src.routers.auth import get_current_user, User
from app.src.routers.notification import add_notification
from app.config import MONGO_DB, MONGO_URI

# Create a router
router = APIRouter()

# Connect to MongoDB
client = MongoClient(MONGO_URI)
db = client[MONGO_DB]
discussion_collection = db['discussions']  # New collection for archived tasks

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

from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Annotated, Any, Union
from pydantic import BaseModel, Field, AfterValidator, PlainSerializer, WithJsonSchema
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
from app.src.routers.auth import get_current_user, User
from app.config import MONGO_DB, MONGO_URI
from app.src.routers.notification import add_notification

# Create a router
router = APIRouter()

# Connect to MongoDB
client = MongoClient(MONGO_URI)
db = client[MONGO_DB]
discussion_collection = db['discussions']

# Helper to validate ObjectId
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

# Pydantic models for validation and serialization
class DiscussionBase(BaseModel):
    author: str
    content: str
    category: str
        
# Model for the Reply
class Reply(BaseModel):
    reply_id: PyObjectId
    author: str
    content: str
    createdAt: datetime
    avatar_color: str

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True


class ReplyCreate(BaseModel):
    author: str
    content: str
    createdAt: datetime
    avatar_color: str

# Pydantic model for discussion creation
class DiscussionCreate(BaseModel):
    title: str
    author: str
    content: str
    category: str
    avatar_color: Optional[str] = "#25160"  # Default avatar color if not provided

# Pydantic model for the response (with ObjectId converted to string)
class DiscussionModel(DiscussionCreate):
    id: PyObjectId = Field(default_factory=str, alias="_id") # type: ignore
    project_id: PyObjectId # type: ignore
    createdAt: datetime
    likes: int = 0
    liked_by: List[PyObjectId] # type: ignore
    replies: List[Reply]

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        
# Helper to convert ObjectId to string
def convert_objectid_to_str(document):
    """Convert ObjectId to string for FastAPI response."""
    if "_id" in document:
        document["id"] = str(document["_id"])  # Convert _id to id
        del document["_id"]
    return document


# Like/Dislike toggle endpoint
# Like toggle endpoint (No Dislike feature)
@router.get("/discussions/{discussion_id}/toggle-like", tags=["discussions"])
def toggle_like(
    discussion_id: str,
    current_user: Annotated[User, Depends(get_current_user)]
):
    try:
        # Check if the discussion exists
        discussion = discussion_collection.find_one({"_id": ObjectId(discussion_id)})
        if not discussion:
            raise HTTPException(status_code=404, detail="Discussion not found")

        if current_user["_id"] in discussion.get("liked_by", []):
            discussion_collection.update_one(
                {"_id": ObjectId(discussion_id)},
                {"$pull": {"liked_by": ObjectId(current_user["_id"])}, "$inc": {"likes": -1}}
            )
        else:
            discussion_collection.update_one(
                {"_id": ObjectId(discussion_id)},
                {"$addToSet": {"liked_by": ObjectId(current_user["_id"])}, "$inc": {"likes": 1}}
            )     

        # Fetch the updated discussion
        updated_discussion = discussion_collection.find_one({"_id": ObjectId(discussion_id)})

        # Return the updated discussion directly
        return {"likes":updated_discussion["likes"]}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Fetch discussions for a specific project
@router.get("/discussions/get/{project_id}", response_model=List[DiscussionModel], tags=["discussions"])
def get_discussions(project_id: str, current_user: User = Depends(get_current_user)):
    try:
        query={"project_id": ObjectId(project_id)}
        discussions = discussion_collection.find(query)

        # Serialize discussions and return them with the correct model
        return [DiscussionModel(**discussion, id=str(discussion["_id"])) for discussion in discussions]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Discussion creation route
@router.post("/discussions/create", response_model=DiscussionModel, tags=["discussions"])
def create_discussion(
    project_id: str,  # Project-wide discussion
    discussion_entry: DiscussionCreate,
    current_user: Annotated[User, Depends(get_current_user)]
):
    try:
        # Create a discussion record with the necessary fields
        record = {
            'title': discussion_entry.title,
            'project_id': ObjectId(project_id),  # Store as ObjectId in the database
            'author': discussion_entry.author,
            'content': discussion_entry.content,
            'category': discussion_entry.category,
            'avatar_color': discussion_entry.avatar_color,
            'createdAt': datetime.now(),
            'likes': 0,
            'liked_by':[],
            'replies':[]
        }

        # Insert the discussion into MongoDB
        result = discussion_collection.insert_one(record)
        
        # Add notification
        notification = {
            'team_id': current_user["team_id"],
            'title': "Discussion",
            'description': f"{current_user['username']} created a discussion.",
            'type': "kanban_added",
            'timestamp': datetime.now()
        }
        add_notification(notification)

        # Add the inserted ID to the record
        record["_id"] = result.inserted_id

        # Convert ObjectId fields to strings
        response_data = convert_objectid_to_str(record)

        return response_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Route to delete a specific reply
@router.delete("/discussions/{discussion_id}/reply/{reply_id}/delete", response_model=dict, tags=["discussions"])
def delete_reply(discussion_id: str, reply_id: str, current_user: Annotated[User, Depends(get_current_user)]):
    try:
        # Check if the discussion exists
        discussion = discussion_collection.find_one({"_id": ObjectId(discussion_id)})
        if not discussion:
            raise HTTPException(status_code=404, detail="Discussion not found")
        
        # Find the reply and remove it
        result = discussion_collection.update_one(
            {"_id": ObjectId(discussion_id)},
            {"$pull": {"replies": {"reply_id": ObjectId(reply_id)}}}  # Remove the reply by ID
        )

        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Reply not found")

        return {"message": "Reply deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Route to delete a discussion
@router.delete("/discussions/{discussion_id}/delete", response_model=dict, tags=["discussions"])
def delete_discussion(discussion_id: str, current_user: Annotated[User, Depends(get_current_user)]):
    try:
        discussion = discussion_collection.find_one({"_id": ObjectId(discussion_id)})
        if not discussion:
            raise HTTPException(status_code=404, detail="Discussion not found")
        
        # Delete discussion
        result = discussion_collection.delete_one({"_id": ObjectId(discussion_id)})

        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Discussion not found")

        # Add notification
        notification = {
            'team_id': current_user["team_id"],
            'title': "Discussion",
            'description': f"{current_user['username']} deleted a discussion.",
            'type': "kanban_deleted",
            'timestamp': datetime.now()
        }
        add_notification(notification)

        return {"message": "Discussion deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/discussions/{discussion_id}/reply")
async def add_reply(discussion_id: str, reply: ReplyCreate):
    # Create a new reply and assign it an ObjectId
    new_reply = reply.model_dump()
    new_reply["reply_id"] = ObjectId()  # Add an ObjectId for the reply

    # Update the discussion by pushing the new reply to the replies array
    result = discussion_collection.update_one(
        {"_id": ObjectId(discussion_id)},
        {"$push": {"replies": new_reply}}
    )

    # Check if the discussion was found and updated
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Discussion not found")
    
    return {"message": "Reply added successfully", "reply_id": str(new_reply["reply_id"])}
