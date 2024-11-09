import pytest
import uuid as uuid_pkg
from unittest.mock import Mock, patch
from backend.models.item import Item, Location
from backend.enums import ItemCategory, ItemStatus, ItemCondition
from backend.db_models.items import ItemsOrm, interested_buyers
from backend.db_models.item_images import ItemImagesOrm

@pytest.fixture
def mock_db_session():
    session = Mock()
    return session

@patch('backend.db_interface.items.upload_to_s3', return_value="https://mocked_s3_url.com/image.jpg")
def test_create_item_with_location_and_images(mock_upload_to_s3, mock_db_session):
    user_id = uuid_pkg.uuid4()
    location = Location(
        latitude=43.6532,
        longitude=-79.3832,
        address="123 Test St"
    )
    # Use a valid base64 string for a 1x1 pixel transparent PNG
    images = ["data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAwAB/8h9CEYAAAAASUVORK5CYII="]

    item = Item(
        name="Test Product",
        description="Test Description",
        images=images,
        lister_id=user_id,
        price=10.99,
        location=location,
        category=ItemCategory.TEXTBOOKS,
        status=ItemStatus.STATUS_NEW,
        condition=ItemCondition.CONDITION_NEW
    )

    # Mock UUID generation
    test_uuid = uuid_pkg.uuid4()
    with patch('uuid.uuid4', return_value=test_uuid):
        from backend.db_interface.items import create_item
        result = create_item(item, mock_db_session)

        # Verify database operations
        mock_db_session.add.assert_called()  # Called multiple times for item and images
        mock_db_session.commit.assert_called_once()
        mock_db_session.close.assert_called_once()

        assert result == {"item_id": str(test_uuid)}
        assert mock_upload_to_s3.call_count == len(item.images)

@patch('backend.db_interface.items.upload_to_s3', return_value="https://mocked_s3_url.com/image.jpg")
def test_create_item_without_location(mock_upload_to_s3, mock_db_session):
    user_id = uuid_pkg.uuid4()
    # Use valid base64 strings for testing
    images = ["data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAwAB/8h9CEYAAAAASUVORK5CYII="]

    item = Item(
        name="Test Product",
        description="Test Description",
        images=images,
        lister_id=user_id,
        price=10.99,
        category=ItemCategory.TEXTBOOKS,
        status=ItemStatus.STATUS_NEW,
        condition=ItemCondition.CONDITION_NEW
    )

    test_uuid = uuid_pkg.uuid4()
    with patch('uuid.uuid4', return_value=test_uuid):
        from backend.db_interface.items import create_item
        result = create_item(item, mock_db_session)

        mock_db_session.add.assert_called()
        mock_db_session.commit.assert_called_once()
        mock_db_session.close.assert_called_once()

        assert result == {"item_id": str(test_uuid)}
        assert mock_upload_to_s3.call_count == len(item.images)

def test_get_item(mock_db_session):
    item_id = str(uuid_pkg.uuid4())
    mock_item = Mock(spec=ItemsOrm)
    mock_item.name = "Test Product"
    mock_item.description = "Test Description"
    mock_item.price = 10.99
    mock_item.item_images = [Mock(spec=ItemImagesOrm, image_data="test_image.jpg")]
    
    mock_db_session.query.return_value.filter.return_value.first.return_value = mock_item
    
    from backend.db_interface.items import get_item
    result = get_item(item_id, mock_db_session)
    
    mock_db_session.query.assert_called_once_with(ItemsOrm)
    assert result == mock_item

@patch('backend.db_interface.items.upload_to_s3', return_value="https://mocked_s3_url.com/image.jpg")
def test_update_item(mock_upload_to_s3, mock_db_session):
    item_id = str(uuid_pkg.uuid4())
    user_id = uuid_pkg.uuid4()

    # Create mock existing item
    mock_item = Mock(spec=ItemsOrm)
    mock_item.item_images = [Mock(spec=ItemImagesOrm, image_data="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAwAB/8h9CEYAAAAASUVORK5CYII=")]  # Mock item_images as a list
    mock_db_session.query.return_value.filter.return_value.first.return_value = mock_item

    updated_item = Item(
        name="Updated Product",
        description="Updated Description",
        images=["data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAwAB/8h9CEYAAAAASUVORK5CYII="],
        lister_id=user_id,
        price=20.99,
        location=Location(latitude=43.6532, longitude=-79.3832, address="456 New St"),
        category=ItemCategory.ELECTRONICS,
        status=ItemStatus.STATUS_CLOSED,
        condition=ItemCondition.CONDITION_USED
    )

    from backend.db_interface.items import update_item
    result = update_item(item_id, updated_item, mock_db_session)

    mock_db_session.query.assert_called_once_with(ItemsOrm)
    mock_db_session.commit.assert_called_once()
    assert result == mock_item
    assert mock_upload_to_s3.call_count == len(updated_item.images)

def test_delete_item(mock_db_session):
    item_id = str(uuid_pkg.uuid4())
    mock_item = Mock(spec=ItemsOrm)
    mock_item.item_images = []  # Make it an empty list so it's iterable

    # Set up the query chain to return the mock item
    mock_db_session.query.return_value.filter.return_value.first.return_value = mock_item

    from backend.db_interface.items import delete_item
    result = delete_item(item_id, mock_db_session)

    # Verify database operations
    mock_db_session.query.assert_any_call(ItemsOrm)
    mock_db_session.commit.assert_called_once()

    assert result is True

def test_list_items(mock_db_session):
    mock_items = [
        Mock(spec=ItemsOrm, name="Product 1", price=10.99),
        Mock(spec=ItemsOrm, name="Product 2", price=20.99)
    ]
    mock_db_session.query.return_value.filter.return_value.all.return_value = mock_items
    
    from backend.db_interface.items import list_items
    result = list_items(mock_db_session)
    
    mock_db_session.query.assert_called_once_with(ItemsOrm)
    assert result == mock_items
