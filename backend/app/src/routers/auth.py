from datetime import datetime, timedelta, timezone
from queue import Full
from typing import Annotated, Any, List, Optional, Union
from fastapi import Depends, APIRouter, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from pymongo import MongoClient, ReturnDocument
from pydantic import AfterValidator, BaseModel, Field, PlainSerializer, WithJsonSchema
from datetime import datetime, timedelta
from bson import ObjectId
from bson.errors import InvalidId  # Import the create_user_settings function
from app.config import SECRET_KEY,MONGO_DB,MONGO_URI

# Create a router
router = APIRouter()
# Load environment variables from a .env file

# to get a string like this run:
# openssl rand -hex 32

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 139600

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# MongoDB credentials and database info
#MONGO_USER = os.getenv("MONGO_USER")
#MONGO_PASSWORD = os.getenv("MONGO_PASSWORD")
#MONGO_HOST = os.getenv("MONGO_HOST")
#MONGO_PORT = os.getenv("MONGO_PORT")
#MONGO_DB = os.getenv("MONGO_DB")

# Connection string
#MONGO_URI = os.getenv("MONGO_URI")

# Connect to MongoDB
client = MongoClient(MONGO_URI)
db = client[MONGO_DB]
user_collection = db['users']
team_collection = db["teams"]
message_collection = db["chat"]
settings_collection = db["user_settings"]


def validate_object_id(v: Any) -> ObjectId:
    if isinstance(v, ObjectId):
        return v
    if ObjectId.is_valid(v):
        return ObjectId(v)
    raise ValueError("Invalid ObjectId")


PyObjectId = Annotated[
    Union[str, ObjectId],
    AfterValidator(validate_object_id),
    PlainSerializer(lambda x: str(x), return_type=str),
    WithJsonSchema({"type": "string"}, mode="serialization"),
]
# Register the custom encoder for PyObjectI

class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Union[str, None] = None

class ChatData(BaseModel):
    chatId: str
    count: int
    lastVisited: Optional[str] = None

class ChatDataList(BaseModel):
    chatData: List[List[Union[str, str]]]
    
class ChatUsername(BaseModel):
    chatData: str
    
class User(BaseModel):
    username: str
    role: str
    #project_id: Optional[PyObjectId] = None
    team_id: Optional[PyObjectId] = None

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True  # required for the _id
        json_encoders = {ObjectId: str}

class CreateUser(User):
    password: str
    avatar_color: str
    
class UserInDB(User):
    password: str
    
