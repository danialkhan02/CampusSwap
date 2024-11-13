import json

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException, status
from typing import List
from backend.websocket.connection_manager import manager
from backend.db_interface.chats import save_message, get_chat_history, get_user_active_chats
from backend.models.chat import ChatMessage
from backend.api_responses import ApiResponse
import logging

logger = logging.getLogger(__name__)

router = APIRouter(
    tags=["chat"],
    responses={404: {"description": "Not found"}}
)



@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    """WebSocket endpoint for chat"""
    logger.info(f"New WebSocket connection request from user {user_id}")

    try:
        await manager.connect(websocket, user_id)

        while True:
            try:
                data = await websocket.receive_json()
                message = ChatMessage(**data)

                # Save message and get response with complete data
                saved_message = await save_message(message)

                if saved_message:  # Only send if it's not a system message
                    # Send to receiver
                    await manager.send_personal_message(
                        saved_message.dict(),
                        str(saved_message.receiver_id)
                    )

                    # Send confirmation back to sender
                    await manager.send_personal_message(
                        saved_message.dict(),
                        str(saved_message.sender_id)
                    )

            except WebSocketDisconnect:
                logger.info(f"WebSocket disconnected for user {user_id}")
                break
            except Exception as e:
                logger.error(f"Error processing message: {str(e)}")
                try:
                    await websocket.send_json({
                        "error": str(e),
                    })
                except:
                    break

    except Exception as e:
        logger.error(f"Error in websocket connection: {str(e)}")
    finally:
        await manager.disconnect(websocket, user_id)


@router.get(
    "/history/{user_id}/{other_user_id}",
    response_model=ApiResponse,
    summary="Get Chat History",
    description="Retrieves the chat history between two users"
)
async def get_messages(
        user_id: str,
        other_user_id: str
) -> ApiResponse:
    """
    Get chat history between two users
    """
    messages = await get_chat_history(user_id, other_user_id)
    return ApiResponse(data=messages)


@router.get(
    "/active/{user_id}",
    response_model=ApiResponse,
    summary="Get Active Chats",
    description="Retrieves all active chat sessions for a user"
)
async def get_active_chats(
        user_id: str
) -> ApiResponse:
    """
    Get all active chat sessions for a user
    """
    try:
        active_chats = await get_user_active_chats(user_id)
        return ApiResponse(data=active_chats)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )