import uuid
from sqlalchemy.orm import Session
from backend.db_models.items import ProductEmbeddingsOrm
from .utils import generate_random_embedding, logger

def seed_product_embeddings(session: Session, item_ids: list[uuid.UUID]):
    """Create embeddings for each item"""
    for item_id in item_ids:
        embeddings = ProductEmbeddingsOrm(
            id=uuid.uuid4(),
            product_id=item_id,
            name_embedding=generate_random_embedding(),
            category_embedding=generate_random_embedding(),
            address_embedding=generate_random_embedding(),
            price_embedding=generate_random_embedding(),
            description_embedding=generate_random_embedding(),
            condition_embedding=generate_random_embedding()
        )
        session.add(embeddings)
        logger.info(f"Created embeddings for item {item_id}")
    session.commit()