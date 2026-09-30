from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from detection_credential import check_password_breach
from detection_session import check_session_anomaly
from detection_ransomware import check_ransomware_staging
from chatbot import ask_security_copilot
from notifications import simulate_notification
from audit import log_action
from auth_dependency import get_current_user, require_admin
from fastapi.middleware.cors import CORSMiddleware
from notifications import simulate_notification, get_setting
import secrets
from datetime import datetime, timedelta

from database import Base, engine, SessionLocal
import models
import schemas
import security

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "NyxBreach backend is running"}

@app.post("/register", response_model=schemas.Token)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.username == user.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")

    hashed_pw = security.hash_password(user.password)
    new_user = models.User(
        username=user.username,
        hashed_password=hashed_pw,
        role=user.role,
        full_name=user.full_name,
        email=user.email,
        organization=user.organization
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    log_action(db, new_user.id, "user_registered", f"New user '{new_user.username}' registered with role '{new_user.role}'")

    token = security.create_access_token({"sub": new_user.username, "role": new_user.role})
    return {"access_token": token, "token_type": "bearer"}

@app.post("/login", response_model=schemas.Token)
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if not db_user or not security.verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect username or password")

    # Run session anomaly detection
    anomaly_result = check_session_anomaly( db, db_user.id, user.ip_address, user.device_info,suspicious_window_seconds=int(get_setting(db, db_user.id, "session_window", "300"))
    )

    if anomaly_result.get("anomaly"):
        new_alert = models.Alert(
            alert_type="session_theft",
            severity="critical",
            title="Suspicious session activity detected",
            description=f"Login detected from a new IP ({anomaly_result['new_ip']}) only {int(anomaly_result['time_gap_seconds'])} seconds after a login from a different IP ({anomaly_result['previous_ip']}).",
            explanation="This alert fired because two logins occurred from different IP addresses within a suspiciously short time window, which may indicate a stolen session token or credential being used simultaneously by an attacker.",
            recommended_action="Immediately revoke active sessions, force a password reset, and enable MFA if not already active.",
            user_id=db_user.id,
            status="open"
        )
        db.add(new_alert)
        db.commit()
        simulate_notification(db, new_alert)

    token = security.create_access_token({"sub": db_user.username, "role": db_user.role})
    log_action(db, db_user.id, "login", f"User '{db_user.username}' logged in from IP {user.ip_address}")
    return {"access_token": token, "token_type": "bearer"}

@app.post("/alerts", response_model=schemas.AlertOut)
def create_alert(alert: schemas.AlertCreate, db: Session = Depends(get_db)):
    new_alert = models.Alert(
        alert_type=alert.alert_type,
        severity=alert.severity,
        title=alert.title,
        description=alert.description,
        explanation=alert.explanation,
        recommended_action=alert.recommended_action,
        user_id=alert.user_id,
        status="open"
    )
    db.add(new_alert)
    db.commit()
    db.refresh(new_alert)
    return new_alert

@app.get("/alerts", response_model=List[schemas.AlertOut])
def list_alerts(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    user = db.query(models.User).filter(models.User.username == current_user["username"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.role == "admin" and user.organization:
        team_ids = [u.id for u in db.query(models.User).filter(models.User.organization == user.organization).all()]
        return db.query(models.Alert).filter(models.Alert.user_id.in_(team_ids)).order_by(models.Alert.created_at.desc()).all()

    return db.query(models.Alert).filter(models.Alert.user_id == user.id).order_by(models.Alert.created_at.desc()).all()

@app.post("/check-credential")
def check_credential(check: schemas.CredentialCheck, db: Session = Depends(get_db)):
    result = check_password_breach(check.password)

    if result.get("breached"):
        new_alert = models.Alert(
            alert_type="credential_leak",
            severity="high" if result["count"] > 1000 else "medium",
            title="Reused or breached password detected",
            description=f"This password has appeared in {result['count']} known data breaches.",
            explanation="This alert fired because the password's hash matches entries in the HaveIBeenPwned breach database, indicating it has been exposed publicly before.",
            recommended_action="Change this password immediately and avoid reusing it across other accounts. Enable MFA if not already active.",
            user_id=check.user_id,
            status="open"
        )
        db.add(new_alert)
        db.commit()
        db.refresh(new_alert)
        log_action(db, check.user_id, "alert_created", f"Credential leak alert created (alert_id={new_alert.id})")

        simulate_notification(db, new_alert)
        return {"breached": True, "count": result["count"], "alert_created": True, "alert_id": new_alert.id}

    return {"breached": False, "count": 0, "alert_created": False}

@app.post("/check-file-activity")
def check_file_activity(check: schemas.FileActivityCheck, db: Session = Depends(get_db)):
    events_as_dicts = [event.dict() for event in check.events]

    rename_threshold = int(get_setting(db, check.user_id, "rename_threshold", "10"))
    time_window = int(get_setting(db, check.user_id, "time_window_seconds", "60"))

    result = check_ransomware_staging(events_as_dicts, rename_threshold, time_window)

    if result.get("staging_detected"):
        new_alert = models.Alert(
            alert_type="ransomware_staging",
            severity="critical",
            title="Possible ransomware pre-encryption activity detected",
            description=f"{result['rename_count']} file renames occurred within {result['time_span_seconds']:.1f} seconds, a pattern consistent with ransomware staging behavior.",
            explanation="This alert fired because a large number of file rename operations occurred in a very short time window, which is a known early-warning pattern for ransomware preparing to encrypt files.",
            recommended_action="Immediately isolate the affected device from the network, halt any suspicious processes, and back up unaffected files before further action.",
            user_id=check.user_id,
            status="open"
        )
        db.add(new_alert)
        db.commit()
        db.refresh(new_alert)
        log_action(db, check.user_id, "alert_created", f"Ransomware staging alert created (alert_id={new_alert.id})")
        simulate_notification(db, new_alert)
        return {"staging_detected": True, "alert_created": True, "alert_id": new_alert.id}

    return {"staging_detected": False, "alert_created": False}

@app.post("/chat")
def chat_with_copilot(chat: schemas.ChatRequest, db: Session = Depends(get_db)):
    user_alerts = db.query(models.Alert).filter(models.Alert.user_id == chat.user_id).all()
    answer = ask_security_copilot(chat.question, user_alerts)
    return {"answer": answer}

from collections import defaultdict

SEVERITY_WEIGHTS = {"low": 1, "medium": 3, "high": 7, "critical": 10}

@app.get("/risk-trend")
def get_risk_trend(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    user = db.query(models.User).filter(models.User.username == current_user["username"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    alerts = db.query(models.Alert).filter(models.Alert.user_id == user.id).all()

    daily_scores = defaultdict(int)
    for alert in alerts:
        day = alert.created_at.strftime("%Y-%m-%d")
        daily_scores[day] += SEVERITY_WEIGHTS.get(alert.severity, 0)

    trend = [{"date": day, "risk_score": score} for day, score in sorted(daily_scores.items())]
    return {"user_id": user.id, "trend": trend}

@app.get("/audit-log")
def get_audit_log(db: Session = Depends(get_db), current_user: dict = Depends(require_admin)):
    user = db.query(models.User).filter(models.User.username == current_user["username"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.organization:
        team_ids = [u.id for u in db.query(models.User).filter(models.User.organization == user.organization).all()]
        logs = db.query(models.AuditLog).filter(models.AuditLog.user_id.in_(team_ids)).order_by(models.AuditLog.timestamp.desc()).all()
    else:
        logs = db.query(models.AuditLog).filter(models.AuditLog.user_id == user.id).order_by(models.AuditLog.timestamp.desc()).all()

    return [{"action": l.action, "details": l.details, "timestamp": l.timestamp} for l in logs]

@app.get("/notifications")
def get_notifications(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    user = db.query(models.User).filter(models.User.username == current_user["username"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    notifications = (
        db.query(models.Notification)
        .join(models.Alert, models.Notification.alert_id == models.Alert.id)
        .filter(models.Alert.user_id == user.id)
        .order_by(models.Notification.sent_at.desc())
        .all()
    )
    return [
        {
            "id": n.id,
            "channel": n.channel,
            "recipient": n.recipient,
            "message": n.message,
            "sent_at": n.sent_at
        }
        for n in notifications
    ]

@app.patch("/alerts/{alert_id}/status")
def update_alert_status(alert_id: int, update: schemas.AlertStatusUpdate, db: Session = Depends(get_db)):
    alert = db.query(models.Alert).filter(models.Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    alert.status = update.status
    db.commit()
    db.refresh(alert)
    return {"id": alert.id, "status": alert.status}

@app.get("/alerts/all")
def list_all_alerts(db: Session = Depends(get_db), current_user: dict = Depends(require_admin)):
    return db.query(models.Alert).order_by(models.Alert.created_at.desc()).all()

@app.get("/settings")
def get_settings(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    user = db.query(models.User).filter(models.User.username == current_user["username"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    settings = db.query(models.Setting).filter(models.Setting.user_id == user.id).all()
    return {s.key: s.value for s in settings}

@app.post("/settings")
def update_setting(key: str, value: str, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    user = db.query(models.User).filter(models.User.username == current_user["username"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    existing = db.query(models.Setting).filter(
        models.Setting.user_id == user.id, models.Setting.key == key
    ).first()
    if existing:
        existing.value = value
    else:
        existing = models.Setting(user_id=user.id, key=key, value=value)
        db.add(existing)
    db.commit()
    return {"key": key, "value": value}

@app.post("/forgot-password")
def forgot_password(request: schemas.ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == request.username).first()
    if not user:
        raise HTTPException(status_code=404, detail="No account found with that username")

    token = secrets.token_hex(4).upper()  # e.g. "A1B2C3D4"
    user.reset_token = token
    user.reset_token_expiry = datetime.utcnow() + timedelta(minutes=15)
    db.commit()

    print(f"\n📧 SIMULATED PASSWORD RESET EMAIL TO {user.email or user.username}:\nYour reset code is: {token} (valid 15 minutes)\n")

    return {
        "message": "A reset code has been sent (simulated).",
        "simulated_token": token  # shown directly since no real email is sent
    }

@app.post("/reset-password")
def reset_password(request: schemas.ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.reset_token == request.token).first()
    if not user or not user.reset_token_expiry or user.reset_token_expiry < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invalid or expired reset code")

    user.hashed_password = security.hash_password(request.new_password)
    user.reset_token = None
    user.reset_token_expiry = None
    db.commit()
    log_action(db, user.id, "password_reset", f"User '{user.username}' reset their password")

    return {"message": "Password reset successful"}

@app.get("/profile/me")
def get_my_profile(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    user = db.query(models.User).filter(models.User.username == current_user["username"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": user.id,
        "username": user.username,
        "full_name": user.full_name,
        "email": user.email,
        "organization": user.organization,
        "role": user.role,
        "profile_image": user.profile_image,
        "created_at": user.created_at
    }

@app.post("/profile/me/picture")
def update_my_profile_picture(update: schemas.ProfileUpdate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    user = db.query(models.User).filter(models.User.username == current_user["username"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.profile_image = update.profile_image
    db.commit()
    return {"message": "Profile picture updated"}

@app.get("/profile/{user_id}")
def get_profile(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": user.id,
        "username": user.username,
        "full_name": user.full_name,
        "email": user.email,
        "organization": user.organization,
        "role": user.role,
        "profile_image": user.profile_image,
        "created_at": user.created_at
    }

@app.post("/profile/{user_id}/picture")
def update_profile_picture(user_id: int, update: schemas.ProfileUpdate, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.profile_image = update.profile_image
    db.commit()
    return {"message": "Profile picture updated"}