from backend.db_models.connection import Session
from backend.db_models.users import UsersOrm
from backend.models.user import User
import uuid as uuid_pkg


def handle_insert_user(posted_user: User):
    new_backend_id = uuid_pkg.uuid4()
    with Session() as session:
        new_user = UsersOrm(
            id=new_backend_id,
            email=posted_user.email,
            first_name=posted_user.first_name,
            last_name=posted_user.last_name,
            stytch_id=posted_user.stytch_id,
            profile_image_url=posted_user.profile_image_url,
            phone_number=posted_user.phone_number,
            description=posted_user.description,
        )
        session.add(new_user)
        session.commit()
    return {"user_id": new_backend_id}


def handle_get_user(user_id: str):
    with Session() as session:
        db_user = session.query(UsersOrm).filter(UsersOrm.id == user_id).first()
    return db_user
