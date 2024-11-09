from typing import List

from PIL import Image
import base64
import io
import os
import uuid
import uuid as uuid_pkg
import logging

import boto3
from botocore.exceptions import ClientError
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from backend.db_models.connection import Session as DefaultSession
from backend.db_models.items import ItemsOrm
from backend.db_models.item_images import ItemImagesOrm
from backend.db_models.users import UsersOrm
from backend.models.item import Item, ProductListQueryParams
from sqlalchemy.sql import func
from dotenv import load_dotenv
from backend.db_models.items import interested_buyers
from backend.models.user import User
from backend.models.provider import Provider

load_dotenv()
logger = logging.getLogger(__name__)

s3_client = boto3.client(
    's3',
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
    region_name='us-east-1',
)
BUCKET_NAME = os.getenv('AWS_BUCKET_NAME')

def upload_to_s3(image_data: str, product_id: str, index: int) -> str:
    """
    Upload an image to S3 and return its URL.
    """
    try:
        if 'base64,' in image_data:
            image_data = image_data.split(',')[1]
        try:
            image_bytes = base64.b64decode(image_data)
        except Exception as e:
            logger.error("Invalid base64 string")
            raise ValueError("Invalid image format: not a valid base64 string")

        # Convert to JPEG using PIL
        img = Image.open(io.BytesIO(image_bytes))

        # Convert to RGB if needed
        if img.mode != 'RGB':
            img = img.convert('RGB')

        # Convert to JPEG bytes
        jpeg_buffer = io.BytesIO()
        img.save(jpeg_buffer, format='JPEG', quality=85, optimize=True)
        jpeg_bytes = jpeg_buffer.getvalue()

        file_name = f'products/{product_id}/image_{index}.jpg'

        s3_client.put_object(
            Bucket=BUCKET_NAME,
            Body=jpeg_bytes,
            ContentType='image/jpeg',
            ACL='public-read',
            Key=file_name
        )

        return f"https://{BUCKET_NAME}.s3.amazonaws.com/{file_name}"
    except ClientError as e:
        logger.error(f"Error uploading to S3: {str(e)}")
        raise ValueError(f"Failed to upload image to S3: {str(e)}")
    except Exception as e:
        logger.error(f"Error processing image: {str(e)}")
        raise ValueError(f"Failed to process image: {str(e)}")

def cleanup_s3_images(image_urls: List[str]):
    """Helper function to clean up S3 images on error"""
    for url in image_urls:
        try:
            key = url.split('.amazonaws.com/')[-1]
            s3_client.delete_object(Bucket=BUCKET_NAME, Key=key)
        except Exception as del_err:
            logger.error(f"Error cleaning up S3 image: {str(del_err)}")

def create_item(item: Item, db: Session = None):
    if not item:
        logger.error("Invalid input: item data is missing")
        raise ValueError("Item data is required")

    if not item.images:
        logger.error("Invalid input: no images provided")
        raise ValueError("At least one image is required")

    if len(item.images) > 5:
        logger.error("Too many images provided")
        raise ValueError("Maximum 5 images allowed")

    new_item_id = uuid_pkg.uuid4()
    session = db or DefaultSession()
    try:
        location_data = {}
        if item.location:
            location_data = {
                "latitude": item.location.latitude,
                "longitude": item.location.longitude,
                "address": item.location.address
            }

        new_item = ItemsOrm(
            id=new_item_id,
            name=item.name,
            description=item.description,
            lister_id=item.lister_id,
            price=item.price,
            category=item.category,
            status=item.status,
            condition=item.condition,
            **location_data
        )
        session.add(new_item)

        image_urls = []
        for index, file_data in enumerate(item.images):
            try:
                image_url = upload_to_s3(file_data, str(new_item_id), index)
                image_urls.append(image_url)

                new_image = ItemImagesOrm(
                    item_id=new_item_id,
                    image_data=image_url
                )
                session.add(new_image)
            except Exception as e:
                # Clean up any uploaded images if there's an error
                cleanup_s3_images(image_urls)
                logger.error(f"Error processing image {index}: {str(e)}")
                raise ValueError(f"Error processing image {index}: {str(e)}")

        session.commit()
        session.refresh(new_item)
        session.close()

        logger.info(f"Item created successfully: {new_item_id}")
        return {"item_id": str(new_item_id)}

    except SQLAlchemyError as e:
        session.rollback()
        cleanup_s3_images(image_urls)
        logger.error(f"Database error while creating item: {str(e)}")
        raise

    except Exception as e:
        session.rollback()
        cleanup_s3_images(image_urls)
        logger.error(f"Error creating item: {str(e)}")
        raise

    finally:
        if not db:
            session.close()

