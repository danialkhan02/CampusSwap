import pytest
import uuid as uuid_pkg
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.db_models.users import UsersOrm
from backend.db_models.base import BaseDbModel
from backend.db_models.items import ItemsOrm
from backend.db_interface.items import (
    create_item,
    get_item,
    get_item_by_lister,
    update_item,
    delete_item,
    list_items,
    add_interested_buyer
)
from backend.models.item import Item, Location
from backend.db_models.items import interested_buyers
from backend.enums import ItemCategory

@pytest.fixture(scope="function")
def test_db():
    engine = create_engine("sqlite:///:memory:")
    BaseDbModel.metadata.create_all(engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = TestingSessionLocal()
    
    # Create a test user (lister)
    test_user = UsersOrm(
        email="test@example.com",
        first_name="Test",
        last_name="User",
        stytch_id="test_stytch_id"
    )
    # Create a test buyer
    test_buyer = UsersOrm(
        email="buyer@example.com",
        first_name="Test",
        last_name="Buyer",
        stytch_id="buyer_stytch_id"
    )
    db.add(test_user)
    db.add(test_buyer)
    db.commit()
    db.refresh(test_user)
    db.refresh(test_buyer)
    
    yield db, test_user.id, test_buyer.id
    db.close()

def test_create_item_with_location(test_db):
    db, user_id, _ = test_db
    location = Location(
        latitude=43.6532,
        longitude=-79.3832,
        address="123 Test St"
    )
    item = Item(
        name="Test Product",
        title="Test Item",
        description="Test Description",
        image="test_image.jpg",
        lister_id=user_id,
        price=10.99,
        location=location,
        category=ItemCategory.TEXTBOOKS
    )
    result = create_item(item, db)
    assert "item_id" in result

    db_item = db.query(ItemsOrm).filter(ItemsOrm.id == uuid_pkg.UUID(result["item_id"])).first()
    assert db_item is not None
    assert db_item.name == item.name
    assert db_item.title == item.title
    assert db_item.latitude == item.location.latitude
    assert db_item.longitude == item.location.longitude
    assert db_item.address == item.location.address

def test_create_item_without_location(test_db):
    db, user_id, _ = test_db
    item = Item(
        name="Test Product",
        title="Test Item",
        description="Test Description",
        image="test_image.jpg",
        lister_id=user_id,
        price=10.99,
        category=ItemCategory.TEXTBOOKS
    )
    result = create_item(item, db)
    assert "item_id" in result

def test_create_item_invalid_input(test_db):
    db, _, _ = test_db
    with pytest.raises(ValueError, match="Item data is required"):
        create_item(None, db)

def test_get_item(test_db):
    db, user_id, _ = test_db
    location = Location(
        latitude=43.6532,
        longitude=-79.3832,
        address="123 Test St"
    )
    item = Item(
        name="Test Product",
        title="Test Item",
        description="Test Description",
        image="test_image.jpg",
        lister_id=user_id,
        price=10.99,
        location=location,
        category=ItemCategory.TEXTBOOKS
    )
    result = create_item(item, db)
    item_id = result["item_id"]

    retrieved_item = get_item(item_id, db)
    assert retrieved_item is not None
    assert str(retrieved_item.id) == item_id
    assert retrieved_item.name == item.name
    assert retrieved_item.title == item.title
    assert retrieved_item.description == item.description
    assert retrieved_item.image == item.image
    assert retrieved_item.lister_id == item.lister_id
    assert retrieved_item.price == item.price
    assert retrieved_item.latitude == item.location.latitude
    assert retrieved_item.longitude == item.location.longitude
    assert retrieved_item.address == item.location.address
    assert retrieved_item.category == item.category

def test_get_item_invalid_id(test_db):
    db, _, _ = test_db
    with pytest.raises(ValueError, match="Invalid item ID format"):
        get_item("invalid-uuid", db)

def test_get_item_by_lister(test_db):
    db, user_id, _ = test_db
    location = Location(
        latitude=43.6532,
        longitude=-79.3832,
        address="123 Test St"
    )
    item = Item(
        name="Test Product",
        title="Test Item",
        description="Test Description",
        image="test_image.jpg",
        lister_id=user_id,
        price=10.99,
        location=location,
        category=ItemCategory.TEXTBOOKS
    )
    result = create_item(item, db)
    item_id = result["item_id"]

    items = get_item_by_lister(str(user_id), db)
    assert len(items) == 1
    assert str(items[0].id) == item_id
    assert items[0].latitude == item.location.latitude
    assert items[0].longitude == item.location.longitude
    assert items[0].address == item.location.address

def test_update_item(test_db):
    db, user_id, _ = test_db
    location = Location(
        latitude=43.6532,
        longitude=-79.3832,
        address="123 Test St"
    )
    item = Item(
        name="Test Product",
        title="Test Item",
        description="Test Description",
        image="test_image.jpg",
        lister_id=user_id,
        price=10.99,
        location=location,
        category=ItemCategory.TEXTBOOKS
    )
    result = create_item(item, db)
    item_id = result["item_id"]

    # Verify initial item was created correctly
    initial_item = get_item(item_id, db)
    assert initial_item.latitude == item.location.latitude
    assert initial_item.longitude == item.location.longitude
    assert initial_item.address == item.location.address

    updated_location = Location(
        latitude=43.7000,
        longitude=-79.4000,
        address="456 Updated St"
    )
    updated_item = Item(
        name="Updated Product",
        title="Updated Item",
        description="Updated Description",
        image="updated_image.jpg",
        lister_id=user_id,
        price=15.99,
        location=updated_location,
        category=ItemCategory.ELECTRONICS
    )
    
    # Perform update
    updated_result = update_item(item_id, updated_item, db)
    
    # Verify the update was successful by retrieving the item again
    retrieved_item = get_item(item_id, db)
    assert retrieved_item is not None
    assert retrieved_item.name == updated_item.name
    assert retrieved_item.title == updated_item.title
    assert retrieved_item.description == updated_item.description
    assert retrieved_item.image == updated_item.image
    assert retrieved_item.price == updated_item.price
    assert retrieved_item.latitude == updated_item.location.latitude
    assert retrieved_item.longitude == updated_item.location.longitude
    assert retrieved_item.address == updated_item.location.address
    assert retrieved_item.category == updated_item.category

def test_add_interested_buyer(test_db):
    db, lister_id, buyer_id = test_db
    
    item = Item(
        name="Test Product",
        title="Test Item",
        description="Test Description",
        image="test_image.jpg",
        lister_id=lister_id,
        price=10.99,
        category=ItemCategory.TEXTBOOKS
    )
    result = create_item(item, db)
    item_id = result["item_id"]

    success = add_interested_buyer(item_id, str(buyer_id), db)
    assert success is True

    db_item = db.query(ItemsOrm).filter(ItemsOrm.id == uuid_pkg.UUID(item_id)).first()
    assert len(db_item.interested_buyers) == 1
    assert db_item.interested_buyers[0].id == buyer_id

def test_add_interested_buyer_duplicate(test_db):
    db, lister_id, buyer_id = test_db
    
    item = Item(
        name="Test Product",
        title="Test Item",
        description="Test Description",
        image="test_image.jpg",
        lister_id=lister_id,
        price=10.99,
        category=ItemCategory.TEXTBOOKS
    )
    result = create_item(item, db)
    item_id = result["item_id"]

    first_add = add_interested_buyer(item_id, str(buyer_id), db)
    second_add = add_interested_buyer(item_id, str(buyer_id), db)
    
    assert first_add is True
    assert second_add is False

def test_delete_item(test_db):
    db, user_id, _ = test_db
    location = Location(
        latitude=43.6532,
        longitude=-79.3832,
        address="123 Test St"
    )
    item = Item(
        name="Test Product",
        title="Test Item",
        description="Test Description",
        image="test_image.jpg",
        lister_id=user_id,
        price=10.99,
        location=location,
        category=ItemCategory.TEXTBOOKS
    )
    result = create_item(item, db)
    item_id = result["item_id"]

    # First verify the item exists
    db_item = get_item(item_id, db)
    assert db_item is not None

    # Delete the item
    delete_result = delete_item(item_id, db)
    assert delete_result is True

    # Verify the item was deleted
    deleted_item = get_item(item_id, db)
    assert deleted_item is None

def test_delete_item_with_interested_buyers(test_db):
    db, lister_id, buyer_id = test_db
    
    item = Item(
        name="Test Product",
        title="Test Item",
        description="Test Description",
        image="test_image.jpg",
        lister_id=lister_id,
        price=10.99,
        category=ItemCategory.TEXTBOOKS
    )
    result = create_item(item, db)
    item_id = result["item_id"]

    # Add an interested buyer
    add_interested_buyer(item_id, str(buyer_id), db)
    
    # Delete the item
    delete_result = delete_item(item_id, db)
    assert delete_result is True

    # Verify the item was deleted
    deleted_item = get_item(item_id, db)
    assert deleted_item is None

    # Verify the interested_buyers relationship was cleaned up
    interested_buyers_count = db.query(interested_buyers).filter(
        interested_buyers.c.item_id == uuid_pkg.UUID(item_id)
    ).count()
    assert interested_buyers_count == 0

def test_delete_item_not_found(test_db):
    db, _, _ = test_db
    non_existent_id = str(uuid_pkg.uuid4())
    result = delete_item(non_existent_id, db)
    assert result is False

def test_delete_item_invalid_id(test_db):
    db, _, _ = test_db
    with pytest.raises(ValueError, match="Invalid item ID format"):
        delete_item("invalid-uuid", db)

def test_list_items(test_db):
    db, user_id, _ = test_db
    location = Location(
        latitude=43.6532,
        longitude=-79.3832,
        address="123 Test St"
    )
    
    items = [
        Item(
            name="Product 1",
            title="Item 1",
            description="Description 1",
            image="image1.jpg",
            lister_id=user_id,
            price=10.99,
            location=location,
            category=ItemCategory.CLOTHING
        ),
        Item(
            name="Product 2",
            title="Item 2",
            description="Description 2",
            image="image2.jpg",
            lister_id=user_id,
            price=20.99,
            location=location,
            category=ItemCategory.ELECTRONICS
        )
    ]
    
    for item in items:
        result = create_item(item, db)
        assert "item_id" in result

    listed_items = list_items(db)
    assert len(listed_items) == 2
    
    for i, item in enumerate(listed_items):
        assert item.name == items[i].name
        assert item.title == items[i].title
        assert item.description == items[i].description
        assert item.image == items[i].image
        assert item.price == items[i].price
        assert item.latitude == items[i].location.latitude
        assert item.longitude == items[i].location.longitude
        assert item.address == items[i].location.address
        assert item.category == items[i].category
        assert item.lister_id == user_id