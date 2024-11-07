from backend.db_models.connection import Session as DefaultSession
from backend.db_models.users import UsersOrm
from backend.models.user import User, UpdateUser
import uuid as uuid_pkg

def handle_insert_user(posted_user: User):
    new_backend_id = uuid_pkg.uuid4()
    with DefaultSession() as session:
        new_user = UsersOrm(
            id=new_backend_id,
            email=posted_user.email,
            first_name=posted_user.first_name,
            last_name=posted_user.last_name,
            stytch_id=posted_user.stytch_id,
            profile_image_url=posted_user.profile_image_url,
            phone_number=posted_user.phone_number,
            description=posted_user.description,
            location=posted_user.location,
        )
        session.add(new_user)
        session.commit()
    return {"user_id": new_backend_id}

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
                
            # Only update allowed fields
            if updated_user.profile_image_url is not None:
                db_user.profile_image_url = updated_user.profile_image_url
            if updated_user.phone_number is not None:
                db_user.phone_number = updated_user.phone_number
            if updated_user.description is not None:
                db_user.description = updated_user.description
            if updated_user.location is not None:
                db_user.location = updated_user.location
            
            session.commit()
            session.refresh(db_user)
            session.close()
            
            return db_user
            
        except ValueError as e:
            raise ValueError(f"Invalid UUID format: {user_id}")
        except Exception as e:
            session.rollback()
            raise e

def handle_get_user(user_id: str):
    with DefaultSession() as session:
        db_user = session.query(UsersOrm).filter(UsersOrm.id == user_id).first()
    return db_user
