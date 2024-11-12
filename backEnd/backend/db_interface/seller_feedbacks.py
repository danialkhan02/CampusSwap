import uuid as uuid_pkg
import logging
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from backend.db_models.connection import Session as DefaultSession
from backend.db_models.seller_feedbacks import SellerFeedbackOrm
from backend.db_models.seller_profiles import SellerProfileOrm
from backend.models.seller_feedback import SellerFeedback
from datetime import datetime

logger = logging.getLogger(__name__)

def create_seller_feedback(feedback: SellerFeedback, db: Session = None):
    if not feedback:
        logger.error("Invalid input: feedback data is missing")
        raise ValueError("Feedback data is required")

    new_feedback_id = uuid_pkg.uuid4()
    session = db or DefaultSession()
    try:
        new_feedback = SellerFeedbackOrm(
            id=new_feedback_id,
            seller_id=feedback.seller_id,
            buyer_id=feedback.buyer_id,
            rating=feedback.rating,
            feedback_message=feedback.feedback_message,
            verified_purchase=feedback.verified_purchase,
            seller_response=feedback.seller_response
        )
        session.add(new_feedback)
        session.commit()
        logger.info(f"Seller feedback created successfully: {new_feedback_id}")

        # Update the average rating for the seller
        update_seller_average_rating(feedback.seller_id, db)

        return {"feedback_id": str(new_feedback_id)}
    except SQLAlchemyError as e:
        session.rollback()
        logger.error(f"Database error while creating seller feedback: {str(e)}")
        raise
    finally:
        if not db:
            session.close()

def get_seller_feedback(feedback_id: str, db: Session = None):
    if not feedback_id:
        logger.error("Invalid input: feedback_id is missing")
        raise ValueError("Feedback ID is required")

    session = db or DefaultSession()
    try:
        uuid_obj = uuid_pkg.UUID(feedback_id)
        feedback = session.query(SellerFeedbackOrm).filter(SellerFeedbackOrm.id == uuid_obj, SellerFeedbackOrm.deleted_at == None).first()
        if not feedback:
            logger.warning(f"Seller feedback not found: {feedback_id}")
        return feedback
    except ValueError:
        logger.error(f"Invalid UUID: {feedback_id}")
        raise ValueError(f"Invalid feedback ID format: {feedback_id}")
    except SQLAlchemyError as e:
        logger.error(f"Database error while retrieving seller feedback {feedback_id}: {str(e)}")
        raise
    finally:
        if not db:
            session.close()

def get_number_of_ratings(seller_id: str, db: Session = None):
    session = db or DefaultSession()
    try:
        ratings_count = {
            5: 0,
            4: 0,
            3: 0,
            2: 0,
            1: 0
        }
        
        feedbacks = session.query(SellerFeedbackOrm).filter(
            SellerFeedbackOrm.seller_id == seller_id,
            SellerFeedbackOrm.deleted_at == None
        ).all()
        
        for feedback in feedbacks:
            if feedback.rating in ratings_count:
                ratings_count[feedback.rating] += 1
        
        logger.info(f"Retrieved ratings count for seller {seller_id}")
        return ratings_count
    except SQLAlchemyError as e:
        logger.error(f"Database error while getting ratings count for seller {seller_id}: {str(e)}")
        raise
    finally:
        if not db:
            session.close()

def update_seller_feedback(feedback_id: str, updated_feedback: SellerFeedback, db: Session = None):
    if not feedback_id:
        logger.error("Invalid input: feedback_id is missing")
        raise ValueError("Feedback ID is required")

    session = db or DefaultSession()
    try:
        uuid_obj = uuid_pkg.UUID(feedback_id)
        feedback = session.query(SellerFeedbackOrm).filter(SellerFeedbackOrm.id == uuid_obj, SellerFeedbackOrm.deleted_at == None).first()
        if feedback:
            for key, value in updated_feedback.model_dump(exclude_unset=True).items():
                setattr(feedback, key, value)
            session.commit()
            logger.info(f"Seller feedback updated successfully: {feedback_id}")

            # Update the average rating for the seller
            update_seller_average_rating(feedback.seller_id, db)

            return feedback
        else:
            logger.warning(f"Seller feedback not found for update: {feedback_id}")
            return None
    except ValueError:
        logger.error(f"Invalid UUID: {feedback_id}")
        raise ValueError(f"Invalid feedback ID format: {feedback_id}")
    except SQLAlchemyError as e:
        session.rollback()
        logger.error(f"Database error while updating seller feedback {feedback_id}: {str(e)}")
        raise
    finally:
        if not db:
            session.close()

