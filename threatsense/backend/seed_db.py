import asyncio
import random
from datetime import datetime, timedelta, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from core.config import settings
from services.mongodb_service import mongodb_service

# --- Realistic Indian Names and Companies ---
INDIAN_FIRST_NAMES = [
    "Aarav", "Vihaan", "Vivaan", "Ananya", "Diya", "Aditya", "Arjun", "Sai",
    "Riya", "Kavya", "Dhruv", "Kabir", "Siddharth", "Ishita", "Anjali",
    "Rohan", "Vikram", "Neha", "Pooja", "Rahul", "Sneha", "Karan", "Sanjay",
    "Amit", "Priya", "Sunita", "Deepak", "Rajesh", "Anita", "Anil", "Manoj",
    "Suresh", "Meena", "Ramesh", "Kiran", "Vijay", "Geeta", "Dinesh", "Rekha",
    "Nitin", "Ashok", "Sita", "Gaurav", "Swati", "Nishant", "Preeti", "Alok",
    "Shruti", "Tarun", "Divya"
]

INDIAN_LAST_NAMES = [
    "Sharma", "Patel", "Singh", "Kumar", "Gupta", "Deshmukh", "Jain", "Reddy",
    "Rao", "Nair", "Iyer", "Chetty", "Chaudhary", "Verma", "Yadav", "Tiwari",
    "Mishra", "Pandey", "Mehta", "Bose", "Das", "Mukherjee", "Chatterjee",
    "Banerjee", "Sengupta", "Kaur", "Ahluwalia", "Bhatia", "Chopra", "Kapur",
    "Malhotra", "Mehra", "Sethi", "Suri", "Tandon", "Ahuja", "Arora", "Bedi",
    "Chawla", "Garg", "Goel", "Joshi", "Kulkarni", "Jadhav", "Pawar", "Shinde",
    "Tambe", "Gaikwad", "Naik", "Kale"
]

COMPANIES = [
    "Tata Consultancy Services", "Infosys", "Wipro", "HCL Technologies",
    "Tech Mahindra", "Reliance Industries", "Larsen & Toubro", "HDFC Bank",
    "ICICI Bank", "State Bank of India", "Bharti Airtel", "Maruti Suzuki",
    "Mahindra & Mahindra", "Bajaj Auto", "Sun Pharmaceutical", "ITC Limited",
    "Asian Paints", "Hindustan Unilever", "UltraTech Cement", "Nestle India",
    "Zomato", "Swiggy", "Ola Cabs", "Flipkart", "Razorpay", "Paytm", "Zerodha",
    "Postman", "Freshworks", "Zoho", "Pine Labs", "Dream11", "CRED",
    "BharatPe", "Meesho", "ShareChat", "Delhivery", "Nykaa", "Unacademy",
    "BYJU'S", "Upstox", "FirstCry", "Lenskart", "Pharmeasy", "Urban Company",
    "CarDekho", "Spinny", "Groww", "Acko", "Cure.fit"
]

# --- Real User Emails (REQUIRED: Add your real email here to test login) ---
USER_EMAILS = [
    "meghanaakota339@gmail.com",
    "meghu17102006@gmail.com",
    "pragnapasumarthi25@gmail.com",
    "pragnashetty559@gmail.com",
    "belliappa1710@gmail.com"
]

STATUSES = ["New", "Contacted", "Negotiation", "Closed"]

DEAL_VALUES = [50000, 150000, 200000, 500000, 1000000, 2500000, 5000000]

def generate_random_phone():
    return f"+91 {random.randint(6, 9)}{random.randint(1000, 9999)} {random.randint(10000, 99999)}"

