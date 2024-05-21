from datetime import datetime, timedelta, timezone
from typing import Annotated, Any, Union
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
ACCESS_TOKEN_EXPIRE_MINUTES = 30

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


class User(BaseModel):
    username: str
    role: str
    team_id: PyObjectId

    class Config:
            allow_population_by_field_name = True
            arbitrary_types_allowed = True #required for the _id 
            json_encoders = {ObjectId: str}

class UserInDB(User):
    password: str


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

@ router.get("/me", response_model=User)
async def read_users_me(
         current_user: Annotated[User, Depends(get_current_user)],
):
    return current_user 

@ router.post("/login")
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
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.get("username")}, expires_delta=access_token_expires
    )
    return Token(access_token=access_token, token_type="bearer")


@ router.post("/token")
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
) -> Token:
    """
    Authenticates the user and generates an access token.

    Args:
        form_data (OAuth2PasswordRequestForm): The form data containing the username and password.

    Returns:
        Token: The access token.

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
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.get("username")}, expires_delta=access_token_expires
    )
    return Token(access_token=access_token, token_type="bearer")


##   email: Union[str, None] = None
  ##  full_name: Union[str, None] = None
  ##  disabled: Union[bool, None] = None
 ##   role: str