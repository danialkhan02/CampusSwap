from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from backend.models.user import User
from uuid import UUID

class ChatMessage(BaseModel):
    id: Optional[UUID] = None
    sender_id: UUID
    receiver_id: UUID
    receiver: Optional[User] = None
    sender: Optional[User] = None
    message: str
    timestamp: Optional[datetime] = None
    read: Optional[bool] = False
