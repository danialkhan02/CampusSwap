from fastapi import FastAPI, Response, HTTPException, status
from starlette.responses import JSONResponse

from backend.api.routes import users
from fastapi.requests import Request
from backend.api_responses import ApiResponse, ErrMessage
from backend.middleware.api_auth import stytch_authentication

api_app = FastAPI()


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
api_app.include_router(users.router, prefix="/users", tags=["users"])
