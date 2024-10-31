from fastapi import APIRouter, Response, status, Depends
from sqlalchemy.orm import Session
from backend.db_interface.notifications import (
    create_notification,
    get_notification,
    delete_notification,
    list_notifications,
    list_notifications_by_user
)
from backend.models.notification import Notification
from backend.api_responses import ApiResponse, ErrMessage
from backend.db_models.connection import Session as DefaultSession, get_db

router = APIRouter()

@router.post("", summary="Create a new notification", response_model=ApiResponse)
async def add_notification(notification: Notification, response: Response, db: Session = Depends(get_db)) -> ApiResponse:
    """
    Create a new notification for a user.
    
    Parameters:
    - **notification**: The Notification object containing user_id, type, and message
    
    Returns:
    - **200 OK**: Returns the created notification ID
    - **400 Bad Request**: If the input parameters are invalid
    - **500 Internal Server Error**: If an unexpected error occurs
    """
    try:
        result = create_notification(notification, db)
        return ApiResponse(data=result)
    except ValueError as e:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return ApiResponse(error=ErrMessage(message=str(e)))
    except Exception as e:
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return ApiResponse(error=ErrMessage(message=str(e)))

@router.get("/user/{user_id}", summary="Get notifications for a user", response_model=ApiResponse)
async def get_user_notifications(user_id: str, response: Response, db: Session = Depends(get_db)) -> ApiResponse:
    """
    Retrieve all notifications for a specific user.
    
    Parameters:
    - **user_id**: The ID of the user whose notifications are being retrieved
    
    Returns:
    - **200 OK**: Returns list of notifications
    - **400 Bad Request**: If user_id is invalid
    - **500 Internal Server Error**: If an unexpected error occurs
    """
    try:
        notifications = list_notifications_by_user(user_id, db)
        notification_list = []
        for notif in notifications:
            notification_dict = {
                "id": str(notif.id),
                "user_id": str(notif.user_id),
                "notif_type": notif.notif_type,
                "notif_string": notif.notif_string,
                "delete_flag": notif.delete_flag,
                "created_at": notif.created_at.isoformat() if notif.created_at else None,
                "updated_at": notif.updated_at.isoformat() if notif.updated_at else None
            }
        notification_list.append(notification_dict)
        return ApiResponse(data=notifications)
    except ValueError as e:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return ApiResponse(error=ErrMessage(message=str(e)))
    except Exception as e:
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return ApiResponse(error=ErrMessage(message=str(e)))

@router.delete("/{notification_id}", summary="Delete a notification", response_model=ApiResponse)
async def remove_notification(notification_id: str, response: Response, db: Session = Depends(get_db)) -> ApiResponse:
    """
    Delete a specific notification.
    
    Parameters:
    - **notification_id**: The ID of the notification to delete
    
    Returns:
    - **200 OK**: If successfully deleted
    - **404 Not Found**: If notification doesn't exist
    - **400 Bad Request**: If notification_id is invalid
    - **500 Internal Server Error**: If an unexpected error occurs
    """
    try:
        result = delete_notification(notification_id, db)
        if not result:
            response.status_code = status.HTTP_404_NOT_FOUND
            return ApiResponse(error=ErrMessage(message="Notification not found"))
        return ApiResponse(data={"success": True})
    except ValueError as e:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return ApiResponse(error=ErrMessage(message=str(e)))
    except Exception as e:
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return ApiResponse(error=ErrMessage(message=str(e)))