def get_item(item_id: str, db: Session = None):
    if not item_id:
        logger.error("Invalid input: item_id is missing")
        raise ValueError("Item ID is required")

    try:
        uuid_obj = uuid_pkg.UUID(item_id)
    except ValueError:
        logger.error(f"Invalid UUID: {item_id}")
        raise ValueError(f"Invalid item ID format: {item_id}")

    session = db or DefaultSession()
    try:
        item = session.query(ItemsOrm).filter(ItemsOrm.id == uuid_obj and 
                                              ItemsOrm.deleted_at.is_(None)).first()
        if not item:
            logger.warning(f"Item not found: {item_id}")
        return item
    except SQLAlchemyError as e:
        logger.error(f"Database error while retrieving item {item_id}: {str(e)}")
        raise
    finally:
        if not db:
            session.close()

def get_item_by_lister(user_id: str, db: Session = None):
    if not user_id:
        logger.error("Invalid input: user_id is missing")
        raise ValueError("User ID is required")

    try:
        uuid_obj = uuid_pkg.UUID(user_id)
    except ValueError:
        logger.error(f"Invalid UUID: {user_id}")
        raise ValueError(f"Invalid user ID format: {user_id}")

    session = db or DefaultSession()
    try:
        items = session.query(ItemsOrm).filter(ItemsOrm.lister_id == uuid_obj and 
                                              ItemsOrm.deleted_at.is_(None)).all()
        logger.info(f"Retrieved {len(items)} items for user {user_id}")
        return items
    except SQLAlchemyError as e:
        logger.error(f"Database error while retrieving items for user {user_id}: {str(e)}")
        raise
    finally:
        if not db:
            session.close()

def update_item(item_id: str, updated_item: Item, db: Session):
    existing_item = db.query(ItemsOrm).filter(ItemsOrm.id == uuid_pkg.UUID(item_id) and 
                                              ItemsOrm.lister_id == updated_item.lister_id and 
                                              ItemsOrm.deleted_at.is_(None)).first()
    if not existing_item:
        raise ValueError("Item not found")

    old_image_urls = [img.image_data for img in existing_item.item_images]

    existing_item.name = updated_item.name
    existing_item.description = updated_item.description
    existing_item.price = updated_item.price
    existing_item.latitude = updated_item.location.latitude
    existing_item.longitude = updated_item.location.longitude
    existing_item.address = updated_item.location.address
    existing_item.category = updated_item.category
    existing_item.status = updated_item.status
    existing_item.condition = updated_item.condition

    # Clear existing images
    existing_item.item_images.clear()

    # Add updated images
    new_image_urls = []
    try:
        for index, image_data in enumerate(updated_item.images):
            # Upload new image to S3
            image_url = upload_to_s3(image_data, str(existing_item.id), index)
            new_image_urls.append(image_url)

            # Create new image record
            new_image = ItemImagesOrm(
                item_id=existing_item.id,
                image_data=image_url
            )
            existing_item.item_images.append(new_image)

        # Commit database changes
        db.commit()

        # After successful commit, delete old images from S3
        cleanup_s3_images(old_image_urls)
        return existing_item

    except Exception as e:
        cleanup_s3_images(new_image_urls)
        raise e

