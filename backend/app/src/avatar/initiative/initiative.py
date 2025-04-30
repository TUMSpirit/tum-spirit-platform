from stable_baselines3 import DQN
from gymnasium.envs.registration import register
import gymnasium as gym
from stable_baselines3.common.logger import configure
from datetime import datetime
import numpy as np
import os
import threading
import time

ACTION_SPACE = gym.spaces.Discrete(2)
OBSERVATION_SPACE = gym.spaces.Box(low=0., high=1., shape=(4,), dtype=np.float64)
BASE_DIR = "app/src/avatar/initiative"
ACTION_TRUE_PATH = os.path.join(BASE_DIR, "np_action_saves", "action_true.npy")
ACTION_FALSE_PATH = os.path.join(BASE_DIR, "np_action_saves", "action_false.npy")
TENSORBOARD_LOG_ROOT = os.path.join(BASE_DIR, "tensorboard_logs")
SAVED_MODEL = os.path.join(BASE_DIR, "saved_models", "Base_Model", "dqn_spirit_model_final.zip")
MODEL_ARCHIVE_DIR = os.path.join(BASE_DIR, "saved_models", "Archive")
INITIATIVE_AVATAR_THREAD_SLEEP_DURATION = 86400

initiative_avatar_thread_sleeping = False
initiative_avatar_stop_flag = False

def run_model_over_all_teams():
    global initiative_avatar_stop_flag

    model = DQN.load(SAVED_MODEL)
    register(
        id="Spirit-v0",
        entry_point="app.src.avatar.initiative.environment:SpiritEnv", 
    )
    env = gym.make('Spirit-v0')
    state, _ = env.reset()
    print(f"[run_model] Starting rollout with state: {state}")

    done = False
    while not done:
        if initiative_avatar_stop_flag:
            print("[run_model] Stop flag detected. Terminating early.")
            break
        action, _ = model.predict(state, deterministic=True)
        print(f"[run_model] Action: {action}")
        state, _, done, _, _ = env.step(action)
        print(f"[run_model] New state: {state} | Done: {done}")


def evaluate(db):
    print("[evaluate] Starting evaluation of reward_buffer...")

    step_id_to_reward = {}
    entries = db['reward_buffer'].find({"evaluated": True})
    
    count_entries = 0
    for entry in entries:
        count_entries += 1
        step_id = entry['step_id']
        reward = entry['reward']
        print(f"[evaluate] Processing entry - step_id: {step_id}, reward: {reward}")

        if step_id not in step_id_to_reward:
            step_id_to_reward[step_id] = reward
            print(f"[evaluate] New step_id {step_id} added with reward {reward}")
        else:
            step_id_to_reward[step_id] += reward
            print(f"[evaluate] Updated step_id {step_id} with cumulative reward {step_id_to_reward[step_id]}")

        db["reward_buffer"].delete_one({"_id": entry["_id"]})
        print(f"[evaluate] Deleted entry with _id: {entry['_id']} from reward_buffer")

    print(f"[evaluate] Finished processing {count_entries} entries.")
    return step_id_to_reward


