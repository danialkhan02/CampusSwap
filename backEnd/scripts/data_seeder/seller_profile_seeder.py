import random
from sqlalchemy.orm import Session
from backend.models.seller_profile import SellerProfile
from backend.db_interface.seller_profiles import create_seller_profile
from backend.db_models.users import UsersOrm
from backend.db_models.seller_feedbacks import SellerFeedbackOrm
from backend.db_models.seller_profiles import SellerProfileOrm
from .utils import logger

def seed_seller_profiles(session: Session, users: list[UsersOrm]) -> list[UsersOrm]:
    """Create seller profiles for 2 random users with initial values"""
    sellers = random.sample(users, 2)
    for seller in sellers:
        # Create if not exists
        profile = session.query(SellerProfileOrm).filter(
            SellerProfileOrm.seller_id == seller.id,
            SellerProfileOrm.deleted_at.is_(None)
        ).first()

        if not profile:
            profile = SellerProfile(
                num_listings=0,
                total_transactions=0,
                average_rating=0.0
            )
            create_seller_profile(profile, seller.id, session)
            logger.info(f"Created initial seller profile for user {seller.id}")
    return sellers

def update_seller_profiles(session: Session, sellers: list[UsersOrm]):
    """Update seller profiles with actual metrics from feedback"""
    for seller in sellers:
        # Merge seller with current session
        seller = session.merge(seller)
        
        # Get all feedback for this seller
        feedbacks = session.query(SellerFeedbackOrm).filter(
            SellerFeedbackOrm.seller_id == seller.id,
            SellerFeedbackOrm.deleted_at.is_(None)
        ).all()
        
        if feedbacks:
            # Calculate metrics
            total_transactions = len(feedbacks)
            average_rating = sum(f.rating for f in feedbacks) / total_transactions
            
            # Update seller profile
            profile = session.query(SellerProfileOrm).filter(
                SellerProfileOrm.seller_id == seller.id,
                SellerProfileOrm.deleted_at.is_(None)
            ).first()
            
            if profile:
                profile.total_transactions = total_transactions
                profile.average_rating = round(average_rating, 1)
                session.commit()
                logger.info(f"Updated seller profile metrics for seller {seller.id}")