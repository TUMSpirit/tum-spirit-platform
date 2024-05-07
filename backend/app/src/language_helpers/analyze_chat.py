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
    for user in getUsers():
        analyze_user_big5(user.id)

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

