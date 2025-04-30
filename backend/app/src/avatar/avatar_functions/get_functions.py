# from SearchGPT_Searx.fetch_web_content import WebContentFetcher
# from SearchGPT_Searx.retrieval import EmbeddingRetriever
# from SearchGPT_Searx.llm_answer import GPTAnswer
from app.config import OPENAI_API_KEY
from datetime import datetime, timedelta, timezone
from app.src.routers.kanban import TaskModel
from app.src.avatar.helper import censor_message
from bson import ObjectId
from openai import OpenAI
from app.src.routers.timeline import MilestoneModel
import json

# def fetch_online_search_results(query):
#     """
#     Fetches and formats online search results for a given query. This function uses a web content fetcher 
#     to gather content, an embedding retriever to find the most relevant documents, and a content processor 
#     to format them.

#     Parameters:
#     - query (str): The search term or question to retrieve content for.

#     Returns:
#     - list: A list of formatted relevant documents, each containing:
#         - 'title': The document's title.
#         - 'url': The document's URL.
#         - 'content': A summary or excerpt from the document.

#     Process:
#     - Fetches web content using `WebContentFetcher`.
#     - Retrieves relevant documents with `EmbeddingRetriever`.
#     - Formats the documents with `GPTAnswer` for readability.

#     Raises:
#     - WebFetchError: If web content fetching fails.
#     - RetrievalError: If document retrieval fails.
#     """
#     print(f"query: {query}")

#     # Fetch web content based on the query
#     web_contents_fetcher = WebContentFetcher(query)
#     web_contents, searx_response = web_contents_fetcher.fetch("http://192.168.0.225:8888/")

#     print(f"web_contents recieved")
#     print(f"web_contents: {web_contents}")
#     print(f"searx_response: {searx_response}")

#     # Retrieve relevant documents using embeddings
#     retriever = EmbeddingRetriever()
#     relevant_docs_list = retriever.retrieve_embeddings(web_contents, searx_response['links'], query, OPENAI_API_KEY)

#     print(f"embeddings recieved")
#     print(f"relevant_docs_list: {relevant_docs_list}")

#     # Format the relevant documents
#     content_processor = GPTAnswer()
#     formatted_relevant_docs = content_processor._format_reference(relevant_docs_list, searx_response['links'])
    
#     return {'message': str(formatted_relevant_docs)}

def get_all_calendar_entries(current_user, db, max_past_events_in_days: int):
    """
    Fetches all calendar entries for a user from the database past, present and future and filters them to include 
    only entries within the specified number of past days. The limit is capped by the constant MAX_PAST_ENTRIES 
    (currently 365 days), so entries older than this are not retrieved.

    Parameters:
    - max_past_events_in_days (int): The maximum past days to retrieve.

    Returns:
    - str: List of filtered calendar entries as a string.

    Process:
    - Fetches entries for the specified user.
    - Filters entries to include only those within max past days.
    - Limits by MAX_PAST_ENTRIES to ensure 365-day max retrieval.

    Raises:
    - None
    """
    MAX_PAST_ENTRIES = 365
    query = {"users": current_user['_id']}
    entries = db['calendar'].find(query)
    ret = []
    max_past_timedelta = timedelta(min(MAX_PAST_ENTRIES, max_past_events_in_days))
    for entry in entries:
        if datetime.now(timezone.utc) - datetime.fromisoformat(entry['endDate']) < max_past_timedelta:
            ret.append(entry)
    return {'message': str(ret)}

def get_all_kanban_tasks(current_user, db):
    query = {"team_id": current_user["team_id"]}
    entries = db['kanban'].find(query)
    return {'message': str(list(entries))}

def get_archived_kanban_tasks(current_user, db):
    query = {"team_id": current_user["team_id"]}
    archived_tasks = list(db['archived_kanban'].find(query))
    return {'message': str([TaskModel(**task) for task in archived_tasks])}

def get_team_members(current_user, db):
    entries = db['users'].find({"team_id": current_user["team_id"]}, {"password": 0}) 
    return {'message': str(list(entries))}

def get_all_files(current_user, db):
    # Convert current user id to string
    #current_user_id_str = str(current_user.id)
    query = {"team_id": current_user['team_id']}
    projection = {"fileData": 0}  # Exclude fileData field
    entries = db['files'].find(query, projection)
    return {'message': str(list(entries))}

def get_file(file_id:str, current_user, db):
    query = {"_id": ObjectId(file_id), "team_id": current_user['team_id']}
    file = db['files'].find_one(query)
    if not file:
        raise Exception("file not found")
    return {'message': str(file)}

def get_filtered_team_chat(current_user, db):
    # Define the lookback period (1 week ago)
    lookback_timespan = datetime.now(timezone.utc) - timedelta(weeks=1)
    
    # Query to filter messages
    query = {
        "teamId": current_user['team_id'],
        "timestamp": {"$gte": lookback_timespan},  # Filter messages newer than 1 week
        "privateChatID": None  # Ensure privateChatID is null
    }
    
    # Fetch and format messages
    messages = (
        db['chat']
        .find(query)
        .sort("timestamp", -1)  # Sort by timestamp, descending
        .limit(50)  # Limit the result to 50
    )
    
    # Convert the cursor to a list of dictionaries
    messages_list = list(messages)
    
    # Prepare the messages for summarization
    formatted_messages = [
        {
            "_id": str(msg["_id"]),
            "timestamp": msg["timestamp"].isoformat(),
            "content": msg["content"],
            "senderId": msg["senderId"],
            "replyingTo": str(msg["replyingTo"])
        }
        for msg in messages_list
    ]

    # Apply the function over each message's content
    # for msg in formatted_messages:
    #     msg['content'] = censor_message(msg['content'])
    
    print(formatted_messages)
    
    # Parse and return the response
    return {'message': json.dumps(formatted_messages)}

def getMilestones(current_user, db
):
    # Create a record with a random ID (ObjectId) and a timestamp
    # Inserting the record into the database
    query = {"team_id":current_user["team_id"]}
    items = []
    for item in db['timeline'].find():
        items.append(MilestoneModel(**item))

    #print(items)
    return {'message': items}
        # Print the results
    #output = list(result)
    # total_entries = collection.count_documents(query)
    # Return the ID of the inserted record
