from sqlalchemy.orm import Session as DBSession
from datetime import datetime
import models

def check_session_anomaly(db: DBSession, user_id: int, ip_address: str, device_info: str, suspicious_window_seconds: int = 300):
    last_session = (
        db.query(models.Session)
        .filter(models.Session.user_id == user_id)
        .order_by(models.Session.login_time.desc())
        .first()
    )

    new_session = models.Session(
        user_id=user_id,
        ip_address=ip_address,
        device_info=device_info
    )
    db.add(new_session)
    db.commit()
    db.refresh(new_session)

    if not last_session:
        return {"anomaly": False}

    time_gap = (new_session.login_time - last_session.login_time).total_seconds()

    if last_session.ip_address != ip_address and abs(time_gap) < suspicious_window_seconds:
        return {
            "anomaly": True,
            "previous_ip": last_session.ip_address,
            "new_ip": ip_address,
            "time_gap_seconds": abs(time_gap)
        }

    return {"anomaly": False}