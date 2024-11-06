import pytest
import uuid as uuid_pkg
from unittest.mock import Mock, patch
from backend.models.notification import Notification
from backend.db_models.notifications import NotificationsOrm
from backend.db_models.users import UsersOrm

@pytest.fixture
def mock_db_session():
    session = Mock()
    return session

def test_create_notification(mock_db_session):
    user_id = uuid_pkg.uuid4()
    notification = Notification(
        user_id=user_id,
        notif_type="message",
        notif_string="This is a test notification."
    )

    # Mock UUID generation
    test_uuid = uuid_pkg.uuid4()
    with patch('uuid.uuid4', return_value=test_uuid):
        from backend.db_interface.notifications import create_notification
        result = create_notification(notification, mock_db_session)

        # Verify database operations
        mock_db_session.add.assert_called_once()
        mock_db_session.commit.assert_called_once()
        mock_db_session.close.assert_called_once()

        assert result == {"notification_id": str(test_uuid)}

def test_get_notification(mock_db_session):
    notification_id = str(uuid_pkg.uuid4())
    mock_notification = Mock(spec=NotificationsOrm)
    mock_notification.notif_type = "message"
    mock_notification.notif_string = "Test notification"
    mock_notification.user_id = uuid_pkg.uuid4()
    
    mock_db_session.query.return_value.filter.return_value.first.return_value = mock_notification
    
    from backend.db_interface.notifications import get_notification
    result = get_notification(notification_id, mock_db_session)
    
    mock_db_session.query.assert_called_once_with(NotificationsOrm)
    assert result == mock_notification

def test_get_notification_invalid_id(mock_db_session):
    from backend.db_interface.notifications import get_notification
    with pytest.raises(ValueError, match="Invalid notification ID format"):
        get_notification("invalid-uuid", mock_db_session)

def test_delete_notification(mock_db_session):
    notification_id = str(uuid_pkg.uuid4())
    mock_notification = Mock(spec=NotificationsOrm)
    
    mock_db_session.query.return_value.filter.return_value.first.return_value = mock_notification
    
    from backend.db_interface.notifications import delete_notification
    result = delete_notification(notification_id, mock_db_session)
    
    mock_db_session.query.assert_called_once_with(NotificationsOrm)
    mock_db_session.delete.assert_called_once_with(mock_notification)
    mock_db_session.commit.assert_called_once()
    assert result is True

def test_delete_notification_not_found(mock_db_session):
    notification_id = str(uuid_pkg.uuid4())
    mock_db_session.query.return_value.filter.return_value.first.return_value = None
    
    from backend.db_interface.notifications import delete_notification
    result = delete_notification(notification_id, mock_db_session)
    
    assert result is False

def test_list_notifications(mock_db_session):
    mock_notifications = [
        Mock(spec=NotificationsOrm, notif_type="message", notif_string="Notification 1"),
        Mock(spec=NotificationsOrm, notif_type="review", notif_string="Notification 2")
    ]
    mock_db_session.query.return_value.all.return_value = mock_notifications
    
    from backend.db_interface.notifications import list_notifications
    result = list_notifications(mock_db_session)
    
    mock_db_session.query.assert_called_once_with(NotificationsOrm)
    assert result == mock_notifications

def test_list_notifications_by_user(mock_db_session):
    user_id = str(uuid_pkg.uuid4())
    mock_notifications = [
        Mock(spec=NotificationsOrm, notif_type="message", notif_string="Notification 1"),
        Mock(spec=NotificationsOrm, notif_type="review", notif_string="Notification 2")
    ]
    mock_db_session.query.return_value.filter.return_value.order_by.return_value.all.return_value = mock_notifications
    
    from backend.db_interface.notifications import list_notifications_by_user
    result = list_notifications_by_user(user_id, mock_db_session)
    
    mock_db_session.query.assert_called_once_with(NotificationsOrm)
    assert result == mock_notifications

def test_list_notifications_by_user_invalid_id(mock_db_session):
    from backend.db_interface.notifications import list_notifications_by_user
    with pytest.raises(ValueError, match="Invalid user ID format"):
        list_notifications_by_user("invalid-uuid", mock_db_session)
