import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent.parent))

import logging
import numpy as np
from faker import Faker
from PIL import Image
import io
import base64
import random

fake = Faker()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_location_with_coordinates():
    """Get a real address with matching coordinates"""
    
    # Predefined locations to cycle through
    possible_locations = [
        {
            'address': "123 Main St, Toronto, ON, Canada",
            'latitude': 43.6532,
            'longitude': -79.3832
        },
        {
            'address': "350 5th Ave, New York, NY, USA",
            'latitude': 40.7484,
            'longitude': -73.9857
        },
        {
            'address': "1600 Amphitheatre Parkway, Mountain View, CA, USA",
            'latitude': 37.4220,
            'longitude': -122.0841
        },
        {
            'address': "401 Congress Ave, Austin, TX, USA",
            'latitude': 30.2672,
            'longitude': -97.7431
        },
        {
            'address': "233 S Wacker Dr, Chicago, IL, USA",
            'latitude': 41.8789,
            'longitude': -87.6359
        }
    ]
    
    location = random.choice(possible_locations)
    return location

def generate_random_image() -> str:
    """Generate a fake base64 image string"""
    return f"data:image/png;base64,{fake.pystr(min_chars=100, max_chars=200)}"

def generate_random_embedding(size: int = 100) -> list[float]:
    """Generate a random embedding vector of specified size"""
    return [float(x) for x in np.random.uniform(-1, 1, size=size)]

def generate_random_image() -> str:
    """Generate a proper base64 image string"""
    # Create a new image with a random color
    width = 400
    height = 400
    color = (
        np.random.randint(0, 255),  # R
        np.random.randint(0, 255),  # G
        np.random.randint(0, 255),  # B
    )
    
    # Create a new image with the random color
    image = Image.new('RGB', (width, height), color)
    
    # Save the image to a bytes buffer
    buffer = io.BytesIO()
    image.save(buffer, format='JPEG')
    image_bytes = buffer.getvalue()
    
    # Encode to base64
    base64_image = base64.b64encode(image_bytes).decode('utf-8')
    return f"data:image/jpeg;base64,{base64_image}"