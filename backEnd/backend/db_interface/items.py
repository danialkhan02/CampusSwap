import uuid as uuid_pkg
import logging
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from backend.db_models.connection import Session as DefaultSession
from backend.db_models.items import ItemsOrm
from backend.db_models.users import UsersOrm
from backend.models.item import Item

logger = logging.getLogger(__name__)

def create_item(item: Item, db: Session = None):
    if not item:
        logger.error("Invalid input: item data is missing")
        raise ValueError("Item data is required")

    new_item_id = uuid_pkg.uuid4()
    session = db or DefaultSession()
    try:
        location_data = {}
        if item.location:
            location_data = {
                "latitude": item.location.latitude,
                "longitude": item.location.longitude,
                "address": item.location.address
            }

        new_item = ItemsOrm(
            id=new_item_id,
            name=item.name,
            title=item.title,
            description=item.description,
            image=item.image,
            lister_id=item.lister_id,
            price=item.price,
            category=item.category,
            **location_data
        )
        session.add(new_item)
        session.commit()
        logger.info(f"Item created successfully: {new_item_id}")
        return {"item_id": str(new_item_id)}
    except SQLAlchemyError as e:
        session.rollback()
        logger.error(f"Database error while creating item: {str(e)}")
        raise
    finally:
        if not db:
            session.close()

def add_interested_buyer(item_id: str, buyer_id: str, db: Session = None):
    if not item_id or not buyer_id:
        logger.error("Invalid input: item_id and buyer_id are required")
        raise ValueError("Item ID and Buyer ID are required")

    try:
        item_uuid = uuid_pkg.UUID(item_id)
        buyer_uuid = uuid_pkg.UUID(buyer_id)
    except ValueError:
        logger.error("Invalid UUID format")
        raise ValueError("Invalid UUID format")

    session = db or DefaultSession()
    try:
        item = session.query(ItemsOrm).filter(ItemsOrm.id == item_uuid).first()
        if not item:
            logger.error(f"Item not found: {item_id}")
            return None

        buyer = session.query(UsersOrm).filter(UsersOrm.id == buyer_uuid).first()
        if not buyer:
            logger.error(f"Buyer not found: {buyer_id}")
            return None

        if buyer not in item.interested_buyers:
            item.interested_buyers.append(buyer)
            session.commit()
            logger.info(f"Added interested buyer {buyer_id} to item {item_id}")
            return True
        return False

    except SQLAlchemyError as e:
        session.rollback()
        logger.error(f"Database error while adding interested buyer: {str(e)}")
        raise
    finally:
        if not db:
            session.close()

def get_item(item_id: str, db: Session = None):
    if not item_id:
        logger.error("Invalid input: item_id is missing")
        raise ValueError("Item ID is required")

    try:
        uuid_obj = uuid_pkg.UUID(item_id)
    except ValueError:
        logger.error(f"Invalid UUID: {item_id}")
        raise ValueError(f"Invalid item ID format: {item_id}")

    session = db or DefaultSession()
    try:
        item = session.query(ItemsOrm).filter(ItemsOrm.id == uuid_obj).first()
        if not item:
            logger.warning(f"Item not found: {item_id}")
        return item
    except SQLAlchemyError as e:
        logger.error(f"Database error while retrieving item {item_id}: {str(e)}")
        raise
    finally:
        if not db:
            session.close()

def get_item_by_lister(user_id: str, db: Session = None):
    if not user_id:
        logger.error("Invalid input: user_id is missing")
        raise ValueError("User ID is required")

    try:
        uuid_obj = uuid_pkg.UUID(user_id)
    except ValueError:
        logger.error(f"Invalid UUID: {user_id}")
        raise ValueError(f"Invalid user ID format: {user_id}")

    session = db or DefaultSession()
    try:
        items = session.query(ItemsOrm).filter(ItemsOrm.lister_id == uuid_obj).all()
        logger.info(f"Retrieved {len(items)} items for user {user_id}")
        return items
    except SQLAlchemyError as e:
        logger.error(f"Database error while retrieving items for user {user_id}: {str(e)}")
        raise
    finally:
        if not db:
            session.close()

def update_item(item_id: str, updated_item: Item, db: Session = None):
    if not item_id or not updated_item:
        logger.error("Invalid input: item_id or updated_item is missing")
        raise ValueError("Item ID and updated item data are required")

    try:
        uuid_obj = uuid_pkg.UUID(item_id)
    except ValueError:
        logger.error(f"Invalid UUID: {item_id}")
        raise ValueError(f"Invalid item ID format: {item_id}")

    session = db or DefaultSession()
    try:
        db_item = session.query(ItemsOrm).filter(ItemsOrm.id == uuid_obj).first()
        if not db_item:
            logger.warning(f"Item not found: {item_id}")
            return None

        update_data = updated_item.model_dump(exclude_unset=True)
        
        # Handle location fields separately
        if 'location' in update_data:
            location = update_data.pop('location')
            if location:
                db_item.latitude = location['latitude']
                db_item.longitude = location['longitude']
                db_item.address = location['address']
            else:
                db_item.latitude = None
                db_item.longitude = None
                db_item.address = None

        # Update remaining fields
        for key, value in update_data.items():
            if hasattr(db_item, key):
                setattr(db_item, key, value)
            else:
                logger.warning(f"Attribute {key} not found in ItemsOrm")

        session.commit()
        logger.info(f"Item updated successfully: {item_id}")
        return db_item
    except SQLAlchemyError as e:
        session.rollback()
        logger.error(f"Database error while updating item {item_id}: {str(e)}")
        raise
    finally:
        if not db:
            session.close()

def delete_item(item_id: str, db: Session = None):
    if not item_id:
        logger.error("Invalid input: item_id is missing")
        raise ValueError("Item ID is required")

    try:
        uuid_obj = uuid_pkg.UUID(item_id)
    except ValueError:
        logger.error(f"Invalid UUID: {item_id}")
        raise ValueError(f"Invalid item ID format: {item_id}")

    session = db or DefaultSession()
    try:
        item = session.query(ItemsOrm).filter(ItemsOrm.id == uuid_obj).first()
        if item:
            session.delete(item)
            session.commit()
            logger.info(f"Item deleted successfully: {item_id}")
            return True
        else:
            logger.warning(f"Item not found for deletion: {item_id}")
            return False
    except SQLAlchemyError as e:
        session.rollback()
        logger.error(f"Database error while deleting item {item_id}: {str(e)}")
        raise
    finally:
        if not db:
            session.close()

def list_items(db: Session = None):
    session = db or DefaultSession()
    try:
        items = session.query(ItemsOrm).all()
        logger.info(f"Retrieved {len(items)} items")
        return items
    except SQLAlchemyError as e:
        logger.error(f"Database error while listing items: {str(e)}")
        raise
    finally:
        if not db:
            session.close()