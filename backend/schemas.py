from pydantic import BaseModel
from datetime import datetime

class UserCreate(BaseModel):
    username: str
    password: str
    role: str
    full_name: str
    email: str
    organization: str | None = None

class UserLogin(BaseModel):
    username: str
    password: str
    ip_address: str = "unknown"
    device_info: str = "unknown"

class Token(BaseModel):
    access_token: str
    token_type: str

class AlertCreate(BaseModel):
    alert_type: str
    severity: str
    title: str
    description: str
    explanation: str
    recommended_action: str
    user_id: int

class AlertOut(BaseModel):
    id: int
    alert_type: str
    severity: str
    title: str
    description: str
    explanation: str
    recommended_action: str
    status: str
    created_at: datetime
    user_id: int

    class Config:
        from_attributes = True
class CredentialCheck(BaseModel):
    user_id: int
    password: str
from typing import List

class FileEvent(BaseModel):
    filename: str
    action: str
    timestamp: str

class FileActivityCheck(BaseModel):
    user_id: int
    events: List[FileEvent]
class ChatRequest(BaseModel):
    user_id: int
    question: str
class AlertStatusUpdate(BaseModel):
    status: str  # "open" / "acknowledged" / "resolved"
class ForgotPasswordRequest(BaseModel):
    username: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class ProfileUpdate(BaseModel):
    profile_image: str  # base64 string