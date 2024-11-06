from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from backend.models.user import User
from backend.enums import ChatMessageType
from uuid import UUID
from backend.models.item import ItemSummary

class ChatMessage(BaseModel):
    id: Optional[UUID] = None
    sender_id: UUID
    receiver_id: UUID
    receiver: Optional[User] = None
    sender: Optional[User] = None
    message: str
    type: ChatMessageType
    product_inquiry_id: Optional[str] = None # id of the item listing
    product_inquiry: Optional[ItemSummary] = None
    timestamp: Optional[datetime] = None
    read: Optional[bool] = False