async def seed_database():
    print(f"Connecting to MongoDB at {settings.MONGODB_URL}...")
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client.threatsense_db

    print("Dropping existing collections for a fresh start...")
    await db.sales_customers.drop()
    await db.sales_appointments.drop()
    await db.hr_employees.drop()
    await db.soc_alerts.drop()
    await db.security_events.drop()

    print("Re-initializing indexes...")
    await mongodb_service.connect()

    # --- 1. Seed 50 Sales Customers ---
    print("Generating 50 realistic Indian Sales Customers...")
    customers = []
    for i in range(50):
        first_name = random.choice(INDIAN_FIRST_NAMES)
        last_name = random.choice(INDIAN_LAST_NAMES)
        domain = random.choice(COMPANIES).lower().replace(" ", "").replace("&", "")
        
        # Random date within the last 30 days
        last_contact = datetime.now(timezone.utc) - timedelta(days=random.randint(0, 30))
        
        customer = {
            "name": f"{first_name} {last_name}",
            "email": f"{first_name.lower()}.{last_name.lower()}@{domain}.com",
            "phone": generate_random_phone(),
            "company": random.choice(COMPANIES),
            "status": random.choice(STATUSES),
            "revenue": random.choice(DEAL_VALUES),
            "lastContactDate": last_contact.isoformat()
        }
        customers.append(customer)

    await db.sales_customers.insert_many(customers)
    print(f"[SUCCESS] Inserted {len(customers)} sales customers.")

    # --- 2. Seed Sales Appointments ---
    print("Generating Sales Appointments...")
    appointments = []
    
    # Needs some active customer IDs
    cursor = db.sales_customers.find({}, {"_id": 1, "name": 1, "company": 1}).limit(5)
    active_customers = await cursor.to_list(length=5)

    meeting_types = ["Demo", "Follow-up", "Contract Discussion", "Initial Pitch"]
    
    for i, active_customer in enumerate(active_customers):
        appt_date = datetime.now(timezone.utc) + timedelta(days=random.randint(1, 14))
        appt = {
            "customerId": str(active_customer["_id"]),
            "clientName": active_customer["name"],
            "company": active_customer["company"],
            "executive": "Sales User",
            "date": appt_date.strftime("%Y-%m-%d"),
            "time": f"{random.randint(10, 16):02d}:00",
            "meetingType": random.choice(meeting_types),
            "status": "Scheduled"
        }
        appointments.append(appt)

    await db.sales_appointments.insert_many(appointments)
    print(f"[SUCCESS] Inserted {len(appointments)} sales appointments.")

    # --- 3. Seed HR Employees (Refined to 25 Unique Names) ---
    print(f"Generating 25 HR Employees mapped to authorized emails...")
    
    PROPOSED_EMPLOYEES = [
        # --- SALES MANAGERS & EXECUTIVES (10) ---
        {"name": "Aarav Sharma", "dept": "Sales", "role": "Senior Sales Manager", "type": "normal"},
        {"name": "Vihaan Patel", "dept": "Sales", "role": "Regional Sales Manager", "type": "normal"},
        {"name": "Aditya Deshmukh", "dept": "Sales", "role": "Sales Team Lead", "type": "normal"},
        {"name": "Arjun Jain", "dept": "Sales", "role": "Sales Lead", "type": "normal"},
        {"name": "Vikram Mishra", "dept": "Sales", "role": "Sales Manager", "type": "anomalous"},
        {"name": "Naman Gupta", "dept": "Sales", "role": "Sales Executive", "type": "normal"},
        {"name": "Ishaan Kapoor", "dept": "Sales", "role": "Senior Sales Executive", "type": "normal"},
        {"name": "Ananya Roy", "dept": "Sales", "role": "Sales Analyst", "type": "normal"},
        {"name": "Karan Malhotra", "dept": "Sales", "role": "Sales Associate", "type": "normal"},
        {"name": "Sanya Verma", "dept": "Sales", "role": "Enterprise Sales", "type": "normal"},
        
        # --- HR DEPARTMENT (5) ---
        {"name": "Diya Gupta", "dept": "HR", "role": "HR Director", "type": "normal"},
        {"name": "Kavya Nair", "dept": "HR", "role": "HR Associate", "type": "normal"},
        {"name": "Swati Sharma", "dept": "HR", "role": "HR Lead", "type": "normal"},
        {"name": "Pooja Mehta", "dept": "HR", "role": "HR Manager", "type": "anomalous"},
        {"name": "Anjali Yadav", "dept": "HR", "role": "HR Specialist", "type": "normal"},
        
        # --- SUPPORT STAFF (5) ---
        {"name": "Vivaan Singh", "dept": "Support", "role": "Senior Support", "type": "normal"},
        {"name": "Sai Reddy", "dept": "Support", "role": "Support Lead", "type": "normal"},
        {"name": "Siddharth Chaudhary", "dept": "Support", "role": "Support Manager", "type": "normal"},
        {"name": "Ananya Kumar", "dept": "Support", "role": "Support Analyst", "type": "normal"},
        {"name": "Rahul Bose", "dept": "Support", "role": "Support Associate", "type": "anomalous"},
        
        # --- SOC TEAM (5) ---
        {"name": "Rohan Tiwari", "dept": "SOC", "role": "SOC Lead", "type": "anomalous"},
        {"name": "Neha Pandey", "dept": "SOC", "role": "Security Analyst", "type": "anomalous"},
        {"name": "Ishita Verma", "dept": "SOC", "role": "Incident Responder", "type": "normal"},
        {"name": "Dhruv Iyer", "dept": "SOC", "role": "SOC Analyst", "type": "normal"},
        {"name": "Kabir Chetty", "dept": "SOC", "role": "Security Researcher", "type": "normal"}
    ]

    # Map 25 users to the new long email pattern
    employees = []
    for i, emp in enumerate(PROPOSED_EMPLOYEES):
        first_name = emp["name"].split(" ")[0]
        last_name = emp["name"].split(" ")[1] if len(emp["name"].split(" ")) > 1 else ""
        
        # New pattern: fullname789456123@gmail.com
        email_to_use = f"{first_name.lower()}{last_name.lower()}789456123@gmail.com"
        password_to_use = f"{first_name.capitalize()}123@" # Keeping password simple as per previous pattern
        
        employees.append({
            "name": emp["name"],
            "email": email_to_use, 
            "password": password_to_use,
            "username": emp["name"].lower().replace(" ", "."),
            "department": emp["dept"],
            "role": emp["role"],
            "status": "Active",
            "type": emp["type"], 
            "hireDate": (datetime.now(timezone.utc) - timedelta(days=random.randint(30, 1000))).isoformat()
        })
    
    await db.hr_employees.insert_many(employees)
    print(f"[SUCCESS] Created {len(employees)} unique employees grouped by sector.")

    # --- 4. Seed SOC Alerts / Security Events (Behavioral Injection) ---
    print("Generating Behavioral Security Events...")
    security_events = []
    
    # 1. Normal Activity (90% of events)
    all_employee_emails = [e["email"] for e in employees]
    for i in range(100):
        emp = random.choice(employees)
        # Standard hours: 9 AM to 6 PM
        timestamp = datetime.now(timezone.utc) - timedelta(days=random.randint(0, 14))
        timestamp = timestamp.replace(hour=random.randint(9, 17), minute=random.randint(0, 59))
        
        event = {
            "user": emp["email"],
            "username": emp["username"],
            "action_type": random.choice(["Login", "View Dashboard", "API Call"]),
            "endpoint": "/api/data/sales",
            "timestamp": timestamp.isoformat(),
            "ip_address": "122.161.x.x", # Consistent local IP
            "risk_score": random.randint(5, 25),
            "anomaly_type": "None",
            "severity": "Low",
            "status": "Normal"
        }
        security_events.append(event)
    
    # 2. Anomalous Activity Injection (Specific to the 5 'anomalous' users)
    anomalous_emps = [e for e in employees if e["type"] == "anomalous"]
    for emp in anomalous_emps:
        # User-specific anomalies
        traits = {
            "rohan.tiwari": {"time": 3, "type": "Off-Hours Access", "risk": 85},
            "vikram.mishra": {"ip": "103.45.x.x", "type": "Unusual ISP", "risk": 75},
            "neha.pandey": {"action": "Data Export", "type": "Mass Download", "risk": 92},
            "pooja.mehta": {"endpoint": "/api/admin/logs", "type": "Privilege Escalation", "risk": 88},
            "rahul.bose": {"count": 10, "type": "High Velocity", "risk": 80}
        }
        
        trait = traits.get(emp["username"], {"type": "General Anomaly", "risk": 70})
        
        # Inject 3-5 high-risk events for each anomalous user
        for _ in range(3):
            timestamp = datetime.now(timezone.utc) - timedelta(hours=random.randint(1, 48))
            if "time" in trait: timestamp = timestamp.replace(hour=trait["time"])
            
            event = {
                "user": emp["email"],
                "username": emp["username"],
                "action_type": trait.get("action", "API Call"),
                "endpoint": trait.get("endpoint", "/api/data/sensitive"),
                "timestamp": timestamp.isoformat(),
                "ip_address": trait.get("ip", "192.168.1.50"),
                "risk_score": trait["risk"] + random.randint(-5, 5),
                "anomaly_type": trait["type"],
                "severity": "High",
                "status": "Open"
            }
            security_events.append(event)

    await db.security_events.insert_many(security_events)
    print(f"[SUCCESS] Inserted {len(security_events)} security events with behavioral patterns.")
    
    print("\nDatabase Seed Complete! Your frontend dashboards now have premium data.")

if __name__ == "__main__":
    asyncio.run(seed_database())