def update_seller_average_rating(seller_id: str, db: Session) -> None:
    """Update the seller's average rating based on all their active feedbacks."""
    try:
        # Get all active feedbacks for the seller
        feedbacks = db.query(SellerFeedbackOrm).filter(
            SellerFeedbackOrm.seller_id == seller_id,
            SellerFeedbackOrm.deleted_at == None
        ).all()
        
        # Calculate new average rating
        if not feedbacks:
            new_average = 0.0
        else:
            total_rating = sum(feedback.rating for feedback in feedbacks)
            new_average = round(total_rating / len(feedbacks), 2)
        
        # Update seller profile
        seller_profile = db.query(SellerProfileOrm).filter(
            SellerProfileOrm.seller_id == seller_id,
            SellerProfileOrm.deleted_at == None
        ).first()
        
        if seller_profile:
            seller_profile.average_rating = new_average
            db.commit()
            logger.info(f"Updated average rating for seller {seller_id} to {new_average}")
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Database error while updating seller average rating: {str(e)}")
        raise

def delete_seller_feedback(feedback_id: str, db: Session = None):
    if not feedback_id:
        logger.error("Invalid input: feedback_id is missing")
        raise ValueError("Feedback ID is required")

    session = db or DefaultSession()
    try:
        uuid_obj = uuid_pkg.UUID(feedback_id)
        feedback = session.query(SellerFeedbackOrm).filter(SellerFeedbackOrm.id == uuid_obj, SellerFeedbackOrm.deleted_at == None).first()
        if feedback:
            feedback.deleted_at = datetime.now()
            session.commit()
            logger.info(f"Seller feedback deleted successfully: {feedback_id}")

            # Update the average rating for the seller
            update_seller_average_rating(feedback.seller_id, db)

            return True
        else:
            logger.warning(f"Seller feedback not found for deletion: {feedback_id}")
            return False
    except ValueError:
        logger.error(f"Invalid UUID: {feedback_id}")
        raise ValueError(f"Invalid feedback ID format: {feedback_id}")
    except SQLAlchemyError as e:
        session.rollback()
        logger.error(f"Database error while deleting seller feedback {feedback_id}: {str(e)}")
        raise
    finally:
        if not db:
            session.close()

def list_seller_feedbacks(seller_id: str, db: Session = None):
    if not seller_id:
        logger.error("Invalid input: seller_id is missing")
        raise ValueError("Seller ID is required")

    session = db or DefaultSession()
    try:
        uuid_obj = uuid_pkg.UUID(seller_id)
        feedbacks = session.query(SellerFeedbackOrm).filter(SellerFeedbackOrm.seller_id == uuid_obj, SellerFeedbackOrm.deleted_at == None).all()
        logger.info(f"Retrieved {len(feedbacks)} feedbacks for seller {seller_id}")
        return feedbacks
    except ValueError:
        logger.error(f"Invalid UUID: {seller_id}")
        raise ValueError(f"Invalid seller ID format: {seller_id}")
    except SQLAlchemyError as e:
        logger.error(f"Database error while listing seller feedbacks for seller {seller_id}: {str(e)}")
        raise
    finally:
        if not db:
            session.close()

def list_seller_feedbacks_by_buyer(buyer_id: str, db: Session = None):
    if not buyer_id:
        logger.error("Invalid input: buyer_id is missing")
        raise ValueError("Buyer ID is required")

    session = db or DefaultSession()
    try:
        uuid_obj = uuid_pkg.UUID(buyer_id)
        feedbacks = session.query(SellerFeedbackOrm).filter(SellerFeedbackOrm.buyer_id == uuid_obj, SellerFeedbackOrm.deleted_at == None).all()
        logger.info(f"Retrieved {len(feedbacks)} feedbacks for buyer {buyer_id}")
        return feedbacks
    except ValueError:
        logger.error(f"Invalid UUID: {buyer_id}")
        raise ValueError(f"Invalid buyer ID format: {buyer_id}")
    except SQLAlchemyError as e:
        logger.error(f"Database error while listing seller feedbacks for buyer {buyer_id}: {str(e)}")
        raise
    finally:
        if not db:
            session.close()