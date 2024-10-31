import uuid as uuid_pkg
import logging
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from backend.db_models.connection import Session as DefaultSession
from backend.db_models.seller_profiles import SellerProfileOrm
from backend.models.seller_profile import SellerProfile
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

def create_seller_profile(seller_profile: SellerProfile, seller_id: uuid_pkg.UUID, db: Session = None):
    if not seller_profile:
        logger.error("Invalid input: seller profile data is missing")
        raise ValueError("Seller profile data is required")

    session = db or DefaultSession()
    try:
        new_profile = SellerProfileOrm(
            seller_id=seller_id,
            num_listings=seller_profile.num_listings,
            total_transactions=seller_profile.total_transactions,
            average_rating=seller_profile.average_rating
        )
        session.add(new_profile)
        session.commit()
        logger.info(f"Seller profile created successfully for seller: {seller_id}")
        return {"seller_id": str(seller_id)}
    except SQLAlchemyError as e:
        session.rollback()
        logger.error(f"Database error while creating seller profile: {str(e)}")
        raise
    finally:
        if not db:
            session.close()

def get_seller_profile(seller_id: uuid_pkg.UUID, db: Session = None):

    session = db or DefaultSession()
    try:
        profile = session.query(SellerProfileOrm).filter(
            SellerProfileOrm.seller_id == seller_id,
            SellerProfileOrm.deleted_at.is_(None)  # Only get non-deleted profiles
        ).first()
        if not profile:
            logger.warning(f"Seller profile not found: {seller_id}")
        return profile
    except SQLAlchemyError as e:
        logger.error(f"Database error while retrieving seller profile {seller_id}: {str(e)}")
        raise
    finally:
        if not db:
            session.close()

def update_seller_profile(seller_id: uuid_pkg.UUID, updated_profile: SellerProfile, db: Session = None):

    session = db or DefaultSession()
    try:
        profile = session.query(SellerProfileOrm).filter(
            SellerProfileOrm.seller_id == seller_id,
            SellerProfileOrm.deleted_at.is_(None)  # Only update non-deleted profiles
        ).first()
        if profile:
            for key, value in updated_profile.model_dump(exclude_unset=True).items():
                setattr(profile, key, value)
            session.commit()
            logger.info(f"Seller profile updated successfully: {seller_id}")
            return profile
        else:
            logger.warning(f"Seller profile not found for update: {seller_id}")
            return None
    except SQLAlchemyError as e:
        session.rollback()
        logger.error(f"Database error while updating seller profile {seller_id}: {str(e)}")
        raise
    finally:
        if not db:
            session.close()

def delete_seller_profile(seller_id: uuid_pkg.UUID, db: Session = None):

    session = db or DefaultSession()
    try:
        profile = session.query(SellerProfileOrm).filter(
            SellerProfileOrm.seller_id == seller_id,
            SellerProfileOrm.deleted_at.is_(None)
        ).first()
        if profile:
            # Soft delete
            profile.deleted_at = datetime.now(timezone.utc)
            session.commit()
            logger.info(f"Seller profile deleted successfully: {seller_id}")
            return True
        else:
            logger.warning(f"Seller profile not found for deletion: {seller_id}")
            return False
    except SQLAlchemyError as e:
        session.rollback()
        logger.error(f"Database error while deleting seller profile {seller_id}: {str(e)}")
        raise
    finally:
        if not db:
            session.close()