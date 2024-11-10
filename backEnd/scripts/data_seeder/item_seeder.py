import uuid
import random
from sqlalchemy.orm import Session
from backend.models.item import Item, Location
from backend.db_interface.items import create_item
from backend.enums import ItemCategory, ItemStatus, ItemCondition
from backend.db_models.users import UsersOrm
from .utils import logger, get_location_with_coordinates
from .kijiji_scraper import KijijiScraper

def seed_items(session: Session, sellers: list[UsersOrm], total_listings: int) -> list[uuid.UUID]:
    item_ids = []
    seller_ids = [seller.id for seller in sellers]
    scraper = KijijiScraper()
    
    try:
        listings_per_category = total_listings // len(ItemCategory)
        
        for category in ItemCategory:
            # Scrape listings for this category
            listings = scraper.scrape_listings(category, listings_per_category)
            
            for listing_data in listings:
                seller_id = seller_ids[len(item_ids) % len(seller_ids)]
                
                # Get location with matching coordinates
                loc_data = get_location_with_coordinates()
                location = Location(
                    latitude=loc_data['latitude'],
                    longitude=loc_data['longitude'],
                    address=loc_data['address']
                )
                
                item = Item(
                    name=listing_data["name"],
                    description=listing_data["description"],
                    images=[listing_data["image"]],
                    lister_id=seller_id,
                    price=listing_data["price"],
                    location=location,
                    category=listing_data["category"],
                    status=listing_data["status"],
                    condition=listing_data["condition"]
                )
                
                result = create_item(item, session)
                item_id = uuid.UUID(result["item_id"])
                item_ids.append(item_id)
                logger.info(f"Created {category.value} item {item_id} for seller {seller_id}")
    
    except Exception as e:
        logger.error(f"Error seeding items: {e}")
        raise
    
    return item_ids