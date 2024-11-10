import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent.parent))

import logging
import numpy as np
from faker import Faker
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut, GeocoderUnavailable
import time

fake = Faker()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize the geocoder with your application name
geocoder = Nominatim(user_agent="marketplace_seeder")

def get_location_with_coordinates():
    """Generate a real address with matching coordinates"""
    max_retries = 3
    retry_delay = 1  # seconds
    
    for _ in range(max_retries):
        try:
            # Generate address in a specific format
            street = fake.street_address()
            city = fake.city()
            state = fake.state()
            country = "United States"
            full_address = f"{street}, {city}, {state}, {country}"
            
            # Get coordinates for the address
            location = geocoder.geocode(full_address)
            
            if location:
                return {
                    'address': full_address,
                    'latitude': location.latitude,
                    'longitude': location.longitude
                }
            
            time.sleep(retry_delay)  # Respect rate limits
            
        except (GeocoderTimedOut, GeocoderUnavailable) as e:
            logger.warning(f"Geocoding error: {str(e)}. Retrying...")
            time.sleep(retry_delay)
            continue
    
    # Fallback to Toronto coordinates if geocoding fails
    logger.warning("Geocoding failed, using fallback location")
    return {
        'address': "123 Main St, Toronto, ON, Canada",
        'latitude': 43.6532,
        'longitude': -79.3832
    }

def generate_random_image() -> str:
    """Generate a fake base64 image string"""
    return f"data:image/png;base64,{fake.pystr(min_chars=100, max_chars=200)}"

def generate_random_embedding() -> list[float]:
    """Generate a random embedding vector of size 1536 (OpenAI's dimension)"""
    return list(np.random.uniform(-1, 1, 1536))