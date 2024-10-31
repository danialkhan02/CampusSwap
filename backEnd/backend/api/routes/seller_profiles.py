from fastapi import APIRouter, Response, status, Depends
from sqlalchemy.orm import Session
from backend.db_interface.seller_profiles import (
    create_seller_profile,
    get_seller_profile,
    update_seller_profile,
    delete_seller_profile
)
from backend.models.seller_profile import SellerProfile
from backend.api_responses import ApiResponse, ErrMessage
from backend.db_models.connection import Session as DefaultSession
import uuid as uuid_pkg

router = APIRouter(
    tags=["seller_profiles"],
    responses={404: {"description": "Not found"}}
)

def get_db():
    db = DefaultSession()
    try:
        yield db
    finally:
        db.close()

@router.post("", summary="Create a new seller profile", response_model=ApiResponse)
async def add_seller_profile(profile: SellerProfile, seller_id: str, response: Response, db: Session = Depends(get_db)) -> ApiResponse:
    """
    Create a new seller profile in the system.

    This endpoint allows the creation of a new seller profile with the provided details.
    If a profile already exists for the given seller_id, the request will fail with
    an appropriate error message.

    Parameters:
    - **profile**: The SellerProfile object containing the seller's profile information
                 (profile_image_url, phone_number, total_transactions, average_rating)
    - **seller_id**: The unique identifier (UUID) for the seller

    Responses:
    - **200 OK**: If the profile is successfully created, returns the created profile data
    - **400 Bad Request**: If the seller_id is not a valid UUID or profile data is invalid
    - **500 Internal Server Error**: If an unexpected error occurs during profile creation
    """
    try:
        uuid_obj = uuid_pkg.UUID(seller_id)
        result = create_seller_profile(profile, uuid_obj, db)
        return ApiResponse(data=result)
    except ValueError as e:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return ApiResponse(error=ErrMessage(message=str(e)))
    except Exception as e:
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return ApiResponse(error=ErrMessage(message=str(e)))

@router.get("/{seller_id}", summary="Get a seller profile by ID", response_model=ApiResponse)
async def get_profile(seller_id: str, response: Response, db: Session = Depends(get_db)) -> ApiResponse:
    """
    Retrieve a seller's profile by their unique identifier.

    This endpoint allows clients to fetch detailed information about a specific seller's profile 
    using the seller's unique ID. The response includes comprehensive details such as the 
    seller's profile image URL, phone number, total transactions, and average rating.

    Parameters:
    - **seller_id**: The unique identifier (UUID) of the seller whose profile is being retrieved.
        --> This is the users.id from the UsersOrm table.
    
    Responses:
    - **200 OK**: Returns the seller's profile details if found.
    - **404 Not Found**: If the seller profile with the specified ID does not exist.
    - **400 Bad Request**: If the seller_id is not a valid UUID format.
    - **500 Internal Server Error**: If an unexpected error occurs during processing.
    """
    try:
        requested_seller_id = uuid_pkg.UUID(seller_id)
        profile = get_seller_profile(requested_seller_id, db)
        if profile is None:
            response.status_code = status.HTTP_404_NOT_FOUND
            return ApiResponse(error=ErrMessage(message="Seller profile not found"))
        
        return_profile = {
            "seller_id": profile.seller_id,
            "profile_image_url": profile.profile_image_url,
            "phone_number": profile.phone_number,
            "total_transactions": profile.total_transactions,
            "average_rating": profile.average_rating,
        }
        return ApiResponse(data=return_profile)
    except ValueError as e:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return ApiResponse(error=ErrMessage(message=str(e)))
    except Exception as e:
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return ApiResponse(error=ErrMessage(message=str(e)))

@router.put("/{seller_id}", summary="Update an existing seller profile", response_model=ApiResponse)
async def update_profile(seller_id: str, profile: SellerProfile, response: Response, db: Session = Depends(get_db)) -> ApiResponse:
    """
    Update an existing seller's profile information.

    This endpoint allows modification of a seller's profile details using their unique seller ID.
    All profile fields can be updated, including the profile image URL, phone number,
    total transactions, and average rating. Only existing profiles can be updated.

    Parameters:
    - **seller_id**: The unique identifier (UUID) of the seller whose profile is being updated.
        --> This is the users.id from the UsersOrm table.
    - **profile**: The SellerProfile object containing the updated profile information:
        - profile_image_url (optional): URL to the seller's profile image
        - phone_number (optional): Contact phone number
        - total_transactions: Number of completed transactions
        - average_rating: Current average rating (0.0 to 5.0)

    Responses:
    - **200 OK**: Returns the updated seller profile details if successful.
    - **404 Not Found**: If the seller profile with the specified ID does not exist.
    - **400 Bad Request**: If the seller_id is not a valid UUID or profile data is invalid.
    - **500 Internal Server Error**: If an unexpected error occurs during processing.
    """
    try:
        request_seller_id = uuid_pkg.UUID(seller_id)
        updated_profile = update_seller_profile(request_seller_id, profile, db)
        if updated_profile is None:
            response.status_code = status.HTTP_404_NOT_FOUND
            return ApiResponse(error=ErrMessage(message="Seller profile not found"))
        
        return_profile = {
            "seller_id": updated_profile.seller_id,
            "profile_image_url": updated_profile.profile_image_url,
            "phone_number": updated_profile.phone_number,
            "total_transactions": updated_profile.total_transactions,
            "average_rating": updated_profile.average_rating,
        }
        return ApiResponse(data=return_profile)  # Convert to dictionary
    except ValueError as e:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return ApiResponse(error=ErrMessage(message=str(e)))
    except Exception as e:
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return ApiResponse(error=ErrMessage(message=str(e)))

@router.delete("/{seller_id}", summary="Delete a seller profile", response_model=ApiResponse)
async def delete_profile(seller_id: str, response: Response, db: Session = Depends(get_db)) -> ApiResponse:
    """
    Delete a seller's profile from the system.

    This endpoint performs a soft delete of a seller's profile using their unique seller ID.
    The profile is not permanently removed from the database but is marked as deleted 
    by setting the deleted_at timestamp. Once deleted, the profile will no longer be 
    accessible through the API.

    Parameters:
    - **seller_id**: The unique identifier (UUID) of the seller whose profile is being deleted.
        --> This is the users.id from the UsersOrm table.

    Responses:
    - **200 OK**: Returns a success message if the profile was successfully deleted.
    - **404 Not Found**: If the seller profile with the specified ID does not exist.
    - **400 Bad Request**: If the seller_id is not a valid UUID format.
    - **500 Internal Server Error**: If an unexpected error occurs during processing.
    """    
    try:
        uuid_obj = uuid_pkg.UUID(seller_id)
        result = delete_seller_profile(uuid_obj, db)
        if not result:
            response.status_code = status.HTTP_404_NOT_FOUND
            return ApiResponse(error=ErrMessage(message="Seller profile not found"))
        return ApiResponse(data={"message": "Profile deleted successfully"})
    except ValueError as e:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return ApiResponse(error=ErrMessage(message=str(e)))
    except Exception as e:
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return ApiResponse(error=ErrMessage(message=str(e)))