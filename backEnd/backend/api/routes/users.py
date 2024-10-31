from fastapi import APIRouter, HTTPException, Response, status
from fastapi.requests import Request

from backend.db_interface.users import handle_insert_user, handle_get_user, handle_update_user
from backend.models.user import User, UpdateUser
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

@router.put("/{user_id}", summary="Update an existing user", response_model=ApiResponse)
async def update_user(user_id: str, updated_user: UpdateUser, response: Response) -> ApiResponse:
    """
    Update an existing user's information.

    This endpoint allows modification of only the following user fields:
    - profile_image_url
    - phone_number 
    - description

    All other fields will be ignored during the update.

    Parameters:
    - **user_id**: The unique identifier (UUID) of the user to update
    - **updated_user**: The User object containing only the allowed updatable fields

    Responses:
    - **200 OK**: Returns the updated user details if successful
    - **404 Not Found**: If the user with the specified ID does not exist
    - **400 Bad Request**: If the user_id is not a valid UUID or user data is invalid
    - **500 Internal Server Error**: If an unexpected error occurs during processing
    """
    try:        
        requested_user_id = uuid_pkg.UUID(user_id)
        result = handle_update_user(requested_user_id, updated_user)
        
        if result is None:
            response.status_code = status.HTTP_404_NOT_FOUND
            return ApiResponse(error=ErrMessage(message="User not found"))
            
        return ApiResponse(data=result.as_dict())
        
    except ValueError as e:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return ApiResponse(error=ErrMessage(message=str(e)))
    except Exception as e:
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return ApiResponse(error=ErrMessage(message=str(e)))