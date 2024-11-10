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
from backend.api.main import api_router  
from backend.middleware.api_auth import stytch_authentication
from backend.api_responses import ApiResponse, ErrMessage


# Configure the main FastAPI application
api_app = FastAPI(
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

# Include the API router
api_app.include_router(api_router)

@api_app.middleware("http")
async def auth_middleware(request: Request, call_next):
    try:
        return await stytch_authentication(request, call_next)
    except Exception as e:
        error_message = ErrMessage(message=str(e))
        if isinstance(e, HTTPException):
            response_status = e.status_code
        else:
            response_status = status.HTTP_500_INTERNAL_SERVER_ERROR
        api_response = ApiResponse(error=error_message)
        return JSONResponse(
            status_code=response_status,
            content=api_response.dict()
        )

@api_app.middleware("http")
async def logging_middleware(request: Request, call_next):
    response = await logger(request, call_next)
    return response

# Add your status endpoint
@api_app.get("/status", status_code=status.HTTP_200_OK)
def read_root():
    return {"message": "OK"}

# Add CORS middleware
origin = os.getenv("FRONTEND_URL")
server_url = os.getenv("SERVER_URL", default="127.0.0.1")
server_port = os.getenv("SERVER_PORT")

if origin is None:
    raise ValueError("FRONTEND_URL environment variable not set")

if server_port is None:
    raise ValueError("SERVER_PORT environment variable not set")

api_app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

def start():
    """Initialize and start the server"""
    init_db()
    print(f'Logging enabled: {(os.getenv("LOGGING_ENABLED", False) == "True")}')
    if os.getenv("BACKEND_TLS_ENABLED"):
        print("Server running with tls enabled")
        uvicorn.run(
            "backend.main:api_app",
            host=server_url,
            port=int(server_port),
            reload=True,
            ssl_certfile=os.getenv("BACKEND_TLS_CERT_FILE"),
            ssl_keyfile=os.getenv("BACKEND_TLS_KEY_FILE"),
        )
    else:
        uvicorn.run(
            "backend.main:api_app",
            host=server_url, 
            port=int(server_port), 
            reload=True
        )

if __name__ == "__main__":
    load_dotenv()
    start()