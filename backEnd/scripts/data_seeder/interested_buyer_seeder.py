import random
import uuid
from sqlalchemy.orm import Session
from backend.db_models.items import interested_buyers
from backend.db_models.users import UsersOrm
from .utils import logger

def seed_interested_buyers(session: Session, item_ids: list[uuid.UUID], users: list[UsersOrm]):
    """Randomly assign interested buyers to items"""
    for item_id in item_ids:
        num_interested = random.randint(0, 3)
        interested_user_ids = random.sample([u.id for u in users], num_interested)
        
        for user_id in interested_user_ids:
            session.execute(
                interested_buyers.insert().values(
                    item_id=item_id,
                    user_id=user_id
                )
            )
            logger.info(f"Added interested buyer {user_id} for item {item_id}")
    session.commit()