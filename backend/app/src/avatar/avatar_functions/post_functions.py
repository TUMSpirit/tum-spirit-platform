from mailbox import Message
from typing import Annotated, Dict, List, Optional, Union
from pydantic import AfterValidator, BaseModel, Field, PlainSerializer, WithJsonSchema
from bson import ObjectId
from datetime import datetime, timezone
from app.src.routers.auth import get_distinct_team_ids
from app.src.routers.avatar import validate_object_id
from app.src.routers.notification import add_notification
from app.src.avatar.helper import get_team_members

def broadcast_message(
    db,
    content: str, 
    project_id: Optional[str] = None,  # Allow project_id as an optional field
):
    """
    Broadcasts a message to the team.

    Parameters:
    - content (str): The content of the message to be broadcast.

    Returns:
    - dict: A dictionary containing:
        - 'message': A success message indicating that the broadcast was successful.
        - 'message_ids': A list of the IDs of the messages that were created and broadcast.

    Raises:
    - TeamsNotFoundException: If team is not found.
    """

    # If a project_id is provided, filter teams by that project ID from the teams collection
    if project_id:
        # Convert the provided project_id to an ObjectId
        project_object_id = ObjectId(project_id)

        # Fetch teams associated with the given project_id
        teams_filtered = db['teams'].find({"project_id": project_object_id})
        team_ids = [team["_id"] for team in teams_filtered]
        print(f"Filtered team IDs for project {project_id}: {team_ids}")  # Debug log

        if not team_ids:
            raise TeamsNotFoundException()
    else:
        # If no project_id is provided, use all teams from the teams collection
        teams_filtered = db['teams'].find({})
        team_ids = [team["_id"] for team in teams_filtered]
        print(f"No project_id provided, using all team IDs: {team_ids}")  # Debug log

    messages = []

    # Broadcast the message to the relevant teams
    for team_id in team_ids:
        message = {
            "teamId": ObjectId(team_id),
            "content": content,
            "senderId": 'Spirit',  # Avatar name as the sender
            "timestamp": datetime.now(timezone.utc),
            "replyingTo": None,
            "reactions": {},  # Set reactions to an empty object
            "isGif": False,  # Set isGif to boolean false
            "privateChatId": None
        }
        result = db['chat'].insert_one(message)
        messages.append(result.inserted_id)

    return {"message": "Broadcast successful", "_ids": messages}

async def upload_document_for_teams(
    db,
    file_title: str,
    file_content: bytes,
    file_content_type: str,
    project_id: Optional[str] = None,  # Single project_id as an optional field
):
    """
    Uploads a document to the team.

    Parameters:
    - db: Database connection for document storage.
    - file_title (str): Title of the uploaded file.
    - file_content (bytes): Binary content of the file.
    - file_content_type (str): MIME type (e.g., 'application/pdf').

    Returns:
    - dict: Contains:
        - 'message': Success message.
        - 'file_ids': List of file IDs uploaded to each team.

    Raises:
    - TeamsNotFoundException: If team is not found.

    The file's metadata, including team ID, filename, content type, and timestamp, is saved. If no project ID is specified, uploads to all teams.
    """
    if type(file_content) != bytes:
        if type(file_content) == str:
            file_content = file_content.encode('utf-8')
        else:
            raise Exception("file content must be encoded in bytes")
    
    file_size = len(file_content)  # Calculate file size in bytes

    # Fetch all team IDs from the user collection
    all_team_ids = get_distinct_team_ids()
    print(f"Fetched team IDs from users collection: {all_team_ids}")  # Debug log

    # If a project_id is provided, filter teams by that project ID from teams collection
    if project_id:
        project_object_id = ObjectId(project_id)
        # Fetch teams associated with the given project_id
        teams_filtered = db['teams'].find({"project_id": project_object_id})
        team_ids = [team["_id"] for team in teams_filtered]
        print(f"Filtered team IDs for project {project_id}: {team_ids}")  # Debug log

        if not team_ids:
            raise Exception("404: No teams found for the specified project")
    else:
        team_ids = all_team_ids  # If no project_id, use all teams
        print(f"No project_id provided, using all team IDs: {team_ids}")  # Debug log

    uploaded_files = []

    for team_id in team_ids:
        file_record = {
            "team_id": team_id,
            "filename": file_title,
            "contentType": file_content_type,
            "fileData": file_content,
            "size": file_size,  # Store file size
            "uploaded_by": 'Spirit',  # Avatar name as uploader
            "timestamp": datetime.now(timezone.utc)
        }

        result = db['files'].insert_one(file_record)
        uploaded_files.append(result.inserted_id)

    return {"message": "Files uploaded", "_id": uploaded_files}

