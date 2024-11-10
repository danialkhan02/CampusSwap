import sys
from sqlalchemy.orm import Session
from backend.db_models.connection import Session as DefaultSession
from backend.db_models.users import UsersOrm
from backend.enums import ItemCategory

from .seller_profile_seeder import seed_seller_profiles, update_seller_profiles
from .item_seeder import seed_items
from .product_embedding_seeder import seed_product_embeddings
from .interested_buyer_seeder import seed_interested_buyers
from .seller_feedback_seeder import seed_seller_feedback
from .utils import logger

def seed_database(listings_per_category: int):
    session = DefaultSession()
    try:
        # Get existing users
        users = session.query(UsersOrm).all()
        if len(users) < 2:
            raise ValueError("Database must have at least 2 users before seeding")
        
        # 1. Create initial seller profiles
        sellers = seed_seller_profiles(session, users)
        
        # 2. Create items for each category
        total_listings = listings_per_category * len(ItemCategory)
        item_ids = seed_items(session, sellers, total_listings)
        
        # 3. Create product embeddings
        seed_product_embeddings(session, item_ids)
        
        # 4. Create interested buyers
        seed_interested_buyers(session, item_ids, users)
        
        # 5. Create seller feedback
        seed_seller_feedback(session, sellers, users)
        
        # 6. Update seller profiles with actual metrics
        update_seller_profiles(session, sellers)
        
        logger.info("Database seeding completed successfully")
        
    except Exception as e:
        logger.error(f"Error seeding database: {str(e)}")
        session.rollback()
        raise
    finally:
        session.close()

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python -m scripts.data_seeder.main <listings_per_category>")
        sys.exit(1)
    
    try:
        listings_per_category = int(sys.argv[1])
        seed_database(listings_per_category)
    except ValueError:
        print("Error: Please provide a valid number for listings per category")
        sys.exit(1)