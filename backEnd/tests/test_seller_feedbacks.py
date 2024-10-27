import pytest
import uuid as uuid_pkg
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.db_models.base import BaseDbModel
from backend.db_models.users import UsersOrm
from backend.db_models.seller_feedbacks import SellerFeedbackOrm
from backend.db_interface.seller_feedbacks import (
    create_seller_feedback,
    get_seller_feedback,
    update_seller_feedback,
    delete_seller_feedback,
    list_seller_feedbacks,
    list_seller_feedbacks_by_buyer
)
from backend.models.seller_feedback import SellerFeedback

# Setup test database
@pytest.fixture(scope="function")
def test_db():
    engine = create_engine("sqlite:///:memory:")
    BaseDbModel.metadata.create_all(engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = TestingSessionLocal()
    
    # Create test users (seller and buyer)
    seller = UsersOrm(
        email="seller@example.com",
        first_name="Test",
        last_name="Seller",
        stytch_id="test_seller_stytch_id"
    )
    buyer = UsersOrm(
        email="buyer@example.com",
        first_name="Test",
        last_name="Buyer",
        stytch_id="test_buyer_stytch_id"
    )
    db.add(seller)
    db.add(buyer)
    db.commit()
    db.refresh(seller)
    db.refresh(buyer)
    
    yield db, seller.id, buyer.id
    db.close()

# Test create_seller_feedback
def test_create_seller_feedback(test_db):
    db, seller_id, buyer_id = test_db
    feedback = SellerFeedback(
        seller_id=seller_id,
        buyer_id=buyer_id,
        rating=5,
        feedback_message="Great seller!",
        verified_purchase=True
    )
    result = create_seller_feedback(feedback, db)
    assert "feedback_id" in result
    assert isinstance(uuid_pkg.UUID(result["feedback_id"]), uuid_pkg.UUID)

    db_feedback = db.query(SellerFeedbackOrm).filter(SellerFeedbackOrm.id == uuid_pkg.UUID(result["feedback_id"])).first()
    assert db_feedback is not None
    assert db_feedback.seller_id == feedback.seller_id
    assert db_feedback.buyer_id == feedback.buyer_id
    assert db_feedback.rating == feedback.rating
    assert db_feedback.feedback_message == feedback.feedback_message
    assert db_feedback.verified_purchase == feedback.verified_purchase

def test_create_seller_feedback_invalid_input(test_db):
    db, _, _ = test_db
    with pytest.raises(ValueError, match="Feedback data is required"):
        create_seller_feedback(None, db)

# Test get_seller_feedback
def test_get_seller_feedback(test_db):
    db, seller_id, buyer_id = test_db
    feedback = SellerFeedback(
        seller_id=seller_id,
        buyer_id=buyer_id,
        rating=4,
        feedback_message="Good experience",
        verified_purchase=True
    )
    result = create_seller_feedback(feedback, db)
    feedback_id = result["feedback_id"]

    retrieved_feedback = get_seller_feedback(feedback_id, db)
    assert retrieved_feedback is not None
    assert str(retrieved_feedback.id) == feedback_id
    assert retrieved_feedback.seller_id == feedback.seller_id
    assert retrieved_feedback.buyer_id == feedback.buyer_id
    assert retrieved_feedback.rating == feedback.rating
    assert retrieved_feedback.feedback_message == feedback.feedback_message
    assert retrieved_feedback.verified_purchase == feedback.verified_purchase

def test_get_seller_feedback_invalid_id(test_db):
    db, _, _ = test_db
    with pytest.raises(ValueError, match="Invalid feedback ID format"):
        get_seller_feedback("invalid-uuid", db)

def test_get_seller_feedback_not_found(test_db):
    db, _, _ = test_db
    non_existent_id = str(uuid_pkg.uuid4())
    result = get_seller_feedback(non_existent_id, db)
    assert result is None

# Test update_seller_feedback
def test_update_seller_feedback(test_db):
    db, seller_id, buyer_id = test_db
    feedback = SellerFeedback(
        seller_id=seller_id,
        buyer_id=buyer_id,
        rating=3,
        feedback_message="Average",
        verified_purchase=True
    )
    result = create_seller_feedback(feedback, db)
    feedback_id = result["feedback_id"]

    updated_feedback = SellerFeedback(
        seller_id=seller_id,
        buyer_id=buyer_id,
        rating=4,
        feedback_message="Better than expected",
        verified_purchase=True
    )
    updated_result = update_seller_feedback(feedback_id, updated_feedback, db)
    assert updated_result is not None
    assert updated_result.rating == updated_feedback.rating
    assert updated_result.feedback_message == updated_feedback.feedback_message

def test_update_seller_feedback_not_found(test_db):
    db, seller_id, buyer_id = test_db
    non_existent_id = str(uuid_pkg.uuid4())
    updated_feedback = SellerFeedback(
        seller_id=seller_id,
        buyer_id=buyer_id,
        rating=5,
        feedback_message="Excellent",
        verified_purchase=True
    )
    result = update_seller_feedback(non_existent_id, updated_feedback, db)
    assert result is None

def test_update_seller_feedback_invalid_id(test_db):
    db, seller_id, buyer_id = test_db
    updated_feedback = SellerFeedback(
        seller_id=seller_id,
        buyer_id=buyer_id,
        rating=5,
        feedback_message="Excellent",
        verified_purchase=True
    )
    with pytest.raises(ValueError, match="Invalid feedback ID format"):
        update_seller_feedback("invalid-uuid", updated_feedback, db)

# Test delete_seller_feedback
def test_delete_seller_feedback(test_db):
    db, seller_id, buyer_id = test_db
    feedback = SellerFeedback(
        seller_id=seller_id,
        buyer_id=buyer_id,
        rating=4,
        feedback_message="Good seller",
        verified_purchase=True
    )
    result = create_seller_feedback(feedback, db)
    feedback_id = result["feedback_id"]

    delete_result = delete_seller_feedback(feedback_id, db)
    assert delete_result is True

    deleted_feedback = get_seller_feedback(feedback_id, db)
    assert deleted_feedback is None

def test_delete_seller_feedback_not_found(test_db):
    db, _, _ = test_db
    non_existent_id = str(uuid_pkg.uuid4())
    result = delete_seller_feedback(non_existent_id, db)
    assert result is False

def test_delete_seller_feedback_invalid_id(test_db):
    db, _, _ = test_db
    with pytest.raises(ValueError, match="Invalid feedback ID format"):
        delete_seller_feedback("invalid-uuid", db)

# Test list_seller_feedbacks
def test_list_seller_feedbacks(test_db):
    db, seller_id, buyer_id = test_db
    
    feedbacks = [
        SellerFeedback(seller_id=seller_id, buyer_id=buyer_id, rating=5, feedback_message="Excellent", verified_purchase=True),
        SellerFeedback(seller_id=seller_id, buyer_id=buyer_id, rating=4, feedback_message="Good", verified_purchase=True),
        SellerFeedback(seller_id=seller_id, buyer_id=buyer_id, rating=3, feedback_message="Average", verified_purchase=False),
    ]
    
    for feedback in feedbacks:
        create_seller_feedback(feedback, db)

    listed_feedbacks = list_seller_feedbacks(str(seller_id), db)
    assert len(listed_feedbacks) == 3
    
    for i, feedback in enumerate(listed_feedbacks):
        assert feedback.seller_id == seller_id
        assert feedback.buyer_id == buyer_id
        assert feedback.rating == feedbacks[i].rating
        assert feedback.feedback_message == feedbacks[i].feedback_message
        assert feedback.verified_purchase == feedbacks[i].verified_purchase

def test_list_seller_feedbacks_invalid_id(test_db):
    db, _, _ = test_db
    with pytest.raises(ValueError, match="Invalid seller ID format"):
        list_seller_feedbacks("invalid-uuid", db)

# Test list_seller_feedbacks_by_buyer
def test_list_seller_feedbacks_by_buyer(test_db):
    db, seller_id, buyer_id = test_db
    
    feedbacks = [
        SellerFeedback(seller_id=seller_id, buyer_id=buyer_id, rating=5, feedback_message="Excellent", verified_purchase=True),
        SellerFeedback(seller_id=seller_id, buyer_id=buyer_id, rating=4, feedback_message="Good", verified_purchase=True),
    ]
    
    for feedback in feedbacks:
        create_seller_feedback(feedback, db)

    listed_feedbacks = list_seller_feedbacks_by_buyer(str(buyer_id), db)
    assert len(listed_feedbacks) == 2
    
    for i, feedback in enumerate(listed_feedbacks):
        assert feedback.seller_id == seller_id
        assert feedback.buyer_id == buyer_id
        assert feedback.rating == feedbacks[i].rating
        assert feedback.feedback_message == feedbacks[i].feedback_message
        assert feedback.verified_purchase == feedbacks[i].verified_purchase

def test_list_seller_feedbacks_by_buyer_invalid_id(test_db):
    db, _, _ = test_db
    with pytest.raises(ValueError, match="Invalid buyer ID format"):
        list_seller_feedbacks_by_buyer("invalid-uuid", db)