class TeamUser(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    username: str
    role: str
    #project_id: Optional[PyObjectId] = None
    team_id: Optional[PyObjectId] = None
    avatar_color: Optional[str] = None
    last_active: Optional[datetime] = datetime.now()
    missed_messages: Optional[int] = 0
    missed_messages_chat: Optional[List[List[Optional[Union[str, str]]]]] = []
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True  # required for the _id
        json_encoders = {ObjectId: str}

class TeamUserClean(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    username: str
    role: str
    #project_id: Optional[PyObjectId] = None
    team_id: Optional[PyObjectId] = None
    avatar_color: Optional[str] = None
    last_active: Optional[datetime] = datetime.now()
    missed_messages: Optional[int] = 0
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True  # required for the _id
        json_encoders = {ObjectId: str}


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


def get_user_db(username: str):
    """
    Fetch user from MongoDB by email.
    Args:
        email (str): Email of the user
    Returns:
        UserInDB | None: UserInDB instance if user is found, else None
    """
    user_data = user_collection.find_one({"username": username})
    if user_data:
        return user_data


def authenticate_user_db(username: str, password: str):
    """
    Authenticates a user using MongoDB.
    Args:
        email (str): The email of the user to authenticate.
        password (str): The password of the user to authenticate.
    Returns:
        User | bool: The authenticated User object, or False if authentication fails.
    """
    user = get_user_db(username)
    if not user:
        return False
    if not verify_password(password, user.get("password")):
        return False
    return user


def create_access_token(data: dict, expires_delta: Union[timedelta, None] = None):
    """
    Create an access token using the provided data and expiration delta.

    Args:
        data (dict): The data to be encoded in the access token.
        expires_delta (Union[timedelta, None], optional): The expiration delta for the access token.
            If not provided, a default expiration of 15 minutes will be used.

    Returns:
        str: The encoded access token.

    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
    """
    Retrieves the current user based on the provided token.

    Args:
        token (str): The authentication token.

    Returns:
        User: The current user.

    Raises:
        HTTPException: If the credentials cannot be validated.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = get_user_db(username=token_data.username)
    if user is None:
        raise credentials_exception
    return user

def get_distinct_team_ids() -> List[str]:
    """
    Fetch all distinct teamIds from the users collection.
    """
    try:
        # Query the users collection and get all distinct teamIds
        team_ids = user_collection.distinct("team_id")
        if not team_ids:
            raise HTTPException(status_code=404, detail="No teams found")
        return team_ids
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving team IDs: {str(e)}")

async def check_role(
    current_user: Annotated[User, Depends(get_current_user)], role: str
):
    if current_user["role"] != role:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return current_user

async def is_admin(current_user: Annotated[User, Depends(get_current_user)]):
    """
    Ensures the current user is an admin.
    Raises HTTPException if the user is not an admin.
    """
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return current_user

def get_missed_messages(team_id: ObjectId, last_active: datetime) -> int:
    missed_messages = message_collection.count_documents(
        {"teamId": team_id, "timestamp": {"$gt": last_active}}
    )
    return missed_messages
    
async def get_user_last_active(user_id: str) -> datetime:
    user = await user_collection.find_one({"_id": user_id})
    if user:
        return user.get("last_active")
    return None

def get_users():
    # Example endpoint to fetch all users
    users = user_collection.find({}, {'username': 1})
    return {"users": [str(user['username']) for user in users]}



def create_user_settings(user_id: ObjectId):
    default_settings = {
        "user_id": ObjectId(user_id),
        "is_first_login": True,
        "test_success": False,
        "trigger_tki_test": False
    }

    # Insert the default settings into the user_settings collection
    result = settings_collection.insert_one(default_settings)

    # Return success or error message based on the insertion
    if result.inserted_id:
        return {"message": "User settings created successfully"}
    else:
        return {"message": "Failed to create user settings"}


@router.post("/create-users")
async def create_users(user_data: List[CreateUser], current_user: User = Depends(get_current_user)):
    """
    Creates users with hashed passwords and initializes their settings.

    Args:
        user_data (List[CreateUser]): A list of CreateUser instances containing user details and passwords.
        current_user (User): The currently authenticated user.

    Returns:
        dict: A confirmation message.
    
    Raises:
        HTTPException: If the current user is not an admin.
    """
    # Check if the current user is an admin
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to perform this action"
        )

    try:
        # Prepare user documents with hashed passwords
        user_docs = []
        for user in user_data:
            hashed_password = get_password_hash(user.password)
            user_docs.append({
                "username": user.username,
                "password": hashed_password,
                "role": user.role,
                "project_id": ObjectId(user.team_id),
                "team_id": ObjectId(user.team_id),
                "avatar_color": user.avatar_color,
            })

        # Insert users into the database
        result = user_collection.insert_many(user_docs)

        # Create user settings for each inserted user
        for inserted_id in result.inserted_ids:
            create_user_settings(ObjectId(inserted_id))

        return {"message": "Users created successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@router.get("/me", response_model=TeamUser)
async def read_users_me(current_user: Annotated[User, Depends(get_current_user)]):
    try:
        # Fetch the current user document from the database
        user = user_collection.find_one({"_id": ObjectId(current_user["_id"])})
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Add the last_active field if it's not set
        if not user.get("last_active"):
            user["last_active"] = datetime.now()
            user_collection.update_one(
                {"_id": ObjectId(current_user["_id"])},
                {"$set": {"last_active": user["last_active"]}}
            )

        return user

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/login")
async def login_for_access_token(form_data: Annotated[OAuth2PasswordRequestForm, Depends()],) -> Token:
    """
    Authenticates a user and generates an access token for them.

    Args:
        form_data (OAuth2PasswordRequestForm): The form data containing the username and password.

    Returns:
        Token: The generated access token.

    Raises:
        HTTPException: If the username or password is incorrect.
    """
    user = authenticate_user_db(
        form_data.username, form_data.password)
    if not user:
        raise HTTPException(
           status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    print(user)
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.get("username")}, expires_delta=access_token_expires
    )
    return Token(access_token=access_token, token_type="bearer")


@router.get("/get-team-members", response_model=List[TeamUserClean])
async def get_team_members(current_user: User = Depends(get_current_user)):
    entries = user_collection.find({"team_id": current_user["team_id"]}, {"password": 0}) 
    return entries

@router.post("/update-last-active")
async def update_last_active(chat_data: ChatUsername, current_user: User = Depends(get_current_user)):
    try:
        # Extract the username from the request (assuming chatData is the username string)
        username = chat_data.chatData
        
        if not username:
            raise HTTPException(status_code=400, detail="Username is required")

        # Fetch the current state of the missed_messages_chat array
        user_doc = user_collection.find_one({"_id": ObjectId(current_user["_id"])})
        
        if user_doc is None:
            raise HTTPException(status_code=404, detail="User not found")

        # Get the existing array, or default to an empty list if it doesn't exist
        existing_data = user_doc.get("missed_messages_chat", [])

        # Create a dictionary to map usernames to their entries
        existing_data_dict = {entry[0]: entry for entry in existing_data if len(entry) == 2}

        # Process the new data
        if username in existing_data_dict:
            # Update the existing entry's timestamp (second element)
            existing_data_dict[username][1] = datetime.now().isoformat()
        else:
            # Add a new entry with username and timestamp
            existing_data_dict[username] = [username, datetime.now().isoformat()]

        # Convert the dictionary back to a list (2D array)
        updated_data_array = list(existing_data_dict.values())
        
        # Update the user document in the database
        result = user_collection.find_one_and_update(
            {"_id": ObjectId(current_user["_id"])},
            {"$set": {"missed_messages_chat": updated_data_array}},
            return_document=ReturnDocument.AFTER
        )
        
        if result:
            return {"message": "Chat data updated successfully"}
        else:
            raise HTTPException(status_code=404, detail="User not found")
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    
@router.get("/missed-chats")
async def get_missed_chats(current_user: User = Depends(get_current_user)):
    # Extract missed messages timestamps and privateChatIDs
    missed_messages_chat = current_user.get("missed_messages_chat", [])

    if not missed_messages_chat:
        # If missed_messages_chat is empty, fetch all team members
        
        team_members = user_collection.find(
            {"team_id": ObjectId(current_user["team_id"]), "_id": {"$ne": ObjectId(current_user["_id"])}},
            {"username": 1}
        )
        
        # Use a more meaningful timestamp, such as the user's registration time or last active time
        # For demonstration, using UNIX epoch time to capture all previous messages
        first_login_timestamp = current_user.get("created_at", "2010-09-10T13:00:00.000000")
        
        # Initialize missed messages with team chat and individual members
        missed_messages_chat.append(['Team', first_login_timestamp])
        
        for member in team_members:
            username = member.get("username")
            if username:
                missed_messages_chat.append([username, first_login_timestamp])
        
        user_collection.find_one_and_update(
            {"_id": ObjectId(current_user["_id"])},
            {"$set": {"missed_messages_chat": missed_messages_chat}},
            return_document=ReturnDocument.AFTER
        )
    
    # Process missed messages chat normally
    missed_chats_by_timestamp = []

    for missed_message in missed_messages_chat:
        timestamp = datetime.fromisoformat(missed_message[1])
   
        if missed_message[0] == "Team":
            private_chat_id = None
            search_key = "Team"
        else:
            # Sort usernames alphabetically to create a unique private chat ID
            items = [current_user["username"], missed_message[0]]
            sorted_items = sorted(items)
            private_chat_id = "-".join(sorted_items)
            search_key = private_chat_id

        if timestamp:
            # Fetch messages for this privateChatID and timestamp
            messages = message_collection.count_documents({
                "privateChatId": private_chat_id,
                "timestamp": {"$gte": timestamp},
                "teamId": current_user["team_id"]
            })

            # Append missed messages count
            missed_chats_by_timestamp.append([search_key, messages])

    return missed_chats_by_timestamp
