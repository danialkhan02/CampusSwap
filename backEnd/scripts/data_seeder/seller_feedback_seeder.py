import random
import uuid
from sqlalchemy.orm import Session
from backend.models.seller_feedback import SellerFeedback
from backend.db_interface.seller_feedbacks import create_seller_feedback
from backend.db_models.users import UsersOrm
from .utils import fake, logger

def seed_seller_feedback(session: Session, sellers: list[UsersOrm], users: list[UsersOrm]):
    """Create feedback for sellers from random buyers (including other sellers)"""
    # Refresh the sellers list within the current session
    seller_ids = [session.merge(seller).id for seller in sellers]
    
    # Get all user IDs in a single query
    user_ids = [user_id for (user_id,) in session.query(UsersOrm.id).all()]
    
    for seller_id in seller_ids:
        # Generate 1-5 feedbacks per seller
        num_feedbacks = random.randint(1, 5)
        # Ensure we don't try to sample more than available
        num_feedbacks = min(num_feedbacks, len(user_ids) - 1)  # -1 to exclude self
        
        # Sample from all users except self
        potential_buyer_ids = [uid for uid in user_ids if uid != seller_id]
        selected_buyer_ids = random.sample(potential_buyer_ids, num_feedbacks)
        
        for buyer_id in selected_buyer_ids:
            feedback = SellerFeedback(
                rating=random.randint(1, 5),
                comment=fake.paragraph(),
                feedback_message=fake.sentence(),
                verified_purchase=random.choice([True, False]),
                seller_id=seller_id,
                buyer_id=buyer_id
            )
            
            create_seller_feedback(feedback, session)
            logger.info(f"Created feedback for seller {seller_id} from buyer {buyer_id}")