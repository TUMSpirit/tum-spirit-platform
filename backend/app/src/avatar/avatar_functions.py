from mailbox import Message
from fastapi import APIRouter, UploadFile
from typing import Annotated, Dict, List, Optional, Union
from pydantic import AfterValidator, BaseModel, Field, PlainSerializer, WithJsonSchema
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime, timezone
from app.src.routers.auth import get_distinct_team_ids
from app.src.routers.avatar import validate_object_id
from app.config import MONGO_DB,MONGO_URI


# Load environment variables from a .env file
#load_dotenv()



PyObjectId = Annotated[
    Union[str, ObjectId],
    AfterValidator(validate_object_id),
    PlainSerializer(lambda x: str(x), return_type=str),
    WithJsonSchema({"type": "string"}, mode="serialization"),
]

class Message(BaseModel):
    teamId: PyObjectId
    content: str
    senderId: str
    timestamp: datetime
    replyingTo: Optional[str] = None
    reactions: Optional[Dict[str, str]] = Field(default_factory=dict)
    isGif: Optional[bool] = False
    privateChatId: Optional[str] = None

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True  # required for the _id
        json_encoders = {ObjectId: str}

class TeamsNotFoundException(Exception):
    def __init__(self, message="No teams found for the specified project"):
        self.message = message
        super().__init__(self.message)


class SpiritException(Exception):
    def __init__(self, message="Something went wrong during the execution of the spirit function"):
        self.message = message
        super().__init__(self.message)


def broadcast_message(
    db,
    content: str, 
    project_id: Optional[str] = None,  # Allow project_id as an optional field
):
    """
    Broadcasts a message to teams. The message can be sent to all teams or filtered by a specific project ID. 
    If a `project_id` is provided, the function filters the teams associated with that project. Otherwise, 
    it broadcasts to all teams.

    Parameters:
    - content (str): The content of the message to be broadcast.
    - project_id (Optional[str]): The ID of the project to filter teams (optional).

    Returns:
    - dict: A dictionary containing:
        - 'message': A success message indicating that the broadcast was successful.
        - 'message_ids': A list of the IDs of the messages that were created and broadcast.

    Raises:
    - TeamsNotFoundException: If no teams are found for the provided `project_id`.
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

    return {"message": "Broadcast successful", "message_ids": [str(m) for m in messages]}


#@router.post("/avatar/create-calendar-entry", tags=["avatar"])
#def create_calendar_entry(title: str, date: datetime = Body(...), current_user: User = Depends(is_admin)):
 #   try:
  #      teams = get_distinct_team_ids()  # Assuming you have a teams collection
   ##     events = []
        
     #   for teamId in teams:
      #      event = {
              #  'title': title,
               # 'startDate': startDate,
                #'endDate': endDate,
                #'color': "B29DD9",
                #'allDay': false,
                #'isOnSite': calendar_entry.isOnSite,
                #'room': calendar_entry.room,
                #'remoteLink': calendar_entry.remoteLink,
                #'textArea': calendar_entry.textArea,
                #'isMilestone': calendar_entry.isMilestone,
                #'files': calendar_entry.files,
                #'users': calendar_entry.users,  # Convert ObjectId to str
       #         'timestamp': datetime.now()
        #    }
         #   result = db['chat'].insert_one(event)
          #  events.append(result.inserted_id)
        
        #return {"message": "Calendar entry created", "message_ids": [str(m) for m in events]}
    #except Exception as e:
     #   raise HTTPException(status_code=500, detail=str(e))


from bson import ObjectId  # Ensure ObjectId is imported

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
    Creates a Kanban card for one or more teams. The card can be associated with a specific project 
    or added to all teams if no project ID is provided. The Kanban card is initially added to the 'backlog' column.

    Parameters:
    - title (str): The title of the Kanban card.
    - description (str): A detailed description of the Kanban card.
    - priority (str): The priority of the task (optional, defaults to an empty string).
    - deadline (int): A Unix timestamp representing the deadline for the card (optional, defaults to 0).
    - milestone (str): The milestone associated with the card (optional, defaults to an empty string).
    - project_id (Optional[str]): The ID of the project to filter teams (optional).

    Returns:
    - dict: A dictionary containing:
        - 'message': A success message indicating that the Kanban card was created.
        - 'card_ids': A list of the IDs of the Kanban cards that were created.

    Raises:
    - TeamsNotFoundException: If no teams are found for the provided `project_id`.
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

    return "Kanban card created" + "card_ids: " + str([str(m) for m in cards])



async def upload_document_for_teams(
    db,
    files: List[UploadFile], 
    project_id: Optional[str] = None,  # Single project_id as an optional field
):
    """
    Uploads a document to teams. The document can either be uploaded to all teams or filtered by a specific 
    project ID. If no project ID is provided, the document is uploaded to all teams. 

    Parameters:
    - files (List[UploadFile]): A list of files to be uploaded. At least one file must be provided.
    - project_id (Optional[str]): The ID of the project to filter teams (optional).

    Returns:
    - dict: A dictionary containing:
        - 'message': A success message indicating that the files were uploaded.
        - 'file_ids': A list of the IDs of the files that were uploaded.

    Raises:
    - SpiritException: If no file is provided.
    - TeamsNotFoundException: If no teams are found for the provided `project_id`.

    This method reads the file, calculates its size, and uploads the document along with its metadata (e.g., 
    team ID, file name, content type, file size, and upload timestamp) to the relevant teams' collection. 
    If no project ID is specified, the file will be uploaded to all teams.
    """
    if not files:
        raise SpiritException("File is required")
    file = files[0]
    file_data = await file.read()
    file_size = len(file_data)  # Calculate file size in bytes

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
            raise TeamsNotFoundException("404: No teams found for the specified project")
    else:
        team_ids = all_team_ids  # If no project_id, use all teams
        print(f"No project_id provided, using all team IDs: {team_ids}")  # Debug log

    uploaded_files = []

    for team_id in team_ids:
        file_record = {
            "team_id": team_id,
            "filename": file.filename,
            "contentType": file.content_type,
            "fileData": file_data,
            "size": file_size,  # Store file size
            "uploaded_by": 'Spirit',  # Avatar name as uploader
            "timestamp": datetime.now(timezone.utc)
        }

        result = db['files'].insert_one(file_record)
        uploaded_files.append(str(result.inserted_id))

    return {"message": "Files uploaded", "file_ids": uploaded_files}
