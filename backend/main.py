from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import conversations, messages
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="MedTranslate Backend")

# Get frontend URL from environment variable, default to localhost if not set
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

# CORS configuration
origins = [
    FRONTEND_URL,
    "http://127.0.0.1:5173",  # fallback local URLs
    "http://localhost:3000",   # optional React default
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(conversations.router)
app.include_router(messages.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to MedTranslate API"}
