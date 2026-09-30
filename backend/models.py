from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from database import Base
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String)  # "admin" or "analyst"
    full_name = Column(String, nullable=True)
    email = Column(String, nullable=True)
    organization = Column(String, nullable=True)
    profile_image = Column(Text, nullable=True)  # base64-encoded image
    reset_token = Column(String, nullable=True)
    reset_token_expiry = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    alert_type = Column(String)          # "credential_leak" / "session_theft" / "ransomware_staging"
    severity = Column(String)            # "low" / "medium" / "high" / "critical"
    title = Column(String)
    description = Column(String)
    explanation = Column(String)
    recommended_action = Column(String)
    status = Column(String, default="open")   # "open" / "acknowledged" / "resolved"
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user_id = Column(Integer, ForeignKey("users.id"))
class Session(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    ip_address = Column(String)
    device_info = Column(String)
    login_time = Column(DateTime(timezone=True), server_default=func.now())
class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(Integer, ForeignKey("alerts.id"))
    channel = Column(String)       # "email" or "sms"
    recipient = Column(String)
    message = Column(String)
    sent_at = Column(DateTime(timezone=True), server_default=func.now())
class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String)        # e.g. "login", "alert_created", "alert_status_changed"
    details = Column(String)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
class Setting(Base):
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    key = Column(String)
    value = Column(String)