import uuid as uuid_pkg
from sqlalchemy.orm import Session
from backend.db_models.connection import Session
from backend.db_models.categories import CategoriesOrm
from backend.models.category import Category 

def create_category(category: Category):
    new_category_id = uuid_pkg.uuid4()
    with Session() as session:
        new_category = CategoriesOrm(
            id=new_category_id,
            title=category.title,
            description=category.description,
            image=category.image,
            lister_id=category.lister_id,
            price=category.price,
            location=category.location
        )
        session.add(new_category)
        session.commit()
    return {"category_id": new_category_id}

def get_category(category_id: str):
    with Session() as session:
        category = session.query(CategoriesOrm).filter(CategoriesOrm.id == uuid_pkg.UUID(category_id)).first()
    return category

def update_category(category_id: str, updated_category: Category):
    with Session() as session:
        db_category = session.query(CategoriesOrm).filter(CategoriesOrm.id == uuid_pkg.UUID(category_id)).first()
        if db_category:
            for key, value in updated_category.dict(exclude_unset=True).items():
                setattr(db_category, key, value)
            session.commit()
            return db_category
    return None

def delete_category(category_id: str):
    with Session() as session:
        category = session.query(CategoriesOrm).filter(CategoriesOrm.id == uuid_pkg.UUID(category_id)).first()
        if category:
            session.delete(category)
            session.commit()
            return True
    return False

def list_categories():
    with Session() as session:
        categories = session.query(CategoriesOrm).all()
    return categories