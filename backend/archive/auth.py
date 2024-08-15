from datetime import datetime, timedelta, timezone
from typing import Annotated, Any, List, Optional, Union
from fastapi import Depends, APIRouter, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from pymongo import MongoClient
from pydantic import AfterValidator, BaseModel, PlainSerializer, WithJsonSchema
from datetime import datetime, timedelta
from bson import ObjectId
from bson.errors import InvalidId
from dotenv import load_dotenv

# Create a router
router = APIRouter()
# Load environment variables from a .env file
load_dotenv()

# to get a string like this run:
# openssl rand -hex 32
SECRET_KEY = "b84be05f4f7e6307639b11d5be65d3c4e53bb2142a83e07b643953709e29b3a5"  # ADD SECRETS
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS = 7

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Retrieve MongoDB credentials and database info
MONGO_USER = "root"
MONGO_PASSWORD = "example"
MONGO_HOST = "mongo"
MONGO_PORT = "27017"
MONGO_DB = "TUMSpirit"

# connection string
MONGO_URI = "mongodb://root:example@mongo:27017/mydatabase?authSource=admin"

# Connect to MongoDB
client = MongoClient(MONGO_URI)
db = client[MONGO_DB]
user_collection = db['users']
team_collection = db["teams"]
message_collection = db["chat"]

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

class Token(BaseModel):
    access_token: str
    token_type: str
    refresh_token: str

class TokenData(BaseModel):
    username: Union[str, None] = None

class User(BaseModel):
    username: str
    role: str
    team_id: PyObjectId

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class UserInDB(User):
    password: str

class TeamUser(BaseModel):
    username: str
    role: str
    team_id: PyObjectId
    avatar_color: Optional[str] = None
    last_active: Optional[datetime] = datetime.now()
    missed_messages: Optional[int] = 0

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def get_user_db(username: str):
    user_data = user_collection.find_one({"username": username})
    if user_data:
        return user_data

def authenticate_user_db(username: str, password: str):
    user = get_user_db(username)
    if not user:
        return False
    if not verify_password(password, user.get("password")):
        return False
    return user

def create_access_token(data: dict, expires_delta: Union[timedelta, None] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict, expires_delta: Union[timedelta, None] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
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

async def check_role(
    current_user: Annotated[User, Depends(get_current_user)], role: str
):
    if current_user.role != role:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
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

@router.get("/me", response_model=TeamUser)
async def read_users_me(current_user: Annotated[User, Depends(get_current_user)]):
    if not current_user.get("last_active"):
        current_user["last_active"] = datetime.now()
        user_collection.update_one(
            {"_id": current_user["_id"]},
            {"$set": {"last_active": current_user["last_active"]}}
        )

    missed_message_count = get_missed_messages(current_user["team_id"], current_user["last_active"])
    user_collection.update_one(
        {"_id": current_user["_id"]},
        {"$set": {"missed_messages": missed_message_count}}
    )

    updated_user = user_collection.find_one({"_id": current_user["_id"]})
    return updated_user

@router.post("/login")
async def login_for_access_token(form_data: Annotated[OAuth2PasswordRequestForm, Depends()]) -> Token:
    user = authenticate_user_db(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token_expires = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    access_token = create_access_token(
        data={"sub": user.get("username")}, expires_delta=access_token_expires
    )
    refresh_token = create_refresh_token(
        data={"sub": user.get("username")}, expires_delta=refresh_token_expires
    )
    return Token(access_token=access_token, token_type="bearer", refresh_token=refresh_token)

@router.post("/refresh")
async def refresh_access_token(refresh_token: str) -> Token:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception

    user = get_user_db(username=token_data.username)
    if user is None:
        raise credentials_exception

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.get("username")}, expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/verify-token")
async def verify_token(token: str = Depends(oauth2_scheme)):
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
        return {"authenticated": True, "username": username}
    except JWTError:
        raise credentials_exception

@router.get("/get-team-members", response_model=List[TeamUser])
async def get_team_members(current_user: User = Depends(get_current_user)):
    entries = user_collection.find({"team_id": current_user["team_id"]}, {"password": 0}) 
    return entries

@router.post("/update-last-active")
async def update_last_active(current_user: User = Depends(get_current_user)):
    user_collection.update_one(
        {"_id": ObjectId(current_user["_id"])},
        {"$set": {"last_active": datetime.now()}}
    )
    return {"message": "Last active updated"}