def delete_item(item_id: str, db: Session = None):
    if not item_id:
        logger.error("Invalid input: item_id is missing")
        raise ValueError("Item ID is required")

    try:
        uuid_obj = uuid_pkg.UUID(item_id)
    except ValueError:
        logger.error(f"Invalid UUID: {item_id}")
        raise ValueError(f"Invalid item ID format: {item_id}")

    session = db or DefaultSession()
    try:
        item = session.query(ItemsOrm).filter(ItemsOrm.id == uuid_obj and 
                                              ItemsOrm.deleted_at.is_(None)).first()
        if item:
            # Set the deleted_at timestamp for the item
            item.deleted_at = func.now()
            # Soft delete related images
            for image in item.item_images:
                image.deleted_at = func.now()

            # Soft delete interested buyers
            session.query(interested_buyers).filter(
                interested_buyers.c.item_id == uuid_obj
            ).update({"deleted_at": func.now()})

            session.commit()
            logger.info(f"Item soft deleted successfully: {item_id}")
            return True
        else:
            logger.warning(f"Item not found for deletion: {item_id}")
            return False
    except SQLAlchemyError as e:
        session.rollback()
        logger.error(f"Database error while deleting item {item_id}: {str(e)}")
        raise
    finally:
        if not db:
            session.close()

def list_items(db: Session = None):
    session = db or DefaultSession()
    try:
        items = (
            session.query(ItemsOrm)
            .filter(ItemsOrm.deleted_at.is_(None))
            .all()
        )

        logger.info(f"Retrieved {len(items)} items")
        return items
    except SQLAlchemyError as e:
        logger.error(f"Database error while listing items: {str(e)}")
        raise
    finally:
        if not db:
            session.close()

def add_interested_buyer(item_id: str, user_id: str, db: Session = None):
    if not item_id or not user_id:
        logger.error("Invalid input: item_id and user_id are required")
        raise ValueError("Item ID and User ID are required")

    try:
        item_uuid = uuid_pkg.UUID(item_id)
        user_uuid = uuid_pkg.UUID(user_id)
    except ValueError as e:
        logger.error(f"Invalid UUID format: {str(e)}")
        raise ValueError("Invalid ID format")

    session = db or DefaultSession()
    try:
        item = session.query(ItemsOrm).filter(ItemsOrm.id == item_uuid and 
                                              ItemsOrm.deleted_at.is_(None)).first()
        user = session.query(UsersOrm).filter(UsersOrm.id == user_uuid and 
                                              UsersOrm.deleted_at.is_(None)).first()

        if not item or not user:
            logger.warning("Item or user not found")
            return False
        
        # Query to find the interested buyer
        interested_buyer = session.query(interested_buyers).filter(
            interested_buyers.c.item_id == item_uuid,
            interested_buyers.c.user_id == user_uuid
        ).first()

        if interested_buyer:
            if interested_buyer.deleted_at is not None:
                # Unpopulate the deleted_at field
                session.query(interested_buyers).filter(
                    interested_buyers.c.item_id == item_uuid,
                    interested_buyers.c.user_id == user_uuid
                ).update({"deleted_at": None})
                session.commit()
                logger.info(f"User {user_id} reactivated as interested buyer for item {item_id}")
                return True  # Indicate that the user was reactivated
            else:
                # Populate the deleted_at field if the user is already interested
                session.query(interested_buyers).filter(
                    interested_buyers.c.item_id == item_uuid,
                    interested_buyers.c.user_id == user_uuid
                ).update({"deleted_at": func.now()})
                session.commit()
                logger.info(f"User {user_id} marked as not interested in item {item_id}")
                return False  # User was marked as not interested

        # If the user is not found, add them as a new interested buyer
        item.interested_buyers.append(user)
        session.commit()
        logger.info(f"Added user {user_id} as interested buyer for item {item_id}")
        return True
    except SQLAlchemyError as e:
        session.rollback()
        logger.error(f"Database error while adding interested buyer: {str(e)}")
        raise
    finally:
        if not db:
            session.close()

