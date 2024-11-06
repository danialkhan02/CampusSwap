from backend.db_models.connection import Session
from backend.db_models.chat import ChatMessagesOrm
from backend.db_models.users import UsersOrm
from backend.models.chat import ChatMessage
from backend.models.user import User
from sqlalchemy import or_, and_
from typing import List
import uuid

from backend.models.provider import Provider


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

async def get_user_active_chats(user_id: str) -> List[ChatMessage]:
    """
    Get last message from each unique chat conversation.
    Returns the most recent message whether the user is sender or receiver.
    Conversations are unique based on participant pair, regardless of sender/receiver role.
    """
    with Session() as session:
        # Get all messages with latest timestamp first
        messages = session.query(
            ChatMessagesOrm
        ).filter(
            or_(
                ChatMessagesOrm.sender_id == user_id,
                ChatMessagesOrm.receiver_id == user_id
            ),
            ChatMessagesOrm.deleted_at.is_(None)
        ).order_by(ChatMessagesOrm.created_at.desc()).all()

        # Track unique conversations and keep only the latest message
        seen_conversations = set()
        latest_messages = {}

        for msg in messages:
            # Create a unique conversation identifier using sorted participant IDs
            conversation_pair = tuple(sorted([msg.sender_id, msg.receiver_id]))

            # Skip if we've already seen this conversation
            if conversation_pair in seen_conversations:
                continue

            seen_conversations.add(conversation_pair)

            # Get the other user's ID
            other_user_id = msg.receiver_id if msg.sender_id == user_id else msg.sender_id

            # Get user details
            sender = session.query(UsersOrm).filter(UsersOrm.id == msg.sender_id).first()
            receiver = session.query(UsersOrm).filter(UsersOrm.id == msg.receiver_id).first()

            # Convert to User models
            sender_user = User(
                id=str(sender.id),
                first_name=sender.first_name,
                last_name=sender.last_name,
                email=sender.email,
                stytch_id=sender.stytch_id,
                profile_image_url=sender.profile_image_url,
                provider=Provider.OAUTH_AUTHENTICATION_TYPE_MICROSOFT
            )

            receiver_user = User(
                id=str(receiver.id),
                first_name=receiver.first_name,
                last_name=receiver.last_name,
                email=receiver.email,
                stytch_id=receiver.stytch_id,
                profile_image_url=receiver.profile_image_url,
                provider=Provider.OAUTH_AUTHENTICATION_TYPE_MICROSOFT
            )

            latest_messages[other_user_id] = ChatMessage(
                id=msg.id,
                sender_id=msg.sender_id,
                receiver_id=msg.receiver_id,
                sender=sender_user,
                receiver=receiver_user,
                message=msg.message,
                timestamp=msg.created_at,
                read=msg.read
            )

        return list(latest_messages.values())