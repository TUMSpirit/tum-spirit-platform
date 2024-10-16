import re
import random
from typing import Annotated, Any, Dict, List, Optional, Union
from bson import ObjectId
from collections import Counter
from pymongo import DESCENDING
from fastapi import APIRouter, Depends, HTTPException
from pydantic import AfterValidator, BaseModel, Field, PlainSerializer, WithJsonSchema
from ..language_helpers.analyze_chat import analyze_chat, analyze_chat_demo
from ..language_helpers.api.sentiment import get_sentiment, get_big5, get_big5_team

from app.src.routers.auth import get_current_user, User

from datetime import datetime, timedelta
from pymongo.errors import ConnectionFailure
from app.src.utils.db import get_db

router = APIRouter()

metadata_collection = get_db("chat_metadata")
ocean_collection = get_db("users_OCEAN")
chats_collection = get_db("chat")
kanban_collection = get_db("kanban")

def convert_objectid(item: Any) -> Any:
    if isinstance(item, dict):
        return {k: convert_objectid(v) for k, v in item.items()}
    elif isinstance(item, list):
        return [convert_objectid(i) for i in item]
    elif isinstance(item, ObjectId):
        return str(item)
    else:
        return item

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


class MetadataModel(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    team_id: PyObjectId
    column: Optional[str] = ""
    title: Optional[str] = ""
    description: Optional[str] = ""
    priority: Optional[str] = ""
    deadline: Optional[int] = 0
    tags: Optional[List] = []


    class Config:
            populate_by_name = True
            arbitrary_types_allowed = True #required for the _id 
            json_encoders = {ObjectId: str}


class MetadataCreate(BaseModel):
    title: str
    column: str
    description: Optional[str] = ""
    priority: str
    deadline: int
    tags: List

class Metadata(MetadataCreate):
    id: PyObjectId

    class Config:
            populate_by_name = True
            arbitrary_types_allowed = True #required for the _id 
            json_encoders = {ObjectId: str}




class AveragePredictionsResponse(BaseModel):
    start_date: str
    end_date: str
    average_predictions: Dict[str, float]

def calculate_average(predictions_list: List[Dict[str, float]]) -> Dict[str, float]:
    if not predictions_list:
        return []
    
    sum_predictions = {key: 0.0 for key in predictions_list[0]}
    count = len(predictions_list)
    
    for predictions in predictions_list:
        for key, value in predictions.items():
            sum_predictions[key] += value
    
    avg_predictions = [round(value / count, 1) for value in sum_predictions.values()]
    return avg_predictions

## Scheduler method, that gets triggered to create new metadata
#@router.get("/language/analyze", tags=["language"])
#def predict():    
 #   return analyze_chat()

@router.get("/language/analyze-demo", tags=["language"])
def predictdemo(input:str):    
    return analyze_chat_demo(input)


@router.get("/language/get-big5-data", tags=["language"])
def get_latest_big5_data(current_user: Annotated[User, Depends(get_current_user)]):
    try:
        # Find the latest OCEAN result for the user
        latest_result = ocean_collection.find_one(
            {"user_id": ObjectId(current_user["_id"])},  # Filter by user ID
            sort=[("timestamp", DESCENDING)]  # Sort by timestamp to get the latest
        )

        # Check if a result was found
        if not latest_result:
            return {"message": "No OCEAN data available for this user."}

        # Extract OCEAN predictions
        ocean_result = latest_result["result"]
        predictions = [
            ocean_result["extraversion"]["predicton_s"],
            ocean_result["conscientiousness"]["predicton_s"],
            ocean_result["agreeableness"]["predicton_s"],
            ocean_result["neuroticism"]["predicton_s"],
            ocean_result["openness"]["predicton_s"],
        ]

        return predictions

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/language/get-big5-team-data", tags=["language"])
def get_team_average_big5_data(current_user: Annotated[User, Depends(get_current_user)]):
    try:
        # Get the team ID of the current user
        team_id = current_user["team_id"]

        # Find all latest OCEAN results for team members
        team_results = ocean_collection.aggregate([
            {"$match": {"team_id": ObjectId(team_id)}},  # Match by team ID
            {
                "$group": {
                    "_id": "$user_id",
                    "latest_result": {"$last": "$$ROOT"},  # Get the latest document for each user
                }
            }
        ])

        # Initialize variables to calculate averages
        count = 0
        sum_extraversion = 0
        sum_conscientiousness = 0
        sum_agreeableness = 0
        sum_neuroticism = 0
        sum_openness = 0

        # Iterate over each user's latest result to sum the scores
        for result in team_results:
            ocean_result = result["latest_result"]["result"]
            sum_extraversion += ocean_result["extraversion"]["predicton_s"]
            sum_conscientiousness += ocean_result["conscientiousness"]["predicton_s"]
            sum_agreeableness += ocean_result["agreeableness"]["predicton_s"]
            sum_neuroticism += ocean_result["neuroticism"]["predicton_s"]
            sum_openness += ocean_result["openness"]["predicton_s"]
            count += 1

        # Check if any results were found
        if count == 0:
            return {"message": "No OCEAN data available for this team."}

        # Calculate averages
        avg_extraversion = sum_extraversion / count
        avg_conscientiousness = sum_conscientiousness / count
        avg_agreeableness = sum_agreeableness / count
        avg_neuroticism = sum_neuroticism / count
        avg_openness = sum_openness / count

        # Return the average OCEAN scores as a list
        return [
            avg_extraversion,
            avg_conscientiousness,
            avg_agreeableness,
            avg_neuroticism,
            avg_openness,
        ]

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/language/get-sentiment", tags=["language"])
def get_sentiment_data(current_user: User = Depends(get_current_user)):
    team_id = current_user["team_id"]

    # Calculate date range for the last 14 days
    end_date = datetime.now()
    start_date = end_date - timedelta(days=14)

    # Use aggregation to group by day and calculate average sentiment
    pipeline = [
        {
            "$match": {
                "team_id": ObjectId(team_id),
                "timestamp": {"$gte": start_date, "$lte": end_date},
            }
        },
        {
            "$group": {
                "_id": {
                    "$dateToString": { "format": "%Y-%m-%d", "date": "$timestamp" }
                },
                "average_polarity": { "$avg": "$metadata.sentiment.polarity" },
                "average_subjectivity": { "$avg": "$metadata.sentiment.subjectivity" },
            }
        },
        {
            "$sort": { "_id": 1 }  # Sort by date ascending
        }
    ]

    sentiment_data = list(metadata_collection.aggregate(pipeline))

    # Format the data to match the required scheme
    result = [
        {
            "date": entry["_id"],  # The formatted date as a string
            "sentiment": {
                "polarity": entry["average_polarity"],
                "subjectivity": entry["average_subjectivity"]
            }
        }
        for entry in sentiment_data
    ]

    return result


@router.get("/language/get-chat-metadata", tags=["language"])
def get_dashboard_stats(current_user: Annotated[User, Depends(get_current_user)]):
    # Fetch data for the current week
    current_start_date = datetime.now() - timedelta(weeks=1)
    current_end_date = datetime.now()

    # Fetch data for the previous week
    previous_start_date = datetime.now() - timedelta(weeks=2)
    previous_end_date = datetime.now() - timedelta(weeks=1)

    filter_by_current = {
        "team_id": ObjectId(current_user["team_id"]), 
        "timestamp": {
            "$gte": current_start_date,
            "$lte": current_end_date
        }
    }
    
    filter_by_previous = {
        "team_id": ObjectId(current_user["team_id"]), 
        "timestamp": {
            "$gte": previous_start_date,
            "$lte": previous_end_date
        }
    }

    # Fetch current and previous data
    current_data = metadata_collection.find(
       filter_by_current,
        {
            "_id": 0,
            "metadata.sentiment": 1,
            "metadata.flesh_reading_ease": 1,
            "metadata.grammar.grammar_mistakes_count": 1,
            "metadata.grammar.average_sentence_length": 1
        }
    )
    
    previous_data = metadata_collection.find(
       filter_by_previous,
        {
            "_id": 0,
            "metadata.sentiment": 1,
            "metadata.flesh_reading_ease": 1,
            "metadata.grammar.grammar_mistakes_count": 1,
            "metadata.grammar.average_sentence_length": 1
        }
    )

    # Process current and previous data
    def calculate_average(data_list):
        total_sentiment = 0
        total_subjectivity = 0
        total_reading_ease = 0
        total_grammar_mistakes = 0
        total_words = 0
        message_count = 0

        for entry in data_list:
            metadata = entry["metadata"]
            total_sentiment += metadata["sentiment"]["polarity"]
            total_subjectivity += metadata["sentiment"]["subjectivity"]
            total_reading_ease += metadata["flesh_reading_ease"]
            total_grammar_mistakes += metadata["grammar"]["grammar_mistakes_count"]
            total_words += metadata["grammar"]["average_sentence_length"]
            message_count += 1

        if message_count > 0:
            avg_sentiment = total_sentiment / message_count
            avg_subjectivity = total_subjectivity / message_count
            avg_reading_ease = total_reading_ease / message_count
            grammar_mistake_percentage = (
                (total_grammar_mistakes / total_words) * 100 if total_words > 0 else 0
            )
        else:
            avg_sentiment = avg_subjectivity = avg_reading_ease = grammar_mistake_percentage = 0

        return {
            "sentiment": avg_sentiment,
            "subjectivity": avg_subjectivity,
            "grammar": grammar_mistake_percentage,
            "precision": avg_reading_ease,
        }

    # Calculate averages for current and previous data
    current_stats = calculate_average(list(current_data))
    previous_stats = calculate_average(list(previous_data))

    # Calculate percentage changes
    def calculate_change(current, previous):
        if previous == 0:
            return 0 if current == 0 else 100  # Handle edge case of division by 0
        return ((current - previous) / previous) * 100

    sentiment_change = calculate_change(current_stats["sentiment"], previous_stats["sentiment"])
    subjectivity_change = calculate_change(current_stats["subjectivity"], previous_stats["subjectivity"])
    grammar_change = calculate_change(current_stats["grammar"], previous_stats["grammar"])
    precision_change = calculate_change(current_stats["precision"], previous_stats["precision"])

    return {
        "sentiment": {
            "value": current_stats["sentiment"],
            "change": sentiment_change,
        },
        "subjectivity": {
            "value": current_stats["subjectivity"],
            "change": subjectivity_change,
        },
        "grammar": {
            "value": current_stats["grammar"],
            "change": grammar_change,
        },
        "precision": {
            "value": current_stats["precision"],
            "change": precision_change,
        }
    }


@router.get("/language/get-emotions", tags=["language"])
def get_emotions(current_user: Annotated[User, Depends(get_current_user)]):
    # Calculate start and end date (last 7 days)
    start_date = datetime.now() - timedelta(weeks=1)
    end_date = datetime.now()
    # MongoDB query to fetch messages from the past week
    filter_by = {
        "team_id": ObjectId(current_user["team_id"]), 
        "timestamp": {
            "$gte": start_date,
            "$lte": end_date
        }
    }
    stats_data = metadata_collection.find(
        filter_by,
        {
            "_id": 0,
            "metadata.emotion": 1  # Include only emotions data
        }
    )

    stats_data_list = list(stats_data)

    # Initialize emotions sum
    total_emotions = {
        "Happy": 0,
        "Angry": 0,
        "Surprise": 0,
        "Sad": 0,
        "Fear": 0
    }
    message_count = 0

    # Sum up the emotions
    for entry in stats_data_list:
        emotions = entry["metadata"].get("emotion", {})
        for emotion in total_emotions.keys():
            total_emotions[emotion] += emotions.get(emotion, 0)
        message_count += 1

    # Calculate the average for each emotion
    if message_count > 0:
        avg_emotions = [total_emotions[emotion] / message_count for emotion in total_emotions.keys()]
    else:
        avg_emotions = [0] * len(total_emotions)

    return avg_emotions




@router.get("/language/get-chat-log", tags=["language"])
def get_chat_log(current_user: Annotated[User, Depends(get_current_user)]):
    # Fetch the last 10 messages sorted by timestamp
    chat_messages = chats_collection.find(
        {"teamId": ObjectId(current_user["team_id"])}, 
        {"_id": 0, "content": 1, "timestamp": 1, "senderId": 1}
    ).sort("timestamp", DESCENDING).limit(4)
    # Debug print to see chat messages
    # Convert cursor to list for proper handling
    chat_messages_list = list(chat_messages)

    # Debug print to see the fetched messages
    print("Fetched chat messages:", chat_messages_list)

    # Format messages to match the required format
    messages_list = []
    for message in chat_messages_list:
        # Debug each message structure
        print("Processing message:", message)

        # Check and handle potential issues with data types or missing fields
        sender = message.get("senderId", "Unknown sender")
        content = message.get("content", "")
        timestamp = message.get("timestamp")

        # Ensure timestamp is correctly formatted
        if isinstance(timestamp, datetime):
            formatted_date = timestamp.strftime("%d/%m/%Y")
        else:
            formatted_date = "Unknown date"

        messages_list.append({
            "sender": sender,
            "message": content,
            "date": formatted_date
        })

    # Debug final formatted list
    print("Formatted messages list:", messages_list)

    # Reverse the list to show messages in chronological order
    messages_list.reverse()
    # Return the formatted list
    return messages_list

@router.get("/language/get-word-cloud", tags=["language"])
def get_word_cloud(current_user: Annotated[User, Depends(get_current_user)]) -> List[dict]:
    # Fetch the last 25 messages sorted by timestamp
    chat_messages = chats_collection.find(
        {"teamId": ObjectId(current_user["team_id"])}, 
        {"_id": 0, "content": 1}
    ).sort("timestamp", DESCENDING).limit(25)

    # Extract words from messages
    words = []
    for message in chat_messages:
        content = message["content"]
        # Tokenize and clean words (simple regex to remove non-alphabetic characters)
        words.extend(re.findall(r'\b\w+\b', content.lower()))

    # Count word usage
    word_count = {}
    for word in words:
        word_count[word] = word_count.get(word, 0) + 1

    # Create word cloud data with random sentiment and subjectivity
    word_cloud_data = [
        {
            "word": word,
            "usage": word_count[word],
            "sentiment": random.uniform(-0.7, 0.8),  # Random sentiment
            "subjectivity": random.uniform(0.1, 0.7),  # Random subjectivity
        }
        for word in word_count
    ]

    # Limit to a fixed number of words (e.g., top 25 by usage)
    word_cloud_data = sorted(word_cloud_data, key=lambda x: x['usage'], reverse=True)[:25]

    return word_cloud_data



@router.get("/language/get-messages-per-day", tags=["language"])
def get_messages_per_day(current_user: Annotated[User, Depends(get_current_user)]):
    # Set the default start date to 10 weeks ago
    start_date = datetime.now() - timedelta(weeks=10)
    end_date = datetime.now()

    filter_by = {
        "teamId": ObjectId(current_user["team_id"]), 
        "timestamp": {
            "$gte": start_date,
            "$lte": end_date
        }
    }

    # Fetch messages within the date range
    chat_messages = chats_collection.find(filter_by, {"_id": 0, "timestamp": 1})

    # Initialize the weekly data dictionary
    weekly_data = {week: [0] * 7 for week in range(10)}  # A dictionary with 10 weeks initialized to 7 days of 0s

    for message in chat_messages:
        timestamp = message["timestamp"]
        # Calculate the week number and day of the week
        week_number = (timestamp - start_date).days // 7
        day_of_week = timestamp.weekday()
        
        # Ensure we are within the expected range of 10 weeks
        if 0 <= week_number < 10:
            # Increment count for the corresponding day in the week
            weekly_data[week_number][day_of_week] += 1

    # Convert weekly_data to a sorted list of counts for 10 weeks
    data = [weekly_data[week] for week in range(10)]

    # Optional: If you need exactly 10 slots per week, expand or modify the data as needed
    # Currently, each week has exactly 7 slots (days), this ensures that each slot is represented as a day
    result_data = [week_data + [0] * (10 - len(week_data)) for week_data in data]  # Extend to 10 slots if needed

    # Generate labels for the weeks
    labels = [f"Week {i + 1}" for i in range(10)]

    return {
        "data": result_data,
        "labels": labels
    }
 
 
 #KANBAN TASK METRICS   

@router.get("/language/get-task-logs", tags=["kanban_metadata"])
def get_kanban_activity_log(current_user: Annotated[User, Depends(get_current_user)]):
    try:
        team_id = current_user["team_id"]
        # Fetch all kanban items for the specified team
        kanban_items = kanban_collection.find(
            {"team_id": ObjectId(team_id)},
            {"title": 1, "column": 1, "sharedUsers": 1, "created_by": 1, "timestamp": 1}
        ).sort("timestamp", DESCENDING)

        activity_log = []

        for item in kanban_items:
            task_name = item.get("title", "Unknown Task")
            created_by = item.get("created_by", "")
            shared_users = item.get("sharedUsers", [])
            timestamp = item.get("timestamp", datetime.now()).strftime("%m/%d/%Y")

            # Add a log entry for task creation
            activity_log.append({
                "task": task_name,
                "message": "Created",
                "userInvolved": False,
                "date": timestamp,
            })

            # Add a log entry if shared with users
            if shared_users:
                for user in shared_users:
                    activity_log.append({
                        "task": task_name,
                        "message": f"Assigned to User ID {user}",  # Replace with actual usernames if needed
                        "userInvolved": True,
                        "date": timestamp,
                    })

            # Add a log entry for status change
            column = item.get("column", "unknown")
            if column:
                activity_log.append({
                    "task": task_name,
                    "message": f"Status changed to {column.capitalize()}",
                    "userInvolved": created_by in shared_users,
                    "date": timestamp,
                })

        return activity_log

    except Exception as e:
        print(f"Error fetching kanban activity log: {e}")
        return []

@router.get("/language/get-task-metrics", tags=["kanban_metadata"])
def get_task_metrics(current_user: Annotated[User, Depends(get_current_user)]):
    try:
        team_id = current_user["team_id"]
        # Get all kanban tasks for the team
        tasks = kanban_collection.find(
            {"team_id": ObjectId(team_id)},
            {"column": 1, "timestamp": 1, "deadline": 1, "description": 1, "priority": 1}
        )

        backlog_count = 0
        doing_count = 0
        testing_count = 0
        done_count = 0
        total_description_length = 0
        task_count = 0

        # Track task ages and priorities
        total_task_age = timedelta()
        total_complete_time = timedelta()
        task_age_count = 0

        # Track priority counts
        priority_counts = {"low": 0, "medium": 0, "high": 0}

        # Count tasks created in last week and month
        last_week = datetime.now() - timedelta(weeks=1)
        last_month = datetime.now() - timedelta(days=30)
        tasks_created_last_week = 0
        tasks_created_last_month = 0

        # Iterate through tasks to calculate metrics
        for task in tasks:
            column = task.get("column", "backlog").lower()
            description_length = len(task.get("description", "").split())
            timestamp = task.get("timestamp", datetime.now())
            priority = task.get("priority", "low").lower()

            # Update task column counts
            if column == "backlog":
                backlog_count += 1
            elif column == "doing":
                doing_count += 1
            elif column == "testing":
                testing_count += 1
            elif column == "done":
                done_count += 1

            # Update description word count
            total_description_length += description_length

            # Track priority
            if priority in priority_counts:
                priority_counts[priority] += 1

            # Calculate task age
            task_age = datetime.now() - timestamp
            total_task_age += task_age
            task_age_count += 1

            # Check task creation within last week and month
            if timestamp >= last_week:
                tasks_created_last_week += 1
            if timestamp >= last_month:
                tasks_created_last_month += 1

            task_count += 1

        # Calculate averages and other metrics
        avg_description_length = (total_description_length / task_count) if task_count > 0 else 0
        avg_task_age = (total_task_age / task_age_count).days if task_age_count > 0 else 0

        total_tasks = backlog_count + doing_count + testing_count + done_count
        completion_percentage_by_column = {
            "backlog": (backlog_count / total_tasks * 100) if total_tasks > 0 else 0,
            "doing": (doing_count / total_tasks * 100) if total_tasks > 0 else 0,
            "testing": (testing_count / total_tasks * 100) if total_tasks > 0 else 0,
            "done": (done_count / total_tasks * 100) if total_tasks > 0 else 0
        }

        # Build response object
        return {
            "task_counts": {
                "backlog": backlog_count,
                "doing": doing_count,
                "testing": testing_count,
                "done": done_count,
            },
            "avg_description_word_count": avg_description_length,
            "tasks_created_last_week": tasks_created_last_week,
            "tasks_created_last_month": tasks_created_last_month,
            "completion_percentage_by_column": completion_percentage_by_column,
            "avg_task_age": f"{avg_task_age} days",
            "priority_counts": priority_counts,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))




