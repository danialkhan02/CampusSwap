from fastapi import APIRouter, Response, HTTPException, status
from starlette.responses import JSONResponse

from backend.api.routes import users, products
from fastapi.requests import Request
from backend.api_responses import ApiResponse, ErrMessage

api_router = APIRouter(
    prefix="/api/v1",
    tags=["api"]
)

# Add all routes
api_router.include_router(products, prefix="/products", tags=["products"])
api_router.include_router(users, prefix="/users", tags=["users"])