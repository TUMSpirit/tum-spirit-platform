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
apple_subscriptions_collection = db['apple_subscriptions']
android_subscriptions_collection = db['android_subscriptions']


# VAPID Keys from environment
VAPID_PUBLIC_KEY = os.getenv("NOTIFICATION_PUBLIC_KEY")
VAPID_PRIVATE_KEY = os.getenv("NOTIFICATION_PRIVATE_KEY")
VAPID_CLAIMS = {"sub": "mailto:"+os.getenv("NOTIFICATION_MAIL")}

# Model for the push subscription
class PushSubscription(BaseModel):
    endpoint: str
    keys: dict

router = APIRouter()

@router.post("/subscribe")
async def subscribe(subscription: PushSubscription):
    """Save the subscription to the MongoDB collection as either Apple or Android."""
    try:
        # Determine the platform by inspecting the endpoint
        if "web.push.apple.com" in subscription.endpoint:
            # Check if subscription already exists in apple_subscriptions
            existing_subscription = apple_subscriptions_collection.find_one({"endpoint": subscription.endpoint})
            if not existing_subscription:
                apple_subscriptions_collection.insert_one(subscription.dict())
                return {"message": "Apple subscription added."}
            else:
                return {"message": "Apple subscription already exists."}
        else:
            # Check if subscription already exists in android_subscriptions
            existing_subscription = android_subscriptions_collection.find_one({"endpoint": subscription.endpoint})
            if not existing_subscription:
                android_subscriptions_collection.insert_one(subscription.dict())
                return {"message": "Android subscription added."}
            else:
                return {"message": "Android subscription already exists."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error storing subscription: {str(e)}")


@router.post("/send-notification")
async def send_notification():
    """Send a web push notification to both Apple and Android subscribed clients."""
    payload = {
        "title": "Push Notification",
        "body": "This is a notification from your PWA!",
        "icon": "/icon.png"
    }

    try:
        # Send notifications to Apple subscriptions
        for subscription in apple_subscriptions_collection.find():
            try:
                subscription_info = {
                    "endpoint": subscription['endpoint'],
                    "keys": {
                        "p256dh": subscription['keys']['p256dh'],
                        "auth": subscription['keys']['auth']
                    }
                }
                webpush(
                    subscription_info=subscription_info,
                    data=json.dumps(payload),
                    vapid_private_key=VAPID_PRIVATE_KEY,
                    vapid_claims={"sub": "mailto:your-email@example.com"}
                )
                print(f"Notification sent to Apple subscription: {subscription['endpoint']}")
            except WebPushException as ex:
                print(f"Failed to send notification to Apple subscription: {subscription['endpoint']}: {ex}")

        # Send notifications to Android subscriptions
        for subscription in android_subscriptions_collection.find():
            try:
                subscription_info = {
                    "endpoint": subscription['endpoint'],
                    "keys": {
                        "p256dh": subscription['keys']['p256dh'],
                        "auth": subscription['keys']['auth']
                    }
                }
                webpush(
                    subscription_info=subscription_info,
                    data=json.dumps(payload),
                    vapid_private_key=VAPID_PRIVATE_KEY,
                    vapid_claims={"sub": "mailto:your-email@example.com"}
                )
                print(f"Notification sent to Android subscription: {subscription['endpoint']}")
            except WebPushException as ex:
                print(f"Failed to send notification to Android subscription: {subscription['endpoint']}: {ex}")

        return {"message": "Notifications sent to all Apple and Android subscribers."}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error sending notification: {str(e)}")
