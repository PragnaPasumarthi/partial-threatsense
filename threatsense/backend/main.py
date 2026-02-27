from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from contextlib import asynccontextmanager

from api.auth import router as auth_router
from api.actions import router as actions_router
from api.websocket import router as ws_router
from api.data import router as data_router
from api.soc import router as soc_router
from ml.detector import AnomalyDetector
from services.redis_service import redis_service as redis_client
from services.mongodb_service import mongodb_service

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting up ThreatSense Backend...")
    global detector
    # Initialize ML Model
    try:
        detector = AnomalyDetector()
        print("ML Models loaded successfully.")
    except Exception as e:
        print(f"Error loading models: {e}")

    # Initialize MongoDB
    await mongodb_service.connect()
        
    yield
    print("Shutting down ThreatSense Backend...")
    await mongodb_service.close()

app = FastAPI(title="ThreatSense API", lifespan=lifespan)

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://mysrkr.online",
        "https://www.mysrkr.online",
        "http://localhost:5173",   # local dev
        "http://localhost:4173",   # local preview build
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(actions_router, prefix="/api/actions", tags=["User Actions"])
app.include_router(ws_router, prefix="/ws", tags=["WebSockets"])
app.include_router(data_router, prefix="/api/data", tags=["Dashboard Data"])
app.include_router(soc_router, prefix="/api/soc", tags=["SOC Operations"])

@app.get("/")
def read_root():
    return {"status": "ThreatSense MVP Backend is running"}

if __name__ == "__main__":
    try:
        uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
    except Exception as e:
        print(f"CRITICAL ERROR: {e}")
    finally:
        print("\n" + "="*50)
        print("Backend Server Stopped.")
        print("Review the logs above. Press Enter to exit this window.")
        print("="*50)
        input()
