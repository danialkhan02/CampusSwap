import pytest
import uuid as uuid_pkg
from unittest.mock import Mock, patch
from backend.models.item import Item, Location, ProductListQueryParams
from backend.enums import ItemCategory, ItemStatus, ItemCondition
from backend.db_models.items import ItemsOrm, ProductEmbeddingsOrm
from backend.db_models.users import UsersOrm
from backend.db_models.item_images import ItemImagesOrm
from backend.db_interface.items import add_first_image_to_items, apply_product_filters_with_cache, search_items
from backend.models.item import ProductListQueryParams
from botocore.exceptions import ClientError
from datetime import datetime
from unittest.mock import AsyncMock

@pytest.fixture
def mock_db_session():
    session = Mock()
    session.add = Mock()
    session.commit = Mock()
    session.close = Mock()
    session.rollback = Mock()
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

def test_add_first_image_to_items(mock_db_session):
    item_id = uuid_pkg.uuid4()
    mock_item = Mock(spec=ItemsOrm)
    mock_item.id = item_id

    # Mock the first image
    mock_image = Mock(spec=ItemImagesOrm)
    mock_image.image_data = "data:image/png;base64,valid_image_data"
    mock_db_session.query.return_value.filter.return_value.first.return_value = mock_image

    result = add_first_image_to_items(mock_item, mock_db_session)

    assert result == ["data:image/png;base64,valid_image_data"]
    mock_db_session.query.assert_called_once_with(ItemImagesOrm)

def test_apply_product_filters_with_cache(mock_db_session):
    params = ProductListQueryParams(
        category=ItemCategory.ELECTRONICS,
        condition=ItemCondition.CONDITION_NEW,
        price_min=100,
        price_max=500,
        sort="price_asc",
        page=1,
        limit=10
    )

    mock_query = Mock()
    mock_query.count.return_value = 5
    mock_query.all.return_value = [Mock(spec=ItemsOrm)]

    # Mock filter, order_by, offset, and limit to return the same mock_query object
    mock_query.filter.return_value = mock_query
    mock_query.order_by.return_value = mock_query
    mock_query.offset.return_value = mock_query
    mock_query.limit.return_value = mock_query

    items, total = apply_product_filters_with_cache(mock_query, params, mock_db_session)

    assert total == 5
    assert len(items) == 1
    mock_query.filter.assert_called()
    mock_query.offset.assert_called_once_with(0)
    mock_query.limit.assert_called_once_with(10)

def test_create_item_with_invalid_image(mock_db_session):
    user_id = uuid_pkg.uuid4()
    item = Item(
        name="Test Product",
        description="Test Description",
        images=["invalid_base64_string"],
        lister_id=user_id,
        price=10.99,
        category=ItemCategory.TEXTBOOKS,
        status=ItemStatus.STATUS_NEW,
        condition=ItemCondition.CONDITION_NEW
    )

    with pytest.raises(ValueError):
        from backend.db_interface.items import create_item
        create_item(item, mock_db_session)

def test_get_item_not_found(mock_db_session):
    item_id = str(uuid_pkg.uuid4())
    mock_db_session.query.return_value.filter.return_value.first.return_value = None
    
    from backend.db_interface.items import get_item
    result = get_item(item_id, mock_db_session)
    
    assert result is None
    mock_db_session.query.assert_called_once_with(ItemsOrm)

def test_get_item_invalid_id(mock_db_session):
    from backend.db_interface.items import get_item
    with pytest.raises(ValueError, match="Invalid item ID format"):
        get_item("invalid-uuid", mock_db_session)

@patch('backend.db_interface.items.s3_client')
def test_upload_to_s3_failure(mock_s3_client, mock_db_session):
    mock_s3_client.upload_fileobj.side_effect = ClientError(
        {'Error': {'Code': '500', 'Message': 'S3 Error'}},
        'operation'
    )
    
    image_data = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwAB/8h9CEYAAAAASUVORK5CYII="
    test_uuid = uuid_pkg.uuid4()
    
    with pytest.raises(ValueError, match="Failed to process image"):
        from backend.db_interface.items import upload_to_s3
        upload_to_s3(image_data, test_uuid, 0)

