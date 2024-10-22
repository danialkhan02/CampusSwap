import pytest
import uuid as uuid_pkg
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.db_models.users import UsersOrm
from backend.db_models.base import BaseDbModel
from backend.db_models.categories import CategoriesOrm
from backend.db_interface.categories import create_category, get_category, get_category_by_lister, update_category, delete_category, list_categories
from backend.models.category import Category

# Setup test database
@pytest.fixture(scope="function")
def test_db():
    engine = create_engine("sqlite:///:memory:")
    BaseDbModel.metadata.create_all(engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = TestingSessionLocal()
    
    # Create a test user
    test_user = UsersOrm(
        email="test@example.com",
        first_name="Test",
        last_name="User",
        stytch_id="test_stytch_id"
    )
    db.add(test_user)
    db.commit()
    db.refresh(test_user)
    
    yield db, test_user.id
    db.close()

# Test create_category
def test_create_category(test_db):
    db, user_id = test_db
    category = Category(
        title="Test Category",
        description="Test Description",
        image="test_image.jpg",
        lister_id=user_id,
        price=10.99,
        location="Test Location"
    )
    result = create_category(category, db)
    assert "category_id" in result
    assert isinstance(uuid_pkg.UUID(result["category_id"]), uuid_pkg.UUID)

    db_category = db.query(CategoriesOrm).filter(CategoriesOrm.id == uuid_pkg.UUID(result["category_id"])).first()
    assert db_category is not None
    assert db_category.title == category.title
    assert db_category.description == category.description
    assert db_category.image == category.image
    assert db_category.lister_id == category.lister_id
    assert db_category.price == category.price
    assert db_category.location == category.location

def test_create_category_invalid_input(test_db):
    db, _ = test_db
    with pytest.raises(ValueError, match="Category data is required"):
        create_category(None, db)

# Test get_category
def test_get_category(test_db):
    db, user_id = test_db
    category = Category(
        title="Test Category",
        description="Test Description",
        image="test_image.jpg",
        lister_id=user_id,
        price=10.99,
        location="Test Location"
    )
    result = create_category(category, db)
    category_id = result["category_id"]

    retrieved_category = get_category(category_id, db)
    assert retrieved_category is not None
    assert str(retrieved_category.id) == category_id
    assert retrieved_category.title == category.title
    assert retrieved_category.description == category.description
    assert retrieved_category.image == category.image
    assert retrieved_category.lister_id == category.lister_id
    assert retrieved_category.price == category.price
    assert retrieved_category.location == category.location

def test_get_category_invalid_id(test_db):
    db, _ = test_db
    with pytest.raises(ValueError, match="Invalid category ID format"):
        get_category("invalid-uuid", db)

# Test get_category_by_lister
def test_get_category_by_lister(test_db):
    db, user_id = test_db
    categories = get_category_by_lister(str(user_id), db)
    assert len(categories) == 0

    category = Category(
        title="Test Category",
        description="Test Description",
        image="test_image.jpg",
        lister_id=user_id,
        price=10.99,
        location="Test Location"
    )
    result = create_category(category, db)
    category_id = result["category_id"]

    categories = get_category_by_lister(str(user_id), db)
    assert len(categories) == 1
    assert str(categories[0].id) == category_id

def test_get_category_by_lister_invalid_id(test_db):
    db, _ = test_db
    with pytest.raises(ValueError, match="Invalid user ID format"):
        get_category_by_lister("invalid-uuid", db)

# Test update_category
def test_update_category(test_db):
    db, user_id = test_db
    category = Category(
        title="Test Category",
        description="Test Description",
        image="test_image.jpg",
        lister_id=user_id,
        price=10.99,
        location="Test Location"
    )
    result = create_category(category, db)
    category_id = result["category_id"]

    updated_category = Category(
        title="Updated Category",
        description="Updated Description",
        image="updated_image.jpg",
        lister_id=user_id,
        price=15.99,
        location="Updated Location"
    )
    updated_result = update_category(category_id, updated_category, db)
    assert updated_result is not None
    assert updated_result.title == updated_category.title
    assert updated_result.description == updated_category.description
    assert updated_result.image == updated_category.image
    assert updated_result.price == updated_category.price
    assert updated_result.location == updated_category.location

def test_update_category_not_found(test_db):
    db, user_id = test_db
    non_existent_id = str(uuid_pkg.uuid4())
    updated_category = Category(
        title="Updated Category",
        description="Updated Description",
        image="updated_image.jpg",
        lister_id=user_id,
        price=15.99,
        location="Updated Location"
    )
    result = update_category(non_existent_id, updated_category, db)
    assert result is None

# Test delete_category
def test_delete_category(test_db):
    db, user_id = test_db
    category = Category(
        title="Test Category",
        description="Test Description",
        image="test_image.jpg",
        lister_id=user_id,
        price=10.99,
        location="Test Location"
    )
    result = create_category(category, db)
    category_id = result["category_id"]

    delete_result = delete_category(category_id, db)
    assert delete_result is True

    deleted_category = get_category(category_id, db)
    assert deleted_category is None

def test_delete_category_not_found(test_db):
    db, _ = test_db
    non_existent_id = str(uuid_pkg.uuid4())
    result = delete_category(non_existent_id, db)
    assert result is False

# Test list_categories
def test_list_categories(test_db):
    db, user_id = test_db
    
    categories = [
        Category(title="Category 1", description="Description 1", image="image1.jpg", lister_id=user_id, price=10.99, location="Location 1"),
        Category(title="Category 2", description="Description 2", image="image2.jpg", lister_id=user_id, price=20.99, location="Location 2"),
        Category(title="Category 3", description="Description 3", image="image3.jpg", lister_id=user_id, price=30.99, location="Location 3"),
    ]
    
    for category in categories:
        result = create_category(category, db)
        assert "category_id" in result, f"Failed to create category: {category.title}"

    listed_categories = list_categories(db)
    assert len(listed_categories) == 3, f"Expected 3 categories, but got {len(listed_categories)}"
    
    for i, category in enumerate(listed_categories):
        assert category.title == categories[i].title
        assert category.description == categories[i].description
        assert category.image == categories[i].image
        assert category.price == categories[i].price
        assert category.location == categories[i].location
        assert category.lister_id == user_id