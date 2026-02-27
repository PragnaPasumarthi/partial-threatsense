from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, validator
from services.email_service import email_service
from services.redis_service import RedisService
from services.mongodb_service import mongodb_service

from services.redis_service import redis_service as redis_client

router = APIRouter()

class LoginRequest(BaseModel):
    user_id: str = Field(..., min_length=3, max_length=50, description="Unique username of the employee")
    email: str = Field(..., description="Authorized company email address")
    password: str = Field(..., description="User password")

    @validator('email')
    def validate_email_format(cls, v):
        import re
        if not re.match(r"[^@]+@[^@]+\.[^@]+", v):
            raise ValueError('Invalid email format')
        return v

@router.post("/login")
async def login(request: LoginRequest):
    """
    1. User enters username and email.
    2. Check if the email exists in the hr_employees collection in MongoDB.
    3. If authorized, set them to "PENDING" in Redis.
    4. Send an email with a unique Verify/Kill token link.
    """
    
    # --- Authorization Check ---
    # We check the MongoDB 'hr_employees' collection to see if this user is "Hired" and password matches
    authorized_user = await mongodb_service.db.hr_employees.find_one({
        "email": request.email,
        "password": request.password
    })
    
    if not authorized_user:
        print(f"SECURITY ALERT: Unauthorized login attempt blocked for {request.email} (Invalid email or password)")
        raise HTTPException(
            status_code=401, 
            detail="Access Denied: Invalid email or password."
        )

    print(f"SUCCESS: Authorized user {request.user_id} ({request.email}) identified.")
    
    # Send Email and get the new unique magic links
    tokens = email_service.send_verification_email(request.email, request.user_id)
    
    # Store their status in Redis (Using full email as the key)
    redis_client.set_val(f"session:{request.email}", "PENDING", ex=300) # 5 min timeout
    
    # Keep track of the specific tokens linked to this user for security
    redis_client.set_val(f"token:{tokens['verify_token']}", request.email, ex=300)
    redis_client.set_val(f"token:{tokens['kill_token']}", request.email, ex=300)

    return {
        "status": "Check your email!",
        "message": f"Verification links sent to {request.email}. Workspace is locked until 'Yes, I'm in' is clicked."
    }

from fastapi.responses import HTMLResponse

@router.get("/verify/{token}", response_class=HTMLResponse)
async def verify(token: str, email: str):
    """
    User clicked 'Yes, I'm In' from the email.
    We grant access to the workspace and notify the Desktop via WebSocket.
    """
    # Verify the token belongs to the user
    saved_user = redis_client.get_val(f"token:{token}")
    
    if saved_user != email:
        return """
            <body style="font-family: sans-serif; text-align: center; padding: 50px;">
                <h1 style="color: #c62828;">Error: Invalid Token</h1>
                <p>This verification link is invalid or has expired.</p>
            </body>
        """
    
    # Update Redis session to VERIFIED
    redis_client.set_val(f"session:{email}", "ACTIVE", ex=86400) # 24h
    
    # Clean up the single-use token
    redis_client.delete_val(f"token:{token}")
    
    # --- WebSocket Notification ---
    # We notify the Desktop app that verification was successful
    print(f"AUTH DEBUG: Token verified for {email}. Notifying WebSocket...")
    from api.websocket import manager
    await manager.send_verification_success(email)
    
    return f"""
        <body style="font-family: sans-serif; text-align: center; padding: 50px; background: #f9f9f9;">
            <div style="max-width: 400px; margin: auto; background: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h1 style="color: #2e7d32; margin-bottom: 10px;">✔ Success!</h1>
                <h2 style="color: #333; margin-top: 0;">Identity Verified</h2>
                <p style="color: #666; line-height: 1.6;">
                    Welcome back, <b>{email}</b>. Your login was successful.
                </p>
                <div style="margin: 20px 0; padding: 15px; background: #e8f5e9; color: #2e7d32; border-radius: 4px; font-weight: bold;">
                    Your desktop workspace is now UNLOCKED.
                </div>
                <p style="color: #888; font-size: 0.9em;">
                    You can safely close this mobile tab now.
                </p>
            </div>
        </body>
    """

@router.get("/report_compromise/{token}", response_class=HTMLResponse)
async def report_compromise(token: str, email: str):
    """
    User clicked 'This is not me'.
    We instantly Kill everything and alert the SOC team via WebSocket.
    """
    # Same check
    saved_user = redis_client.get_val(f"token:{token}")
    if saved_user != email:
        return """
            <body style="font-family: sans-serif; text-align: center; padding: 50px;">
                <h1 style="color: #c62828;">Error: Invalid Token</h1>
                <p>This report link is invalid or has expired.</p>
            </body>
        """
    
    from api.websocket import manager # Import WebSocket manager
    
    # 1. Nuke their Redis session
    redis_client.clear_session(email)
    
    # 2. Tell the React App to immediately lock the screen via WebSocket
    await manager.send_termination(email)
    
    return f"""
        <body style="font-family: sans-serif; text-align: center; padding: 50px; background: #fff5f5;">
            <div style="max-width: 400px; margin: auto; background: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); border: 1px solid #ffcdd2;">
                <h1 style="color: #c62828; margin-bottom: 10px;">⚠ Compromise Reported</h1>
                <p style="color: #333; line-height: 1.6;">
                    Security Alert: All active sessions for <b>{email}</b> have been <b>terminated</b>.
                </p>
                <p style="color: #666;">
                    Our security team has been notified. We recommend changing your password immediately.
                </p>
                <p style="color: #888; font-size: 0.9em; margin-top: 20px;">
                    You can close this tab now.
                </p>
            </div>
        </body>
    """
