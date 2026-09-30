from sqlalchemy.orm import Session
import models

def get_setting(db: Session, user_id: int, key: str, default: str):
    setting = db.query(models.Setting).filter(
        models.Setting.user_id == user_id, models.Setting.key == key
    ).first()
    return setting.value if setting else default

def simulate_notification(db: Session, alert: models.Alert):
    if alert.severity not in ("high", "critical"):
        return None

    if alert.severity == "high":
        enabled = get_setting(db, alert.user_id, "notify_high", "true") == "true"
    else:
        enabled = get_setting(db, alert.user_id, "notify_critical", "true") == "true"

    if not enabled:
        return None

    message = f"[SIMULATED ALERT] {alert.title} — Severity: {alert.severity.upper()}. {alert.recommended_action}"

    notification = models.Notification(
        alert_id=alert.id,
        channel="email",
        recipient=f"user{alert.user_id}@nyxbreach.local",
        message=message
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)

    print(f"\n📧 SIMULATED EMAIL SENT TO {notification.recipient}:\n{message}\n")

    return notification