def add_calendar_entry(current_user, db, title: str, startDateTime:str, endDateTime:str,
                       users:List[str],room:str = "", remoteLink:str = "", color:str = "#1677FF",
                       allDay:bool = False, isOnSite:bool = True, description:str = "", 
                       isMilestone:bool = False, isInitiativeAI: bool = False):
    """
    Adds a calendar entry for specified users; the current user must be included in `users`.

    Parameters:
    - title (str): Calendar entry title.
    - startDateTime (str): Start date/time in "YYYY-MM-DDTHH:MM:SS+01:00" format.
    - endDateTime (str): End date/time in "YYYY-MM-DDTHH:MM:SS+01:00" format.
    - users (List[str]): List of usernames, including the current user.
    - room (str, optional): Event location.
    - remoteLink (str, optional): URL for remote participation.
    - color (str, optional): Hex color for display.
    - allDay (bool, optional): Indicates if the event lasts all day.
    - isOnSite (bool, optional): Marks if the event is on-site.
    - description (str, optional): Event details.
    - isMilestone (bool, optional): Marks the event as a milestone.

    Returns:
    - str: Success message.

    Raises:
    - Exception: If the current user is not in `users`.

    Creates the event and sends a notification to the team.
    """
    #print(current_user["username"])
    #print(users)
    includes_self = False
    included_users = []
    team = get_team_members(current_user, db)
    #print(f"team: {list(team)}")

    found_usernames = set()

    for user in team:
        print(f"user: {user['username']} checked")
        if user['username'] in users:
            print(f"user: {user['username']} included")
            included_users.append(user['_id'])
            found_usernames.add(user['username'])
            includes_self = includes_self or (user['username'] == current_user['username'])

    if not includes_self and not isInitiativeAI:
        raise Exception("the current user must be part of the users")
    
    missing_users = set(users) - found_usernames
    if missing_users:
        raise Exception(f" The following users were not found in the team: {', '.join(missing_users)}."
                        f" these are all members of the team: {str([user['username'] for user in list(get_team_members(current_user, db))])}")

    record = {
        'title': title,
        'startDate': startDateTime,
        'endDate': endDateTime,
        'color': color,
        'allDay': allDay,
        'isOnSite': isOnSite,
        'room': room,
        'remoteLink': remoteLink,
        'textArea': description,
        'isMilestone': isMilestone,
        'files': [],
        'users': included_users,  # Convert ObjectId to str
        'timestamp': datetime.now()
    }

    result = db['calendar'].insert_one(record)


    notification = {
        'team_id': current_user['team_id'],
        'title': "Calendar",
        'description': current_user['username'] + " added a Calendar Entry",
        'type': "calendar_added",
        'timestamp': datetime.now()
    }
    add_notification(notification)
    print("calender_post_done")
    
    return {'message': "Calendar entry successfully created.", '_id': result.inserted_id}

class TeamsNotFoundException(Exception):
    def __init__(self, message="No teams found for the specified project"):
        self.message = message
        super().__init__(self.message)

def create_kanban_card(
    db,
    title: str,
    description: str,
    priority: str = "",
    deadline: int = 0,
    milestone: str = "",
    project_id: Optional[str] = None,  # Allow project_id as an optional field
):
    """
    Creates a Kanban card for the team. The Kanban card is initially added to the 'backlog' column.

    Parameters:
    - title (str): The title of the Kanban card.
    - description (str): A detailed description of the Kanban card.
    - priority (str): The priority of the task (optional, defaults to an empty string).
    - deadline (int): A Unix timestamp representing the deadline for the card (optional, defaults to 0).
    - milestone (str): The milestone associated with the card (optional, defaults to an empty string).

    Returns:
    - dict: A dictionary containing:
        - 'message': A success message indicating that the Kanban card was created.
        - 'card_ids': A list of the IDs of the Kanban cards that were created.

    Raises:
    - TeamsNotFoundException: If team is not found.
    """
    # If a project_id is provided, filter teams by that project ID from the teams collection
    if project_id:
        # Convert the provided project_id to an ObjectId
        project_object_id = ObjectId(project_id)

        # Fetch teams associated with the given project_id
        teams_filtered = db['teams'].find({"project_id": project_object_id})
        team_ids = [team["_id"] for team in teams_filtered]
        print(f"Filtered team IDs for project {project_id}: {team_ids}")  # Debug log

        if not team_ids:
            raise TeamsNotFoundException()
    else:
        # If no project_id is provided, use all teams from the teams collection
        teams_filtered = db['teams'].find({})
        team_ids = [team["_id"] for team in teams_filtered]
        print(f"No project_id provided, using all team IDs: {team_ids}")  # Debug log

    cards = []

    # Create a Kanban card for the relevant teams
    for team_id in team_ids:
        card = {
            'team_id': ObjectId(team_id),
            'title': title,
            'column': "backlog",  # Assuming the initial column is 'backlog'
            'description': description,
            'priority': priority,
            'deadline': deadline,
            'tags': [],
            'milestone': milestone,
            'sharedUsers': [],
            'created_by': 'Spirit',
            'timestamp': datetime.now(timezone.utc)  # Track the time the card was created
        }
        result = db['kanban'].insert_one(card)
        cards.append(result.inserted_id)

    return {'message': "Kanban card created",'_id': cards}

def add_milestone(db, title: str, deadline: str, details: str = ""):
    """
    Adds a milestone to the timeline.

    Parameters:
    - title (str): The title of the milestone.
    - deadline (str): The deadline for the milestone in ISO 8601 format (e.g., "2023-11-27").
    - details (str): Additional details about the milestone (optional, defaults to an empty string).

    Returns:
    - dict: A dictionary containing:
        - 'id': The unique identifier of the newly created milestone.
        - 'title': The title of the milestone.
        - 'details': The details of the milestone.
        - 'deadline': The parsed deadline as a datetime object.
        - 'timestamp': The timestamp of when the milestone was created.

    Raises:
    - ValueError: If the deadline is not in a valid ISO 8601 format.
    """
    deadline = datetime.fromisoformat(deadline)

    record = {
        'title': title,
        'details': details,
        'deadline': deadline,
        'timestamp': datetime.now()
    }

    result = db['timeline'].insert_one(record)

    return {'message': "milestone created", 'id': result.inserted_id, **record}