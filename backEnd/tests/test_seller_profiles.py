import pytest
import uuid as uuid_pkg
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.db_models.base import BaseDbModel
from backend.db_models.users import UsersOrm
from backend.db_models.seller_profiles import SellerProfileOrm
from backend.db_interface.seller_profiles import (
    create_seller_profile,
    get_seller_profile,
    update_seller_profile,
    delete_seller_profile
)
from backend.models.seller_profile import SellerProfile

@pytest.fixture(scope="function")
def test_db():
    engine = create_engine("sqlite:///:memory:")
    BaseDbModel.metadata.create_all(engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = TestingSessionLocal()
    
    # Create a test user
    user = UsersOrm(
        email="seller@example.com",
        first_name="Test",
        last_name="Seller",
        stytch_id="test_seller_stytch_id"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    yield db, user.id
    db.close()

def test_create_seller_profile(test_db):
    db, user_id = test_db
    profile = SellerProfile(
        num_listings=0,
        total_transactions=0,
        average_rating=0.0
    )
    result = create_seller_profile(profile, user_id, db)
    assert "seller_id" in result
    assert str(user_id) == result["seller_id"]  # Should match the user_id since it's the PK

    db_profile = db.query(SellerProfileOrm).filter(SellerProfileOrm.seller_id == user_id).first()
    assert db_profile is not None
    assert db_profile.seller_id == user_id  # Verify the PK/FK relationship
    assert db_profile.num_listings == profile.num_listings
    assert db_profile.total_transactions == profile.total_transactions
    assert db_profile.average_rating == profile.average_rating

def test_get_seller_profile(test_db):
    db, user_id = test_db
    profile = SellerProfile(
        num_listings=0,
        total_transactions=0,
        average_rating=0.0
    )
    create_seller_profile(profile, user_id, db)

    retrieved_profile = get_seller_profile(user_id, db)
    assert retrieved_profile is not None
    assert retrieved_profile.seller_id == user_id  # Verify the PK matches
    assert retrieved_profile.num_listings == profile.num_listings
    assert retrieved_profile.total_transactions == profile.total_transactions
    assert retrieved_profile.average_rating == profile.average_rating

def test_update_seller_profile(test_db):
    db, user_id = test_db
    profile = SellerProfile(
        num_listings=0,
        total_transactions=0,
        average_rating=0.0
    )
    create_seller_profile(profile, user_id, db)

    updated_profile = SellerProfile(
        num_listings=5,
        total_transactions=5,
        average_rating=4.5
    )
    result = update_seller_profile(user_id, updated_profile, db)
    assert result is not None
    assert result.seller_id == user_id  # Verify PK remains unchanged
    assert result.num_listings == updated_profile.num_listings
    assert result.total_transactions == updated_profile.total_transactions
    assert result.average_rating == updated_profile.average_rating

def test_delete_seller_profile(test_db):
    db, user_id = test_db
    profile = SellerProfile(
        num_listings=0,
        total_transactions=0,
        average_rating=0.0
    )
    create_seller_profile(profile, user_id, db)

    delete_result = delete_seller_profile(user_id, db)
    assert delete_result is True

    deleted_profile = get_seller_profile(user_id, db)
    assert deleted_profile is None

def test_get_seller_profile_not_found(test_db):
    db, _ = test_db
    # Create a random UUID that doesn't correspond to any user
    non_existent_id = uuid_pkg.uuid4()
    result = get_seller_profile(non_existent_id, db)
    assert result is None

def test_update_seller_profile_not_found(test_db):
    db, _ = test_db
    # Create a random UUID that doesn't correspond to any user
    non_existent_id = uuid_pkg.uuid4()
    updated_profile = SellerProfile(
        num_listings=5,
        total_transactions=5,
        average_rating=4.5
    )
    result = update_seller_profile(non_existent_id, updated_profile, db)
    assert result is None

def test_delete_seller_profile_not_found(test_db):
    db, _ = test_db
    # Create a random UUID that doesn't correspond to any user
    non_existent_id = uuid_pkg.uuid4()
    result = delete_seller_profile(non_existent_id, db)
    assert result is False