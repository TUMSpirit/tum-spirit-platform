import gymnasium as gym
from gymnasium import spaces
from collections import deque
from typing import Optional, List, Tuple, Dict
import random
from app.src.routers.ai import GPT_with_tools
from datetime import datetime, timezone, timedelta
from app.config import OPENAI_API_KEY, MONGO_DB, MONGO_URI
from openai import OpenAI
from app.src.avatar.translate_functions import extract_function_strings_and_functions_from_multiple_python_files
from pymongo import MongoClient
from app.src.avatar.avatar_functions.get_functions import get_filtered_team_chat
from app.src.avatar.helper import get_team_members, add_idle_entry, get_kanban_task_summary
import numpy as np
from bson import ObjectId
import asyncio

INITIATIVE_FUNCTIONS_PATH = "app/src/avatar/initiative/initiative_avatar_functions.py"
ACTION_SPACE = spaces.Discrete(2)
OBSERVATION_SPACE = spaces.Box(low=0., high=1., shape=(4,), dtype=np.float64)
INTERACTION_FREQUENCY = 1 / 5
IDLE_ENTRY_PROBABILITY = 0.2

class SpiritEnv(gym.Env):

    def __init__(self):
        super(SpiritEnv, self).__init__()

        print("[init] Initializing SpiritEnv...")

        self.action_space = ACTION_SPACE
        self.observation_space = OBSERVATION_SPACE
        self.team_index = 0
        self.client = OpenAI(api_key=OPENAI_API_KEY)

        self.step_id = ObjectId()

        client = MongoClient(MONGO_URI)
        self.db = client[MONGO_DB]
        self.team_array = list(self.db['teams'].find())
        print(f"[init] Loaded {len(self.team_array)} teams from database.")

        self.state = get_state(self.team_array[0]['_id'], db=self.db)
        print("[init] SpiritEnv initialization complete.")

    def step(self, action):
        print(f"[step] Team: {self.team_array[self.team_index]['name']} | Action: {action}")
        add_step_buffer = True
        done = False
        self.step_id = ObjectId()
        truncated = False

        users_collection = self.db['users']
        users = list(users_collection.find({"team_id": self.team_array[self.team_index]['_id']}))
        reward = 0

        if action == 1 and users:
            print("[step] Performing engagement action.")
            self.db['teams'].update_one(
                {"_id": ObjectId(self.team_array[self.team_index]['_id'])},
                {"$set": {"last_engagement": datetime.now()}}
            )
            instructions = (
                "You are Spirit, an assistant in the project management software TUM-Spirit. Spirit should always be witty, "
                f"intelligent, and funny. Current time: {datetime.now(timezone.utc)}."
            )
            input_value = (
                "Your job is now to help along the team by providing good ideas or valuable content. "
                "You can do this by broadcasting a message, scheduling a meeting, creating a kanban card or uploading a file. "
                "Mention all actions explicitly in the broadcasted message."
                f"Team Chat: {get_filtered_team_chat(users[0], self.db)}"
                f"Kanban Tasks: {get_kanban_task_summary(team_id=self.team_array[self.team_index]['_id'], db=self.db)}"
                f"Team Members: {str([user['username'] for user in list(get_team_members(users[0], self.db))])}"
            )
            thread_id = self.client.beta.threads.create().id
            (function_strings, functions) = extract_function_strings_and_functions_from_multiple_python_files([INITIATIVE_FUNCTIONS_PATH])
            asyncio.run(GPT_with_tools(
                instructions=instructions,
                inputValue=input_value,
                threadId=thread_id,
                function_strings=function_strings,
                functions=functions,
                current_user=users[0],
                step_id=self.step_id,
                client=self.client
            ))
        else:
            print("[step] Performing idle behavior check...")
            last_engagement = get_last_engagement(self.team_array[self.team_index]['_id'], self.db)
            idle_reward = (last_engagement - 0.5) * -2
            if random.random() < IDLE_ENTRY_PROBABILITY:
                add_idle_entry(self.db, self.step_id, idle_reward)
                print(f"[step] Idle entry added with reward {idle_reward:.3f}")
            else:
                add_step_buffer = False
                print("[step] Idle entry skipped.")

        self.team_index += 1
        if self.team_index >= len(self.team_array):
            print("[step] All teams processed. Resetting team index.")
            done = True
            self.team_array = self.db['teams'].find()
            self.team_index = 0

        next_state = get_state(self.team_array[self.team_index]['_id'], db=self.db)

        if add_step_buffer:
            self.db['step_buffer'].insert_one({
                '_id': self.step_id,
                'action': int(action),
                'state': self.state.tolist(),
                'next_state': next_state.tolist(),
                'done': done,
            })
            print("[step] Step inserted into step_buffer.")

        self.state = next_state

        return self.state, reward, done, truncated, {"step": self.step_id}

    def reset(
            self,
            *,
            seed: Optional[int] = None,
            options: Optional[Dict] = None,
    ) -> Tuple[np.ndarray, Dict]:
        print("[reset] Resetting environment...")
        self.step_id = ObjectId()
        self.team_index = 0
        self.client = OpenAI(api_key=OPENAI_API_KEY)

        client = MongoClient(MONGO_URI)
        self.db = client[MONGO_DB]
        self.team_array = list(self.db['teams'].find())

        self.state = get_state(self.team_array[0]['_id'], self.db)
        print("[reset] Environment reset complete.")

        return self.state, {}

