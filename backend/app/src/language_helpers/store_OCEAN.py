
from .dto.OCEAN import OCEANResult

from ..utils.db import get_db

from datetime import datetime


metadata_collection = get_db("user_OCEAN")

def store_OCEAN(user_id, OCEAN_result: OCEANResult):
    record = {
        'user_id': user_id,
        'timestamp': datetime.now(),
        'result': OCEAN_result
    }
    
    result = metadata_collection.insert_one(record)

    # Return the ID of the inserted record
    return {"id": str(result.inserted_id)}