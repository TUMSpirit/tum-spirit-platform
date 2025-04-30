from bson import ObjectId
from datetime import datetime
from PIL import Image
from presidio_analyzer import AnalyzerEngine
from presidio_anonymizer import AnonymizerEngine
from langdetect import detect
import debugpy
from app.config import MONGO_DB,MONGO_URI
from pymongo import MongoClient


client = MongoClient(MONGO_URI)
db = client[MONGO_DB]


def get_team_members(current_user, db):
    entries = db['users'].find({"team_id": current_user["team_id"]}, {"password": 0}) 
    return entries


def get_project_by_team(current_user, db):
    """
    Fetch the project and milestones based on the current user's team.
    """
    # Fetch the team by team_id
    team = db['teams'].find_one({"_id": ObjectId(current_user["team_id"])})
    
    if not team:
        raise Exception(detail="Team not found")

    # Fetch the project_id from the team
    project_id = team.get("project_id")
    if not project_id:
        raise Exception(detail="Team does not have an associated project")

    # Fetch the project document
    project = db['projects'].find_one({"_id": ObjectId(project_id)})
    if not project:
        raise Exception(detail="Project not found")

    # Fetch the milestones associated with the project_id
    milestones = list(db['milestones'].find({"project_id": ObjectId(project_id)}))

    # Convert milestones' _id to string
    milestones_data = [
        {
            "title": milestone.get("title"),
            "date": milestone.get("date"),
            "details": milestone.get("details")
        }
        for milestone in milestones
    ]

    # Return the project and associated milestones
    return {
        "id": str(project["_id"]),
        "name": project.get("name"),
        "team_name": team.get("name"),
        "description": project.get("description"),
        "start_date": project.get("start_date"),
        "created_at": project.get("created_at", datetime.now()),
        "milestones": milestones_data
    }

def check_for_ID_in_reward_buffer(id, db):
    reward_collection = db['reward_buffer']
    result = reward_collection.find_one({'type_id': id})
    return result is not None

def get_feedback(id, db):
    print(f"user feedback for {str(id)}")

def feedback_recieved(id, reward):
    collection = db["reward_buffer"]
    
    # Convert id to ObjectId if necessary
    if not isinstance(id, ObjectId):
        id = ObjectId(id)
    
    # Update the document where _id matches
    result = collection.update_one({"_id": id}, {"$set": {"reward": reward, "evaluated": True}})
    
    # Check if the document was updated
    if result.matched_count < 1:
        raise Exception(detail="matching entry not found")



def censor_message(message:str):
    # SUPPORTED_LANGUAGES = ["en", "de"]

    # analyzer = AnalyzerEngine()
    # anonymizer = AnonymizerEngine()
    # detected_language = detect(message)

    # if not detected_language in SUPPORTED_LANGUAGES:
    #     raise Exception("language could not be detected or is not supported")
    print("start")
    print(message)

    # Start the debug server
    # debugpy.listen(("0.0.0.0", 5678))  # Listen on all IP addresses and port 5678
    # print("Waiting for debugger to attach...")
    # debugpy.wait_for_client()  # Wait until the debugger client connects

    analyzer = AnalyzerEngine()
    anonymizer = AnonymizerEngine() 

    detected_language = "en"

    entities = analyzer.get_supported_entities(language=detected_language)
    print(entities)

    entities = [s for s in entities if s != "PERSON"]
    results = analyzer.analyze(text=message, entities=entities, language=detected_language)
    anonymized_text = anonymizer.anonymize(text=message, analyzer_results=results)
    print(anonymized_text.text)
    print("finish")

    return anonymized_text.text


def add_idle_entry(db, action_step_id, reward):
    buffer_entry = {
        'type': 'Idle',
        'reward': reward,
        'step_id': action_step_id,
        'evaluated': True
    }
    db['reward_buffer'].insert_one(buffer_entry)


def get_kanban_task_summary(team_id: str, db):
    """
    Fetches all Kanban tasks for a given team ID and returns a human-readable string
    listing the title and description of each task.
    """
    tasks = db['kanban'].find({"team_id": ObjectId(team_id)})
    task_list = list(tasks)

    if not task_list:
        return "No Kanban tasks found for this team."

    output = []
    for task in task_list:
        title = task.get('title', 'Untitled')
        description = task.get('description', 'No description provided.')
        output.append(f"Task: {title}\nDescription: {description}\n")

    return "\n".join(output)