import uuid as uuid_pkg
import logging
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from backend.db_models.connection import Session as DefaultSession
from backend.db_models.seller_feedbacks import SellerFeedbackOrm
from backend.models.seller_feedback import SellerFeedback, SellerFeedbackInDB

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
        feedback = session.query(SellerFeedbackOrm).filter(SellerFeedbackOrm.id == uuid_obj).first()
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

def update_seller_feedback(feedback_id: str, updated_feedback: SellerFeedback, db: Session = None):
    if not feedback_id:
        logger.error("Invalid input: feedback_id is missing")
        raise ValueError("Feedback ID is required")

    session = db or DefaultSession()
    try:
        uuid_obj = uuid_pkg.UUID(feedback_id)
        feedback = session.query(SellerFeedbackOrm).filter(SellerFeedbackOrm.id == uuid_obj).first()
        if feedback:
            for key, value in updated_feedback.model_dump(exclude_unset=True).items():
                setattr(feedback, key, value)
            session.commit()
            logger.info(f"Seller feedback updated successfully: {feedback_id}")
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

def delete_seller_feedback(feedback_id: str, db: Session = None):
    if not feedback_id:
        logger.error("Invalid input: feedback_id is missing")
        raise ValueError("Feedback ID is required")

    session = db or DefaultSession()
    try:
        uuid_obj = uuid_pkg.UUID(feedback_id)
        feedback = session.query(SellerFeedbackOrm).filter(SellerFeedbackOrm.id == uuid_obj).first()
        if feedback:
            session.delete(feedback)
            session.commit()
            logger.info(f"Seller feedback deleted successfully: {feedback_id}")
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
        feedbacks = session.query(SellerFeedbackOrm).filter(SellerFeedbackOrm.seller_id == uuid_obj).all()
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
        feedbacks = session.query(SellerFeedbackOrm).filter(SellerFeedbackOrm.buyer_id == uuid_obj).all()
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