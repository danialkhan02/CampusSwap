import pytest
import uuid as uuid_pkg
from unittest.mock import Mock, patch
from backend.models.user import User, UpdateUser
from fastapi import Response
from backend.models.provider import Provider
from backend.db_interface.users import UsersOrm
from backend.api_responses import ApiResponse

#
# @pytest.mark.parametrize("email,should_succeed", [
#     ("test@mail.utoronto.ca", True),
#     ("test@utoronto.ca", True),
#     ("test@MAIL.UTORONTO.CA", True),
#     ("test@UTORONTO.CA", True),
#     ("test@gmail.com", False),
#     ("test@yahoo.com", False),
#     ("test@fake.utoronto.ca", False),
#     ("test@utoronto.ca", True),
#     ("test@mailutoronto.ca", False),
#     ("test@mail.utorontoca", False),
#     ("te2st@mail.utoronto.ca", True),
#
# ])
# @pytest.mark.asyncio
# async def test_email_domain_validation(mock_db_session, email, should_succeed):
#     # Mock Stytch client
#     mock_stytch_response = Mock()
#     mock_stytch_response.status_code = 200
#     mock_response = Response()  # Create FastAPI Response object
#
#     with patch('backend.api.routes.users.StytchClient.users.update', return_value=mock_stytch_response), \
#             patch('backend.api.routes.users.handle_insert_user') as mock_insert, \
#             patch('backend.api.routes.users.handle_get_user') as mock_get:
#
#         mock_insert.return_value = {"user_id": "test-id"}
#         mock_get.return_value = Mock(as_dict=lambda: {})
#
#         user = User(
#             email=email,
#             first_name="Test",
#             last_name="User",
#             provider=Provider.OAUTH_AUTHENTICATION_TYPE_MICROSOFT,
#             stytch_id="test_stytch_id",
#             oauth_id="test_oauth_id"
#         )
#
#         from backend.api.routes.users import add_user
#         result = await add_user(user, mock_response)
#
#         if should_succeed:
#             assert mock_response.status_code != 403
#             assert result.error is None
#         else:
#             assert mock_response.status_code == 403
#             assert result.error.message == "Only University of Toronto email addresses are allowed"


@pytest.fixture
def mock_db_session():
    with patch('backend.db_interface.users.DefaultSession') as mock_session:
        # Create a mock session instance
        session_instance = Mock()
        mock_session.return_value.__enter__.return_value = session_instance
        yield session_instance

def test_insert_user(mock_db_session):
    user = User(
        email="test1@example.com",
        first_name="Test",
        last_name="User",
        provider=Provider.OAUTH_AUTHENTICATION_TYPE_MICROSOFT,
        stytch_id="test_stytch_id",
        oauth_id="test_oauth_id",
        profile_image_url="http://example.com/image.jpg",
        phone_number="1234567890",
        description="Test description",
        location="Toronto, ON"
    )
    
    # Mock UUID generation
    test_uuid = uuid_pkg.uuid4()
    with patch('uuid.uuid4', return_value=test_uuid):
        from backend.db_interface.users import handle_insert_user
        result = handle_insert_user(user)
        
        # Verify the mock was called correctly
        mock_db_session.add.assert_called_once()
        mock_db_session.commit.assert_called_once()
        
        assert result == {"user_id": test_uuid}

def test_update_user(mock_db_session):
    user_id = uuid_pkg.uuid4()
    updated_data = UpdateUser(
        profile_image_url="http://example.com/new_image.jpg",
        phone_number="9876543210",
        description="Updated description",
        location="Vancouver, BC"
    )
    
    # Create mock user
    mock_user = Mock()
    
    # Setup the query chain
    mock_db_session.query.return_value.filter.return_value.first.return_value = mock_user
    
    from backend.db_interface.users import handle_update_user
    result = handle_update_user(str(user_id), updated_data)
    
    # Verify database operations
    mock_db_session.query.assert_called_once_with(UsersOrm)
    mock_db_session.commit.assert_called_once()
    mock_db_session.refresh.assert_called_once_with(mock_user)
    mock_db_session.close.assert_called_once()
    
    # Verify the user was updated correctly
    assert mock_user.profile_image_url == updated_data.profile_image_url
    assert mock_user.phone_number == updated_data.phone_number
    assert mock_user.description == updated_data.description
    assert mock_user.location == updated_data.location
    
    assert result == mock_user

def test_get_user(mock_db_session):
    user_id = uuid_pkg.uuid4()
    mock_user = Mock()
    mock_user.email = "test3@example.com"
    mock_user.first_name = "Test"
    mock_user.last_name = "User"
    
    mock_db_session.query.return_value.filter.return_value.first.return_value = mock_user
    
    from backend.db_interface.users import handle_get_user
    result = handle_get_user(str(user_id))
    
    assert result is not None
    assert result.email == mock_user.email
    assert result.first_name == mock_user.first_name
    assert result.last_name == mock_user.last_name

def test_update_user_not_found(mock_db_session):
    # Setup the query chain to return None
    query_mock = Mock()
    filter_mock = Mock()
    
    mock_db_session.query.return_value = query_mock
    query_mock.filter.return_value = filter_mock
    filter_mock.first.return_value = None
    
    from backend.db_interface.users import handle_update_user
    result = handle_update_user(str(uuid_pkg.uuid4()), UpdateUser(description="Updated description"))
    
    # Verify database operations
    mock_db_session.query.assert_called_once_with(UsersOrm)
    
    # Verify the result
    assert result is None

def test_update_user_invalid_id(mock_db_session):
    from backend.db_interface.users import handle_update_user
    with pytest.raises(ValueError, match="Invalid UUID format"):
        handle_update_user("invalid-uuid", UpdateUser())