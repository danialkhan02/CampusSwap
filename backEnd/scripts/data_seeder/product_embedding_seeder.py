import uuid
from sqlalchemy.orm import Session
from backend.db_models.items import ProductEmbeddingsOrm
from .utils import generate_random_embedding, logger

def seed_product_embeddings(session: Session, item_ids: list[uuid.UUID]):
    """Create embeddings for each item"""
    batch_size = 50 
    
    for i in range(0, len(item_ids), batch_size):
        batch_ids = item_ids[i:i + batch_size]
        
        for item_id in batch_ids:
            embeddings = ProductEmbeddingsOrm(
                id=uuid.uuid4(),
                product_id=item_id,
                name_embedding=generate_random_embedding(size=100),     
                category_embedding=generate_random_embedding(size=100),   
                address_embedding=generate_random_embedding(size=100),
                price_embedding=generate_random_embedding(size=100),  
                description_embedding=generate_random_embedding(size=100),
                condition_embedding=generate_random_embedding(size=100)
            )
            session.add(embeddings)
            
        try:
            session.commit()
            logger.info(f"Created embeddings for batch of {len(batch_ids)} items")
        except Exception as e:
            logger.error(f"Error creating embeddings batch: {str(e)}")
            session.rollback()
            raise