from backend.db_models.connection import Session
from backend.db_models.chat import ChatMessagesOrm
from backend.models.chat import ChatMessage
from sqlalchemy import or_, and_
from typing import List
import uuid

async def save_message(message: ChatMessage) -> ChatMessage:
    """Save a chat message to the database"""
    with Session() as session:
        db_message = ChatMessagesOrm(
            id=uuid.uuid4(),
            sender_id=message.sender_id,
            receiver_id=message.receiver_id,
            message=message.message,
            read=False
        )
        session.add(db_message)
        session.commit()
        session.refresh(db_message)
        return ChatMessage(
            id=db_message.id,
            sender_id=db_message.sender_id,
            receiver_id=db_message.receiver_id,
            message=db_message.message,
            read=db_message.read,
            timestamp=db_message.created_at
        )

async def get_chat_history(user_id: str, other_user_id: str) -> List[ChatMessage]:
    """Get chat history between two users"""
    with Session() as session:
        messages = session.query(ChatMessagesOrm).filter(
            or_(
                and_(
                    ChatMessagesOrm.sender_id == user_id,
                    ChatMessagesOrm.receiver_id == other_user_id
                ),
                and_(
                    ChatMessagesOrm.sender_id == other_user_id,
                    ChatMessagesOrm.receiver_id == user_id
                )
            )
        ).order_by(ChatMessagesOrm.created_at).all()
        
        return [
            ChatMessage(
                id=msg.id,
                sender_id=msg.sender_id,
                receiver_id=msg.receiver_id,
                message=msg.message,
                read=msg.read,
                timestamp=msg.created_at
            ) for msg in messages
        ]

async def mark_messages_as_read(receiver_id: str, sender_id: str) -> None:
    """Mark all messages from sender to receiver as read"""
    with Session() as session:
        session.query(ChatMessagesOrm).filter(
            and_(
                ChatMessagesOrm.sender_id == sender_id,
                ChatMessagesOrm.receiver_id == receiver_id,
                ChatMessagesOrm.read == False
            )
        ).update({ChatMessagesOrm.read: True})
        session.commit()