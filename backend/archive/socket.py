import socketio
from fastapi import Depends
from .auth import get_current_user
from motor.motor_asyncio import AsyncIOMotorClient
import json

sio = socketio.AsyncServer(cors_allowed_origins=["http://localhost:3000"])

client = AsyncIOMotorClient('mongodb://root:example@mongo:27017/mydatabase?authSource=admin')
db = client.chat_db

poll_data = []

async def load_poll_data():
    global poll_data
    try:
        with open('pollresults.json', 'r') as f:
            poll_data = json.load(f)
    except FileNotFoundError:
        poll_data = []

async def save_poll_data():
    with open('pollresults.json', 'w') as f:
        json.dump(poll_data, f, indent=2)

@sio.event
async def connect(sid, environ):
    print(f"{sid} user just connected!")
    await sio.emit('initialPollData', poll_data, room=sid)

@sio.event
async def joinTeam(sid, teamId):
    sio.enter_room(sid, teamId)
    print(f"User {sid} joined team {teamId}")

@sio.event
async def message(sid, data, token: str = Depends(get_current_user)):
    user = await get_current_user(token)
    if data.get('isPoll'):
        poll_options = data['content'].replace('/Create Poll:', '').split(',')
        new_poll = {
            "id": data['id'],
            "votes": [0] * len(poll_options)
        }
        poll_data.append(new_poll)
        await save_poll_data()
        await sio.emit('pollUpdated', poll_data)
    try:
        result = await db.messages.insert_one(data)
        response = await db.messages.find_one({"_id": result.inserted_id})
        await sio.emit("messageResponse", response, room=data['teamId'])
    except Exception as e:
        print(e)

@sio.event
async def votePoll(sid, pollId, optionIndex):
    for poll in poll_data:
        if poll['id'] == pollId:
            poll['votes'][optionIndex] += 1
            break
    await save_poll_data()
    await sio.emit('pollUpdated', poll_data)

@sio.event
async def emojiReaction(sid, data):
    try:
        result = await db.messages.update_one({"_id": data['messageId']}, {"$inc": {f"reactions.{data['emoji']}": 1}})
        response = await db.messages.find_one({"_id": data['messageId']})
        await sio.emit('emojiReactionUpdated', response, room=response['teamId'])
    except Exception as e:
        print(e)

@sio.event
async def removeEmojiReaction(sid, data):
    try:
        result = await db.messages.update_one({"_id": data['messageId']}, {"$set": {f"reactions.{data['emoji']}": 0}})
        response = await db.messages.find_one({"_id": data['messageId']})
        await sio.emit('emojiReactionRemoved', response, room=response['teamId'])
    except Exception as e:
        print(e)

@sio.event
async def deleteMessage(sid, data):
    try:
        result = await db.messages.delete_one({"_id": data['messageId']})
        await sio.emit('messageDeleted', data['messageId'], room=data['teamId'])
    except Exception as e:
        print(e)

@sio.event
async def editMessage(sid, updatedMessage):
    try:
        result = await db.messages.update_one({"_id": updatedMessage['id']}, {"$set": updatedMessage})
        response = await db.messages.find_one({"_id": updatedMessage['id']})
        await sio.emit('messageUpdated', response, room=response['teamId'])
    except Exception as e:
        print(e)

@sio.event
async def typing(sid, data):
    print('User typing:', data)
    await sio.emit('typing', data, room=data['teamId'])

@sio.event
async def stop_typing(sid, data):
    print('User stopped typing:', data)
    await sio.emit('stop_typing', data, room=data['teamId'])

@sio.event
async def disconnect(sid):
    print(f"User {sid} disconnected")
