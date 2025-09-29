# Import necessary libraries
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import openai
from openai import OpenAI
from datetime import datetime
from typing import List
import pytz
from dotenv import load_dotenv
import os
from app.config import MONGO_DB,MONGO_URI, OPENAI_API_KEY
from pymongo import MongoClient

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
# Retrieve MongoDB credentials and database info

# Connect to MongoDB
client = MongoClient(MONGO_URI)
db = client[MONGO_DB]
collection = db['chatbot_analytics']

# Endpoint to generate AI responses using OpenAI


@router.post("/ai/generate", tags=["ai"])
async def generate(messages: MessageList):

    # Initialize OpenAI client
    client = OpenAI(
        base_url='http://ollama:11434/v1',
        api_key="NO_API_KEY_NEEDED_FOR_LOCAL_SERVER",
    )

    # Prepare the request data using the provided messages
    response = client.chat.completions.create(
        model="llama3",
        messages=messages.messages
    )

    # Print the generated response for debugging purposes (remove for production)
    print(response.choices[0].message.content)

    # Return the OpenAI response object
    return response


# Endpoint to generate AI responses using OpenAI
@router.post("/ai/generate_gpt", tags=["ai"])
async def generate(messages: MessageList):
    try:
        # Initialize OpenAI client
        client = OpenAI(api_key=OPENAI_API_KEY)

        # Prepare the messages for the chat model
        chat_messages = [{"role": msg.role, "content": msg.content} for msg in messages.messages]

        # Send the request to the chat/completions endpoint
        response = client.chat.completions.create(
            model="gpt-4o-mini",  # You can change the model as needed (gpt-4 is also available)
            messages=chat_messages
        )

        # Extract and return the generated response using dot notation
        return response
    
    except Exception as e:
        print(e)
        # Raise an HTTP exception if there's an error
        raise HTTPException(status_code=500, detail=str(e))


# Simple endpoint to return a "Hello World" message
#@router.get("/ai/hello", tags=["ai"])
#async def generate():
#
    #return {"message": "Hello World"}


@router.post("/ai/analytics", tags=["ai"])
def insert_record(event: AnalyticsRecord):
    try:
        # Create a record with a random ID (ObjectId) and a timestamp
        record = {
            "event_type": event.event_type,
            "session_id": event.session_id,
            'timestamp': datetime.now(pytz.UTC),
            "data": event.data
        }
        # Inserting the record into the database
        result = collection.insert_one(record)
        # Return the ID of the inserted record
        return {"id": str(result.inserted_id)}
    except Exception as e:
        print(e)
        # If something goes wrong, raise an HTTP exception
        raise HTTPException(status_code=500, detail=str(e))
