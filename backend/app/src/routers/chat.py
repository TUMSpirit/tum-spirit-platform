from fastapi import APIRouter
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
from fastapi import HTTPException


# Create a router
router = APIRouter()


# Retrieve MongoDB credentials and database info
MONGO_USER = "root"
MONGO_PASSWORD = "example"
MONGO_HOST = "mongo"
MONGO_PORT = "27017"
MONGO_DB = "TUMSpirit"

# connection string
MONGO_URI = "mongodb://root:example@129.187.135.9:27017/mydatabase?authSource=admin"

class Message():
    content: str
    sender_id: str

# Connect to MongoDB
client = MongoClient(MONGO_URI)
db = client[MONGO_DB]
collection = db['chat']


# Define a route to insert a record into the database
@router.get("/chat/hello", tags=["chat"])
async def chatGenerate():

    return {"message": "Hello World"}


@router.post("/chat/insert", tags=["chat"])
def send_message(message: Message):
    try:
        # Create a record with a random ID (ObjectId) and a timestamp
        record = {
            '_id': ObjectId(),
            'content': message.content,
            'sender_id': message.sender_id,
            'timestamp': datetime.utcnow()
        }
        # Inserting the record into the database
        result = collection.insert_one(record)
        # Return the ID of the inserted record
        return {"id": str(result.inserted_id)}
    except Exception as e:
        # If something goes wrong, raise an HTTP exception
        raise HTTPException(status_code=500, detail=str(e))