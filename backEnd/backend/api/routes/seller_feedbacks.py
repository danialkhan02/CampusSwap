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
from backend.db_models.connection import Session as DefaultSession, get_db
from backend.db_interface.users import get_user_summary

router = APIRouter()

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
        
        # Get user summaries
        seller = get_user_summary(str(feedback.seller_id))
        buyer = get_user_summary(str(feedback.buyer_id))
        
        if not seller or not buyer:
            response.status_code = status.HTTP_404_NOT_FOUND
            return ApiResponse(error=ErrMessage(message="Associated user not found"))
        
        # Create a SellerFeedback object from the feedback
        feedback_obj = {
            "id": str(feedback.id),
            "seller": seller,
            "buyer": buyer,
            "rating": feedback.rating,
            "feedback_message": feedback.feedback_message,
            "verified_purchase": feedback.verified_purchase,
            "seller_response": feedback.seller_response,
            "timestamp": feedback.timestamp.isoformat() if feedback.timestamp else None
        }

        return ApiResponse(data=feedback_obj)
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
        return ApiResponse(data=updated.as_dict())
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

        # Create a list of SellerFeedback objects
        feedback_list = []
        for feedback in feedbacks:
            seller = get_user_summary(str(feedback.seller_id))
            buyer = get_user_summary(str(feedback.buyer_id))
            feedback_list.append(SellerFeedback(seller=seller, buyer=buyer, **feedback.as_dict()))

        return ApiResponse(data=feedback_list)
    except ValueError as e:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return ApiResponse(error=ErrMessage(message=str(e)))
    except Exception as e:
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return ApiResponse(error=ErrMessage(message=str(e))) 
    
@router.get("/buyer/{buyer_id}", summary="List all feedbacks made by a buyer", response_model=ApiResponse)
async def list_buyer_feedback(buyer_id: str, response: Response, db: Session = Depends(get_db)) -> ApiResponse:
    """
    Retrieve all feedbacks made by a specific buyer.

    Parameters:
    - **buyer_id**: The unique identifier of the buyer

    Responses:
    - **200 OK**: Returns list of feedbacks
    - **400 Bad Request**: If the buyer_id is invalid
    - **500 Internal Server Error**: If an unexpected error occurs
    """
    try:
        feedbacks = list_seller_feedbacks_by_buyer(buyer_id, db)

        # Create a list of SellerFeedback objects
        feedback_list = []
        for feedback in feedbacks:
            seller = get_user_summary(str(feedback.seller_id))
            buyer = get_user_summary(str(feedback.buyer_id))
            feedback_list.append(SellerFeedback(seller=seller, buyer=buyer, **feedback.as_dict()))

        return ApiResponse(data=feedback_list)
    except ValueError as e:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return ApiResponse(error=ErrMessage(message=str(e)))
    except Exception as e:
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return ApiResponse(error=ErrMessage(message=str(e)))
