import uuid
import random
from sqlalchemy.orm import Session
from backend.models.item import Item, Location
from backend.db_interface.items import create_item
from backend.enums import ItemCategory, ItemStatus, ItemCondition
from backend.db_models.users import UsersOrm
from .utils import fake, logger, generate_random_image, get_location_with_coordinates

def seed_items(session: Session, sellers: list[UsersOrm], num_listings: int) -> list[uuid.UUID]:
    """Create items divided among sellers"""
    listings_per_seller = num_listings // len(sellers)
    item_ids = []
    
    for seller_id in [s.id for s in sellers]:  # Store only seller IDs
        for _ in range(listings_per_seller):
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
                lister_id=seller_id,
                price=round(random.uniform(10.0, 1000.0), 2),
                location=location,
                category=random.choice(list(ItemCategory)),
                status=ItemStatus.STATUS_NEW,
                condition=random.choice(list(ItemCondition))
            )
            
            result = create_item(item, session)
            item_id = uuid.UUID(result["item_id"])
            item_ids.append(item_id)
            logger.info(f"Created item {item_id} for seller {seller_id}")
    
    return item_ids