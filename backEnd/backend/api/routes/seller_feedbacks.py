from fastapi import APIRouter, Response, status, Depends
from sqlalchemy.orm import Session
from backend.db_interface.seller_feedbacks import (
    create_seller_feedback,
    get_seller_feedback,
    update_seller_feedback,
    delete_seller_feedback,
    list_seller_feedbacks,
    list_seller_feedbacks_by_buyer
)
from backend.models.seller_feedback import SellerFeedback
from backend.api_responses import ApiResponse, ErrMessage
from backend.db_models.connection import Session as DefaultSession
import uuid as uuid_pkg

router = APIRouter(
    tags=["seller_feedbacks"],
    responses={404: {"description": "Not found"}}
)

def get_db():
    db = DefaultSession()
    try:
        yield db
    finally:
        db.close()

@router.post("", summary="Create a new seller feedback", response_model=ApiResponse)
async def create_feedback(feedback: SellerFeedback, response: Response, db: Session = Depends(get_db)) -> ApiResponse:
    """
    Create a new feedback for a seller.

    This endpoint allows buyers to submit feedback for sellers they've interacted with.
    The feedback includes a rating, message, and verification status of the purchase.

    Parameters:
    - **feedback**: The SellerFeedback object containing:
        - seller_id: UUID of the seller
        - buyer_id: UUID of the buyer
        - rating: Numeric rating (typically 1-5)
        - feedback_message: Detailed feedback text
        - verified_purchase: Boolean indicating if this is from a verified purchase
        - seller_response: Optional response from the seller

    Responses:
    - **200 OK**: Returns the created feedback ID
    - **400 Bad Request**: If the feedback data is invalid
    - **500 Internal Server Error**: If an unexpected error occurs
    """
    try:
        result = create_seller_feedback(feedback, db)
        return ApiResponse(data=result)
    except ValueError as e:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return ApiResponse(error=ErrMessage(message=str(e)))
    except Exception as e:
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return ApiResponse(error=ErrMessage(message=str(e)))

@router.get("/{feedback_id}", summary="Get a seller feedback by ID", response_model=ApiResponse)
async def get_feedback(feedback_id: str, response: Response, db: Session = Depends(get_db)) -> ApiResponse:
    """
    Retrieve a specific feedback by its ID.

    Parameters:
    - **feedback_id**: The unique identifier of the feedback to retrieve

    Responses:
    - **200 OK**: Returns the feedback details
    - **404 Not Found**: If the feedback doesn't exist
    - **400 Bad Request**: If the feedback_id is invalid
    - **500 Internal Server Error**: If an unexpected error occurs
    """
    try:
        feedback = get_seller_feedback(feedback_id, db)
        if not feedback:
            response.status_code = status.HTTP_404_NOT_FOUND
            return ApiResponse(error=ErrMessage(message="Feedback not found"))
        return ApiResponse(data=feedback)
    except ValueError as e:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return ApiResponse(error=ErrMessage(message=str(e)))
    except Exception as e:
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return ApiResponse(error=ErrMessage(message=str(e)))

@router.put("/{feedback_id}", summary="Update a seller feedback", response_model=ApiResponse)
async def update_feedback(feedback_id: str, feedback: SellerFeedback, response: Response, db: Session = Depends(get_db)) -> ApiResponse:
    """
    Update an existing feedback.

    Parameters:
    - **feedback_id**: The unique identifier of the feedback to update
    - **feedback**: The updated SellerFeedback object

    Responses:
    - **200 OK**: Returns the updated feedback
    - **404 Not Found**: If the feedback doesn't exist
    - **400 Bad Request**: If the input data is invalid
    - **500 Internal Server Error**: If an unexpected error occurs
    """
    try:
        updated = update_seller_feedback(feedback_id, feedback, db)
        if not updated:
            response.status_code = status.HTTP_404_NOT_FOUND
            return ApiResponse(error=ErrMessage(message="Feedback not found"))
        return ApiResponse(data=updated)
    except ValueError as e:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return ApiResponse(error=ErrMessage(message=str(e)))
    except Exception as e:
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return ApiResponse(error=ErrMessage(message=str(e)))

@router.delete("/{feedback_id}", summary="Delete a seller feedback", response_model=ApiResponse)
async def delete_feedback(feedback_id: str, response: Response, db: Session = Depends(get_db)) -> ApiResponse:
    """
    Delete a specific feedback.

    Parameters:
    - **feedback_id**: The unique identifier of the feedback to delete

    Responses:
    - **200 OK**: Returns success message
    - **404 Not Found**: If the feedback doesn't exist
    - **400 Bad Request**: If the feedback_id is invalid
    - **500 Internal Server Error**: If an unexpected error occurs
    """
    try:
        result = delete_seller_feedback(feedback_id, db)
        if not result:
            response.status_code = status.HTTP_404_NOT_FOUND
            return ApiResponse(error=ErrMessage(message="Feedback not found"))
        return ApiResponse(data={"message": "Feedback deleted successfully"})
    except ValueError as e:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return ApiResponse(error=ErrMessage(message=str(e)))
    except Exception as e:
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return ApiResponse(error=ErrMessage(message=str(e)))

@router.get("/seller/{seller_id}", summary="List all feedbacks for a seller", response_model=ApiResponse)
async def list_seller_feedback(seller_id: str, response: Response, db: Session = Depends(get_db)) -> ApiResponse:
    """
    Retrieve all feedbacks for a specific seller.

    Parameters:
    - **seller_id**: The unique identifier of the seller

    Responses:
    - **200 OK**: Returns list of feedbacks
    - **400 Bad Request**: If the seller_id is invalid
    - **500 Internal Server Error**: If an unexpected error occurs
    """
    try:
        feedbacks = list_seller_feedbacks(seller_id, db)
        return ApiResponse(data=feedbacks)
    except ValueError as e:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return ApiResponse(error=ErrMessage(message=str(e)))
    except Exception as e:
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return ApiResponse(error=ErrMessage(message=str(e))) 