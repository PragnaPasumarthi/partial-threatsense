from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime
import uuid
import json

from services.mongodb_service import mongodb_service
from services.redis_service import redis_service
from ml.detector import AnomalyDetector

router = APIRouter()
detector = AnomalyDetector()

# WebSocket Manager for SOC Analysts (Broadcasting to all connected analysts)
class SOCConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                pass

soc_manager = SOCConnectionManager()

@router.websocket("/session-monitoring")
async def soc_websocket_endpoint(websocket: WebSocket):
    await soc_manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        soc_manager.disconnect(websocket)

# --- Schemas ---

class AlertAction(BaseModel):
    alert_id: str
    action: str # lock | logout | false_positive
    user: Optional[str] = None  # needed for session restoration

class SimulationRequest(BaseModel):
    simulation_type: str # abnormal_login | volume_spike | file_transition | privilege_escalation

# --- Endpoints ---

@router.get("/alerts-feed")
async def get_alerts_feed():
    try:
        alerts = []
        cursor = mongodb_service.db.security_events.find({"is_anomaly": True}).sort("timestamp", -1).limit(50)
        async for doc in cursor:
            alerts.append({
                "alert_id": str(doc.get("_id", uuid.uuid4())),
                "user": doc.get("user"),
                "department": doc.get("department"),
                "risk_level": doc.get("risk_level", "Medium"),
                "risk_score": doc.get("risk_score", 0),
                "confidence": doc.get("confidence", 0),
                "timestamp": doc.get("timestamp"),
                "status": doc.get("status", "Open"),
                "ml_details": doc.get("ml_details", {}),
                "session_context": doc.get("session_context", {}),
                "session_status": doc.get("session_status", "Active")
            })
        return alerts
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sessions/status")
async def get_session_statuses():
    """Returns all sessions that are Terminated or High Risk for SOC monitoring."""
    try:
        sessions = []
        # Fetch terminated and high-risk sessions
        cursor = mongodb_service.db.security_events.find({
            "$or": [
                {"session_status": "Terminated"},
                {"risk_score": {"$gte": 70}, "is_anomaly": True}
            ]
        }).sort("timestamp", -1).limit(100)
        
        async for doc in cursor:
            sessions.append({
                "alert_id": str(doc.get("_id")),
                "user": doc.get("user"),
                "department": doc.get("department"),
                "risk_score": doc.get("risk_score", 0),
                "risk_level": doc.get("risk_level", "High"),
                "session_status": doc.get("session_status", "Active"),
                "status": doc.get("status", "Open"),
                "timestamp": doc.get("timestamp"),
                "ml_details": doc.get("ml_details", {}),
                "session_context": doc.get("session_context", {})
            })
        return sessions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/action")
