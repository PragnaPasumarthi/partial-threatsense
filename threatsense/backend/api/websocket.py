from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, WebSocket] = {}

    async def connect(self, user_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]

    async def send_termination(self, user_id: str):
        if user_id in self.active_connections:
            await self.active_connections[user_id].send_json({
                "action": "TERMINATE_SESSION",
                "reason": "Security Alert: High Risk Score"
            })

    async def send_restore(self, user_id: str):
        """Send a session restoration signal, used when SOC marks an alert as False Positive."""
        if user_id in self.active_connections:
            await self.active_connections[user_id].send_json({
                "action": "SESSION_RESTORED",
                "message": "Your session has been restored by the SOC team."
            })
            print(f"WS: Session restored for {user_id}")
        else:
            print(f"WS: Could not restore session for {user_id} - not connected")

    async def send_verification_success(self, user_id: str):
        print(f"WS DEBUG: Attempting to send success to {user_id}")
        print(f"WS DEBUG: Active connections: {list(self.active_connections.keys())}")
        if user_id in self.active_connections:
            await self.active_connections[user_id].send_json({
                "action": "VERIFICATION_SUCCESS",
                "message": f"Welcome back, {user_id}! Identity Verified."
            })
            print(f"WS DEBUG: Message sent to {user_id}")
        else:
            print(f"WS DEBUG: User {user_id} not found in active connections")

manager = ConnectionManager()

@router.websocket("/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await manager.connect(user_id, websocket)
    try:
        while True:
            await websocket.receive_text() # Keep connection alive
    except WebSocketDisconnect:
        manager.disconnect(user_id)
