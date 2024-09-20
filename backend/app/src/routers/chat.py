from fastapi import APIRouter, Depends, HTTPException, Header, Body, Query
from typing import List, Optional, Dict
from pydantic import BaseModel, Field
from pymongo import MongoClient, DESCENDING
from bson import ObjectId
from datetime import datetime, timezone, timedelta
from app.src.routers.auth import get_current_user, User
from app.config import MONGO_DB,MONGO_URI



# Create a router
router = APIRouter()

class Message(BaseModel):
    id: Optional[str] = None
    teamId: str
    content: str
    senderId: str
    timestamp: datetime
    replyingTo: Optional[str] = None
    reactions: Optional[Dict[str, str]] = Field(default_factory=dict)
    isGif: Optional[bool] = False
    privateChatId: Optional[str] = None

    class Config:
        from_attributes = True
        json_encoders = {
            ObjectId: str,
            datetime: lambda dt: dt.isoformat(),
        }


client = MongoClient(MONGO_URI)
db = client[MONGO_DB]
collection = db['chat']


def get_messages(latest: datetime):
    try:
        query = {'timestamp': latest}
        items = []

        for item in collection.find(query):
            print(f"Found message: {item}")
            item['id'] = str(item['_id'])
            item['teamId'] = str(item['teamId'])
            item['senderId'] = str(item['senderId'])
            item['timestamp'] = item['timestamp'] + timedelta(hours=2)
            item['reactions'] = dict(item.get('reactions', {}))
            item['isGif'] = item.get('isGif', False)
            item['privateChatId'] = item.get('privateChatId', None)
            items.append(Message(**item))

        print(f"Total messages found: {len(items)}")
        return items
    except Exception as e:
        print(f"Error fetching messages: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
def get_combined_messages(
    since: str,
    user_id: str
) -> Dict[str, List[str]]:
    try:
        # Convert ISO 8601 string to datetime object
        since_datetime = datetime.fromisoformat(since.replace("Z", "+00:00"))
        
        query = {
            'senderId': user_id,
            'timestamp': {'$gte': since_datetime}
        }

        messages_cursor = collection.find(query)
        messages = list(messages_cursor)  # Convert cursor to list for easier processing

        # Extract message content into a list
        message_contents = [message['content'] for message in messages]
        # Count the number of messages
        message_count = len(messages)

        return {
            "combined_messages": message_contents,
            "message_count": message_count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
 

@router.post("/chat/new-message", tags=["chat"])
def send_message(message: Message, current_user: User = Depends(get_current_user)):
    try:
        if not message.content:
            raise HTTPException(status_code=400, detail="Message content cannot be empty")

        record = {
            'teamId': current_user["team_id"],
            'content': message.content,
            'senderId': current_user["username"],
            'timestamp': datetime.now(timezone.utc),
            'replyingTo': message.replyingTo if message.replyingTo else None,
            'reactions': {},
            'isGif': message.isGif,
            'privateChatId': message.privateChatId
        }

        result = collection.insert_one(record)

        record['_id'] = str(result.inserted_id)
        record['teamId'] = str(record['teamId'])
        record['senderId'] = str(record['senderId'])
        record['id'] = record['_id']
        del record['_id']

        return record
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/chat/add-reaction/{message_id}", tags=["chat"])
def add_reaction(message_id: str, emoji: str = Body(..., embed=True), current_user: User = Depends(get_current_user)):
    try:
        message = collection.find_one({"_id": ObjectId(message_id)})
        if not message:
            raise HTTPException(status_code=404, detail="Message not found")

        user_id = current_user["username"]
        collection.update_one(
            {"_id": ObjectId(message_id)},
            {"$set": {f"reactions.{user_id}": emoji}}
        )
        updated_message = collection.find_one({"_id": ObjectId(message_id)})
        updated_message['id'] = str(updated_message['_id'])
        updated_message['teamId'] = str(updated_message['teamId'])
        updated_message['senderId'] = str(updated_message['senderId'])
        updated_message['timestamp'] = updated_message['timestamp'] + timedelta(hours=2)
        updated_message['reactions'] = dict(updated_message.get('reactions', {}))
        del updated_message['_id']

        return updated_message
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/chat/remove-reaction/{message_id}", tags=["chat"])
def remove_reaction(message_id: str, current_user: User = Depends(get_current_user)):
    try:
        message = collection.find_one({"_id": ObjectId(message_id)})
        if not message:
            raise HTTPException(status_code=404, detail="Message not found")

        user_id = current_user["username"]
        collection.update_one(
            {"_id": ObjectId(message_id)},
            {"$unset": {f"reactions.{user_id}": ""}}
        )
        updated_message = collection.find_one({"_id": ObjectId(message_id)})
        updated_message['id'] = str(updated_message['_id'])
        updated_message['teamId'] = str(updated_message['teamId'])
        updated_message['senderId'] = str(updated_message['senderId'])
        updated_message['timestamp'] = updated_message['timestamp'] + timedelta(hours=2)
        updated_message['reactions'] = dict(updated_message.get('reactions', {}))
        del updated_message['_id']

        return updated_message
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/chat/edit-message/{message_id}", tags=["chat"])
def update_message(message_id: str, message: Message, current_user: User = Depends(get_current_user)):
    try:
        existing_entry = collection.find_one({"_id": ObjectId(message_id)})
        if not existing_entry:
            raise HTTPException(status_code=404, detail="Entry not found")

        if existing_entry['senderId'] != str(current_user["username"]):
            raise HTTPException(status_code=403, detail="Not authorized to edit this message")

        update_record = {
            'content': message.content,
            'timestamp': datetime.now(timezone.utc),
            'replyingTo': message.replyingTo if message.replyingTo else None,
            'reactions': existing_entry.get('reactions', {}),
            'isGif': message.isGif,
            'privateChatId': message.privateChatId
        }

        result = collection.update_one(
            {"_id": ObjectId(message_id)},
            {"$set": update_record}
        )

        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Entry not found")

        updated_entry = collection.find_one({"_id": ObjectId(message_id)})
        updated_entry['id'] = str(updated_entry['_id'])
        updated_entry['teamId'] = str(updated_entry['teamId'])
        updated_entry['senderId'] = str(updated_entry['senderId'])
        updated_entry['timestamp'] = updated_entry['timestamp'] + timedelta(hours=2)
        updated_entry['reactions'] = dict(updated_entry.get('reactions', {}))
        del updated_entry['_id']

        return updated_entry
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/chat/delete-message/{message_id}", tags=["chat"])
def delete_message(message_id: str, current_user: User = Depends(get_current_user)):
    existing_entry = collection.find_one({"_id": ObjectId(message_id)})
    if not existing_entry:
        raise HTTPException(status_code=404, detail="Entry not found")

    if existing_entry['senderId'] != current_user["username"]:
        raise HTTPException(status_code=403, detail="Not authorized to delete this message")

    result = collection.delete_one({"_id": ObjectId(message_id)})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Entry not found")

    return {"message": "Entry deleted successfully"}


@router.get("/chat/get-messages", tags=["chat"], response_model=List[Message])
def get_messages(
    current_user: User = Depends(get_current_user),
    private_chat_id: Optional[str] = None,
    skip: Optional[int] = 0,
    limit: Optional[int] = 500,
):
    try:
        team_id = ObjectId(current_user["team_id"])
        print(f"Fetching messages for team_id: {team_id}, private_chat_id: {private_chat_id}, skip: {skip}, limit: {limit}")

        # Set query based on whether it's a private chat or team chat
        if private_chat_id:
            query = {'teamId': team_id, 'privateChatId': private_chat_id}
        else:
            query = {'teamId': team_id, 'privateChatId': None}

        # Fetch messages with pagination and sort by timestamp (newest first)
        messages_cursor = collection.find(query).sort("timestamp", DESCENDING).skip(skip).limit(limit)
        
        items = []
        for item in messages_cursor:
            item['id'] = str(item['_id'])
            item['teamId'] = str(item['teamId'])
            item['senderId'] = str(item['senderId'])
            item['timestamp'] = item['timestamp'] + timedelta(hours=2)
            item['reactions'] = dict(item.get('reactions', {}))
            item['isGif'] = item.get('isGif', False)
            item['privateChatId'] = item.get('privateChatId', None)
            items.append(Message(**item))

        print(f"Total messages found: {len(items)}")
        return items
    except Exception as e:
        print(f"Error fetching messages: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/chat/get-message/{message_id}", response_model=Message, tags=["chat"])
def get_message(message_id: str, current_user: User = Depends(get_current_user)):
    try:
        print(f"Fetching message with ID: {message_id}")
        message = collection.find_one({"_id": ObjectId(message_id)})
        if not message:
            print(f"Message with ID {message_id} not found")
            raise HTTPException(status_code=404, detail="Message not found")
        if str(message["teamId"]) != str(current_user["team_id"]) and not (
                message.get("privateChatId") and current_user["username"] in message["privateChatId"]):
            print(f"User {current_user['username']} not authorized to access message ID {message_id}")
            raise HTTPException(status_code=403, detail="Not authorized to access this message")
        message['id'] = str(message['_id'])
        message['teamId'] = str(message['teamId'])
        message['timestamp'] = message['timestamp'] + timedelta(hours=2)
        message['reactions'] = dict(message.get('reactions', {}))
        message['isGif'] = message.get('isGif', False)
        message['privateChatId'] = message.get('privateChatId', None)
        del message['_id']
        print(f"Message found: {message}")
        return Message(**message)
    except Exception as e:
        print(f"Error fetching message: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
    


#@router.get("/chat/get-unread-message-count", response_model=int, tags=["chat"])
#def get_missed_message_count(current_user: User = Depends(get_current_user)):
 #   last_login = await get_user_last_login(current_user["_id"])
  #  if last_login:
   #     count = await messages_collection.count_documents({"teamId": team_id, "timestamp": {"$gt": last_login}})
    #    return count
    #return 0
