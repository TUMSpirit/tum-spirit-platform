# Import necessary libraries
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from openai import OpenAI
from bson import ObjectId
from datetime import datetime
from typing import List
from dotenv import load_dotenv
import os
from pymongo import MongoClient

# Load environment variables from a .env file
load_dotenv()

# Define a BaseModel for representing a single message


class Message(BaseModel):
    role: str  # Defines the role of the sender (e.g., user, bot)
    content: str  # The actual message content


# Define a BaseModel for representing a list of messages
class MessageList(BaseModel):
    messages: List[Message]  # A list of Message objects


# Define a BaseModel for analytics records
class AnalyticsRecord(BaseModel):
    event_type: str  # The unique identifier of the record
    session_id: str  # The chat session ID
    data: dict  # Additional data to be stored in the record


# Create a FastAPI router object
router = APIRouter()


# Access environment variables for database credentials
MONGO_USER = os.getenv("MONGO_USER")
MONGO_PASSWORD = os.getenv("MONGO_PASSWORD")
MONGO_HOST = os.getenv("MONGO_HOST")
MONGO_PORT = os.getenv("MONGO_PORT")
MONGO_DB = os.getenv("MONGO_DB")
# Add an environment variable for OpenAI API key
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Construct the MongoDB connection URI
MONGO_URI = f"mongodb://{MONGO_USER}:{MONGO_PASSWORD}@{MONGO_HOST}:{MONGO_PORT}/{MONGO_DB}"

# Connect to MongoDB
client = MongoClient(MONGO_URI)
db = client[MONGO_DB]
collection = db['chatbot_analytics']

# Endpoint to generate AI responses using OpenAI


@router.post("/ai/generate", tags=["ai"])
async def generate(messages: MessageList):

    # Initialize OpenAI client
    client = OpenAI(
        base_url='http://127.0.0.1:11434/v1',
        api_key=OPENAI_API_KEY,
    )

    # Prepare the request data using the provided messages
    response = client.chat.completions.create(
        model="llama2",
        messages=messages.messages
    )

    # Print the generated response for debugging purposes (remove for production)
    print(response.choices[0].message.content)

    # Return the OpenAI response object
    return response


# Simple endpoint to return a "Hello World" message
@router.get("/ai/hello", tags=["ai"])
async def generate():

    return {"message": "Hello World"}


# Define a route to insert analytics records into the database
@router.post("/ai/analytics", tags=["ai"])
def insert_record(event: AnalyticsRecord):
    try:
        # Create a record with a random ID (ObjectId) and a timestamp
        record = {
            "event_type": event.event_type,
            "session_id": event.session_id,
            'timestamp': datetime.now(datetime.UTC),
            "data": event.data
        }
        # Inserting the record into the database
        result = collection.insert_one(record)
        # Return the ID of the inserted record
        return {"id": str(result.inserted_id)}
    except Exception as e:
        # If something goes wrong, raise an HTTP exception
        raise HTTPException(status_code=500, detail=str(e))
