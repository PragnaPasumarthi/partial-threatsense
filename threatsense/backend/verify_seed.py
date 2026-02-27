from pymongo import MongoClient
client = MongoClient("mongodb://localhost:27017")
db = client.threatsense_db
count = db.hr_employees.count_documents({})
print(f"Total Employees in DB: {count}")
for emp in db.hr_employees.find().limit(5):
    print(f"Name: {emp['name']}, Email: {emp['email']}")
