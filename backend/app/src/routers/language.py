from fastapi import APIRouter

from ..language_helpers.analyze_chat import analyze_chat
from ..language_helpers.api.sentiment import get_sentiment

from ..utils.fakeAuth import CurrentUser

from datetime import datetime

router = APIRouter()

@router.get("/language/analyze", tags=["language"])
def predict():    
    return analyze_chat()

@router.get("/language/sentiment", tags=["language"])
async def sentiment(current_user: CurrentUser, startDate:datetime=None, endDate:datetime=None):
    return get_sentiment(current_user.id, startDate, endDate)