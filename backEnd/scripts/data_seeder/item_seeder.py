import uuid
import random
from sqlalchemy.orm import Session
from backend.models.item import Item, Location
from backend.db_interface.items import create_item
from backend.enums import ItemCategory, ItemStatus, ItemCondition
from backend.db_models.users import UsersOrm
from .utils import fake, logger, generate_random_image, get_location_with_coordinates
from itertools import cycle

def seed_items(session: Session, sellers: list[UsersOrm], total_listings: int) -> list[uuid.UUID]:
    item_ids = []
    # Store just the IDs instead of the full objects
    seller_ids = [seller.id for seller in sellers]
    
    for category in ItemCategory:
        for i in range(total_listings // len(ItemCategory)):
            # Get seller ID using modulo
            seller_id = seller_ids[i % len(seller_ids)]
            
            # Get location with matching coordinates
            loc_data = get_location_with_coordinates()
            location = Location(
                latitude=loc_data['latitude'],
                longitude=loc_data['longitude'],
                address=loc_data['address']
            )
            
            images = [generate_random_image() for _ in range(random.randint(3, 5))]
            
            item = Item(
                name=fake.catch_phrase(),
                description=fake.paragraph(),
                images=images,
                lister_id=seller_id,  # Use the ID directly
                price=round(random.uniform(10.0, 1000.0), 2),
                location=location,
                category=category,
                status=random.choice(list(ItemStatus)),
                condition=random.choice(list(ItemCondition))
            )
            
            result = create_item(item, session)
            item_id = uuid.UUID(result["item_id"])
            item_ids.append(item_id)
            logger.info(f"Created {category.value} item {item_id} for seller {seller_id}")

    return item_ids