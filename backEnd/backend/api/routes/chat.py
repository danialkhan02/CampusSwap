from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException, status
from typing import List
from backend.websocket.connection_manager import manager
from backend.db_interface.chats import save_message, get_chat_history
from backend.models.chat import ChatMessage
from backend.api_responses import ApiResponse

router = APIRouter(
    tags=["chat"],
    responses={404: {"description": "Not found"}}
)

@router.websocket("/ws/{user_id}")
async def websocket_endpoint(
    websocket: WebSocket, 
    user_id: str
):
    """
    WebSocket endpoint for real-time chat
    
    Parameters:
    - **user_id**: The ID of the user connecting to the chat
    """
    await manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_json()
            message = ChatMessage(**data)
            await save_message(message)
            await manager.send_personal_message(
                message.dict(),
                str(message.receiver_id)
            )
    except WebSocketDisconnect:
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

    Parameters:
    - **user_id**: ID of the first user
    - **other_user_id**: ID of the second user

    Returns:
    - List of chat messages between the two users
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

    Parameters:
    - **user_id**: ID of the user

    Returns:
    - List of active chat sessions
    """
    active_chats = manager.get_active_chats(user_id)
    return ApiResponse(data=active_chats)