# Helpers

def get_last_engagement(team_id: str, db):
    print(f"[get_last_engagement] Fetching last engagement for team {team_id}...")
    team = db['teams'].find_one({'_id': ObjectId(team_id)})
    if not team:
        print(f"[get_last_engagement] Team {team_id} not found. Returning default score 1.")
        return 1

    last_engagement = team.get("last_engagement")
    if not last_engagement:
        print(f"[get_last_engagement] No last engagement recorded. Returning default score 1.")
        return 1

    days_since_engagement = (datetime.now() - last_engagement).total_seconds() / 86400
    result = t0_lim1(days_since_engagement, 0.2)
    print(f"[get_last_engagement] Last engagement {days_since_engagement:.2f} days ago. Result: {result:.3f}")
    return result

def get_state(team_id: str, db):
    print(f"[get_state] Getting state for team {team_id}...")
    users_arr = list(db['users'].find({'team_id': ObjectId(team_id)}))
    print(f"[get_state] Found {len(users_arr)} users.")

    last_active = []
    query = {"teamId": ObjectId(team_id), "privateChatID": None}

    messages = list(db['chat'].find(query).sort("timestamp", -1).limit(50))
    print(f"[get_state] Retrieved {len(messages)} messages.")

    message_timestamps = [(datetime.now() - entry['timestamp']).total_seconds() / 86400 for entry in messages]
    if message_timestamps:
        min_message_ts = t0_lim1(np.min(message_timestamps), INTERACTION_FREQUENCY)
        print(f"[get_state] Min message timestamp after scaling: {min_message_ts:.3f}")
    else:
        min_message_ts = 1

    for user in users_arr:
        if user.get('last_active'):
            delta_days = (datetime.now() - user['last_active']).total_seconds() / 86400
            last_active.append(delta_days)

    if last_active:
        median_active = t0_lim1(np.median(last_active), INTERACTION_FREQUENCY)
        print(f"[get_state] Median user activity after scaling: {median_active:.3f}")
    else:
        median_active = 1

    milestones = list(db['timeline'].find().sort("deadline", -1))
    future_milestones = [entry for entry in milestones if entry['deadline'] > datetime.now()]
    if future_milestones:
        next_deadlines = [(entry['deadline'] - datetime.now()).total_seconds() / 86400 for entry in future_milestones]
        next_milestone_deadline = t1_lim0(np.min(next_deadlines), INTERACTION_FREQUENCY)
        print(f"[get_state] Next milestone deadline after scaling: {next_milestone_deadline:.3f}")
    else:
        next_milestone_deadline = 0

    last_engagement = get_last_engagement(team_id, db)
    print(f"[get_state] Last engagement score: {last_engagement:.3f}")

    result = np.array([median_active, min_message_ts, next_milestone_deadline, last_engagement])
    print(f"[get_state] Final state array: {result}")

    return result

def t1_lim0(x, s):
    return 1 / (1 + s * x)

def t0_lim1(x, s):
    return -1 / (1 + (1-s) * x) + 1
