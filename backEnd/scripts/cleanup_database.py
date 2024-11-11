import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent.parent))

import logging
from sqlalchemy.orm import Session
from datetime import datetime

# Import all models to ensure proper initialization
from backend.db_models.items import ProductEmbeddingsOrm, interested_buyers, ItemsOrm
from backend.db_models.item_images import ItemImagesOrm
from backend.db_models.seller_feedbacks import SellerFeedbackOrm
from backend.db_models.seller_profiles import SellerProfileOrm
from backend.db_interface.items import cleanup_s3_images
from backend.db_models.connection import Session as DefaultSession

logger = logging.getLogger(__name__)

def cleanup_database(session: Session = None):
    """Delete all entries from all tables except users"""
    session = session or DefaultSession()

    try:
        # First, get all image URLs from the database
        image_records = session.query(ItemImagesOrm).all()
        
        # Delete each image from S3
        for image_record in image_records:
            try:
                cleanup_s3_images([image_record.image_data])
                logger.info(f"Deleted S3 image: {image_record.image_data}")
            except Exception as e:
                logger.error(f"Error deleting S3 image: {e}")

        # Order matters due to foreign key constraints
        # 1. Delete product embeddings
        session.query(ProductEmbeddingsOrm).delete()
        logger.info("Deleted all product embeddings")

        # 2. Delete interested buyers (junction table)
        session.execute(interested_buyers.delete())
        logger.info("Deleted all interested buyers")

        # 3. Delete item images
        session.query(ItemImagesOrm).delete()
        logger.info("Deleted all item images")

        # 4. Delete items
        session.query(ItemsOrm).delete()
        logger.info("Deleted all items")

        # 5. Delete seller feedbacks
        session.query(SellerFeedbackOrm).delete()
        logger.info("Deleted all seller feedbacks")

        # 6. Delete seller profiles
        session.query(SellerProfileOrm).delete()
        logger.info("Deleted all seller profiles")

        session.commit()
        logger.info("Database cleanup completed successfully")

    except Exception as e:
        session.rollback()
        logger.error(f"Error during database cleanup: {str(e)}")
        raise
    finally:
        if not session:
            session.close()

def soft_delete_database(session: Session = None):
    """Soft delete all entries from all tables except users"""
    session = session or DefaultSession()
    try:
        current_time = datetime.now()

        # 1. Soft delete product embeddings
        session.query(ProductEmbeddingsOrm).update(
            {ProductEmbeddingsOrm.deleted_at: current_time}, 
            synchronize_session=False
        )
        logger.info("Soft deleted all product embeddings")

        # 2. Soft delete interested buyers
        session.execute(
            interested_buyers.update().values(deleted_at=current_time)
        )
        logger.info("Soft deleted all interested buyers")

        # 3. Soft delete item images
        session.query(ItemImagesOrm).update(
            {ItemImagesOrm.deleted_at: current_time}, 
            synchronize_session=False
        )
        logger.info("Soft deleted all item images")

        # 4. Soft delete items
        session.query(ItemsOrm).update(
            {ItemsOrm.deleted_at: current_time}, 
            synchronize_session=False
        )
        logger.info("Soft deleted all items")

        # 5. Soft delete seller feedbacks
        session.query(SellerFeedbackOrm).update(
            {SellerFeedbackOrm.deleted_at: current_time}, 
            synchronize_session=False
        )
        logger.info("Soft deleted all seller feedbacks")

        # 6. Soft delete seller profiles
        session.query(SellerProfileOrm).update(
            {SellerProfileOrm.deleted_at: current_time}, 
            synchronize_session=False
        )
        logger.info("Soft deleted all seller profiles")

        session.commit()
        logger.info("Database soft delete completed successfully")

    except Exception as e:
        session.rollback()
        logger.error(f"Error during database soft delete: {str(e)}")
        raise
    finally:
        if not session:
            session.close()

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description='Clean up database tables')
    parser.add_argument('--soft', action='store_true', help='Perform soft delete instead of hard delete')
    args = parser.parse_args()

    try:
        if args.soft:
            soft_delete_database()
        else:
            cleanup_database()
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)
