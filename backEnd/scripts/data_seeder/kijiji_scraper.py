from bs4 import BeautifulSoup
import requests
import time
import random
import base64
from typing import List, Dict
from enum import Enum
import logging
from backend.enums import ItemCategory, ItemStatus, ItemCondition
import io
from PIL import Image

logger = logging.getLogger(__name__)

class KijijiScraper:
    def __init__(self):
        self.base_url = "https://www.kijiji.ca"
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
        }
        self.category_ids = {
            ItemCategory.TEXTBOOKS: "109",
            ItemCategory.ELECTRONICS: "15",
            ItemCategory.FURNITURE: "235",
            ItemCategory.CLOTHING: "274",
            ItemCategory.SCHOOL_SUPPLIES: "109",
            ItemCategory.SPORTS_EQUIPMENT: "641",
            ItemCategory.MUSICAL_INSTRUMENTS: "17",
            ItemCategory.OTHER: "10"
        }
        self.TEST_IMAGE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAwAB/8h9CEYAAAAASUVORK5CYII="

    def scrape_listings(self, category: ItemCategory, num_listings: int = 10) -> List[Dict]:
        listings = []
        page = 1
        
        while len(listings) < num_listings:
            try:
                url = f"https://www.kijiji.ca/b-{category.value.lower().replace('_', '-')}/gta-greater-toronto-area/c{self.category_ids[category]}l1700272"
                if page > 1:
                    url = url.replace("/b-", f"/b-page-{page}/")
                    
                logger.info(f"Scraping listings from {url}")
                
                response = requests.get(url, headers=self.headers)
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # Find all listing items
                items = soup.find_all('li', attrs={'data-testid': lambda x: x and x.startswith('listing-card-list-item')})
                
                if not items:
                    logger.info(f"Found {len(listings)} ads")
                    break
                
                for item in items:
                    if len(listings) >= num_listings:
                        break
                        
                    try:
                        # Get title and link
                        title_elem = item.select_one('[data-testid="listing-title"] a')
                        if not title_elem:
                            continue
                            
                        name = title_elem.text.strip()
                        ad_url = self.base_url + title_elem['href'] if title_elem['href'].startswith('/') else title_elem['href']
                        
                        # Get price
                        price_elem = item.select_one('[data-testid="listing-price"]')
                        price_text = price_elem.text.strip() if price_elem else "0"
                        price = float(price_text.replace("$", "").replace(",", "")) if price_text.replace("$", "").replace(",", "").strip().isdigit() else 0.0
                        
                        # Get image (with fallback)
                        image_data = self.TEST_IMAGE  # Default to test image
                        try:
                            image_elem = item.select_one('[data-testid="listing-card-image"]')
                            if image_elem and (image_url := image_elem.get('src')):
                                image_response = requests.get(image_url, timeout=5)  # Reduced timeout
                                if image_response.status_code == 200:
                                    image_data = f"data:image/jpeg;base64,{base64.b64encode(image_response.content).decode()}"
                        except Exception as e:
                            logger.warning(f"Failed to fetch image for {name}, using test image: {e}")
                        
                        
                        # Get description
                        description_elem = item.select_one('[data-testid="listing-description"]')
                        description = description_elem.text.strip() if description_elem else f"Listed on Kijiji - {name}"
                        
                        # Create listing object
                        listing = {
                            "name": name,
                            "price": price,
                            "description": description,
                            "image": image_data,
                            "category": category,
                            "status": ItemStatus.STATUS_NEW,
                            "condition": random.choice(list(ItemCondition))
                        }
                        
                        listings.append(listing)
                        logger.info(f"Scraped listing: {name}")
                        
                    except Exception as e:
                        logger.error(f"Error processing listing: {e}")
                        continue
                    
                    # Random delay between processing items
                    time.sleep(random.uniform(0.5, 1.5))
                
                page += 1
                # Random delay between pages
                time.sleep(random.uniform(1.5, 3.0))
                
            except Exception as e:
                logger.error(f"Error scraping category {category}: {e}")
                break
                
        return listings[:num_listings]