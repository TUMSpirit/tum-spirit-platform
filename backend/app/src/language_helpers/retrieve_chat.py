
from bson import ObjectId
from datetime import datetime
from .dto.message import Message

def retrieve_chat(user_id = None, since = None):

    record: Message = {
        'id': ObjectId(),
        'sender_id': ObjectId(),
        'timestamp': datetime.now(),
        'content': "Playing games has always been thought to be important to the development of well-balanced and creative children"
    }
    return [record]