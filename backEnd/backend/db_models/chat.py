from sqlalchemy import String, Boolean, ForeignKey
from sqlalchemy.orm import mapped_column, relationship, Mapped
from backend.db_models.base import BaseDbModel
from uuid import UUID

class ChatMessagesOrm(BaseDbModel):
    __tablename__ = "chat_messages"
    
    sender_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    receiver_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    message: Mapped[str] = mapped_column(String, nullable=False)
    read: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # Relationships
    sender = relationship("UsersOrm", foreign_keys=[sender_id])
    receiver = relationship("UsersOrm", foreign_keys=[receiver_id])