def learn(db):
    print("[learn] Starting learning process...")

    current_time = datetime.now().strftime('%Y-%m-%d_%H-%M-%S')

    step_id_to_reward = evaluate(db)
    step_buffer = db['step_buffer'].find({"_id": {"$in": list(step_id_to_reward.keys())}})

    print("[learn] Registering custom environment 'Spirit-v0'...")
    register(
        id="Spirit-v0",
        entry_point="app.src.avatar.initiative.environment:SpiritEnv",
    )

    print("[learn] Creating environment...")
    env = gym.make("Spirit-v0")

    print("[learn] Loading saved DQN model...")
    model = DQN.load(SAVED_MODEL)

    print("[learn] Setting environment for the model...")
    model.set_env(env)

    print("[learn] Loading action mappings...")
    action_true = np.load(ACTION_TRUE_PATH)
    action_false = np.load(ACTION_FALSE_PATH)

    
    tensorboard_log_dir = os.path.join(
        TENSORBOARD_LOG_ROOT,
        current_time
    )
    os.makedirs(tensorboard_log_dir, exist_ok=True)

    print(f"[learn] Configuring new logger at: {tensorboard_log_dir}")
    new_logger = configure(tensorboard_log_dir, ["stdout", "csv", "tensorboard"])
    model.set_logger(new_logger)

    replay_buffer = model.replay_buffer
    print(f"[learn] Replay buffer size: {replay_buffer.buffer_size}")

    steps_added = 0
    for step in step_buffer:
        action_value = action_true if step["action"] == 1 else action_false
        replay_buffer.add(
            obs=np.array(step["state"]),
            next_obs=np.array(step["next_state"]),
            action=action_value,
            reward=np.array([step_id_to_reward[step["_id"]]], dtype=np.float32),
            done=np.array([step["done"]], dtype=np.float32),
            infos=[{}]
        )
        steps_added += 1

    print(f"[learn] Added {steps_added} steps to the replay buffer.")

    print("[learn] Starting training...")
    model.policy.train()
    model.train(gradient_steps=1000, batch_size=64)
    print("[learn] Training complete.")

    print("[learn] Saving model...")
    model.save(SAVED_MODEL)
    print("[learn] Model saved successfully.")

    archive_path = os.path.join(MODEL_ARCHIVE_DIR, f"dqn_spirit_model_{current_time}.zip")
    os.makedirs(MODEL_ARCHIVE_DIR, exist_ok=True)
    model.save(archive_path)
    print(f"[learn] Archived model at {archive_path}")

    step_buffer = list(db['step_buffer'].find({"_id": {"$in": list(step_id_to_reward.keys())}}))
    steps_deleted = 0
    for step in step_buffer:
        # Check if there are any rewards left linked to this step
        reward_count = db['reward_buffer'].count_documents({"step_id": step["_id"]})

        if reward_count == 0:
            # If no rewards are left, safe to delete the step
            db['step_buffer'].delete_one({"_id": step["_id"]})
            steps_deleted += 1

    print(f"[learn] Cleanup complete. Deleted {steps_deleted} steps from step_buffer.")
    print("[learn] Learning process finished.")


def initiative_avatar_scheduler(sleep_duration_seconds: float):
    global initiative_avatar_thread_sleeping, initiative_avatar_stop_flag

    while not initiative_avatar_stop_flag:
        start_time = time.time()
        print("[initiative_avatar_scheduler] Starting model run.")
        run_model_over_all_teams()
        elapsed = time.time() - start_time
        remaining_sleep = max(0, sleep_duration_seconds - elapsed)

        print(f"[initiative_avatar_scheduler] Model run complete. Sleeping for {remaining_sleep:.2f} seconds...")
        initiative_avatar_thread_sleeping = True
        time.sleep(remaining_sleep)
        initiative_avatar_thread_sleeping = False


def start_initiative_avatar_thread(sleep_duration_seconds: float = INITIATIVE_AVATAR_THREAD_SLEEP_DURATION):
    global initiative_avatar_stop_flag
    initiative_avatar_stop_flag = False
    thread = threading.Thread(
        target=initiative_avatar_scheduler,
        args=(sleep_duration_seconds,),
        daemon=True
    )
    thread.start()
    print("[start_initiative_avatar_thread] Initiative avatar thread started.")



def shutdown_initiative_avatar_thread():
    """
    Gracefully stops the initiative avatar thread by setting the stop flag.
    Returns whether the thread is currently sleeping.
    """
    global initiative_avatar_stop_flag, initiative_avatar_thread_sleeping

    print("[shutdown] Setting stop flag for initiative avatar thread...")
    initiative_avatar_stop_flag = True
    return initiative_avatar_thread_sleeping
