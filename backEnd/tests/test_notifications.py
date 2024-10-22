import pytest
import uuid as uuid_pkg
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.db_models.base import BaseDbModel
from backend.db_models.users import UsersOrm
from backend.db_models.notifications import NotificationsOrm
from backend.db_interface.notifications import create_notification, get_notification, delete_notification, list_notifications, list_notifications_by_user
from backend.models.notification import Notification

# Setup test database
@pytest.fixture(scope="function")
def test_db():
    engine = create_engine("sqlite:///:memory:")
    BaseDbModel.metadata.create_all(engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = TestingSessionLocal()
    
    # Create a test user
    test_user = UsersOrm(
        email="test@example.com",
        first_name="Test",
        last_name="User",
        stytch_id="test_stytch_id"
    )
    db.add(test_user)
    db.commit()
    db.refresh(test_user)
    
    yield db, test_user.id
    db.close()

# Test create_notification
def test_create_notification(test_db):
    db, user_id = test_db
    notification = Notification(
        user_id=user_id,
        notif_type="message",
        notif_string="This is a test notification."
    )
    result = create_notification(notification, db)
    assert "notification_id" in result
    assert isinstance(uuid_pkg.UUID(result["notification_id"]), uuid_pkg.UUID)

    db_notification = db.query(NotificationsOrm).filter(NotificationsOrm.id == uuid_pkg.UUID(result["notification_id"])).first()
    assert db_notification is not None
    assert db_notification.notif_type == notification.notif_type
    assert db_notification.notif_string == notification.notif_string
    assert db_notification.user_id == notification.user_id

# Test get_notification with invalid ID
def test_get_notification_invalid_id(test_db):
    db, user_id = test_db
    with pytest.raises(ValueError, match="Invalid notification ID format"):
        get_notification("invalid-uuid", db)

# Test delete_notification with invalid ID
def test_delete_notification_invalid_id(test_db):
    db, user_id = test_db
    with pytest.raises(ValueError, match="Invalid notification ID format"):
        delete_notification("invalid-uuid", db)

# Test delete_notification that does not exist
def test_delete_notification_not_found(test_db):
    db, user_id = test_db
    notification_id = str(uuid_pkg.uuid4())  # Generate a random UUID
    delete_result = delete_notification(notification_id, db)
    assert delete_result is False  # Should return False since it doesn't exist

# Test list_notifications
def test_list_notifications(test_db):
    db, user_id = test_db
    notifications = [
        Notification(user_id=user_id, notif_type="message", notif_string="Notification 1"),
        Notification(user_id=user_id, notif_type="review", notif_string="Notification 2"),
        Notification(user_id=user_id, notif_type="message", notif_string="Notification 3"),
    ]
    for notification in notifications:
        create_notification(notification, db)

    listed_notifications = list_notifications(db)
    assert len(listed_notifications) == 3
    for i, notification in enumerate(listed_notifications):
        assert notification.notif_string == notifications[i].notif_string
        assert notification.notif_type == notifications[i].notif_type
        assert notification.user_id == notifications[i].user_id

# Test list_notifications_by_user
def test_list_notifications_by_user(test_db):
    db, user_id = test_db
    notifications = [
        Notification(user_id=user_id, notif_type="message", notif_string="Notification 1"),
        Notification(user_id=user_id, notif_type="review", notif_string="Notification 2"),
        Notification(user_id=user_id, notif_type="message", notif_string="Notification 3"),
    ]
    for notification in notifications:
        create_notification(notification, db)

    listed_notifications = list_notifications_by_user(str(user_id), db)  # Convert user_id to string
    assert len(listed_notifications) == 3
    for i, notification in enumerate(listed_notifications):
        assert notification.notif_string == notifications[i].notif_string
        assert notification.notif_type == notifications[i].notif_type
        assert notification.user_id == notifications[i].user_id