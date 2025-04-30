from bson import ObjectId
from datetime import datetime
from app.src.routers.notification import add_notification

def delete_calendar_entry(entry_id: str, current_user, db):
    # Überprüfen, ob der Eintrag existiert und der aktuelle Benutzer berechtigt ist
    existing_entry = db['calendar'].find_one({"_id": ObjectId(entry_id), "users": current_user['_id']})
    if not existing_entry:
        raise Exception(detail="Entry not found or not authorized")

    # Löschen des Eintrags aus der MongoDB
    result = db['calendar'].delete_one({"_id": ObjectId(entry_id)})
    
    notification = {
        'team_id': current_user["team_id"],
        'title': "Calendar",
        'description': current_user["username"] + " deleted a Calendar Entry",
        'type': "calendar_deleted",
        'timestamp': datetime.now()
    }
    add_notification(notification)

    if result.deleted_count == 0:
        raise Exception(detail="Entry not found")

    return {"message": "Entry deleted successfully"}

def delete_kanban_task(task_id: str, current_user, db):
    # Überprüfen, ob der Eintrag existiert und der aktuelle Benutzer berechtigt ist
    existing_entry = db['kanban'].find_one({"_id": ObjectId(task_id), "team_id": current_user["team_id"]})
    if not existing_entry:
        raise Exception(detail="Entry not found or not authorized")

    # Löschen des Eintrags aus der MongoDB
    result = db['kanban'].delete_one({"_id": ObjectId(task_id)})

    notification = {
        'team_id': current_user["team_id"],
        'title': "Kanban",
        'description': current_user["username"] + " deleted a Kanban Card",
        'type': "kanban_deleted",
        'timestamp': datetime.now()
    }
    add_notification(notification)
    
    if result.deleted_count == 0:
        raise Exception(detail="Entry not found")

    return {"message": "Entry deleted successfully"}

def delete_file(file_id: str, current_user, db):
    result = db['files'].delete_one({"_id": ObjectId(file_id), "team_id": current_user["team_id"]})
    if result.deleted_count == 0:
        raise Exception(detail="File not found")
    return {"detail": "File successfully deleted"}