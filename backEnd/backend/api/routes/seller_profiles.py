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
    prefix="/seller_profiles",
    tags=["seller_profiles"],
    responses={404: {"description": "Not found"}}
)

def get_db():
    db = DefaultSession()
    try:
        yield db
    finally:
        db.close()

@router.post("")
async def add_seller_profile(profile: SellerProfile, seller_id: str, response: Response, db: Session = Depends(get_db)) -> ApiResponse:
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

@router.get("/{seller_id}")
async def get_profile(seller_id: str, response: Response, db: Session = Depends(get_db)) -> ApiResponse:
    try:
        uuid_obj = uuid_pkg.UUID(seller_id)
        profile = get_seller_profile(uuid_obj, db)
        if profile is None:
            response.status_code = status.HTTP_404_NOT_FOUND
            return ApiResponse(error=ErrMessage(message="Seller profile not found"))
        return ApiResponse(data=profile)
    except ValueError as e:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return ApiResponse(error=ErrMessage(message=str(e)))
    except Exception as e:
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return ApiResponse(error=ErrMessage(message=str(e)))

@router.put("/{seller_id}")
async def update_profile(seller_id: str, profile: SellerProfile, response: Response, db: Session = Depends(get_db)) -> ApiResponse:
    try:
        uuid_obj = uuid_pkg.UUID(seller_id)
        updated_profile = update_seller_profile(uuid_obj, profile, db)
        if updated_profile is None:
            response.status_code = status.HTTP_404_NOT_FOUND
            return ApiResponse(error=ErrMessage(message="Seller profile not found"))
        return ApiResponse(data=updated_profile)
    except ValueError as e:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return ApiResponse(error=ErrMessage(message=str(e)))
    except Exception as e:
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return ApiResponse(error=ErrMessage(message=str(e)))

@router.delete("/{seller_id}")
async def delete_profile(seller_id: str, response: Response, db: Session = Depends(get_db)) -> ApiResponse:
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