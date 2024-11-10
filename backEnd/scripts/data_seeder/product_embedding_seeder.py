import uuid
import asyncio
from sqlalchemy.orm import Session
from backend.db_models.items import ProductEmbeddingsOrm, ItemsOrm
from backend.openai_integration.openai_client import OpenAIClientWrapper
from .utils import logger

async def generate_embeddings_for_item(client: OpenAIClientWrapper, item: ItemsOrm) -> dict:
    """Generate embeddings for a single item using OpenAI"""
    return await client.generate_product_embeddings(
        name=item.name,
        category=item.category.value,
        address=item.address,
        price=float(item.price),
        description=item.description or "",
        condition=item.condition.value
    )

async def generate_batch_embeddings(client: OpenAIClientWrapper, items: list[ItemsOrm]) -> list[dict]:
    """Generate embeddings for a batch of items"""
    tasks = [generate_embeddings_for_item(client, item) for item in items]
    return await asyncio.gather(*tasks)

def seed_product_embeddings(session: Session, item_ids: list[uuid.UUID]):
    """Create embeddings for each item using OpenAI"""
    batch_size = 50
    client = OpenAIClientWrapper()
    
    for i in range(0, len(item_ids), batch_size):
        batch_ids = item_ids[i:i + batch_size]
        
        # Get items from database
        items = session.query(ItemsOrm).filter(ItemsOrm.id.in_(batch_ids)).all()
        
        try:
            # Generate embeddings using OpenAI
            embeddings_batch = asyncio.run(generate_batch_embeddings(client, items))
            
            # Create embedding records
            for item, embeddings in zip(items, embeddings_batch):
                embedding_record = ProductEmbeddingsOrm(
                    id=uuid.uuid4(),
                    product_id=item.id,
                    name_embedding=embeddings['name_embedding'],
                    category_embedding=embeddings['category_embedding'],
                    address_embedding=embeddings['address_embedding'],
                    price_embedding=embeddings['price_embedding'],
                    description_embedding=embeddings['description_embedding'],
                    condition_embedding=embeddings['condition_embedding']
                )
                session.add(embedding_record)
            
            session.commit()
            logger.info(f"Created OpenAI embeddings for batch of {len(batch_ids)} items")
            
        except Exception as e:
            logger.error(f"Error creating embeddings batch: {str(e)}")
            session.rollback()
            raise