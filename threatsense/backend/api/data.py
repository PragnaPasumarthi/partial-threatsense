from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.mongodb_service import mongodb_service
from services.redis_service import RedisService
from datetime import datetime

router = APIRouter()
redis_client = RedisService()

@router.get("/sales")
async def get_sales_data():
    """Aggregate sales metrics, appointments, and deals from MongoDB"""
    try:
        # 1. Basic Metrics
        active_deals_count = await mongodb_service.db.sales_customers.count_documents({"status": "Active"})
        total_leads = await mongodb_service.db.sales_customers.count_documents({})
        
        # 2. Latest 10 Appointments
        appointments = []
        cursor = mongodb_service.db.sales_appointments.find().sort("date", -1).limit(10)
        async for doc in cursor:
            doc["id"] = str(doc["_id"])
            del doc["_id"]
            appointments.append(doc)
            
        # 3. Deal Pipeline (Customers)
        deals = []
        cursor = mongodb_service.db.sales_customers.find().sort("lastContactDate", -1).limit(20)
        async for doc in cursor:
            doc["id"] = str(doc["_id"])
            del doc["_id"]
            # Format revenue for display
            if isinstance(doc.get("revenue"), (int, float)):
                doc["value"] = f"₹{(doc['revenue']/100000):.1f}L"
            else:
                doc["value"] = str(doc.get("revenue", "₹0"))
            deals.append(doc)
            
        return {
            "totalRevenue": "₹12.5L", # Still placeholder for now or aggregate if needed
            "totalLeads": str(total_leads),
            "activeDeals": str(active_deals_count),
            "conversionRate": 64,
            "appointments": appointments,
            "deals": deals,
            "chartData": [
                {"month": "Jan", "revenue": 45},
                {"month": "Feb", "revenue": 52},
                {"month": "Mar", "revenue": 48},
                {"month": "Apr", "revenue": 61},
                {"month": "May", "revenue": 55},
                {"month": "Jun", "revenue": 67}
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class AppointmentCreate(BaseModel):
    clientName: str
    company: str
    executive: str
    date: str
    time: str
    meetingType: str
    status: str = "Scheduled"

@router.post("/appointments")
async def create_appointment(appt: AppointmentCreate):
    """Save a new appointment to MongoDB"""
    try:
        new_appt = appt.dict()
        result = await mongodb_service.db.sales_appointments.insert_one(new_appt)
        return {"id": str(result.inserted_id), "status": "Success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class DealCreate(BaseModel):
    name: str # Client Name
    company: str
    email: str
    phone: str
    status: str
    revenue: float
    lastContactDate: str

@router.post("/deals")
async def create_deal(deal: DealCreate):
    """Save a new deal (customer) into sales_customers"""
    try:
        new_deal = deal.dict()
        # Map frontend 'name' to whatever backend uses if different
        result = await mongodb_service.db.sales_customers.insert_one(new_deal)
        return {"id": str(result.inserted_id), "status": "Success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/hr")
async def get_hr_data():
    """Fetch employee list from MongoDB"""
    try:
        employees = []
        cursor = mongodb_service.db.hr_employees.find().limit(100)
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])
            employees.append(doc)
            
        return employees
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/soc")
async def get_soc_stats(user_id: str = None):
    """Get security stats and risk scores"""
    try:
        # Get global alerts
        alerts = []
        cursor = mongodb_service.db.security_events.find().sort("timestamp", -1).limit(10)
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])
            if "timestamp" in doc and hasattr(doc["timestamp"], "isoformat"):
                doc["timestamp"] = doc["timestamp"].isoformat()
            alerts.append(doc)

        risk_score = 0
        if user_id:
            risk_score = redis_client.get_risk_score(user_id)

        return {
            "alerts": alerts,
            "current_user_risk": risk_score,
            "system_health": "Optimal",
            "threat_level": "Elevated" if risk_score > 40 else "Low"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status")
async def get_system_status():
    """Returns counts and health status for all collections"""
    try:
        status = {
            "mongodb": "Connected",
            "redis": "Connected (Service Pattern)",
            "counts": {
                "sales_customers": await mongodb_service.db.sales_customers.count_documents({}),
                "hr_employees": await mongodb_service.db.hr_employees.count_documents({}),
                "security_events": await mongodb_service.db.security_events.count_documents({}),
                "sales_appointments": await mongodb_service.db.sales_appointments.count_documents({})
            },
            "last_updated": datetime.now().isoformat()
        }
        return status
    except Exception as e:
        return {"error": f"Failed to fetch status: {str(e)}", "mongodb": "Disconnected"}