@pytest.mark.asyncio
async def test_search_items(mock_db_session):
    search_query = ProductListQueryParams(search_query="test")
    mock_items = [
        Mock(
            spec=ItemsOrm,
            id=str(uuid_pkg.uuid4()),  # Add id field
            name="Test Product 1",
            price=10.99,
            name_embedding=None,
            category_embedding=None,
            address_embedding=None,
            price_embedding=None,
            description_embedding=None,
            condition_embedding=None,
            product_id=str(uuid_pkg.uuid4()),
            description="Test description 1",
            category="TEXTBOOKS",
            condition="CONDITION_NEW",
            status="STATUS_NEW",
            created_at=datetime.now(),
            updated_at=datetime.now()
        ),
        Mock(
            spec=ItemsOrm,
            id=str(uuid_pkg.uuid4()),  # Add id field
            name="Test Product 2",
            price=20.99,
            name_embedding=None,
            category_embedding=None,
            address_embedding=None,
            price_embedding=None,
            description_embedding=None,
            condition_embedding=None,
            product_id=str(uuid_pkg.uuid4()),
            description="Test description 2",
            category="ELECTRONICS",
            condition="CONDITION_USED",
            status="STATUS_NEW",
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
    ]
    mock_db_session.query.return_value.filter.return_value.all.return_value = mock_items

    # Mock OpenAI client with proper return structure
    mock_openai = Mock()
    mock_openai.search_products = AsyncMock(return_value=[
        {"product_id": mock_items[0].id, "similarity": 0.8},
        {"product_id": mock_items[1].id, "similarity": 0.6}
    ])

    with patch('backend.db_interface.items.OpenAIClient', mock_openai):
        from backend.db_interface.items import search_items
        result = await search_items(search_query, mock_items, mock_db_session)
        
        assert len(result) == 2
        mock_db_session.query.assert_called_with(ItemsOrm)

@pytest.mark.asyncio
async def test_add_interested_buyer(mock_db_session):
    item_id = str(uuid_pkg.uuid4())
    user_id = str(uuid_pkg.uuid4())
    
    # Mock item and user
    mock_item = Mock(spec=ItemsOrm)
    mock_user = Mock(spec=UsersOrm)
    
    # Set up the query chain for item and user queries
    mock_db_session.query.return_value.filter.return_value.first.side_effect = [
        mock_item,  # First call returns mock_item
        mock_user,  # Second call returns mock_user
        None        # Third call returns None (for interested_buyer query)
    ]
    
    # Mock the append method for interested_buyers
    mock_item.interested_buyers = Mock()
    mock_item.interested_buyers.append = Mock()
    
    from backend.db_interface.items import add_interested_buyer
    result = add_interested_buyer(item_id, user_id, mock_db_session)
    
    assert result is True
    mock_item.interested_buyers.append.assert_called_once_with(mock_user)
    mock_db_session.commit.assert_called_once()

@pytest.mark.asyncio
async def test_add_interested_buyer_already_exists(mock_db_session):
    item_id = str(uuid_pkg.uuid4())
    user_id = str(uuid_pkg.uuid4())
    
    # Mock item, user, and existing interested_buyer
    mock_item = Mock(spec=ItemsOrm)
    mock_user = Mock(spec=UsersOrm)
    mock_interested_buyer = Mock(deleted_at=None)
    
    mock_db_session.query.return_value.filter.return_value.first.side_effect = [
        mock_item,
        mock_user,
        mock_interested_buyer
    ]
    
    from backend.db_interface.items import add_interested_buyer
    result = add_interested_buyer(item_id, user_id, mock_db_session)
    
    assert result is False
    mock_db_session.commit.assert_called_once()

@pytest.mark.asyncio
async def test_add_interested_buyer_invalid_ids(mock_db_session):
    from backend.db_interface.items import add_interested_buyer
    
    with pytest.raises(ValueError, match="Item ID and User ID are required"):
        add_interested_buyer("", "", mock_db_session)
    
    with pytest.raises(ValueError, match="Invalid ID format"):
        add_interested_buyer("invalid-uuid", "invalid-uuid", mock_db_session)

@pytest.mark.asyncio
async def test_add_interested_buyer_not_found(mock_db_session):
    item_id = str(uuid_pkg.uuid4())
    user_id = str(uuid_pkg.uuid4())
    
    # Mock item and user not found
    mock_db_session.query.return_value.filter.return_value.first.return_value = None
    
    from backend.db_interface.items import add_interested_buyer
    result = add_interested_buyer(item_id, user_id, mock_db_session)
    
    assert result is False
