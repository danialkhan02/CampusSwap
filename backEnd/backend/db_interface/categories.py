import uuid as uuid_pkg
import logging
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from backend.db_models.connection import Session as DefaultSession
from backend.db_models.categories import CategoriesOrm
from backend.models.category import Category

logger = logging.getLogger(__name__)

def create_category(category: Category, db: Session = None):
    if not category:
        logger.error("Invalid input: category data is missing")
        raise ValueError("Category data is required")

    new_category_id = uuid_pkg.uuid4()
    session = db or DefaultSession()
    try:
        new_category = CategoriesOrm(
            id=new_category_id,
            title=category.title,
            description=category.description,
            image=category.image,
            lister_id=category.lister_id,
            price=category.price,
            location=category.location
        )
        session.add(new_category)
        session.commit()
        logger.info(f"Category created successfully: {new_category_id}")
        return {"category_id": str(new_category_id)}
    except SQLAlchemyError as e:
        session.rollback()
        logger.error(f"Database error while creating category: {str(e)}")
        raise
    finally:
        if not db:
            session.close()

def get_category(category_id: str, db: Session = None):
    if not category_id:
        logger.error("Invalid input: category_id is missing")
        raise ValueError("Category ID is required")

    try:
        uuid_obj = uuid_pkg.UUID(category_id)
    except ValueError:
        logger.error(f"Invalid UUID: {category_id}")
        raise ValueError(f"Invalid category ID format: {category_id}")

    session = db or DefaultSession()
    try:
        category = session.query(CategoriesOrm).filter(CategoriesOrm.id == uuid_obj).first()
        if not category:
            logger.warning(f"Category not found: {category_id}")
        return category
    except SQLAlchemyError as e:
        logger.error(f"Database error while retrieving category {category_id}: {str(e)}")
        raise
    finally:
        if not db:
            session.close()

def get_category_by_lister(user_id: str, db: Session = None):
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
        categories = session.query(CategoriesOrm).filter(CategoriesOrm.lister_id == uuid_obj).all()
        logger.info(f"Retrieved {len(categories)} categories for user {user_id}")
        return categories
    except SQLAlchemyError as e:
        logger.error(f"Database error while retrieving categories for user {user_id}: {str(e)}")
        raise
    finally:
        if not db:
            session.close()

def update_category(category_id: str, updated_category: Category, db: Session = None):
    if not category_id or not updated_category:
        logger.error("Invalid input: category_id or updated_category is missing")
        raise ValueError("Category ID and updated category data are required")

    try:
        uuid_obj = uuid_pkg.UUID(category_id)
    except ValueError:
        logger.error(f"Invalid UUID: {category_id}")
        raise ValueError(f"Invalid category ID format: {category_id}")

    session = db or DefaultSession()
    try:
        db_category = session.query(CategoriesOrm).filter(CategoriesOrm.id == uuid_obj).first()
        if not db_category:
            logger.warning(f"Category not found: {category_id}")
            return None

        update_data = updated_category.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            if hasattr(db_category, key):
                setattr(db_category, key, value)
            else:
                logger.warning(f"Attribute {key} not found in CategoriesOrm")

        session.commit()
        logger.info(f"Category updated successfully: {category_id}")
        return db_category
    except SQLAlchemyError as e:
        session.rollback()
        logger.error(f"Database error while updating category {category_id}: {str(e)}")
        raise
    finally:
        if not db:
            session.close()

def delete_category(category_id: str, db: Session = None):
    if not category_id:
        logger.error("Invalid input: category_id is missing")
        raise ValueError("Category ID is required")

    try:
        uuid_obj = uuid_pkg.UUID(category_id)
    except ValueError:
        logger.error(f"Invalid UUID: {category_id}")
        raise ValueError(f"Invalid category ID format: {category_id}")

    session = db or DefaultSession()
    try:
        category = session.query(CategoriesOrm).filter(CategoriesOrm.id == uuid_obj).first()
        if category:
            session.delete(category)
            session.commit()
            logger.info(f"Category deleted successfully: {category_id}")
            return True
        else:
            logger.warning(f"Category not found for deletion: {category_id}")
            return False
    except SQLAlchemyError as e:
        session.rollback()
        logger.error(f"Database error while deleting category {category_id}: {str(e)}")
        raise
    finally:
        if not db:
            session.close()

def list_categories(db: Session = None):
    session = db or DefaultSession()
    try:
        categories = session.query(CategoriesOrm).all()
        logger.info(f"Retrieved {len(categories)} categories")
        return categories
    except SQLAlchemyError as e:
        logger.error(f"Database error while listing categories: {str(e)}")
        raise
    finally:
        if not db:
            session.close()