async def handle_soc_action(data: AlertAction):
    try:
        status_map = {
            "lock": "Resolved (Locked)",
            "logout": "Resolved (Terminated)",
            "false_positive": "Resolved (Dismissed)",
            "investigating": "Investigating"
        }
        status = status_map.get(data.action, "Investigating")
        
        # Determine session_status field
        session_status_map = {
            "lock": "Locked",
            "logout": "Terminated",
            "false_positive": "Restored",
            "investigating": "Investigating"
        }
        new_session_status = session_status_map.get(data.action, "Investigating")

        # Update MongoDB
        from bson import ObjectId
        query = {}
        try:
            query["_id"] = ObjectId(data.alert_id)
        except:
            query["alert_id"] = data.alert_id

        await mongodb_service.db.security_events.update_one(
            query,
            {"$set": {"status": status, "session_status": new_session_status}}
        )

        # If false_positive: send WebSocket SESSION_RESTORED signal to the employee
        if data.action == "false_positive" and data.user:
            try:
                from api.websocket import manager
                await manager.send_restore(data.user)
                print(f"SOC ACTION: False positive confirmed for {data.user}. Session restored.")
                # Also reset risk score in Redis
                redis_service.reset_risk_score(data.user)
            except Exception as ws_err:
                print(f"WS restore failed (non-critical): {ws_err}")

        # Broadcast status update to all connected SOC analysts
        await soc_manager.broadcast({
            "type": "action_update",
            "alert_id": data.alert_id,
            "action": data.action,
            "new_status": status,
            "session_status": new_session_status,
            "user": data.user
        })

        # Recalculate Metrics
        total_anomalies = await mongodb_service.db.security_events.count_documents({"is_anomaly": True})
        resolved = await mongodb_service.db.security_events.count_documents({"status": {"$regex": "Resolved"}})
        investigating = await mongodb_service.db.security_events.count_documents({"status": "Investigating"})
        
        return {
            "status": status,
            "session_status": new_session_status,
            "updated_metrics": {
                "activeAlerts": total_anomalies - resolved,
                "investigating": investigating,
                "resolvedToday": resolved,
                "avgRiskScore": 64
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/simulate")
async def trigger_simulation(req: SimulationRequest):
    try:
        user = "Vikram Mishra"
        timestamp = datetime.utcnow().isoformat()
        
        mock_log = {
            "user": user,
            "department": "SOC",
            "log_type": "Access",
            "file_accessed": "Admin_Panel",
            "timestamp": timestamp,
            "location": "Mumbai, IN",
            "device_type": "Desktop",
            "ip_address": "192.168.1.105"
        }

        if req.simulation_type == "abnormal_login":
            mock_log["timestamp"] = datetime.now().replace(hour=3).isoformat()
        elif req.simulation_type == "risk_tamper":
            mock_log["log_type"] = "System Config Change"
            mock_log["file_accessed"] = "detection_thresholds.yaml"
            mock_log["details"] = "Attempted to zero out user risk weights"
        
        mock_history = [{"file_accessed": "Dashboard"}] * 10 
        result = detector.predict(mock_log, mock_history)
        
        result["is_anomaly"] = True
        result["anomaly_score"] = 85.0
        
        risk_level = "High" if result["anomaly_score"] > 70 else "Medium"
        alert_id = str(uuid.uuid4())

        alert_event = {
            "alert_id": alert_id,
            "user": user,
            "department": mock_log["department"],
            "risk_level": risk_level,
            "risk_score": result["anomaly_score"],
            "confidence": result["confidence"],
            "timestamp": timestamp,
            "status": "Open",
            "session_status": "Terminated",
            "ml_details": result["details"],
            "session_context": {
                "ip_address": mock_log["ip_address"],
                "device_type": mock_log["device_type"],
                "location": mock_log["location"],
                "login_time": timestamp
            },
            "is_anomaly": True
        }

        await mongodb_service.db.security_events.insert_one(alert_event)
        await soc_manager.broadcast(alert_event)

        return {
            "before_risk": 15,
            "after_risk": result["anomaly_score"],
            "triggered_signals": [k for k, v in result["details"].items() if v == "flagged"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/metrics")
async def get_blue_team_metrics():
    try:
        total_anomalies = await mongodb_service.db.security_events.count_documents({"is_anomaly": True})
        resolved = await mongodb_service.db.security_events.count_documents({"status": {"$regex": "Resolved"}})
        terminated = await mongodb_service.db.security_events.count_documents({"session_status": "Terminated"})
        
        return {
            "totalSessions": 1250,
            "totalAnomalies": total_anomalies,
            "highRiskPercentage": 12,
            "resolutionRate": int((resolved/total_anomalies)*100) if total_anomalies > 0 else 100,
            "avgRiskScoreLastHour": 42,
            "terminatedSessions": terminated
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/risk-distribution")
async def get_risk_distribution():
    low = await mongodb_service.db.security_events.count_documents({"risk_score": {"$lt": 40}})
    medium = await mongodb_service.db.security_events.count_documents({"risk_score": {"$gte": 40, "$lte": 70}})
    high = await mongodb_service.db.security_events.count_documents({"risk_score": {"$gt": 70}})
    return {"low": low, "medium": medium, "high": high}

@router.get("/trend")
async def get_risk_trend():
    return [
        {"time": "00:00", "avgRiskScore": 30},
        {"time": "04:00", "avgRiskScore": 25},
        {"time": "08:00", "avgRiskScore": 45},
        {"time": "12:00", "avgRiskScore": 52},
        {"time": "16:00", "avgRiskScore": 48},
        {"time": "20:00", "avgRiskScore": 35}
    ]

@router.get("/department-summary")
async def get_department_summary():
    pipeline = [
        {"$group": {
            "_id": "$department",
            "anomalies": {"$sum": {"$cond": ["$is_anomaly", 1, 0]}},
            "avgRiskScore": {"$avg": "$risk_score"}
        }}
    ]
    cursor = mongodb_service.db.security_events.aggregate(pipeline)
    summary = []
    async for doc in cursor:
        summary.append({
            "department": doc["_id"],
            "activeSessions": 10,
            "anomalies": doc["anomalies"],
            "avgRiskScore": round(doc["avgRiskScore"], 1)
        })
    return summary

@router.get("/logs")
async def get_soc_logs(page: int = 1, anomaliesOnly: bool = False):
    limit = 20
    skip = (page - 1) * limit
    query = {"is_anomaly": True} if anomaliesOnly else {}
    
    cursor = mongodb_service.db.security_events.find(query).sort("timestamp", -1).skip(skip).limit(limit)
    logs = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        logs.append(doc)
        
    total = await mongodb_service.db.security_events.count_documents(query)
    return {
        "data": logs,
        "totalPages": (total // limit) + (1 if total % limit > 0 else 0)
    }
