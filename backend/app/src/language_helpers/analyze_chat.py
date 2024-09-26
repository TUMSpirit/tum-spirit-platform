from typing import List
from .generate_metadata import generate_metadata
from .retrieve_chat import retrieve_chat
from .store_metadata import store_metadata

from .generate_OCEAN import generate_OCEAN
from .store_OCEAN import store_OCEAN


from ..utils.fakeAuth import User

#TODO: connect to db
def getUsers():
    return [User(id="jkjnsadkjn", username="blah")]

def analyze_chat():
    analyze_chats()
    #for user in getUsers():
    #   analyze_user_big5(user.id)

def analyze_chats():
    latest_metadata = "2024-01-01"

    messages = retrieve_chat(since=latest_metadata)

    for message in messages:
        metadata = generate_metadata(message["content"])
        store_metadata(message["id"], message["sender_id"], message["timestamp"], metadata)


def analyze_user_big5(user_id):
    messages = retrieve_chat(user_id)

    big5_result = generate_OCEAN(messages)

    store_OCEAN(user_id, big5_result)

def analyze_chat_prod(latest):
    latest_metadata = latest #"2024-01-01"

    messages = retrieve_chat(since=latest_metadata)

    for message in messages:
        metadata = generate_metadata(message["content"])
        store_metadata(message["id"], message["sender_id"], message["timestamp"], metadata)





def analyze_big5(user_id: str, chat_string: List[str]):
    try:
        # Check if the chat_string array is empty
        if not chat_string:
            # If empty, store an empty result
            big5_result = {}
        else:
            # Process the chat_string to generate Big Five (OCEAN) result
            big5_result = generate_OCEAN(chat_string)
        
        # Store the result
        store_OCEAN(user_id, big5_result)
    
    except Exception as e:
        # Handle exceptions if necessary
        print(f"Error analyzing Big Five: {str(e)}")


def analyze_chat_demo(input):
    metadata = generate_metadata(input)
    return metadata

