from pymongo import MongoClient
import sys

try:
    client = MongoClient("mongodb://localhost:27017", serverSelectionTimeoutMS=2000)
    client.admin.command('ping')
    print("SUCCESS: MongoDB is reachable")
except Exception as e:
    print(f"ERROR: Could not connect to MongoDB: {e}")
    sys.exit(1)
