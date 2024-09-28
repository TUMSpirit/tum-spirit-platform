import json
from fastapi import APIRouter, Depends, HTTPException
from typing import Annotated, Any, List, Optional, Union
from pydantic import BaseModel, Field, AfterValidator, PlainSerializer, WithJsonSchema
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
from app.src.routers.auth import get_current_user, User
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

# Define a model for the request body
class NotificationRequest(BaseModel):
    username: str
    message: str

class CalendarNotificationRequest(NotificationRequest):
    participant_ids: List[str]  # List of participant user IDs

@router.post("/subscribe")
async def subscribe(subscription: PushSubscription, current_user: Annotated[User, Depends(get_current_user)]):
    """Save the subscription to the MongoDB collection as either Apple or Android with user_id and team_id."""
    try:
        # Add team_id and user_id (or username) to the subscription
        subscription_with_user_info = subscription.dict()
        subscription_with_user_info["team_id"] = current_user["team_id"]
        subscription_with_user_info["user_id"] = current_user["_id"]  # Use user ID from current_user
        
        if "web.push.apple.com" in subscription.endpoint:
            # Check if subscription already exists in apple_subscriptions
            existing_subscription = apple_subscriptions_collection.find_one({
                "endpoint": subscription.endpoint, 
                "user_id": current_user["_id"]
            })
            if not existing_subscription:
                apple_subscriptions_collection.insert_one(subscription_with_user_info)
                return {"message": "Apple subscription added."}
            else:
                return {"message": "Apple subscription already exists."}
        else:
            # Check if subscription already exists in android_subscriptions
            existing_subscription = android_subscriptions_collection.find_one({
                "endpoint": subscription.endpoint, 
                "user_id": current_user["_id"]
            })
            if not existing_subscription:
                android_subscriptions_collection.insert_one(subscription_with_user_info)
                return {"message": "Android subscription added."}
            else:
                return {"message": "Android subscription already exists."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error storing subscription: {str(e)}")

@router.post("/send-notification")
async def send_notification(notification_request: NotificationRequest, current_user: Annotated[User, Depends(get_current_user)]):
    """Send a web push notification to both Apple and Android subscribed clients, filtered by team_id."""
    payload = {
        "title": f"Boo! New Message: {notification_request.username}",  # Ghost emoji and playful title
        "body": f"{notification_request.message}",  # Message with playful prompt
        "vibrate": [200, 100, 200],  # Vibration pattern (optional)
        "tag": "spirit-message"  # Add a unique tag to group notifications
    }

    try:
        # Send notifications to Apple subscriptions filtered by team_id
        for subscription in apple_subscriptions_collection.find({"team_id": current_user["team_id"]}):
            if subscription['user_id'] == current_user["_id"]:  # Skip the sender
                continue  # Don't send notification to the message sende
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

        # Send notifications to Android subscriptions filtered by team_id
        for subscription in android_subscriptions_collection.find({"team_id": current_user["team_id"]}):
            if subscription['user_id'] == current_user["_id"]:  # Skip the sender
                continue  # Don't send notification to the message sender
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

        return {"message": f"Notifications sent to all teammates of {notification_request.username}."}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error sending notification: {str(e)}")

@router.post("/calendar-notification")
async def send_calendar_notification(notification_request: CalendarNotificationRequest, current_user: Annotated[User, Depends(get_current_user)]):
    """Send a calendar notification only to the participants of the event."""
    payload = {
        "title": f"New Calendar Event from {notification_request.username}",
        "body": f"{notification_request.message}",
        "vibrate": [100, 50, 100],
        "tag": "calendar-event"
    }

    try:
        # Filter subscriptions based on participant user IDs and team_id
        apple_subscriptions = apple_subscriptions_collection.find({
            "team_id": current_user["team_id"],
            "user_id": {"$in": notification_request.participant_ids}
        })
        android_subscriptions = android_subscriptions_collection.find({
            "team_id": current_user["team_id"],
            "user_id": {"$in": notification_request.participant_ids}
        })

        # Send notifications to Apple subscriptions
        for subscription in apple_subscriptions:
            if subscription['user_id'] == current_user["_id"]:  # Skip the sender
                continue
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
                print(f"Calendar notification sent to Apple subscription: {subscription['endpoint']}")
            except WebPushException as ex:
                print(f"Failed to send calendar notification to Apple subscription: {subscription['endpoint']}: {ex}")

        # Send notifications to Android subscriptions
        for subscription in android_subscriptions:
            if subscription['user_id'] == current_user["_id"]:  # Skip the sender
                continue
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
                print(f"Calendar notification sent to Android subscription: {subscription['endpoint']}")
            except WebPushException as ex:
                print(f"Failed to send calendar notification to Android subscription: {subscription['endpoint']}: {ex}")

        return {"message": f"Calendar notifications sent to participants of {notification_request.username}."}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error sending calendar notification: {str(e)}")


