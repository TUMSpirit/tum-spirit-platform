
from bson import ObjectId
from datetime import datetime

from .dto.message_metadata import MessageMetadata

from ..utils.db import get_db


metadata_collection = get_db("chat_metadata")

def store_metadata(message_id, sender_id, timestamp, metadata):
    record: MessageMetadata = {
        '_id': ObjectId(),
        'message_id': message_id,
        'sender_id': sender_id,
        'timestamp': timestamp,
        'metadata': metadata
    }
    
    result = metadata_collection.insert_one(record)

    # Return the ID of the inserted record
    return {"id": str(result.inserted_id)}