import uuid as uuid_pkg
import logging
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from backend.db_models.notifications import NotificationsOrm
from backend.db_models.connection import Session as DefaultSession
from backend.models.notification import Notification

logger = logging.getLogger(__name__)

def create_notification(notification: Notification, db: Session = None):
    if not notification:
        logger.error("Invalid input: notification data is missing")
        raise ValueError("Notification data is required")

    session = db or DefaultSession()
    try:
        new_notification = NotificationsOrm(
            id=uuid_pkg.uuid4(),
            user_id=notification.user_id,
            notif_type=notification.notif_type,
            notif_string=notification.notif_string
        )
        session.add(new_notification)
        session.commit()
        logger.info(f"Notification created successfully: {new_notification.id}")
        return {"notification_id": str(new_notification.id)}
    except SQLAlchemyError as e:
        session.rollback()
        logger.error(f"Database error while creating notification: {str(e)}")
        raise
    finally:
        if not db:
            session.close()

def get_notification(notification_id: str, db: Session = None):
    if not notification_id:
        logger.error("Invalid input: notification_id is missing")
        raise ValueError("Notification ID is required")

    # check if notification_id is a valid UUID
    try:
        uuid_obj = uuid_pkg.UUID(notification_id)
    except ValueError:
        logger.error(f"Invalid UUID: {notification_id}")
        raise ValueError(f"Invalid notification ID format: {notification_id}")

    session = db or DefaultSession()
    try:
        uuid_obj = uuid_pkg.UUID(notification_id)
        notification = session.query(NotificationsOrm).filter(NotificationsOrm.id == uuid_obj).first()
        if not notification:
            logger.warning(f"Notification not found: {notification_id}")
        return notification
    except ValueError:
        logger.error(f"Invalid UUID: {notification_id}")
        raise ValueError(f"Invalid notification ID format: {notification_id}")
    except SQLAlchemyError as e:
        logger.error(f"Database error while retrieving notification {notification_id}: {str(e)}")
        raise
    finally:
        if not db:
            session.close()

def delete_notification(notification_id: str, db: Session = None):
    if not notification_id:
        logger.error("Invalid input: notification_id is missing")
        raise ValueError("Notification ID is required")
    
    # check if notification_id is a valid UUID
    try:
        uuid_obj = uuid_pkg.UUID(notification_id)
    except ValueError:
        logger.error(f"Invalid UUID: {notification_id}")
        raise ValueError(f"Invalid notification ID format: {notification_id}")

    session = db or DefaultSession()
    try:
        uuid_obj = uuid_pkg.UUID(notification_id)
        notification = session.query(NotificationsOrm).filter(NotificationsOrm.id == uuid_obj).first()
        if notification:
            session.delete(notification)
            session.commit()
            logger.info(f"Notification deleted successfully: {notification_id}")
            return True
        else:
            logger.warning(f"Notification not found for deletion: {notification_id}")
            return False
    except ValueError:
        logger.error(f"Invalid UUID: {notification_id}")
        raise ValueError(f"Invalid notification ID format: {notification_id}")
    except SQLAlchemyError as e:
        session.rollback()
        logger.error(f"Database error while deleting notification {notification_id}: {str(e)}")
        raise
    finally:
        if not db:
            session.close()

def list_notifications(db: Session = None):
    session = db or DefaultSession()
    try:
        notifications = session.query(NotificationsOrm).all()
        logger.info(f"Retrieved {len(notifications)} notifications")
        return notifications
    except SQLAlchemyError as e:
        logger.error(f"Database error while listing notifications: {str(e)}")
        raise
    finally:
        if not db:
            session.close()

# list notifications by user_id
def list_notifications_by_user(user_id: str, db: Session = None):
    if not user_id:
        logger.error("Invalid input: user_id is missing")
        raise ValueError("User ID is required")

    # Check if user_id is a valid UUID
    try:
        uuid_obj = uuid_pkg.UUID(user_id)  # Convert to UUID
    except ValueError:
        logger.error(f"Invalid UUID: {user_id}")
        raise ValueError(f"Invalid user ID format: {user_id}")

    session = db or DefaultSession()
    try:
        # Use the UUID object in the query
        notifications = session.query(NotificationsOrm).filter(NotificationsOrm.user_id == uuid_obj).all()
        logger.info(f"Retrieved {len(notifications)} notifications for user {user_id}")
        return notifications
    except SQLAlchemyError as e:
        logger.error(f"Database error while listing notifications for user {user_id}: {str(e)}")
        raise
    finally:
        if not db:
            session.close()