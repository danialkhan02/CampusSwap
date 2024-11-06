import pytest
import uuid as uuid_pkg
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.db_models.base import BaseDbModel
from backend.db_models.users import UsersOrm
from backend.db_interface.users import handle_insert_user, handle_update_user, handle_get_user
from backend.models.user import User, UpdateUser
from backend.models.provider import Provider
from backend.db_models.connection import Session as DefaultSession

@pytest.fixture(scope="function")
def test_db():
    engine = create_engine("sqlite:///:memory:")
    BaseDbModel.metadata.create_all(engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    DefaultSession.configure(bind=engine)
    db = TestingSessionLocal()
    
    yield db
    
    db.commit()
    db.close()

def test_insert_user(test_db):
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
    
    result = handle_insert_user(user)
    assert "user_id" in result
    assert isinstance(uuid_pkg.UUID(str(result["user_id"])), uuid_pkg.UUID)

def test_update_user(test_db):
    user = User(
        email="test2@example.com",
        first_name="Test",
        last_name="User",
        provider=Provider.OAUTH_AUTHENTICATION_TYPE_MICROSOFT,
        stytch_id="test_stytch_id",
        oauth_id="test_oauth_id"
    )
    
    result = handle_insert_user(user)
    user_id = result["user_id"]
    
    updated_data = UpdateUser(
        profile_image_url="http://example.com/new_image.jpg",
        phone_number="9876543210",
        description="Updated description",
        location="Vancouver, BC"
    )
    
    updated_user = handle_update_user(user_id, updated_data)
    assert updated_user is not None
    assert updated_user.profile_image_url == updated_data.profile_image_url
    assert updated_user.phone_number == updated_data.phone_number
    assert updated_user.description == updated_data.description
    assert updated_user.location == updated_data.location

def test_get_user(test_db):
    user = User(
        email="test3@example.com",
        first_name="Test",
        last_name="User",
        provider=Provider.OAUTH_AUTHENTICATION_TYPE_MICROSOFT,
        stytch_id="test_stytch_id",
        oauth_id="test_oauth_id"
    )
    
    result = handle_insert_user(user)
    user_id = result["user_id"]
    
    retrieved_user = handle_get_user(user_id)
    assert retrieved_user is not None
    assert retrieved_user.email == user.email
    assert retrieved_user.first_name == user.first_name
    assert retrieved_user.last_name == user.last_name

def test_update_user_not_found(test_db):
    non_existent_id = uuid_pkg.uuid4()
    updated_data = UpdateUser(
        description="Updated description"
    )
    result = handle_update_user(str(non_existent_id), updated_data)
    assert result is None

def test_update_user_invalid_id(test_db):
    with pytest.raises(ValueError, match="Invalid UUID format"):
        handle_update_user("invalid-uuid", UpdateUser())