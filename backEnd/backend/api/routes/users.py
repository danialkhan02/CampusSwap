from fastapi import APIRouter, HTTPException, Response, status
from fastapi.requests import Request

from backend.db_interface.users import handle_insert_user, handle_get_user
from backend.models.user import User
from backend.db_models.users import UsersOrm
from backend.stytch_client import StytchClient
from backend.db_models.connection import Session
from backend.api_responses import ApiResponse, ErrMessage
from backend.constants import BACKEND_ID_STYTCH_KEY
import uuid as uuid_pkg
from datetime import datetime

router = APIRouter(
    tags=["users"],
    responses={404: {"description": "Not found"}}
)

@router.post("")
async def add_user(posted_user: User, response: Response) -> ApiResponse:
    # Check if user exists
    with Session() as session:
        existing_user = session.query(UsersOrm).filter(UsersOrm.email == posted_user.email).first()
        if existing_user is not None:
            user = handle_get_user(existing_user.id)
            return ApiResponse(data=user.as_dict())

    new_user = handle_insert_user(posted_user)
    new_backend_id = new_user.get("user_id", "")
    if not len(str(new_backend_id)):
        error = ErrMessage(message="error databasing user")
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return ApiResponse(error=error)

    # Adds user and metadata to stytch
    stytch_response = StytchClient.users.update(
        user_id=posted_user.stytch_id,
        trusted_metadata={BACKEND_ID_STYTCH_KEY: str(new_backend_id)},
    )
    if stytch_response.status_code == 200:
        new_user_response = handle_get_user(new_backend_id)
        return ApiResponse(data=new_user_response.as_dict())
    else:
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        error = ErrMessage(message=stytch_response.text)
        return ApiResponse(error=error)


@router.get("/{user_id}")
async def get_user(user_id: str, response: Response) -> ApiResponse:
    try:
        requested_user_id = uuid_pkg.UUID(user_id)
    except ValueError as e:
        error = ErrMessage(message=str(e))
        response.status_code = status.HTTP_400_BAD_REQUEST
        return ApiResponse(error=error)
    db_user = handle_get_user(requested_user_id)
    if db_user is None:
        error = ErrMessage(message="user not found")
        response.status_code = status.HTTP_404_NOT_FOUND
        return ApiResponse(error=error)
    else:
        return ApiResponse(data=db_user.as_dict())
