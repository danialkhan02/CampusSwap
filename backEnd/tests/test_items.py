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
    add_interested_buyer,
)
from backend.models.item import Item, Location
from backend.db_models.item_images import ItemImagesOrm
from backend.enums import ItemCategory, ItemStatus
from backend.db_models.items import interested_buyers

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

def test_create_item_with_location_and_images(test_db):
    db, user_id, _ = test_db
    location = Location(
        latitude=43.6532,
        longitude=-79.3832,
        address="123 Test St"
    )
    images = ["test_image_0", "test_image_1"]
    item = Item(
        name="Test Product",
        description="Test Description",
        images=images,
        lister_id=user_id,
        price=10.99,
        location=location,
        category=ItemCategory.TEXTBOOKS,
        status=ItemStatus.STATUS_NEW
    )
    result = create_item(item, db)
    assert "item_id" in result

    db_item = db.query(ItemsOrm).filter(ItemsOrm.id == uuid_pkg.UUID(result["item_id"])).first()
    assert db_item is not None
    assert db_item.name == item.name
    assert db_item.latitude == item.location.latitude
    assert db_item.longitude == item.location.longitude
    assert db_item.address == item.location.address
    assert db_item.status == item.status
    assert db_item.category == item.category

    # Verify images
    assert len(db_item.item_images) == 2
    for i, image in enumerate(db_item.item_images):
        assert image.image_data == images[i]

def test_create_item_without_location(test_db):
    db, user_id, _ = test_db
    images = ["test_image_0"]
    item = Item(
        name="Test Product",
        description="Test Description",
        images=images,
        lister_id=user_id,
        price=10.99,
        category=ItemCategory.TEXTBOOKS,
        status=ItemStatus.STATUS_NEW
    )
    result = create_item(item, db)
    assert "item_id" in result

    db_item = db.query(ItemsOrm).filter(ItemsOrm.id == uuid_pkg.UUID(result["item_id"])).first()
    assert db_item is not None
    assert len(db_item.item_images) == 1

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
    images = ["test_image_0"]
    item = Item(
        name="Test Product",
        description="Test Description",
        images=images,
        lister_id=user_id,
        price=10.99,
        location=location,
        category=ItemCategory.TEXTBOOKS,
        status=ItemStatus.STATUS_NEW
    )
    result = create_item(item, db)
    item_id = result["item_id"]

    retrieved_item = get_item(item_id, db)
    assert retrieved_item is not None
    assert str(retrieved_item.id) == item_id
    assert retrieved_item.name == item.name
    assert retrieved_item.description == item.description
    assert retrieved_item.lister_id == item.lister_id
    assert retrieved_item.price == item.price
    assert retrieved_item.latitude == item.location.latitude
    assert retrieved_item.longitude == item.location.longitude
    assert retrieved_item.address == item.location.address
    
    # Verify image
    assert len(retrieved_item.item_images) == 1
    assert retrieved_item.item_images[0].image_data == images[0]

def test_update_item(test_db):
    db, user_id, _ = test_db
    location = Location(
        latitude=43.6532,
        longitude=-79.3832,
        address="123 Test St"
    )
    initial_images = ["test_image_0"]
    item = Item(
        name="Test Product",
        description="Test Description",
        images=initial_images,
        lister_id=user_id,
        price=10.99,
        location=location,
        category=ItemCategory.TEXTBOOKS,
        status=ItemStatus.STATUS_NEW
    )
    result = create_item(item, db)
    item_id = result["item_id"]

    updated_location = Location(
        latitude=43.7000,
        longitude=-79.4000,
        address="456 Updated St"
    )
    updated_images = ["test_image_0", "test_image_1"]
    updated_item = Item(
        name="Updated Product",
        description="Updated Description",
        images=updated_images,
        lister_id=user_id,
        price=15.99,
        location=updated_location,
        category=ItemCategory.ELECTRONICS,
        status=ItemStatus.STATUS_NEW
    )

    update_result = update_item(item_id, updated_item, db)
    assert update_result is not None

    retrieved_item = get_item(item_id, db)
    assert retrieved_item is not None
    assert len(retrieved_item.item_images) == 2

def test_delete_item_with_images(test_db):
    db, user_id, _ = test_db
    images = ["test_image_0"]
    item = Item(
        name="Test Product",
        description="Test Description",
        images=images,
        lister_id=user_id,
        price=10.99,
        category=ItemCategory.TEXTBOOKS,
        status=ItemStatus.STATUS_NEW
    )
    result = create_item(item, db)
    item_id = result["item_id"]

    # Verify images exist
    image_count = db.query(ItemImagesOrm).filter(
        ItemImagesOrm.item_id == uuid_pkg.UUID(item_id)
    ).count()
    assert image_count == 1

    # Delete the item
    delete_result = delete_item(item_id, db)
    assert delete_result is True

    # Verify the item and its images were soft deleted
    deleted_item = get_item(item_id, db)
    assert deleted_item.deleted_at is not None

    image_count = db.query(ItemImagesOrm).filter(
        ItemImagesOrm.item_id == uuid_pkg.UUID(item_id),
        ItemImagesOrm.deleted_at.is_(None)
    ).count()
    assert image_count == 0

