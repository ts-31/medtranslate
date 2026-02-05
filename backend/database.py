import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorGridFSBucket
from dotenv import load_dotenv
import certifi

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
DB_NAME = os.getenv("DB_NAME", "medtranslate_db")

class Database:
    client: AsyncIOMotorClient = None
    db_name = DB_NAME

    def __init__(self):
        self.client = None

db_instance = Database()

def get_db_client():
    """
    Lazy initialization of the Motor client.
    Ensures the client is attached to the current running event loop.
    """
    if db_instance.client is None:
        db_instance.client = AsyncIOMotorClient(MONGODB_URI, tlsCAFile=certifi.where())
    else:
        # Check if the existing client's loop matches the current loop
        try:
            # motor/pymongo internals are a bit opaque, but generally
            # if we are in a new loop (common in serverless), the old client's
            # io_loop will be different or closed.
            # In Motor > 2.0, accessing io_loop directly might differ,
            # but usually creating a new client is safe if the old one is effectively dead
            # or on a closed loop.
            # However, simpler check: just ensure we have a client.
            # For strict loop safety in Vercel:
            # We can rely on the fact that if the module is re-imported or
            # if we are in a persistent runtime but new request -> same loop.
            # If serverless -> new request might be new loop.
            
            # Key fix for "Task got Future attached to a different loop":
            # Accessing the client's loop property to compare.
            if db_instance.client.io_loop != asyncio.get_running_loop():
                 db_instance.client = AsyncIOMotorClient(MONGODB_URI, tlsCAFile=certifi.where())
        except Exception:
             # If checking loop fails (e.g. client closed), recreate
             db_instance.client = AsyncIOMotorClient(MONGODB_URI, tlsCAFile=certifi.where())

    return db_instance.client

async def get_database():
    client = get_db_client()
    return client[DB_NAME]

async def get_fs():
    client = get_db_client()
    db = client[DB_NAME]
    return AsyncIOMotorGridFSBucket(db)
