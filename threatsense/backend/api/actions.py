from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
from enum import Enum

router = APIRouter()

class LogType(str, Enum):
    FILE_ACCESS = "File Access"
    LOGIN = "Login"
    DATA_EXPORT = "Data Export"
    SENSITIVE_ACCESS = "Sensitive File Access"
    SYSTEM_CONFIG = "System Config Change"

class Department(str, Enum):
    ENGINEERING = "Engineering"
    HR = "HR"
    FINANCE = "Finance"
    SALES = "Sales"
    SUPPORT = "Support"
    IT = "IT"

class Location(str, Enum):
    MUMBAI = "Mumbai"
    BANGALORE = "Bangalore"
    HYDERABAD = "Hyderabad"
    DELHI = "Delhi"
    REMOTE = "Remote"
    SPOOFED = "Unknown/Spoofed"

class DeviceType(str, Enum):
    LAPTOP = "Laptop (Mac/Linux)"
    WINDOWS = "Windows Desktop"
    MOBILE = "Mobile Device"
    TABLET = "Tablet"

class UserAction(BaseModel):
    user: str = Field(..., min_length=3, max_length=100, description="Authorized email of the user")
    log_type: LogType = Field(..., description="The category of action performed")
    department: Department = Field(..., description="User's organizational department")
    file_accessed: str = Field(..., min_length=1, max_length=255)
    location: Location = Field(..., description="Physical or network location of the user")
    device_type: DeviceType = Field(..., description="The type of hardware used")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    @validator('timestamp', pre=True)
    def parse_timestamp(cls, v):
        if isinstance(v, str):
            if not v or v == "string":
                return datetime.utcnow()
            try:
                return datetime.fromisoformat(v)
            except ValueError:
                return datetime.utcnow()
        return v or datetime.utcnow()

@router.post("/log")
async def log_action(action: UserAction):
    from main import detector, redis_client
    
    # 1. Update Daily Access Count
    daily_count = redis_client.increment_daily_access(action.user)
    
    # 2. Get User History from Redis for sliding window
    history = redis_client.get_user_history(action.user)
    
    action_dict = action.dict()
    action_dict['timestamp'] = action.timestamp.isoformat()
    
    # 3. Run ML Analysis with daily threshold gating
    analysis = detector.predict(action_dict, history, daily_access_count=daily_count)
    
    # 4. Update Risk Score in Redis
    # Strictly zero increment if under threshold
    risk_increment = 0
    if daily_count > 20:
        risk_increment = 20 if analysis['is_anomaly'] else (analysis['anomaly_score'] / 2)
    
    # --- Behavioral Demo Tweak ---
    if action.user == "belliappa1710@gmail.com":
        risk_increment *= 2.5
    elif action.user == "meghanaakota339@gmail.com":
        risk_increment *= 0.5
    elif action.user == "diyagupta789456123@gmail.com":
        risk_increment = 0
        analysis['is_anomaly'] = False
        print(f"SOC OVERRIDE: {action.user} marked as False Positive.")
        
    new_risk = redis_client.update_risk_score(action.user, risk_increment)
    
    # 5. Determine if session should terminate
    terminate = new_risk > 80
    
    # Store current action in sliding window
    redis_client.store_action(action.user, action_dict)
    
    # 6. SOC Alerting
    if terminate or analysis['is_anomaly']:
        from api.soc import soc_manager
        from services.mongodb_service import mongodb_service
        
        event_doc = {
            "user": action.user,
            "department": action.department,
            "risk_level": "High" if analysis['anomaly_score'] > 70 or terminate else "Medium",
            "risk_score": max(analysis['anomaly_score'], (new_risk if terminate else 0)),
            "confidence": analysis['confidence'],
            "timestamp": action.timestamp.isoformat(),
            "status": "Open",
            "ml_details": analysis['details'],
            "session_context": {
                "ip_address": "127.0.0.1",
                "device_type": action.device_type,
                "location": action.location,
                "login_time": action.timestamp.isoformat()
            },
            "is_anomaly": True
        }
        
        await mongodb_service.log_security_event(event_doc)
        await soc_manager.broadcast({"alert_id": "new", **event_doc})

        if terminate:
            from api.websocket import manager
            await manager.send_termination(action.user)
    
    return {
        "status": "success",
        "analysis": analysis,
        "daily_access": daily_count,
        "current_risk": new_risk,
        "action_required": "TERMINATE" if terminate else "CONTINUE"
    }