def get_product_details(item, db: Session) -> dict:
    seller = User(
        id=str(item.lister.id),
        first_name=item.lister.first_name,
        last_name=item.lister.last_name,
        email=item.lister.email,
        stytch_id=item.lister.stytch_id,
        profile_image_url=item.lister.profile_image_url,
        provider=Provider.OAUTH_AUTHENTICATION_TYPE_MICROSOFT
    )

    # Get the interested buyers for the item
    interested_buyers_list = db.query(interested_buyers).filter(
        interested_buyers.c.item_id == item.id,
        interested_buyers.c.deleted_at.is_(None)
    ).all()

    interested_buyers_result = []
    for buyer in interested_buyers_list:
        # Get the user from the users table
        user = db.query(UsersOrm).filter(UsersOrm.id == buyer.user_id).first()
        interested_buyers_result.append(User(
            id=str(user.id),
            first_name=user.first_name,
            last_name=user.last_name,
            email=user.email,
            stytch_id=user.stytch_id,
            provider=Provider.OAUTH_AUTHENTICATION_TYPE_MICROSOFT
        ).dict())

    location = None
    if item.latitude and item.longitude:
        location = {
            "latitude": item.latitude,
            "longitude": item.longitude,
            "address": item.address
        }

    images = []
    # Query the item_images table for the item_id
    item_images = db.query(ItemImagesOrm).filter(ItemImagesOrm.item_id == item.id).all()
    for image in item_images:
        images.append(image.image_data)

    return {
        "id": str(item.id),
        "name": item.name,
        "price": item.price,
        "images": images,
        "seller": seller.dict(),
        "interested_buyers": interested_buyers_result,
        "location": location,
        "category": item.category.value,
        "condition": item.condition.value,
        "status": item.status.value,
        "description": item.description,
    }

def get_interested_items(user_id: str, db: Session):
    """
    Retrieve all products that a user is interested in.

    This function fetches all products that the specified user has expressed interest in.
    It only includes products that are not marked as deleted.

    Parameters:
    - user_id: The unique identifier of the user whose interested products are being retrieved.
    - db: The database session to use for the query.

    Returns:
    A list of products that the user is interested in.
    """
    try:
        user_uuid = uuid_pkg.UUID(user_id)  # Convert user_id to UUID
    except ValueError:
        raise ValueError("Invalid user ID format")

    interested_products = (
        db.query(ItemsOrm)
        .join(interested_buyers)
        .filter(
            interested_buyers.c.user_id == user_uuid,  # Use the UUID here
            ItemsOrm.deleted_at.is_(None),  # Ensure the product is not deleted
            interested_buyers.c.deleted_at.is_(None)  # Ensure interested_buyers is not deleted
        )
        .all()
    )
    
    return interested_products

def apply_product_filters(query, params: ProductListQueryParams, db: Session):
    """Apply common filters and sorting to product queries"""
    # Apply filters
    if params.category:
        query = query.filter(ItemsOrm.category == params.category)

    if params.condition:
        query = query.filter(ItemsOrm.condition == params.condition)

    if params.price_min is not None:
        query = query.filter(ItemsOrm.price >= params.price_min)

    if params.price_max is not None:
        query = query.filter(ItemsOrm.price <= params.price_max)

    # Location-based filtering
    if all(coord is not None for coord in [params.latitude, params.longitude, params.radius]):
        distance = func.acos(
            func.sin(func.radians(params.latitude)) * 
            func.sin(func.radians(ItemsOrm.latitude)) +
            func.cos(func.radians(params.latitude)) * 
            func.cos(func.radians(ItemsOrm.latitude)) * 
            func.cos(func.radians(ItemsOrm.longitude) - 
            func.radians(params.longitude))
        ) * 6371
        query = query.filter(distance <= params.radius)

    # Apply sorting
    if params.sort:
        sort_mapping = {
            "price_asc": ItemsOrm.price.asc(),
            "price_desc": ItemsOrm.price.desc(),
            "created_at_asc": ItemsOrm.created_at.asc(),
            "created_at_desc": ItemsOrm.created_at.desc()
        }
        query = query.order_by(sort_mapping[params.sort])

    return query
