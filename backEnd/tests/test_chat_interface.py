import pytest
from unittest.mock import Mock, patch
import uuid as uuid_pkg
from datetime import datetime
from backend.models.chat import ChatMessage
from backend.enums import ChatMessageType
from backend.db_models.chat import ChatMessagesOrm, ChatProductInquiryOrm
from backend.db_models.items import ItemsOrm
from backend.db_models.users import UsersOrm

@pytest.fixture
def mock_db_session():
    with patch('backend.db_interface.chats.Session') as mock_session:
        session_instance = Mock()
        mock_session.return_value.__enter__.return_value = session_instance
        yield session_instance

@pytest.mark.asyncio
async def test_save_message(mock_db_session):
    message = ChatMessage(
        sender_id=uuid_pkg.uuid4(),
        receiver_id=uuid_pkg.uuid4(),
        message="Test message",
        type=ChatMessageType.TEXT
    )
    
    # Mock the created message
    mock_message = Mock(spec=ChatMessagesOrm)
    mock_message.id = uuid_pkg.uuid4()
    mock_message.created_at = datetime.now()
    mock_db_session.add = Mock()
    mock_db_session.commit = Mock()
    mock_db_session.refresh = Mock()
    
    # Mock the return value of refresh to set created_at
    def mock_refresh(obj):
        obj.created_at = datetime.now()
    mock_db_session.refresh.side_effect = mock_refresh
    
    test_uuid = uuid_pkg.uuid4()
    with patch('uuid.uuid4', return_value=test_uuid):
        from backend.db_interface.chats import save_message
        result = await save_message(message)
        
        mock_db_session.add.assert_called()
        mock_db_session.commit.assert_called_once()
        assert result.id == test_uuid

@pytest.mark.asyncio
async def test_save_message_with_product_inquiry(mock_db_session):
    message = ChatMessage(
        sender_id=uuid_pkg.uuid4(),
        receiver_id=uuid_pkg.uuid4(),
        message="Test product inquiry",
        type=ChatMessageType.PRODUCT_INQUIRY,
        product_inquiry_id=str(uuid_pkg.uuid4())
    )
    
    # Mock product query
    mock_product = Mock(spec=ItemsOrm)
    mock_db_session.query.return_value.filter.return_value.first.return_value = mock_product
    
    # Mock message and product inquiry
    mock_message = Mock(spec=ChatMessagesOrm)
    mock_message.id = uuid_pkg.uuid4()
    mock_message.created_at = datetime.now()
    
    mock_product_inquiry = Mock(spec=ChatProductInquiryOrm)
    mock_product_inquiry.product_id = message.product_inquiry_id
    
    mock_db_session.add = Mock()
    mock_db_session.commit = Mock()
    mock_db_session.refresh = Mock()
    
    # Mock the return value of refresh to set created_at
    def mock_refresh(obj):
        obj.created_at = datetime.now()
    mock_db_session.refresh.side_effect = mock_refresh
    
    test_uuid = uuid_pkg.uuid4()
    with patch('uuid.uuid4', return_value=test_uuid):
        from backend.db_interface.chats import save_message
        result = await save_message(message)
        
        mock_db_session.add.assert_called()
        mock_db_session.commit.assert_called_once()
        assert result.type == ChatMessageType.PRODUCT_INQUIRY
        assert result.product_inquiry_id == message.product_inquiry_id

