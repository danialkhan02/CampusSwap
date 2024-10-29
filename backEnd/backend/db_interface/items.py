import uuid as uuid_pkg
import logging
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from backend.db_models.connection import Session as DefaultSession
from backend.db_models.items import ItemsOrm
from backend.db_models.item_images import ItemImagesOrm
from backend.db_models.users import UsersOrm
from backend.models.item import Item
from sqlalchemy.sql import func
from backend.db_models.items import interested_buyers
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
            lister_id=item.lister_id,
            price=item.price,
            category=item.category,
            **location_data
        )
        session.add(new_item)

        # Handle images
        for image in item.images:
            new_image = ItemImagesOrm(
                item_id=new_item_id,
                image_data=image  # Store the image string directly
            )
            session.add(new_image)

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
        item = session.query(ItemsOrm).filter(ItemsOrm.id == uuid_obj and 
                                              ItemsOrm.deleted_at.is_(None)).first()
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
        items = session.query(ItemsOrm).filter(ItemsOrm.lister_id == uuid_obj and 
                                              ItemsOrm.deleted_at.is_(None)).all()
        logger.info(f"Retrieved {len(items)} items for user {user_id}")
        return items
    except SQLAlchemyError as e:
        logger.error(f"Database error while retrieving items for user {user_id}: {str(e)}")
        raise
    finally:
        if not db:
            session.close()

def update_item(item_id: str, updated_item: Item, db: Session):
    existing_item = db.query(ItemsOrm).filter(ItemsOrm.id == uuid_pkg.UUID(item_id) and 
                                              ItemsOrm.lister_id == updated_item.lister_id and 
                                              ItemsOrm.deleted_at.is_(None)).first()
    if not existing_item:
        raise ValueError("Item not found")

    existing_item.name = updated_item.name
    existing_item.title = updated_item.title
    existing_item.description = updated_item.description
    existing_item.price = updated_item.price
    existing_item.latitude = updated_item.location.latitude
    existing_item.longitude = updated_item.location.longitude
    existing_item.address = updated_item.location.address
    existing_item.category = updated_item.category

    # Clear existing images
    existing_item.item_images.clear()

    # Add updated images
    for image in updated_item.images:
        new_image = ItemImagesOrm(
            item_id=existing_item.id,
            image_data=image
        )
        existing_item.item_images.append(new_image)

    db.commit()
    return existing_item

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
        item = session.query(ItemsOrm).filter(ItemsOrm.id == uuid_obj and 
                                              ItemsOrm.deleted_at.is_(None)).first()
        if item:
            # Set the deleted_at timestamp for the item
            item.deleted_at = func.now()
            # Soft delete related images
            for image in item.item_images:
                image.deleted_at = func.now()

            # Soft delete interested buyers
            session.query(interested_buyers).filter(
                interested_buyers.c.item_id == uuid_obj
            ).update({"deleted_at": func.now()})

            session.commit()
            logger.info(f"Item soft deleted successfully: {item_id}")
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
        items = session.query(ItemsOrm).filter(ItemsOrm.deleted_at.is_(None)).all()
        logger.info(f"Retrieved {len(items)} items")
        return items
    except SQLAlchemyError as e:
        logger.error(f"Database error while listing items: {str(e)}")
        raise
    finally:
        if not db:
            session.close()

def add_interested_buyer(item_id: str, user_id: str, db: Session = None):
    if not item_id or not user_id:
        logger.error("Invalid input: item_id and user_id are required")
        raise ValueError("Item ID and User ID are required")

    try:
        item_uuid = uuid_pkg.UUID(item_id)
        user_uuid = uuid_pkg.UUID(user_id)
    except ValueError as e:
        logger.error(f"Invalid UUID format: {str(e)}")
        raise ValueError("Invalid ID format")

    session = db or DefaultSession()
    try:
        item = session.query(ItemsOrm).filter(ItemsOrm.id == item_uuid and 
                                              ItemsOrm.deleted_at.is_(None)).first()
        user = session.query(UsersOrm).filter(UsersOrm.id == user_uuid and 
                                              UsersOrm.deleted_at.is_(None)).first()

        if not item or not user:
            logger.warning("Item or user not found")
            return False

        if user in item.interested_buyers:
            logger.info(f"User {user_id} is already interested in item {item_id}")
            return False

        item.interested_buyers.append(user)
        session.commit()
        logger.info(f"Added user {user_id} as interested buyer for item {item_id}")
        return True
    except SQLAlchemyError as e:
        session.rollback()
        logger.error(f"Database error while adding interested buyer: {str(e)}")
        raise
    finally:
        if not db:
            session.close()