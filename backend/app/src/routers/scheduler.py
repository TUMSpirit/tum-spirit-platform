from datetime import datetime, timedelta, timezone
from typing import Dict, List
from bson import ObjectId
from fastapi import HTTPException
from pymongo import ASCENDING, MongoClient
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.date import DateTrigger
from apscheduler.triggers.cron import CronTrigger
from app.config import MONGO_DB,MONGO_URI
from app.src.routers.auth import get_users
#from app.src.routers.chat import get_combined_messages
from app.src.language_helpers.analyze_chat import analyze_big5, analyze_chat_prod


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

        messages_cursor = chat_collection.find(query)
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
    
    
def get_chat_messages_since_last_run(task_name: str) -> List[Dict[str, str]]:
    try:
        # Get the last run time for the specified task
        last_run = get_last_run_time(task_name)
        since_datetime = datetime.fromisoformat(last_run.replace("Z", "+00:00"))

        # Query to fetch chat messages from last_run to now, excluding messages from "Spirit"
        chat_query = {
            'timestamp': {'$gte': since_datetime},
            'senderId': {'$ne': 'Spirit'}  # Exclude messages from "Spirit"
        }

        # Fetch messages and include senderId, teamId, content, and _id
        messages_cursor = chat_collection.find(chat_query, {'_id': 1, 'senderId': 1, 'teamId': 1, 'content': 1, 'timestamp': 1})
        messages = list(messages_cursor)  # Convert cursor to list

        # Format messages as required
        formatted_messages = [
            {
                "_id": str(message["_id"]),  # Convert ObjectId to string
                "senderId": message["senderId"],
                "teamId": message["teamId"],
                "content": message["content"],
                "timestamp": message["timestamp"]  # Adjust for timezone if necessary
            }
            for message in messages
        ]

        return formatted_messages
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def get_combined_chats_and_kanban(
    user_id: str
) -> Dict[str, List]:
    try:
        # Convert ISO 8601 string to datetime object
       #since_datetime = datetime.fromisoformat(since.replace("Z", "+00:00"))

        # Query for chat messages
        chat_query = {
            'senderId': user_id
        }
        messages_cursor = chat_collection.find(chat_query)
        messages = list(messages_cursor)  # Convert cursor to list


        # Extract message content into a list (chat)
        message_contents = [message['content'] for message in messages]
        message_count = len(messages)

        # Query for kanban tasks (only title and description)
        kanban_query = {
            'created_by': user_id
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
    print(f"Last run: {last_run}")
    
    # Retrieve all chat messages since last run
    messages = get_chat_messages_since_last_run("daily_task")
    print(f"Retrieved {len(messages)} messages since last run")

    # Process or analyze messages as needed
    for msg in messages:
        print(f"{msg['senderId']} in team {msg['teamId']}: {msg['content']}")
        analyze_chat_prod(msg)
        
    update_last_run_time("daily_task")
    
def monthly_task():
    print("Running monthly task")
    last_run = get_last_run_time("monthly_task")
    users_object = get_users()
    
    # Extract user data with user IDs, usernames, and team IDs
    user_data = [
        {
            "user_id": user['user_id'],
            "username": user['username'],
            "team_id": user['team_id']
        }
        for user in users_object['users']
    ]
    
    # Trigger analysis for each user
    for user in user_data:
        user_id = user['user_id']
        username = user['username']
        team_id = user['team_id']
        
        # Fetch and analyze the data for the user
        userString = get_combined_chats_and_kanban(username)
        analyze_big5(ObjectId(user_id), ObjectId(team_id), userString["combined_contents"])
        
    update_last_run_time("monthly_task")


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
    scheduler.add_job(daily_task, CronTrigger(hour=19, minute=59), id="daily_task")

    # Schedule monthly task on the 15th of each month at midnight
    #scheduler.add_job(monthly_task, CronTrigger(day=3, hour=, minute=49), id="monthly_task")
    # Schedule weekly task every Monday at midnight
    #scheduler.add_job(weekly_task, CronTrigger(hour=2, minute=0, day_of_week="mon"))

    # Start the scheduler
    scheduler.start()

def stop_scheduler():
    print("scheduler stopped")
    scheduler.shutdown()
