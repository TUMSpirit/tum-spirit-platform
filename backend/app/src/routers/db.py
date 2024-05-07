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
collection = db['mycollection']


# Define a route to insert a record into the database
@router.get("/db/insert", tags=["db"])
def insert_record():
    try:
        # Create a record with a random ID (ObjectId) and a timestamp
        record = {
            '_id': ObjectId(),
            'timestamp': datetime.now()
        }
        # Inserting the record into the database
        result = collection.insert_one(record)
        # Return the ID of the inserted record
        return {"id": str(result.inserted_id)}
    except Exception as e:
        # If something goes wrong, raise an HTTP exception
        raise HTTPException(status_code=500, detail=str(e))
