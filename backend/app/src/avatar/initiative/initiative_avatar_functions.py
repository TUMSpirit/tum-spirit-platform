from typing import Optional, List

def create_kanban_card(
    db,
    title: str,
    description: str,
    action_step_id: int,
    priority: str = "",
    deadline: int = -2,
    milestone: str = "",
    project_id: Optional[str] = None,
):
    from app.src.avatar.avatar_functions.post_functions import create_kanban_card
    print("[create_kanban_card] Initializing Kanban card creation...")
    try:
        card = create_kanban_card(
            db=db,
            title=title,
            description=description,
            priority=priority,
            deadline=deadline,
            milestone=milestone,
            project_id=project_id
        )
        id = card['_id']
        buffer_entry = {
            'type': 'Kanban_Card',
            'type_id': id,
            'reward': 0,
            'step_id': action_step_id,
            'evaluated': False
        }
        db['reward_buffer'].insert_one(buffer_entry)
        print(f"[create_kanban_card] Kanban card created with ID {id}")
    except Exception as e:
        print(f"[create_kanban_card] Exception occurred: {e}")
        return {'message': str(e)}
    return card

def broadcast_message(
    db,
    content: str, 
    action_step_id: int,
    project_id: Optional[str] = None,
):
    from app.src.avatar.avatar_functions.post_functions import broadcast_message
    print(f"[broadcast_message] Broadcasting message: {content[:30]}...")
    try:
        message = broadcast_message(
            db=db,
            content=content,
            project_id=project_id
        )
        for id in message['_ids']:
            buffer_entry = {
                'type': 'Message',
                'type_id': id,
                'reward': 0,
                'step_id': action_step_id,
                'evaluated': False
            }
            db['reward_buffer'].insert_one(buffer_entry)
        print(f"[broadcast_message] Broadcast successful with {len(message['_ids'])} message(s).")
    except Exception as e:
        print(f"[broadcast_message] Exception occurred: {e}")
        return {'message': str(e)}
    return message

def upload_document(
    db,
    file_title: str,
    file_content: bytes,
    file_content_type: str,
    action_step_id: int,
    project_id: Optional[str] = None,
):
    from app.src.avatar.avatar_functions.post_functions import upload_document_for_teams
    print(f"[upload_document] Uploading document: {file_title}")
    try:
        document = upload_document_for_teams(
            db=db,
            file_title=file_title,
            file_content=file_content,
            file_content_type=file_content_type,
            project_id=project_id
        )
        id = document['_id']
        buffer_entry = {
            'type': 'Document',
            'type_id': id,
            'reward': 0,
            'step_id': action_step_id,
            'evaluated': False
        }
        db['reward_buffer'].insert_one(buffer_entry)
        print(f"[upload_document] Document uploaded with ID {id}")
    except Exception as e:
        print(f"[upload_document] Exception occurred: {e}")
        return {'message': str(e)}
    return document

def add_calendar_entry(
        current_user, db, action_step_id: int, title: str, startDateTime: str, endDateTime: str,
        users: List[str], room: str = "", remoteLink: str = "", color: str = "#1677FF",
        allDay: bool = False, isOnSite: bool = True, description: str = "", isMilestone: bool = False):
    from app.src.avatar.avatar_functions.post_functions import add_calendar_entry
    print(f"[add_calendar_entry] Creating calendar entry: {title}")
    try:
        calendar_entry = add_calendar_entry(
            db=db,
            title=title,
            description=description,
            current_user=current_user,
            startDateTime=startDateTime,
            endDateTime=endDateTime,
            users=users,
            room=room,
            remoteLink=remoteLink,
            color=color,
            allDay=allDay,
            isOnSite=isOnSite,
            isMilestone=isMilestone,
            isInitiativeAI=True
        )
        id = calendar_entry['_id']
        buffer_entry = {
            'type': 'Calendar_Entry',
            'type_id': id,
            'reward': -2,
            'step_id': action_step_id,
            'evaluated': False
        }
        db['reward_buffer'].insert_one(buffer_entry)
        print(f"[add_calendar_entry] Calendar entry created with ID {id}")
    except Exception as e:
        print(f"[add_calendar_entry] Exception occurred: {e}")
        return {'message': str(e)}
    return calendar_entry
