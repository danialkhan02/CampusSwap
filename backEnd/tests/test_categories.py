import pytest
import uuid as uuid_pkg
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.db_models.users import UsersOrm
from backend.db_models.base import BaseDbModel
from backend.db_models.items import ItemsOrm
from backend.db_interface.items import create_item, get_item, get_item_by_lister, update_item, delete_item, list_items
from backend.models.item import Item

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

# Test create_item
def test_create_item(test_db):
    db, user_id = test_db
    item = Item(
        title="Test Item",
        description="Test Description",
        image="test_image.jpg",
        lister_id=user_id,
        price=10.99,
        location="Test Location"
    )
    result = create_item(item, db)
    assert "item_id" in result
    assert isinstance(uuid_pkg.UUID(result["item_id"]), uuid_pkg.UUID)

    db_item = db.query(ItemsOrm).filter(ItemsOrm.id == uuid_pkg.UUID(result["item_id"])).first()
    assert db_item is not None
    assert db_item.title == item.title
    assert db_item.description == item.description
    assert db_item.image == item.image
    assert db_item.lister_id == item.lister_id
    assert db_item.price == item.price
    assert db_item.location == item.location

def test_create_item_invalid_input(test_db):
    db, _ = test_db
    with pytest.raises(ValueError, match="Item data is required"):
        create_item(None, db)

# Test get_item
def test_get_item(test_db):
    db, user_id = test_db
    item = Item(
        title="Test Item",
        description="Test Description",
        image="test_image.jpg",
        lister_id=user_id,
        price=10.99,
        location="Test Location"
    )
    result = create_item(item, db)
    item_id = result["item_id"]

    retrieved_item = get_item(item_id, db)
    assert retrieved_item is not None
    assert str(retrieved_item.id) == item_id
    assert retrieved_item.title == item.title
    assert retrieved_item.description == item.description
    assert retrieved_item.image == item.image
    assert retrieved_item.lister_id == item.lister_id
    assert retrieved_item.price == item.price
    assert retrieved_item.location == item.location

def test_get_item_invalid_id(test_db):
    db, _ = test_db
    with pytest.raises(ValueError, match="Invalid item ID format"):
        get_item("invalid-uuid", db)

# Test get_item_by_lister
def test_get_item_by_lister(test_db):
    db, user_id = test_db
    items = get_item_by_lister(str(user_id), db)
    assert len(items) == 0

    item = Item(
        title="Test Item",
        description="Test Description",
        image="test_image.jpg",
        lister_id=user_id,
        price=10.99,
        location="Test Location"
    )
    result = create_item(item, db)
    item_id = result["item_id"]

    items = get_item_by_lister(str(user_id), db)
    assert len(items) == 1
    assert str(items[0].id) == item_id

def test_get_item_by_lister_invalid_id(test_db):
    db, _ = test_db
    with pytest.raises(ValueError, match="Invalid user ID format"):
        get_item_by_lister("invalid-uuid", db)

# Test update_item
def test_update_item(test_db):
    db, user_id = test_db
    item = Item(
        title="Test Item",
        description="Test Description",
        image="test_image.jpg",
        lister_id=user_id,
        price=10.99,
        location="Test Location"
    )
    result = create_item(item, db)
    item_id = result["item_id"]

    updated_item = Item(
        title="Updated Item",
        description="Updated Description",
        image="updated_image.jpg",
        lister_id=user_id,
        price=15.99,
        location="Updated Location"
    )
    updated_result = update_item(item_id, updated_item, db)
    assert updated_result is not None
    assert updated_result.title == updated_item.title
    assert updated_result.description == updated_item.description
    assert updated_result.image == updated_item.image
    assert updated_result.price == updated_item.price
    assert updated_result.location == updated_item.location

def test_update_item_not_found(test_db):
    db, user_id = test_db
    non_existent_id = str(uuid_pkg.uuid4())
    updated_item = Item(
        title="Updated Item",
        description="Updated Description",
        image="updated_image.jpg",
        lister_id=user_id,
        price=15.99,
        location="Updated Location"
    )
    result = update_item(non_existent_id, updated_item, db)
    assert result is None

# Test delete_item
def test_delete_item(test_db):
    db, user_id = test_db
    item = Item(
        title="Test Item",
        description="Test Description",
        image="test_image.jpg",
        lister_id=user_id,
        price=10.99,
        location="Test Location"
    )
    result = create_item(item, db)
    item_id = result["item_id"]

    delete_result = delete_item(item_id, db)
    assert delete_result is True

    deleted_item = get_item(item_id, db)
    assert deleted_item is None

def test_delete_item_not_found(test_db):
    db, _ = test_db
    non_existent_id = str(uuid_pkg.uuid4())
    result = delete_item(non_existent_id, db)
    assert result is False

# Test list_items
def test_list_items(test_db):
    db, user_id = test_db
    
    items = [
        Item(title="Item 1", description="Description 1", image="image1.jpg", lister_id=user_id, price=10.99, location="Location 1"),
        Item(title="Item 2", description="Description 2", image="image2.jpg", lister_id=user_id, price=20.99, location="Location 2"),
        Item(title="Item 3", description="Description 3", image="image3.jpg", lister_id=user_id, price=30.99, location="Location 3"),
    ]
    
    for item in items:
        result = create_item(item, db)
        assert "item_id" in result, f"Failed to create item: {item.title}"

    listed_items = list_items(db)
    assert len(listed_items) == 3, f"Expected 3 items, but got {len(listed_items)}"
    
    for i, item in enumerate(listed_items):
        assert item.title == items[i].title
        assert item.description == items[i].description
        assert item.image == items[i].image
        assert item.price == items[i].price
        assert item.location == items[i].location
        assert item.lister_id == user_id