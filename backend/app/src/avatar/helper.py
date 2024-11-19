from bson import ObjectId
from datetime import datetime
from PIL import Image

def get_team_members(current_user, db):
    entries = db['users'].find({"team_id": current_user["team_id"]}, {"password": 0}) 
    return entries


def get_project_by_team(current_user, db):
    """
    Fetch the project and milestones based on the current user's team.
    """
    # Fetch the team by team_id
    team = db['teams'].find_one({"_id": ObjectId(current_user["team_id"])})
    
    if not team:
        raise Exception(detail="Team not found")

    # Fetch the project_id from the team
    project_id = team.get("project_id")
    if not project_id:
        raise Exception(detail="Team does not have an associated project")

    # Fetch the project document
    project = db['projects'].find_one({"_id": ObjectId(project_id)})
    if not project:
        raise Exception(detail="Project not found")

    # Fetch the milestones associated with the project_id
    milestones = list(db['milestones'].find({"project_id": ObjectId(project_id)}))

    # Convert milestones' _id to string
    milestones_data = [
        {
            "title": milestone.get("title"),
            "date": milestone.get("date"),
            "details": milestone.get("details")
        }
        for milestone in milestones
    ]

    # Return the project and associated milestones
    return {
        "id": str(project["_id"]),
        "name": project.get("name"),
        "team_name": team.get("name"),
        "description": project.get("description"),
        "start_date": project.get("start_date"),
        "created_at": project.get("created_at", datetime.now()),
        "milestones": milestones_data
    }