@pytest.mark.asyncio
async def test_get_chat_history(mock_db_session):
    user_id = str(uuid_pkg.uuid4())
    other_user_id = str(uuid_pkg.uuid4())
    test_uuid = uuid_pkg.uuid4()
    
    # Create mock messages with proper attributes, including `read` as a boolean
    mock_messages = [
        Mock(
            spec=ChatMessagesOrm,
            id=test_uuid,
            type=ChatMessageType.TEXT,
            message="Test message",
            sender_id=user_id,
            receiver_id=other_user_id,
            created_at=datetime.now(),
            read=True,  # Set `read` as a boolean
            sender=Mock(
                id=user_id,
                first_name="Test",
                last_name="User",
                email="test@example.com",
                profile_image_url="http://example.com/image.jpg",
                stytch_id="test_stytch_id"
            ),
            receiver=Mock(
                id=other_user_id,
                first_name="Other",
                last_name="User",
                email="other@example.com",
                profile_image_url="http://example.com/other.jpg",
                stytch_id="other_stytch_id"
            )
        )
    ]

    # Setup query chain for messages
    def query_side_effect(*args):
        if args[0] == ChatMessagesOrm:
            query = Mock()
            query.filter.return_value.order_by.return_value.all.return_value = mock_messages
            return query
        elif args[0] == ChatProductInquiryOrm:
            query = Mock()
            query.filter.return_value.first.return_value = None
            return query
        elif args[0] == UsersOrm:
            query = Mock()
            if mock_messages[0].sender_id == user_id:
                query.filter.return_value.first.return_value = mock_messages[0].sender
            else:
                query.filter.return_value.first.return_value = mock_messages[0].receiver
            return query
    mock_db_session.query.side_effect = query_side_effect

    from backend.db_interface.chats import get_chat_history
    result = await get_chat_history(user_id, other_user_id)
    
    assert len(result) == 1
    assert result[0].type == ChatMessageType.TEXT
    assert str(result[0].sender_id) == user_id
    assert str(result[0].receiver_id) == other_user_id

@pytest.mark.asyncio
async def test_get_user_active_chats(mock_db_session):
    user_id = str(uuid_pkg.uuid4())
    other_id = str(uuid_pkg.uuid4())
    test_uuid = uuid_pkg.uuid4()
    
    # Create mock sender and receiver
    mock_sender = Mock(
        spec=UsersOrm,
        id=user_id,
        first_name="Test",
        last_name="User",
        email="test@example.com",
        profile_image_url="http://example.com/image.jpg",
        stytch_id="test_stytch_id"
    )
    
    mock_receiver = Mock(
        spec=UsersOrm,
        id=other_id,
        first_name="Other",
        last_name="User",
        email="other@example.com",
        profile_image_url="http://example.com/other.jpg",
        stytch_id="other_stytch_id"
    )
    
    # Create mock messages
    mock_messages = [
        Mock(
            spec=ChatMessagesOrm,
            id=test_uuid,
            message="Test message",
            sender_id=user_id,
            receiver_id=other_id,
            created_at=datetime.now(),
            deleted_at=None,
            type=ChatMessageType.TEXT,
            read=False
        )
    ]
    
    # Setup query chain
    def query_side_effect(*args):
        if args[0] == ChatMessagesOrm:
            query = Mock()
            query.filter.return_value.order_by.return_value.all.return_value = mock_messages
            return query
        elif args[0] == UsersOrm:
            query = Mock()
            def filter_side_effect(*args):
                filter_mock = Mock()
                def first_side_effect():
                    # Extract the ID from the SQLAlchemy filter condition
                    condition = args[0]
                    if hasattr(condition, 'right'):
                        id_to_find = condition.right.value
                        if id_to_find == user_id:
                            return mock_sender
                        elif id_to_find == other_id:
                            return mock_receiver
                    return None
                filter_mock.first = first_side_effect
                return filter_mock
            query.filter = filter_side_effect
            return query
    mock_db_session.query.side_effect = query_side_effect
    
    # Mock the attribute access for sender and receiver
    mock_messages[0].sender = mock_sender
    mock_messages[0].receiver = mock_receiver
    
    from backend.db_interface.chats import get_user_active_chats
    result = await get_user_active_chats(user_id)
    
    assert len(result) == 1
    assert str(result[0].sender_id) == user_id
    assert str(result[0].receiver_id) == other_id
    assert result[0].sender.first_name == "Test"
    assert result[0].receiver.first_name == "Other"
