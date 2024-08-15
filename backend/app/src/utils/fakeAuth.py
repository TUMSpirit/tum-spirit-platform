from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer

from typing import Annotated, Any
from pydantic import BaseModel

from bson import ObjectId

from .db import PyObjectId


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


class User(BaseModel):
    username: str
    id: PyObjectId


def fake_decode_token(token):
    return User(
        username=token + "fakedecoded", id=ObjectId("663506d86905198ad715ded8")
    )


async def get_current_active_user(token: Annotated[str, Depends(oauth2_scheme)]):
    user = fake_decode_token(token)
    return user


CurrentUser = Annotated[User, Depends(get_current_active_user)]