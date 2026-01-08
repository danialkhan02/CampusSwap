import multiprocessing
import os
import traceback
from fastapi import FastAPI, status, Response, HTTPException
from fastapi.requests import Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse

import uvicorn
from dotenv import load_dotenv
from backend.db_models.connection import init_db
from backend.middleware.logging import logger
from backend.environments import logging_env
from backend.api.main import api_app  
from backend.middleware.api_auth import stytch_authentication
from backend.api_responses import ApiResponse, ErrMessage


# Configure the main FastAPI application
app = FastAPI(
    title="Swap Squad API",
    description="""
    API for swap squad. 
    Allows managing products, users, and marketplace interactions.
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

@app.middleware("http")
async def logging_middleware(request: Request, call_next):
    response = await logger(request, call_next)
    return response

# Add your status endpoint
@app.get("/status", status_code=status.HTTP_200_OK)
def read_root():
    return {"message": "OK"}

app.mount("/api/v1", api_app)

# Add CORS middleware
origin = os.getenv("FRONTEND_URL")
server_url = os.getenv("SERVER_URL", default="127.0.0.1")
server_port = os.getenv("SERVER_PORT")

if origin is None:
    raise ValueError("FRONTEND_URL environment variable not set")

if server_port is None:
    raise ValueError("SERVER_PORT environment variable not set")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

workers = (multiprocessing.cpu_count() * 2) + 1

@app.get("/status", status_code=status.HTTP_200_OK)
def read_root():
    return {"message": "OK"}

def start():
    """Initialize and start the server"""
    init_db()
    print(f'Logging enabled: {(os.getenv("LOGGING_ENABLED", False) == "True")}')
    if os.getenv("BACKEND_TLS_ENABLED"):
        print("Server running with tls enabled")
        uvicorn.run(
            "backend.main:app",
            host=server_url,
            port=int(server_port),
            workers=1,
            limit_concurrency=200,
            backlog=1024,
            timeout_keep_alive=30,
            ssl_certfile=os.getenv("BACKEND_TLS_CERT_FILE"),
            ssl_keyfile=os.getenv("BACKEND_TLS_KEY_FILE"),
        )
    else:
        uvicorn.run(
            "backend.main:app",
            host=server_url, 
            port=int(server_port),
            workers=1,
            limit_concurrency=200,
            backlog=1024,
            timeout_keep_alive=30,
        )

if __name__ == "__main__":
    load_dotenv()
    start()