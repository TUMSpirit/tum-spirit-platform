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
    """Send web push notification to all subscribed clients."""
    try:
        payload = {
            "title": "Push Notification",
            "body": "This is a notification from your PWA!",
            "icon": "/icon.png"  # Adjust to your icon path
        }

        # Loop over each subscription and send the notification
        for subscription in subscriptions_collection.find():
            try:
                hardcoded_subscription = {
                    "endpoint": "https://web.push.apple.com/QF2ROOGObnudptrFHZyVa975CLXU8iS4miFMPqlLpwmRUctq_UrukRrOn77XSieCozrujlHwicODRY-vOljcq44JuW93EzrMkJ89NqH4oDQe40xiYh64hA-1QBQc9bpRDaR9c0Gz73C20bbgSWOPHJiGs0S47qRerYTNAA_GTYc",
                    "expirationTime": None,
                    "keys": {
                        "p256dh": "BIr74ZN4C80CnvoywTmNfLNb3dIlrL9UET8hpC7G32RucUe245JZKXBlxP3brwXhY8ede7Enjgcl4DyelcJXrj0",
                        "auth": "hSSZxvlU7V0GVgnpRmi9KQ"
                    }
                }
                subscription_info = {
                    "endpoint": subscription['endpoint'],
                    "expirationTime": None,  # Use None if not present
                    "keys": {
                        "p256dh": subscription['keys']['p256dh'],  # Dynamically use p256dh from the subscription
                        "auth": subscription['keys']['auth']  # Dynamically use auth from the subscription
                    }
                }
                 # Check if the endpoint contains 'web.push' (iOS Safari)
                if 'web.push' in subscription_info['endpoint']:
                    # iOS Safari requires JSON strings, so use json.dumps for payload
                    print("Sending notification to Safari (iOS):", json.dumps(subscription_info))
                    webpush(
                        subscription_info=hardcoded_subscription,  # Pass subscription_info directly as a dict
                        data=json.dumps(payload),  # Payload serialized to JSON
                        vapid_private_key=VAPID_PRIVATE_KEY,
                        vapid_claims=VAPID_CLAIMS
                    )
                else:
                    # For Chrome and other browsers, avoid json.dumps for payload
                    print("Sending notification to Chrome or other browsers:", subscription_info)
                    webpush(
                        subscription_info=subscription_info,  # Pass subscription_info directly as a dict
                        data=json.dumps(payload),  # Payload serialized to JSON for all browsers
                        vapid_private_key=VAPID_PRIVATE_KEY,
                        vapid_claims=VAPID_CLAIMS
                    )
            except WebPushException as ex:
                print(f"Failed to send notification to {subscription['endpoint']}: {ex}")

        return {"message": "Notification sent to all subscribers."}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error sending notification: {str(e)}")
