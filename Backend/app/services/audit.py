from sqlalchemy.orm import Session
from app.models import ActivityLog

def log_activity(db:Session, admin_id:int|None, action:str, entity_type:str|None=None, entity_id:int|None=None, description:str|None=None, ip_address:str|None=None, user_agent:str|None=None):
    db.add(ActivityLog(admin_id=admin_id,action=action[:50],entity_type=entity_type,entity_id=entity_id,description=description,ip_address=ip_address[:45] if ip_address else None,user_agent=user_agent[:500] if user_agent else None))
