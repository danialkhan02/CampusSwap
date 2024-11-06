import pytest
from unittest.mock import MagicMock, patch
from uuid import UUID
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.db_models.base import BaseDbModel
from backend.db_models.chat import ChatMessagesOrm, ChatProductInquiryOrm
from backend.db_models.users import UsersOrm
from backend.models.chat import ChatMessage
from backend.models.user import User
from backend.models.provider import Provider
from backend.enums import ChatMessageType
from backend.db_interface.chats import save_message

# Setup test database
@pytest.fixture(scope="function")
def test_db():
    engine = create_engine("sqlite:///:memory:")
    BaseDbModel.metadata.create_all(engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = TestingSessionLocal()
    yield db
    db.close()

@pytest.fixture
def mock_session():
    with patch('backend.db_interface.chats.Session') as mock:
        session_instance = MagicMock()
        mock.return_value.__enter__.return_value = session_instance
        yield session_instance

@pytest.fixture
def sample_chat_message():
    return ChatMessage(
        sender_id=UUID('12345678-1234-5678-1234-567812345678'),
        receiver_id=UUID('87654321-4321-8765-4321-876543210987'),
        message="Hello!",
        type=ChatMessageType.TEXT,
        read=False
    )

@pytest.mark.asyncio
async def test_save_message(mock_session, sample_chat_message):
    # Arrange
    db_message = ChatMessagesOrm(
        id=UUID('11111111-1111-1111-1111-111111111111'),
        sender_id=sample_chat_message.sender_id,
        receiver_id=sample_chat_message.receiver_id,
        message=sample_chat_message.message,
        type=sample_chat_message.type,
        read=False,
        created_at=datetime.now()
    )
    mock_session.add = MagicMock()
    mock_session.commit = MagicMock()
    mock_session.refresh = MagicMock(return_value=db_message)
    
    # Act
    result = await save_message(sample_chat_message)
    
    # Assert
    assert mock_session.add.called
    assert mock_session.commit.called
    assert str(result.sender_id) == str(sample_chat_message.sender_id)
    assert str(result.receiver_id) == str(sample_chat_message.receiver_id)
    assert result.message == sample_chat_message.message
    assert result.type == sample_chat_message.type

@pytest.mark.asyncio
async def test_save_message_with_product_inquiry(mock_session, sample_chat_message):
    # Arrange
    sample_chat_message.type = ChatMessageType.PRODUCT_INQUIRY
    sample_chat_message.product_inquiry_id = str(UUID('98765432-9876-5432-9876-987654321098'))
    mock_session.query.return_value.filter.return_value.first.return_value = MagicMock()