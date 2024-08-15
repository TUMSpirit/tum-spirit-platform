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


# Connect to MongoDB
client = MongoClient(MONGO_URI)
db = client[MONGO_DB]
collection = db['user']


# Define a route to insert a record into the database
@router.get("/user/insert", tags=["user"])
def create_user(user_entry):
    try:
        # Create a record with a random ID (ObjectId) and a timestamp
        record = {
            '_id': ObjectId(),
            'username': user_entry.username,
            'team': user_entry.team,
        }
        # Inserting the record into the database
        result = timeline.insert_one(record)
        # Return the ID of the inserted record
        return {"id": str(result.inserted_id)}
    except Exception as e:
        # If something goes wrong, raise an HTTP exception
        raise HTTPException(status_code=500, detail=str(e))

# Define a route to insert a record into the database
@router.put("/user/update", tags=["user"])
def update_timelineEntry(user_id, newValues):
    try:
        query = { '_id': user_id }
        # Updating the record into the database
        result = timeline.update_one(query, values)
        # Return the ID of the inserted record
        return result
    except Exception as e:
        # If something goes wrong, raise an HTTP exception
        raise HTTPException(status_code=500, detail=str(e))

# Define a route to insert a record into the database
@router.put("/user/delete", tags=["user"])
def insert_timelineEntry(user_id):
    try:
        # Create a record with a random ID (ObjectId) and a timestamp
        query = { '_id': user_id }
        # Inserting the record into the database
        result = timeline.remove(query)
        # Return the ID of the inserted record
        return result
    except Exception as e:
        # If something goes wrong, raise an HTTP exception
        raise HTTPException(status_code=500, detail=str(e))