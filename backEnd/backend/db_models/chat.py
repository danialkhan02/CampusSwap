from sqlalchemy import String, Boolean, ForeignKey, Enum
from sqlalchemy.orm import mapped_column, relationship, Mapped
from backend.db_models.base import BaseDbModel
from uuid import UUID
from backend.enums import ChatMessageType

class ChatMessagesOrm(BaseDbModel):
    __tablename__ = "chat_messages"
    
    sender_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    receiver_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    message: Mapped[str] = mapped_column(String, nullable=False)
    read: Mapped[bool] = mapped_column(Boolean, default=False)
    type: Mapped[ChatMessageType] = mapped_column(
        Enum(ChatMessageType, name="chatmessagetype", create_type=True, native_enum=True),
        nullable=False,
        server_default=ChatMessageType.TEXT.value
    )
    
    # Relationships
    sender = relationship("UsersOrm", foreign_keys=[sender_id])
    receiver = relationship("UsersOrm", foreign_keys=[receiver_id])
    
    # One to one relationship with chat product inquiry
    chat_product_inquiry = relationship("ChatProductInquiryOrm", back_populates="chat_message", uselist=False)

class ChatProductInquiryOrm(BaseDbModel):
    __tablename__ = "chat_product_inquiry"
    
    chat_message_id: Mapped[UUID] = mapped_column(ForeignKey("chat_messages.id"), nullable=False)
    product_id: Mapped[UUID] = mapped_column(ForeignKey("items.id"), nullable=False)

    # Relationships
    chat_message = relationship("ChatMessagesOrm", foreign_keys=[chat_message_id])
    product = relationship("ItemsOrm", foreign_keys=[product_id])
