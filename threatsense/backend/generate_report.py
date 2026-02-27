import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import sys
import os

# Adjust path to import core.config
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from core.config import settings

async def generate_mapping_report():
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client.threatsense_db
    
    # Fetch all employees
    employees = await db.hr_employees.find({}).to_list(length=100)
    
    # Map users to emails
    mapping = {}
    for emp in employees:
        email = emp.get("email")
        name = emp.get("name")
        if email not in mapping:
            mapping[email] = []
        mapping[email].append(name)
    
    print("\n--- EMPLOYEE MAPPING REPORT ---")
    for email, names in mapping.items():
        print(f"\nREAL EMAIL ID: {email}")
        print(f"Number of Linked Identities: {len(names)}")
        print(f"Sample Names: {', '.join(names[:10])}")
        if len(names) > 10:
            print(f"... and {len(names) - 10} more.")
    print("\nTotal Employees Seeded: ", len(employees))

if __name__ == "__main__":
    asyncio.run(generate_mapping_report())
