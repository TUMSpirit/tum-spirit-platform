from datetime import datetime, timedelta, timezone
from typing import Annotated, Union
from fastapi.middleware.cors import CORSMiddleware
from fastapi import BackgroundTasks, Depends, FastAPI, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from pymongo import MongoClient
from pydantic import BaseModel
from datetime import datetime, timedelta
from celery import Celery
from croniter import croniter


app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://localhost:8080",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# to get a string like this run:
# openssl rand -hex 32
SECRET_KEY = "" #ADD SECRETS
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
MONGO_URI = "mongodb://root:example@129.187.135.9:27017/mydatabase?authSource=admin"


# Connect to MongoDB
client = MongoClient(MONGO_URI)
db = client[MONGO_DB]
user_collection = db['users']
team_collection = db["teams"]


# Initialize Celery
celery = Celery(__name__)
celery.conf.update(
    broker_url='redis://localhost:6379/0',
    result_backend='redis://localhost:6379/0'
)

fake_users_db = {
    "john@test.de": {
        "username": "john@test.de",
        "full_name": "John Doe",
        "email": "johndoe@example.com",
        "role": "admin",
        "hashed_password": "$2b$12$kySG7cpEzUULLrkh/N8iS.TlhRufh.7Lp4JmiTl.OCaHc7S8LI0VS",
        "disabled": False,
    }
}



class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Union[str, None] = None


class User(BaseModel):
    username: str
    email: Union[str, None] = None
    full_name: Union[str, None] = None
    disabled: Union[bool, None] = None
    role: str


class UserInDB(User):
    hashed_password: str


# Define a Pydantic model for the task payload
class TaskPayload(BaseModel):
    task_name: str
    team_name: str
    execution_time: datetime


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


def get_user(db, username: str):
    if username in db:
        user_dict = db[username]
        return UserInDB(**user_dict)


def authenticate_user(fake_db, username: str, password: str):
    user = get_user(fake_db, username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user


def create_access_token(data: dict, expires_delta: Union[timedelta, None] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
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
    user = get_user(fake_users_db, username=token_data.username)
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(
    current_user: Annotated[User, Depends(get_current_user)],
):
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

# Celery worker function
def start_celery_worker():
    # Start Celery worker
    celery.worker_main(["-A", "main:celery", "--loglevel=info"])


# Celery task to execute the scheduled action
@celery.task
def execute_scheduled_task(task_name: str, team_name: str):
    print(f"Executing task: {task_name}")
    # Create team in database
    #team = {"name": team_name, "created_at": datetime.utcnow()}
    #team_collection.insert_one(team)
    #print(f"Team created: {team}")

# Background task to schedule a task for future execution
def schedule_task(payload: TaskPayload):
    now = datetime.now(timezone.utc)
    execution_time = payload.execution_time - now
    # Convert execution time to seconds
    delay = execution_time.total_seconds()
    # Schedule the task with Celery
    execute_scheduled_task.apply_async(args=[payload.task_name, payload.team_name], countdown=delay)


@app.post("/start-celery/")
async def start_celery(background_tasks: BackgroundTasks):
    background_tasks.add_task(start_celery_worker)
    return {"message": "Celery worker started."}


# FastAPI endpoint to schedule a task
@app.post("/schedule-task/")
async def schedule_task_endpoint(payload: TaskPayload, background_tasks: BackgroundTasks, current_user: dict = Depends(get_current_active_user)):
    background_tasks.add_task(schedule_task, payload)
    return {"message": "Task scheduled successfully"}




#TODO
@app.post("/register")
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
) -> Token:
    user = authenticate_user(fake_users_db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return Token(access_token=access_token, token_type="bearer")

@app.post("/token")
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
) -> Token:
    user = authenticate_user(fake_users_db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return Token(access_token=access_token, token_type="bearer")


@app.get("/users/me/", response_model=User)
async def read_users_me(
    current_user: Annotated[User, Depends(get_current_active_user)],
):
    return current_user


@app.get("/users/me/items/")
async def read_own_items(
    current_user: Annotated[User, Depends(get_current_active_user)],
):
    return [{"item_id": "Foo", "owner": current_user.username}]