from datetime import datetime, timezone
import os
from fastapi import BackgroundTasks, APIRouter, HTTPException
from pydantic import BaseModel, Field
from pymongo import MongoClient
from celery import Celery
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB configuration from environment
MONGO_USER = os.getenv("MONGO_USER", "root")
MONGO_PASSWORD = os.getenv("MONGO_PASSWORD", "example")
MONGO_HOST = os.getenv("MONGO_HOST", "mongo")
MONGO_PORT = os.getenv("MONGO_PORT", "27017")
MONGO_DB = os.getenv("MONGO_DB", "TUMSpirit")

MONGO_URI = f"mongodb://{MONGO_USER}:{MONGO_PASSWORD}@{MONGO_HOST}:{MONGO_PORT}/{MONGO_DB}?authSource=admin"

# Celery configuration
CELERY_BROKER_URL = os.getenv('CELERY_BROKER_URL', 'redis://localhost:6379/0')
CELERY_RESULT_BACKEND = os.getenv(
    'CELERY_RESULT_BACKEND', 'redis://localhost:6379/0')

# Create a router
router = APIRouter()

# Connect to MongoDB
client = MongoClient(MONGO_URI)
db = client[MONGO_DB]
user_collection = db['users']  # Assuming these are used elsewhere
team_collection = db["teams"]

# Initialize Celery
celery = Celery(__name__, broker=CELERY_BROKER_URL,
                backend=CELERY_RESULT_BACKEND)


class TaskPayload(BaseModel):
    task_name: str = Field(..., example="Sample Task")
    team_name: str = Field(..., example="Sample Team")
    execution_time: datetime = Field(...)


@celery.task
def execute_scheduled_task(task_name: str, team_name: str):
    # It's good practice to add try/except blocks for error handling.
    try:
        print(f"Executing task: {task_name}")
        team = {"name": team_name, "created_at": datetime.utcnow()}
        team_collection.insert_one(team)
    except Exception as e:
        print(f"Error creating team: {str(e)}")


def schedule_task(payload: TaskPayload):
    now = datetime.now(timezone.utc)
    execution_time = payload.execution_time - now
    delay = execution_time.total_seconds()
    if delay < 0:
        # Handling past dates guard condition.
        raise ValueError("Scheduled time cannot be in the past.")
    execute_scheduled_task.apply_async(
        args=[payload.task_name, payload.team_name], countdown=delay)


@router.post("/start-celery/")
async def start_celery(background_tasks: BackgroundTasks):
    # Error handling for task initiation can be more complex in real scenarios.
    try:
        background_tasks.add_task(start_celery_worker)
        return {"message": "Celery worker started."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/schedule-task/")
async def schedule_task_endpoint(payload: TaskPayload, background_tasks: BackgroundTasks):
    try:
        background_tasks.add_task(schedule_task, payload)
        return {"message": "Task scheduled successfully"}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def start_celery_worker():
    # Practical Celery worker instantiation might be outside of standard request/response cycle.
    celery.worker_main(["-A", __name__ + ".celery", "--loglevel=info"])
