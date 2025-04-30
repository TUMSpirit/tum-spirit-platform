from app.src.routers.kanban import TaskModel
from datetime import datetime
from bson import ObjectId
from app.src.routers.notification import add_notification


def archive_kanban_task(task_id: str, current_user, db):
    task = db['kanban'].find_one({"_id": ObjectId(task_id), "team_id": current_user["team_id"]})
    if not task:
        raise Exception(detail="Task not found")

    # Insert the task into the archived collection
    db['archived_kanban'].insert_one(task)
    # Remove the task from the original collection
    db['kanban'].delete_one({"_id": ObjectId(task_id)})

    notification = {
        'team_id': current_user["team_id"],
        'title': "Kanban",
        'description': f"{current_user['username']} archived a Kanban Card",
        'type': "kanban_deleted",
        'timestamp': datetime.now()
    }
    add_notification(notification)

    return {'message': "Task archived successfully. " + str(TaskModel(**task))}

def restore_archived_kanban_task(task_id: str, current_user, db):
    archived_task = db['archived_kanban'].find_one({"_id": ObjectId(task_id), "team_id": current_user["team_id"]})
    if not archived_task:
        raise Exception(detail="Archived task not found")

    # Insert the task back into the original collection
    db['kanban'].insert_one(archived_task)
    # Remove the task from the archived collection
    db['archived_kanban'].delete_one({"_id": ObjectId(task_id)})

    notification = {
        'team_id': current_user["team_id"],
        'title': "Kanban",
        'description': f"{current_user['username']} restored a Kanban Card",
        'type': "kanban_added",
        'timestamp': datetime.now()
    }
    add_notification(notification)

    return {'message': "Task restored successfully. " + str(TaskModel(**archived_task))}

def update_task_column(task_id: str, column: str, current_user, db):
    available_columns = ["backlog", "doing", "testing", "done"]
    if not column in available_columns:
        raise Exception("column not valid. Valid columns: " + str(available_columns))
    existing_entry = db['kanban'].find_one({"_id": ObjectId(task_id), "team_id": current_user["team_id"]})
    if not existing_entry:
        raise Exception(detail="Task not found")

    # Update the 'column' field only
    result = db['kanban'].update_one(
        {"_id": ObjectId(task_id)},
        {"$set": {"column": column, "timestamp": datetime.now()}}
    )

    if result.matched_count == 0:
        raise Exception(detail="Task not found")

    # Retrieve and return the updated task
    updated_entry = db['kanban'].find_one({"_id": ObjectId(task_id), "team_id": current_user["team_id"]})
    return {'message': "column updated successfully" + str(TaskModel(**updated_entry))}