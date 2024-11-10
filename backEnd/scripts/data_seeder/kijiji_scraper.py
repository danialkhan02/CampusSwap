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
        }
        self.TEST_IMAGE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAwAB/8h9CEYAAAAASUVORK5CYII="
        self.TEST_IMAGE_BYTES = base64.b64decode(self.TEST_IMAGE.split(',')[1])
        
    def get_processed_image(self, image_url: str) -> bytes:
        """Helper method to process images with proper error handling"""
        try:
            if not image_url:
                return self.TEST_IMAGE_BYTES
                
            response = requests.get(image_url, timeout=5)
            if response.status_code != 200:
                return self.TEST_IMAGE_BYTES
                
            # Verify content type is an image
            content_type = response.headers.get('content-type', '')
            if not content_type.startswith('image/'):
                logger.warning(f"Invalid content type: {content_type}, using test image")
                return self.TEST_IMAGE_BYTES
                
            # Try to process the image with additional error handling
            try:
                img = Image.open(io.BytesIO(response.content))
                # Verify the image can be loaded
                img.verify()
                # Reload the image after verify
                img = Image.open(io.BytesIO(response.content))
                img = img.convert('RGB')
                
                output_buffer = io.BytesIO()
                img.save(output_buffer, format='JPEG', quality=85)
                output_buffer.seek(0)
                return output_buffer.getvalue()
            except Exception as img_error:
                logger.warning(f"Image processing failed: {img_error}, using test image")
                return self.TEST_IMAGE_BYTES
                
        except Exception as e:
            logger.warning(f"Image download failed: {e}, using test image")
            return self.TEST_IMAGE_BYTES

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
                        
                        # Get image with improved error handling
                        image_elem = item.select_one('[data-testid="listing-card-image"]')
                        image_url = image_elem.get('src') if image_elem else None
                        image_bytes = self.get_processed_image(image_url)
                        
                        # Convert to base64 for database storage
                        image_data = f"data:image/jpeg;base64,{base64.b64encode(image_bytes).decode()}"
                        
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