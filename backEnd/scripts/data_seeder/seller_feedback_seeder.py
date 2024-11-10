import random
from sqlalchemy.orm import Session
from backend.models.seller_feedback import SellerFeedback
from backend.db_interface.seller_feedbacks import create_seller_feedback
from backend.db_models.users import UsersOrm
from .utils import fake, logger

def seed_seller_feedback(session: Session, sellers: list[UsersOrm], users: list[UsersOrm]):
    """Create feedback for sellers from random buyers"""
    for seller in sellers:
        num_feedbacks = random.randint(3, 8)
        buyers = random.choices([u for u in users if u.id != seller.id], k=num_feedbacks)
        
        for buyer in buyers:
            feedback = SellerFeedback(
                seller_id=seller.id,
                buyer_id=buyer.id,
                rating=random.randint(3, 5),
                feedback_message=fake.sentence(),
                verified_purchase=random.choice([True, False]),
                seller_response=fake.sentence() if random.random() > 0.5 else None
            )
            create_seller_feedback(feedback, session)
            logger.info(f"Created feedback from {buyer.id} for seller {seller.id}")