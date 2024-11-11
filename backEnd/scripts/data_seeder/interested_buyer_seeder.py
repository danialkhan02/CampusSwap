import random
import uuid
from sqlalchemy.orm import Session
from backend.db_models.items import interested_buyers
from backend.db_models.users import UsersOrm
from .utils import logger

def seed_interested_buyers(session: Session, item_ids: list[uuid.UUID], users: list[UsersOrm]):
    """Create interested buyers for items"""
    # Get all user IDs first
    user_ids = [user.id for user in session.query(UsersOrm.id).all()]
    
    for item_id in item_ids:
        # For each item, 1-3 users are interested
        num_interested = random.randint(1, 3)
        # Ensure we don't try to sample more than available
        num_interested = min(num_interested, len(user_ids))
        
        interested_user_ids = random.sample(user_ids, num_interested)
        
        for user_id in interested_user_ids:
            session.execute(
                interested_buyers.insert().values(
                    item_id=item_id,
                    user_id=user_id
                )
            )
            logger.info(f"Added interested buyer {user_id} for item {item_id}")
    
    session.commit()