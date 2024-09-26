from datetime import datetime, timezone
from typing import Dict, List
from fastapi import HTTPException
from pymongo import ASCENDING, MongoClient
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.date import DateTrigger
from apscheduler.triggers.cron import CronTrigger
from app.config import MONGO_DB,MONGO_URI
from app.src.routers.auth import get_users
from app.src.routers.chat import get_combined_messages
from app.src.language_helpers.analyze_chat import analyze_big5


# Connect to MongoDB
client = MongoClient(MONGO_URI)
db = client[MONGO_DB]
team_collection = db["teams"]
task_log_collection = db["scheduler_log"]
chat_collection= db["chat"]
kanban_collection= db["kanban"]
archived_kanban_collection=db["archived_kanban"]

# Initialize APScheduler
scheduler = BackgroundScheduler()


def create_team(team_name: str):
    try:
        print(f"Creating team: {team_name}")
        team = {"name": team_name, "created_at": datetime.now()}
        team_collection.insert_one(team)
        print("Team created successfully")
    except Exception as e:
        print(f"Error creating team: {str(e)}")

def get_latest_data(since_time: datetime):
    # Example function to get the latest data since a specific time
    try:
        latest_data = list(task_log_collection.find({"created_at": {"$gt": since_time}}).sort("created_at", ASCENDING))
        print(f"Retrieved {len(latest_data)} new records since {since_time}")
        return latest_data
    except Exception as e:
        print(f"Error retrieving latest data: {str(e)}")
        return []

def update_last_run_time(task_name: str):
    try:
        task_log_collection.update_one(
            {"task_name": task_name},
            {"$set": {"last_run_time": datetime.now()}},
            upsert=True
        )
    except Exception as e:
        print(f"Error updating last run time: {str(e)}")

def get_last_run_time(task_name: str) -> str:
    try:
        task_log = task_log_collection.find_one({"task_name": task_name})
        if task_log and "last_run_time" in task_log:
            last_run_time = task_log["last_run_time"]
            if isinstance(last_run_time, datetime):
                return last_run_time.isoformat()
            else:
                raise ValueError("Stored last_run_time is not a datetime object")
        else:
            # If no log exists, return a default past time as ISO format
            default_time = datetime(1970, 1, 1, tzinfo=timezone.utc)
            return default_time.isoformat()
    except Exception as e:
        print(f"Error getting last run time: {str(e)}")
        # Return a default past time as ISO format in case of error
        default_time = datetime(1970, 1, 1, tzinfo=timezone.utc)
        return default_time.isoformat()


def get_combined_chats_and_kanban(
    since: str,
    user_id: str
) -> Dict[str, List]:
    try:
        # Convert ISO 8601 string to datetime object
        since_datetime = datetime.fromisoformat(since.replace("Z", "+00:00"))

        # Query for chat messages
        chat_query = {
            'senderId': user_id,
            'timestamp': {'$gte': since_datetime}
        }
        messages_cursor = chat_collection.find(chat_query)
        messages = list(messages_cursor)  # Convert cursor to list


        # Extract message content into a list (chat)
        message_contents = [message['content'] for message in messages]
        message_count = len(messages)

        # Query for kanban tasks (only title and description)
        kanban_query = {
            'created_by': user_id,
            'timestamp': {'$gte': since_datetime}
        }
        kanban_cursor = kanban_collection.find(kanban_query, {'title': 1, 'description': 1})
        kanban_items = list(kanban_cursor)

        # Extract title and description from kanban tasks
        kanban_contents = [
            f"{item.get('title', '')} {item.get('description', '')}".strip()
            for item in kanban_items
        ]
        kanban_count = len(kanban_items)
        # Query for archived kanban tasks (only title and description)
        archived_kanban_cursor = archived_kanban_collection.find(kanban_query, {'title': 1, 'description': 1})
        archived_kanban_items = list(archived_kanban_cursor)

        # Extract title and description from archived kanban tasks
        archived_kanban_contents = [
            f"{item.get('title', '')} {item.get('description', '')}".strip()
            for item in archived_kanban_items
        ]
        archived_kanban_count = len(archived_kanban_items)

        # Combine chat messages, kanban tasks, and archived kanban tasks
        combined_contents = message_contents + kanban_contents + archived_kanban_contents
        total_count = message_count + kanban_count + archived_kanban_count

        return {
            "combined_contents": combined_contents,
            "total_count": total_count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def daily_task():
    print("Running daily task")
    last_run = get_last_run_time("daily_task")
    print(last_run)
    users_object = get_users()
    user_ids = users_object['users']
    
   # Trigger analysis for each user
    for user_id in user_ids:
        print(user_id)
        #userString = get_combined_messages(last_run, user_id)
        #analyze_big5(user_id, userString["combined_messages"])
        
    update_last_run_time("daily_task")
    

def monthly_task():
    print("Running monthly task")
    last_run = get_last_run_time("monthly_task")
    users_object = get_users()
    user_ids = users_object['users']
    
   # Trigger analysis for each user
    for user_id in user_ids:
        userString = get_combined_chats_and_kanban(last_run, user_id)
        print(userString["combined_contents"])
        print(userString["total_count"])
        #analyze_big5(user_id, userString["combined_contents"])

def schedule_task(task_name: str, team_name: str, execution_time: datetime):
    now = datetime.now(timezone.utc)
    if execution_time < now:
        raise ValueError("Scheduled time cannot be in the past.")
    trigger = DateTrigger(run_date=execution_time)
    scheduler.add_job(create_team, trigger, args=[team_name], id=task_name)
    print(f"Task '{task_name}' scheduled for {execution_time}")

def start_scheduler():
    # Schedule daily task at midnight
    print("scheduler started")
    #scheduler.add_job(daily_task, CronTrigger(hour=1, minute=3), id="daily_task")

    # Schedule monthly task on the 15th of each month at midnight
    scheduler.add_job(monthly_task, CronTrigger(day=20, hour=23, minute=38), id="monthly_task")
    # Schedule weekly task every Monday at midnight
    #scheduler.add_job(weekly_task, CronTrigger(hour=2, minute=0, day_of_week="mon"))

    # Start the scheduler
    scheduler.start()

def stop_scheduler():
    print("scheduler stopped")
    scheduler.shutdown()
