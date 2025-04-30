# Import necessary libraries
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import openai
from openai import OpenAI
from datetime import datetime, timezone
from typing import List
import pytz
from dotenv import load_dotenv
import os
from app.config import MONGO_DB,MONGO_URI, OPENAI_API_KEY
from pymongo import MongoClient
from app.src.avatar.translate_functions import extract_avatar_functions
import json
from openai.types.beta import Thread
import inspect
from app.src.routers.auth import get_current_user, User
from app.src.avatar.helper import get_project_by_team, feedback_recieved
from app.src.avatar.initiative.initiative import run_model_over_all_teams, learn, start_initiative_avatar_thread
from bson import ObjectId

class GenerateGPTRequest(BaseModel):
    inputValue: str
    threadId: str

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

# Initialize OpenAI client
client = OpenAI(api_key=OPENAI_API_KEY)

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


@router.post("/ai/generate_gpt_thread", tags=["ai"])
async def generate():
    print("thread generated")
    return client.beta.threads.create().id

async def GPT_with_tools(instructions:str, function_strings:str, threadId:str, inputValue:str, functions, current_user, step_id = None, client=client):
    assistant = client.beta.assistants.create(
        instructions=instructions,
        model="gpt-4o-mini",
        tools=function_strings
    )

    message = client.beta.threads.messages.create(
        thread_id=threadId,
        role="user",
        content=inputValue,
    )

    run = client.beta.threads.runs.create_and_poll(
        thread_id=threadId,
        assistant_id=assistant.id,
    )

    num_req = 10

    while run.status != 'completed' and num_req > 0:
        num_req -= 1
        if run.status == 'cancelled' or run.status == 'failed' or run.status == 'expired':
            return f"request: {run.status}"
        elif run.status == 'requires_action':
            # Define the list to store tool outputs
            tool_outputs = []

            # Loop through each tool in the required action section
            for tool in run.required_action.submit_tool_outputs.tool_calls:
                function_name = tool.function.name
                print(f"{function_name} called")
                try:
                    function_args = json.loads(tool.function.arguments)

                    # Retrieve and call the function
                    if function_name in functions:
                        function_to_call = functions[function_name]
                        sig = inspect.signature(function_to_call)
                        true_func_args = [param.name for param in sig.parameters.values()]
                        if true_func_args.__contains__('db'):
                            function_args['db'] = db
                        if true_func_args.__contains__('current_user'):
                            function_args['current_user'] = current_user
                        if true_func_args.__contains__('project_id'):
                            function_args['project_id'] = get_project_by_team(current_user, db)['id']
                        if true_func_args.__contains__('action_step_id'):
                            function_args['action_step_id'] = step_id
                        if inspect.iscoroutinefunction(function_to_call):
                            function_result = await function_to_call(**function_args)
                        else:
                            function_result = function_to_call(**function_args)
                        print(f"function_result: {function_result}")
                    else:
                        function_result = "error: " + f"Function '{function_name}' not found"
                        print(f"Function '{function_name}' not found")
                
                except Exception as e:
                    function_result = "error: " + str(e)
                    print(f"error: {str(e)}")

                tool_outputs.append({
                    "tool_call_id": tool.id,
                    "output": function_result['message']
                })

            # Submit all tool outputs at once after collecting them in a list
            if tool_outputs:
                try:
                    run = client.beta.threads.runs.submit_tool_outputs_and_poll(
                        thread_id=threadId,
                        run_id=run.id,
                        tool_outputs=tool_outputs
                    )
                    print("Tool outputs submitted successfully.")
                except Exception as e:
                    return "Failed to submit tool outputs:" + str(e)

            else:
                print("No tool outputs to submit.")
    messages = client.beta.threads.messages.list(
            thread_id=threadId
        )
    return messages
    

# Endpoint to generate AI responses using OpenAI
@router.post("/ai/generate_gpt", tags=["ai"])
async def generate(request: GenerateGPTRequest, current_user: User = Depends(get_current_user)):
    inputValue = request.inputValue
    threadId = request.threadId
    print("start")
    print(f"input Value: {inputValue}")
    try:
        # Retrieve function mappings
        function_strings, functions = extract_avatar_functions()

        instructions=("You are Spirit, an assistant in the project management software TUM-Spirit. Spirit should always be witty, "
              f"intelligent, and funny. The current user is called {current_user['username']}. Current time: {datetime.now(timezone.utc)}."
              "Before deleting anything ask the user if their sure unless promted to do otherwise")
        
        messages = await GPT_with_tools(instructions=instructions, function_strings=function_strings, threadId=threadId, inputValue=inputValue, functions=functions, current_user= current_user)

        print(f"returned: {messages._get_page_items()[0].content[0].text.value}")
            
        return messages._get_page_items()[0].content[0].text.value
    
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
    

@router.post("/ai/run_initiative_over_all_teams", tags=["ai"])
def run_initiative_over_all_teams():
    try:
        run_model_over_all_teams()
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))
    

@router.post("/ai/train_model", tags=["ai"])
def train_model():
    try:
        learn(db)
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))
    

@router.post("/ai/test_feedback_recieved", tags=["ai"])
def test_feedback_recieved(id: str, reward: int):
    try:
        feedback_recieved(ObjectId(id), reward)
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))
    

@router.post("/ai/test_launch_thread", tags=["ai"])
def test_launch_thread(sleep_duration):
    try:
        return start_initiative_avatar_thread(sleep_duration)
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))