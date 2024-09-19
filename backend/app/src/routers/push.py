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

hardcoded_subscription = {
    "endpoint": "https://web.push.apple.com/QF2ROOGObnudptrFHZyVa975CLXU8iS4miFMPqlLpwmRUctq_UrukRrOn77XSieCozrujlHwicODRY-vOljcq44JuW93EzrMkJ89NqH4oDQe40xiYh64hA-1QBQc9bpRDaR9c0Gz73C20bbgSWOPHJiGs0S47qRerYTNAA_GTYc",
    "expirationTime": None,
    "keys": {
        "p256dh": "BIr74ZN4C80CnvoywTmNfLNb3dIlrL9UET8hpC7G32RucUe245JZKXBlxP3brwXhY8ede7Enjgcl4DyelcJXrj0",
        "auth": "hSSZxvlU7V0GVgnpRmi9KQ"
    }
}

# Connect to MongoDB
client = MongoClient(MONGO_URI)
db = client[MONGO_DB]
subscriptions_collection = db['subscriptions']

# VAPID Keys from environment
VAPID_PUBLIC_KEY = os.getenv("NOTIFICATION_PUBLIC_KEY")
VAPID_PRIVATE_KEY = os.getenv("NOTIFICATION_PRIVATE_KEY")
VAPID_CLAIMS = {"sub": "mailto:"+os.getenv("NOTIFICATION_MAIL")}

# Model for the subscription
class PushSubscription(BaseModel):
    endpoint: str
    keys: dict


@router.post("/subscribe")
async def subscribe(subscription: PushSubscription):
    """Save the subscription to the MongoDB collection."""
    try:
        # Check if subscription already exists
        existing_subscription = subscriptions_collection.find_one({"endpoint": subscription.endpoint})
        if not existing_subscription:
            subscriptions_collection.insert_one(subscription.dict())
            return {"message": "Subscription added."}
        else:
            return {"message": "Subscription already exists."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error storing subscription: {str(e)}")


@router.post("/send-notification")
async def send_notification():
    """Send a web push notification using a hardcoded subscription."""
    try:
        # Payload for the notification
        payload = {
            "title": "Test Notification",
            "body": "This is a test notification from your PWA.",
            "icon": "/icon.png",  # Your icon URL
            "data": {
                "url": "https://your-pwa-url.com/success"  # URL to open when clicking notification
            }
        }

        # Send the notification using the hardcoded subscription
        try:
            webpush(
                subscription_info=hardcoded_subscription,
                data=json.dumps(payload),
                vapid_private_key=VAPID_PRIVATE_KEY,
                vapid_claims=VAPID_CLAIMS
            )
            return {"message": "Notification sent successfully!"}
        except WebPushException as ex:
            print(f"Failed to send notification: {ex}")
            raise HTTPException(status_code=500, detail=f"Error sending notification: {str(ex)}")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing notification: {str(e)}")
