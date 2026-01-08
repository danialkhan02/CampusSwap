from datetime import datetime
from uuid import UUID
from fastapi import WebSocket
from typing import Dict, Set, Any
import logging

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        """Connect a user's WebSocket connection"""
        try:
            await websocket.accept()
            if user_id not in self.active_connections:
                self.active_connections[user_id] = set()
            self.active_connections[user_id].add(websocket)
            logger.info(f"User {user_id} connected. Total connections: {len(self.active_connections[user_id])}")
        except Exception as e:
            logger.error(f"Error connecting user {user_id}: {str(e)}")
            await self.disconnect(websocket, user_id)
            raise

    async def disconnect(self, websocket: WebSocket, user_id: str):
        """Disconnect a user's WebSocket connection"""
        try:
            if user_id in self.active_connections:
                self.active_connections[user_id].discard(websocket)
                if not self.active_connections[user_id]:
                    del self.active_connections[user_id]
                logger.info(f"User {user_id} disconnected")

            try:
                await websocket.close()
            except Exception:
                pass  # WebSocket might already be closed
        except Exception as e:
            logger.error(f"Error disconnecting user {user_id}: {str(e)}")

    async def send_personal_message(self, message: Dict[str, Any], user_id: str):
        """Send a message to a specific user"""
        if user_id not in self.active_connections:
            return

        message_copy = self._prepare_message(message)
        websockets = self.active_connections[user_id].copy()

        for websocket in websockets:
            try:
                await websocket.send_json(message_copy)
            except Exception as e:
                logger.error(f"Error sending message to user {user_id}: {str(e)}")
                await self.disconnect(websocket, user_id)

    def _prepare_message(self, message: dict) -> dict:
        """Convert UUID and datetime objects to strings in the message"""
        def convert_value(obj):
            if isinstance(obj, UUID):
                return str(obj)
            if isinstance(obj, datetime):
                return obj.isoformat()
            if isinstance(obj, dict):
                return {k: convert_value(v) for k, v in obj.items()}
            if isinstance(obj, list):
                return [convert_value(item) for item in obj]
            return obj

        return {k: convert_value(v) for k, v in message.items()}

    def get_connected_users(self) -> Set[str]:
        """Get all currently connected user IDs"""
        return set(self.active_connections.keys())

# Create a single instance to be imported
manager = ConnectionManager()