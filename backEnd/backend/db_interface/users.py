import base64
import io
import os

from PIL import Image
import boto3
import logging
from dotenv import load_dotenv
from botocore.exceptions import ClientError

from backend.db_interface.items import cleanup_s3_images
from backend.db_models.connection import Session as DefaultSession
from backend.db_models.users import UsersOrm
from backend.models.user import User, UpdateUser
import uuid as uuid_pkg

load_dotenv()
logger = logging.getLogger(__name__)

s3_client = boto3.client(
    's3',
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
    region_name='us-east-1',
)
BUCKET_NAME = os.getenv('AWS_BUCKET_NAME')

def upload_to_s3(image_data: str, user_id: str, index: int) -> str:
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

        file_name = f'user/{user_id}/image_{index}.jpg'

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

def handle_insert_user(posted_user: User):
    new_backend_id = uuid_pkg.uuid4()
    s3_image_url = None

    try:
        if posted_user.profile_image_url and posted_user.profile_image_url.startswith('data:image'):
            s3_image_url = upload_to_s3(
                posted_user.profile_image_url,
                new_backend_id,
                0
            )

        with DefaultSession() as session:
            new_user = UsersOrm(
                id=new_backend_id,
                email=posted_user.email,
                first_name=posted_user.first_name,
                last_name=posted_user.last_name,
                stytch_id=posted_user.stytch_id,
                profile_image_url=s3_image_url or posted_user.profile_image_url,
                phone_number=posted_user.phone_number,
                description=posted_user.description,
                location=posted_user.location,
            )
            session.add(new_user)
            session.commit()
        return {"user_id": new_backend_id}

    except Exception as e:
        if s3_image_url:
            cleanup_s3_images([s3_image_url])
        raise e

def handle_update_user(user_id: str, updated_user: UpdateUser):
    with DefaultSession() as session:
        try:
            uuid_obj = uuid_pkg.UUID(str(user_id))
            db_user = session.query(UsersOrm).filter(
                UsersOrm.id == uuid_obj,
                UsersOrm.deleted_at.is_(None)
            ).first()
            
            if not db_user:
                return None

            new_s3_image_url = None
            old_image_url = db_user.profile_image_url

            if updated_user.profile_image_url is not None:
                if updated_user.profile_image_url.startswith('data:image'):
                    # Upload new image to S3
                    new_s3_image_url = upload_to_s3(
                        updated_user.profile_image_url,
                        str(user_id),
                        0
                    )
                    db_user.profile_image_url = new_s3_image_url
                else:
                    db_user.profile_image_url = updated_user.profile_image_url
                
            # Only update allowed fields
            if updated_user.phone_number is not None:
                db_user.phone_number = updated_user.phone_number
            if updated_user.description is not None:
                db_user.description = updated_user.description
            if updated_user.location is not None:
                db_user.location = updated_user.location
            
            session.commit()
            session.refresh(db_user)
            session.close()

            if new_s3_image_url and old_image_url and old_image_url.startswith(f"https://{BUCKET_NAME}.s3.amazonaws.com/"):
                cleanup_s3_images([old_image_url])
            
            return db_user
            
        except ValueError as e:
            raise ValueError(f"Invalid UUID format: {user_id}")
        except Exception as e:
            session.rollback()
            if new_s3_image_url:
                cleanup_s3_images([new_s3_image_url])
            raise e

def handle_get_user(user_id: str):
    with DefaultSession() as session:
        db_user = session.query(UsersOrm).filter(UsersOrm.id == user_id).first()
    return db_user
