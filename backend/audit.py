from sqlalchemy.orm import Session
import models

def log_action(db: Session, user_id: int, action: str, details: str):
    entry = models.AuditLog(
        user_id=user_id,
        action=action,
        details=details
    )
    db.add(entry)
    db.commit()