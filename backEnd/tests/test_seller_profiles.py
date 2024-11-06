import pytest
import uuid as uuid_pkg
from unittest.mock import Mock, patch
from backend.models.seller_profile import SellerProfile
from backend.db_models.seller_profiles import SellerProfileOrm
from backend.db_models.users import UsersOrm
from datetime import datetime, timezone

@pytest.fixture
def mock_db_session():
    session = Mock()
    return session

def test_create_seller_profile(mock_db_session):
    seller_id = uuid_pkg.uuid4()
    profile = SellerProfile(
        num_listings=0,
        total_transactions=0,
        average_rating=0.0
    )

    from backend.db_interface.seller_profiles import create_seller_profile
    result = create_seller_profile(profile, seller_id, mock_db_session)

    # Verify database operations
    mock_db_session.add.assert_called_once()
    mock_db_session.commit.assert_called_once()
    
    assert result == {"seller_id": str(seller_id)}

def test_get_seller_profile(mock_db_session):
    seller_id = uuid_pkg.uuid4()
    mock_profile = Mock(spec=SellerProfileOrm)
    mock_profile.seller_id = seller_id
    mock_profile.num_listings = 0
    mock_profile.total_transactions = 0
    mock_profile.average_rating = 0.0
    
    mock_db_session.query.return_value.filter.return_value.first.return_value = mock_profile
    
    from backend.db_interface.seller_profiles import get_seller_profile
    result = get_seller_profile(seller_id, mock_db_session)
    
    mock_db_session.query.assert_called_once_with(SellerProfileOrm)
    assert result == mock_profile

def test_update_seller_profile(mock_db_session):
    seller_id = uuid_pkg.uuid4()
    mock_profile = Mock(spec=SellerProfileOrm)
    mock_profile.seller_id = seller_id
    
    mock_db_session.query.return_value.filter.return_value.first.return_value = mock_profile
    
    updated_profile = SellerProfile(
        num_listings=5,
        total_transactions=5,
        average_rating=4.5
    )
    
    from backend.db_interface.seller_profiles import update_seller_profile
    result = update_seller_profile(seller_id, updated_profile, mock_db_session)
    
    mock_db_session.query.assert_called_once_with(SellerProfileOrm)
    mock_db_session.commit.assert_called_once()
    assert result == mock_profile

def test_delete_seller_profile(mock_db_session):
    seller_id = uuid_pkg.uuid4()
    mock_profile = Mock(spec=SellerProfileOrm)
    mock_profile.seller_id = seller_id
    mock_profile.deleted_at = None
    
    mock_db_session.query.return_value.filter.return_value.first.return_value = mock_profile
    
    from backend.db_interface.seller_profiles import delete_seller_profile
    result = delete_seller_profile(seller_id, mock_db_session)
    
    mock_db_session.query.assert_called_once_with(SellerProfileOrm)
    mock_db_session.commit.assert_called_once()
    assert result is True
    assert mock_profile.deleted_at is not None

def test_get_seller_profile_not_found(mock_db_session):
    seller_id = uuid_pkg.uuid4()
    mock_db_session.query.return_value.filter.return_value.first.return_value = None
    
    from backend.db_interface.seller_profiles import get_seller_profile
    result = get_seller_profile(seller_id, mock_db_session)
    
    assert result is None

def test_update_seller_profile_not_found(mock_db_session):
    seller_id = uuid_pkg.uuid4()
    mock_db_session.query.return_value.filter.return_value.first.return_value = None
    
    updated_profile = SellerProfile(
        num_listings=5,
        total_transactions=5,
        average_rating=4.5
    )
    
    from backend.db_interface.seller_profiles import update_seller_profile
    result = update_seller_profile(seller_id, updated_profile, mock_db_session)
    
    assert result is None

def test_delete_seller_profile_not_found(mock_db_session):
    seller_id = uuid_pkg.uuid4()
    mock_db_session.query.return_value.filter.return_value.first.return_value = None
    
    from backend.db_interface.seller_profiles import delete_seller_profile
    result = delete_seller_profile(seller_id, mock_db_session)
    
    assert result is False

def test_increment_num_listings(mock_db_session):
    seller_id = uuid_pkg.uuid4()
    mock_profile = Mock(spec=SellerProfileOrm)
    mock_profile.num_listings = 0
    
    mock_db_session.query.return_value.filter.return_value.first.return_value = mock_profile
    
    from backend.db_interface.seller_profiles import increment_num_listings
    increment_num_listings(seller_id, mock_db_session)
    
    assert mock_profile.num_listings == 1
    mock_db_session.commit.assert_called_once()

def test_decrement_num_listings(mock_db_session):
    seller_id = uuid_pkg.uuid4()
    mock_profile = Mock(spec=SellerProfileOrm)
    mock_profile.num_listings = 2
    
    mock_db_session.query.return_value.filter.return_value.first.return_value = mock_profile
    
    from backend.db_interface.seller_profiles import decrement_num_listings
    decrement_num_listings(seller_id, mock_db_session)
    
    assert mock_profile.num_listings == 1
    mock_db_session.commit.assert_called_once()

def test_increment_num_listings_nonexistent_profile(mock_db_session):
    seller_id = uuid_pkg.uuid4()
    mock_db_session.query.return_value.filter.return_value.first.return_value = None
    
    from backend.db_interface.seller_profiles import increment_num_listings
    increment_num_listings(seller_id, mock_db_session)
    
    mock_db_session.commit.assert_not_called()

def test_decrement_num_listings_nonexistent_profile(mock_db_session):
    seller_id = uuid_pkg.uuid4()
    mock_db_session.query.return_value.filter.return_value.first.return_value = None
    
    from backend.db_interface.seller_profiles import decrement_num_listings
    decrement_num_listings(seller_id, mock_db_session)
    
    mock_db_session.commit.assert_not_called()