import json
from fastapi import APIRouter, Depends, HTTPException
from typing import Annotated, Any, List, Optional, Union
from pydantic import BaseModel, Field, AfterValidator, PlainSerializer, WithJsonSchema
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
from app.src.routers.auth import get_current_user, is_admin, User
from dotenv import load_dotenv
import os
from app.config import MONGO_DB, MONGO_URI
from pywebpush import webpush, WebPushException

router = APIRouter()

# Allow CORS for local development


# VAPID Keys from environment
VAPID_PUBLIC_KEY = os.getenv("NOTIFICATION_PUBLIC_KEY")
VAPID_PRIVATE_KEY = os.getenv("NOTIFICATION_PRIVATE_KEY")
VAPID_CLAIMS = {"sub": "mailto:"+os.getenv("NOTIFICATION_MAIL")}

# Store subscriptions (use a database in production)
subscriptions = []

# Model for the subscription
class PushSubscription(BaseModel):
    endpoint: str
    keys: dict


@router.post("/subscribe")
async def subscribe(subscription: PushSubscription):
    subscriptions.append(subscription.model_dump())
    return {"message": "Subscription successful"}


@router.post("/send-notification")
async def send_notification():
    payload = {
        "title": "New Notification",
        "body": "You have a new message!"
    }

    for subscription in subscriptions:
        try:
            webpush(
                subscription_info=subscription,
                data=json.dumps(payload),
                vapid_private_key=VAPID_PRIVATE_KEY,
                vapid_claims=VAPID_CLAIMS
            )
        except WebPushException as ex:
            print(f"Failed to send notification: {ex}")
            return {"message": f"Error sending notification: {str(ex)}"}

    return {"message": "Notification sent to all subscribers"}
