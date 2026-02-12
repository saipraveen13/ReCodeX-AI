"""
MongoDB database connection and configuration
"""
import os
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.server_api import ServerApi

# MongoDB connection
mongodb_client: AsyncIOMotorClient = None
database = None


async def connect_to_mongo():
    """Connect to MongoDB"""
    global mongodb_client, database
    
    mongodb_url = os.getenv("MONGODB_URL")
    if not mongodb_url:
        raise ValueError("MONGODB_URL environment variable not set")
    
    try:
        # Create MongoDB client
        mongodb_client = AsyncIOMotorClient(
            mongodb_url,
            server_api=ServerApi('1')
        )
        
        # Get database (extract from URL or use default)
        database = mongodb_client.recodex
        
        # Test connection
        await mongodb_client.admin.command('ping')
        print("✅ Successfully connected to MongoDB!")
        
    except Exception as e:
        print(f"❌ Error connecting to MongoDB: {e}")
        raise


async def close_mongo_connection():
    """Close MongoDB connection"""
    global mongodb_client
    
    if mongodb_client:
        mongodb_client.close()
        print("MongoDB connection closed")


def get_database():
    """Get database instance"""
    return database