def test_add_interested_buyer(test_db):
    db, lister_id, buyer_id = test_db
    
    item = Item(
        name="Test Product",
        description="Test Description",
        images=["test_image_0"],
        lister_id=lister_id,
        price=10.99,
        category=ItemCategory.TEXTBOOKS,
        status=ItemStatus.STATUS_NEW
    )
    result = create_item(item, db)
    item_id = result["item_id"]

    success = add_interested_buyer(item_id, str(buyer_id), db)
    assert success is True

    db_item = db.query(ItemsOrm).filter(ItemsOrm.id == uuid_pkg.UUID(item_id)).first()
    assert len(db_item.interested_buyers) == 1
    assert db_item.interested_buyers[0].id == buyer_id

def test_get_item_after_deletion(test_db):
    db, user_id, _ = test_db
    location = Location(
        latitude=43.6532,
        longitude=-79.3832,
        address="123 Test St"
    )
    images = ["test_image_0"]
    item = Item(
        name="Test Product",
        description="Test Description",
        images=images,
        lister_id=user_id,
        price=10.99,
        location=location,
        category=ItemCategory.TEXTBOOKS,
        status=ItemStatus.STATUS_NEW
    )
    result = create_item(item, db)
    item_id = result["item_id"]

    # Delete the item
    delete_result = delete_item(item_id, db)
    assert delete_result is True

    # Attempt to retrieve the deleted item
    deleted_item = get_item(item_id, db)
    assert deleted_item.deleted_at is not None  # Ensure the item is marked as deleted

def test_delete_item(test_db):
    db, user_id, _ = test_db
    location = Location(
        latitude=43.6532,
        longitude=-79.3832,
        address="123 Test St"
    )
    item = Item(
        name="Test Product",
        description="Test Description",
        images=["test_image.jpg"],
        lister_id=user_id,
        price=10.99,
        location=location,
        category=ItemCategory.TEXTBOOKS,
        status=ItemStatus.STATUS_NEW
    )
    result = create_item(item, db)
    item_id = result["item_id"]

    # First verify the item exists
    db_item = get_item(item_id, db)
    assert db_item is not None

    # Delete the item
    delete_result = delete_item(item_id, db)
    assert delete_result is True

    # Verify the item was soft deleted
    deleted_item = get_item(item_id, db)
    assert deleted_item.deleted_at is not None  # Ensure the item is marked as deleted

def test_delete_item_with_interested_buyers(test_db):
    db, lister_id, buyer_id = test_db

    item = Item(
        name="Test Product",
        description="Test Description",
        images=["test_image.jpg"],
        lister_id=lister_id,
        price=10.99,
        category=ItemCategory.TEXTBOOKS,
        status=ItemStatus.STATUS_NEW
    )
    result = create_item(item, db)
    item_id = result["item_id"]

    # Add an interested buyer
    add_interested_buyer(item_id, str(buyer_id), db)

    # Delete the item
    delete_result = delete_item(item_id, db)
    assert delete_result is True

    # Verify the item was soft deleted
    deleted_item = get_item(item_id, db)
    assert deleted_item.deleted_at is not None  # Ensure the item is marked as deleted

    # Verify the interested_buyers relationship was cleaned up
    interested_buyers_count = db.query(interested_buyers).filter(
        interested_buyers.c.item_id == uuid_pkg.UUID(item_id),
        interested_buyers.c.deleted_at.is_(None)
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
            description="Description 1",
            images=["test_image_0"],
            lister_id=user_id,
            price=10.99,
            location=location,
            category=ItemCategory.CLOTHING,
            status=ItemStatus.STATUS_NEW
        ),
        Item(
            name="Product 2",
            description="Description 2",
            images=["test_image_0"],
            lister_id=user_id,
            price=20.99,
            location=location,
            category=ItemCategory.ELECTRONICS,
            status=ItemStatus.STATUS_NEW
        )
    ]
    
    for item in items:
        result = create_item(item, db)
        assert "item_id" in result

    listed_items = list_items(db)
    assert len(listed_items) == 2
    
    for i, item in enumerate(listed_items):
        assert item.name == items[i].name
        assert item.description == items[i].description
        assert len(item.item_images) == 1
        assert item.item_images[0].image_data == items[i].images[0]
        assert item.price == items[i].price
        assert item.latitude == items[i].location.latitude
        assert item.longitude == items[i].location.longitude
        assert item.address == items[i].location.address
        assert item.category == items[i].category
        assert item.status == items[i].status
