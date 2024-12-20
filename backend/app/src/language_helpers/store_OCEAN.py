
from .dto.OCEAN import OCEANResult

from ..utils.db import get_db

from datetime import datetime


metadata_collection = get_db("users_OCEAN")

def store_OCEAN(user_id, team_id, OCEAN_result: OCEANResult, message_count):
    record = {
        'user_id': user_id,
        'team_id': team_id,
        'timestamp': datetime.now(),
        'message_count': message_count,
        'result': OCEAN_result
    }
    
    result = metadata_collection.insert_one(record)

    # Return the ID of the inserted record
    return {"id": str(result.inserted_id)}