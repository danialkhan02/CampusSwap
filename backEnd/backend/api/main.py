from fastapi import FastAPI, HTTPException, status
from starlette.responses import JSONResponse

from backend.api.routes import users, products, seller_profiles, chat, seller_feedbacks
from fastapi.requests import Request
from backend.api_responses import ApiResponse, ErrMessage
from backend.middleware.api_auth import stytch_authentication

api_app = FastAPI(
    title="Swap Squad API",
    description="""
    API for swap squad. 
    Allows managing products, users, and marketplace interactions.
    """,
    version="1.0.0",
)

@api_app.middleware("http")
async def api_middleware_helper(request: Request, call_next):    
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


# Add all routes
api_app.include_router(products.router, prefix="/products", tags=["products"])
api_app.include_router(users.router, prefix="/users", tags=["users"])
api_app.include_router(seller_profiles.router, prefix="/seller_profiles", tags=["seller_profiles"])
api_app.include_router(chat.router, prefix="/chat", tags=["chat"])
api_app.include_router(seller_feedbacks.router, prefix="/seller_feedbacks", tags=["seller_feedbacks"])
