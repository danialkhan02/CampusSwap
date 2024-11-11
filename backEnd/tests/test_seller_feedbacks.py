import pytest
import uuid as uuid_pkg
from unittest.mock import Mock, patch
from backend.models.seller_feedback import SellerFeedback
from backend.db_models.seller_feedbacks import SellerFeedbackOrm
from backend.db_models.seller_profiles import SellerProfileOrm
from datetime import datetime
from backend.db_interface.seller_feedbacks import get_seller_feedback

@pytest.fixture
def mock_db_session():
    session = Mock()
    return session

def test_create_seller_feedback(mock_db_session):
    seller_id = uuid_pkg.uuid4()
    buyer_id = uuid_pkg.uuid4()
    feedback = SellerFeedback(
        seller_id=seller_id,
        buyer_id=buyer_id,
        rating=5,
        feedback_message="Great seller!",
        verified_purchase=True
    )

    # Mock seller profile
    mock_profile = Mock(spec=SellerProfileOrm)
    mock_profile.average_rating = 0.0

    # Mock existing feedbacks query
    mock_db_session.query.return_value.filter.return_value.all.return_value = [
        Mock(spec=SellerFeedbackOrm, rating=5)  # The new feedback we're adding
    ]
    # Mock profile query
    mock_db_session.query.return_value.filter.return_value.first.return_value = mock_profile

    # Mock UUID generation
    test_uuid = uuid_pkg.uuid4()
    with patch('uuid.uuid4', return_value=test_uuid):
        from backend.db_interface.seller_feedbacks import create_seller_feedback
        result = create_seller_feedback(feedback, mock_db_session)

        # Verify database operations
        assert mock_db_session.add.call_count == 1
        assert mock_db_session.commit.call_count == 2  # One for feedback creation, one for rating update
        assert result == {"feedback_id": str(test_uuid)}
        assert mock_profile.average_rating == 5.0  # Single 5-star rating

def test_get_seller_feedback(mock_db_session):
    feedback_id = str(uuid_pkg.uuid4())
    mock_feedback = Mock(spec=SellerFeedbackOrm)
    mock_feedback.seller_id = uuid_pkg.uuid4()
    mock_feedback.buyer_id = uuid_pkg.uuid4()
    mock_feedback.rating = 5
    mock_feedback.feedback_message = "Great seller!"
    mock_feedback.verified_purchase = True
    
    mock_db_session.query.return_value.filter.return_value.first.return_value = mock_feedback
    
    result = get_seller_feedback(feedback_id, mock_db_session)
    
    mock_db_session.query.assert_called_once_with(SellerFeedbackOrm)
    assert result == mock_feedback

def test_get_seller_feedback_invalid_id(mock_db_session):
    with pytest.raises(ValueError, match="Invalid feedback ID format"):
        get_seller_feedback("invalid-uuid", mock_db_session)

def test_update_seller_feedback(mock_db_session):
    feedback_id = str(uuid_pkg.uuid4())
    seller_id = uuid_pkg.uuid4()
    buyer_id = uuid_pkg.uuid4()
    
    # Create mock existing feedback
    mock_feedback = Mock(spec=SellerFeedbackOrm)
    mock_feedback.seller_id = seller_id
    mock_feedback.rating = 3  # Original rating
    
    # Create mock seller profile
    mock_profile = Mock(spec=SellerProfileOrm)
    mock_profile.average_rating = 3.0
    
    # Mock the queries
    def query_side_effect(*args):
        if args[0] == SellerFeedbackOrm:
            query = Mock()
            query.filter.return_value.first.return_value = mock_feedback
            query.filter.return_value.all.return_value = [
                Mock(spec=SellerFeedbackOrm, rating=5)  # Updated rating
            ]
            return query
        elif args[0] == SellerProfileOrm:
            query = Mock()
            query.filter.return_value.first.return_value = mock_profile
            return query
        return Mock()

    mock_db_session.query.side_effect = query_side_effect
    
    updated_feedback = SellerFeedback(
        seller_id=seller_id,
        buyer_id=buyer_id,
        rating=5,  # New rating
        feedback_message="Updated feedback",
        verified_purchase=True
    )
    
    from backend.db_interface.seller_feedbacks import update_seller_feedback
    result = update_seller_feedback(feedback_id, updated_feedback, mock_db_session)
    
    assert mock_db_session.commit.call_count == 2  # One for feedback update, one for rating update
    assert mock_profile.average_rating == 5.0  # Updated to new rating
    assert result == mock_feedback

def test_delete_seller_feedback(mock_db_session):
    feedback_id = str(uuid_pkg.uuid4())
    seller_id = uuid_pkg.uuid4()
    
    # Create mock feedback to be deleted
    mock_feedback = Mock(spec=SellerFeedbackOrm)
    mock_feedback.seller_id = seller_id
    mock_feedback.deleted_at = None
    
    # Create mock seller profile
    mock_profile = Mock(spec=SellerProfileOrm)
    mock_profile.average_rating = 4.5
    
    # Mock the queries
    def query_side_effect(*args):
        if args[0] == SellerFeedbackOrm:
            query = Mock()
            query.filter.return_value.first.return_value = mock_feedback
            # Return empty list for remaining feedbacks after deletion
            query.filter.return_value.all.return_value = []
            return query
        elif args[0] == SellerProfileOrm:
            query = Mock()
            query.filter.return_value.first.return_value = mock_profile
            return query
        return Mock()

    mock_db_session.query.side_effect = query_side_effect
    
    from backend.db_interface.seller_feedbacks import delete_seller_feedback
    result = delete_seller_feedback(feedback_id, mock_db_session)
    
    assert mock_db_session.commit.call_count == 2  # One for feedback deletion, one for rating update
    assert mock_profile.average_rating == 0.0  # No remaining feedbacks
    assert result is True
    assert mock_feedback.deleted_at is not None  # Verify soft delete

def test_delete_seller_feedback_not_found(mock_db_session):
    feedback_id = str(uuid_pkg.uuid4())
    mock_db_session.query.return_value.filter.return_value.first.return_value = None
    
    from backend.db_interface.seller_feedbacks import delete_seller_feedback
    result = delete_seller_feedback(feedback_id, mock_db_session)
    
    assert result is False

def test_list_seller_feedbacks(mock_db_session):
    seller_id = str(uuid_pkg.uuid4())
    mock_feedbacks = [
        Mock(spec=SellerFeedbackOrm, rating=5, feedback_message="Excellent"),
        Mock(spec=SellerFeedbackOrm, rating=4, feedback_message="Good")
    ]
    mock_db_session.query.return_value.filter.return_value.all.return_value = mock_feedbacks
    
    from backend.db_interface.seller_feedbacks import list_seller_feedbacks
    result = list_seller_feedbacks(seller_id, mock_db_session)
    
    mock_db_session.query.assert_called_once_with(SellerFeedbackOrm)
    assert result == mock_feedbacks

def test_list_seller_feedbacks_invalid_id(mock_db_session):
    from backend.db_interface.seller_feedbacks import list_seller_feedbacks
    with pytest.raises(ValueError, match="Invalid seller ID format"):
        list_seller_feedbacks("invalid-uuid", mock_db_session)

def test_list_seller_feedbacks_by_buyer(mock_db_session):
    buyer_id = str(uuid_pkg.uuid4())
    mock_feedbacks = [
        Mock(spec=SellerFeedbackOrm, rating=5, feedback_message="Excellent"),
        Mock(spec=SellerFeedbackOrm, rating=4, feedback_message="Good")
    ]
    mock_db_session.query.return_value.filter.return_value.all.return_value = mock_feedbacks
    
    from backend.db_interface.seller_feedbacks import list_seller_feedbacks_by_buyer
    result = list_seller_feedbacks_by_buyer(buyer_id, mock_db_session)
    
    mock_db_session.query.assert_called_once_with(SellerFeedbackOrm)
    assert result == mock_feedbacks

def test_list_seller_feedbacks_by_buyer_invalid_id(mock_db_session):
    from backend.db_interface.seller_feedbacks import list_seller_feedbacks_by_buyer
    with pytest.raises(ValueError, match="Invalid buyer ID format"):
        list_seller_feedbacks_by_buyer("invalid-uuid", mock_db_session)

def test_get_number_of_ratings(mock_db_session):
    seller_id = str(uuid_pkg.uuid4())
    
    # Create mock feedback objects with different ratings
    mock_feedbacks = [
        Mock(spec=SellerFeedbackOrm, rating=5),
        Mock(spec=SellerFeedbackOrm, rating=5),
        Mock(spec=SellerFeedbackOrm, rating=4),
        Mock(spec=SellerFeedbackOrm, rating=3),
        Mock(spec=SellerFeedbackOrm, rating=1)
    ]
    
    mock_db_session.query.return_value.filter.return_value.all.return_value = mock_feedbacks
    
    from backend.db_interface.seller_feedbacks import get_number_of_ratings
    result = get_number_of_ratings(seller_id, mock_db_session)
    
    expected_counts = {
        5: 2,  # Two 5-star ratings
        4: 1,  # One 4-star rating
        3: 1,  # One 3-star rating
        2: 0,  # No 2-star ratings
        1: 1   # One 1-star rating
    }
    
    assert result == expected_counts
    mock_db_session.query.assert_called_once_with(SellerFeedbackOrm)

def test_get_number_of_ratings_no_feedbacks(mock_db_session):
    seller_id = str(uuid_pkg.uuid4())
    
    # Return empty list to simulate no feedbacks
    mock_db_session.query.return_value.filter.return_value.all.return_value = []
    
    from backend.db_interface.seller_feedbacks import get_number_of_ratings
    result = get_number_of_ratings(seller_id, mock_db_session)
    
    expected_counts = {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0
    }
    
    assert result == expected_counts
    mock_db_session.query.assert_called_once_with(SellerFeedbackOrm)

def test_update_seller_average_rating_multiple_feedbacks(mock_db_session):
    seller_id = str(uuid_pkg.uuid4())
    
    # Create mock feedbacks with different ratings
    mock_feedbacks = [
        Mock(spec=SellerFeedbackOrm, rating=5),
        Mock(spec=SellerFeedbackOrm, rating=4),
        Mock(spec=SellerFeedbackOrm, rating=3),
        Mock(spec=SellerFeedbackOrm, rating=5)
    ]
    
    # Create mock seller profile
    mock_profile = Mock(spec=SellerProfileOrm)
    mock_profile.average_rating = 0.0
    
    # Setup mock queries
    mock_db_session.query.return_value.filter.return_value.all.return_value = mock_feedbacks
    mock_db_session.query.return_value.filter.return_value.first.return_value = mock_profile
    
    from backend.db_interface.seller_feedbacks import update_seller_average_rating
    update_seller_average_rating(seller_id, mock_db_session)
    
    # Expected average: (5 + 4 + 3 + 5) / 4 = 4.25
    assert mock_profile.average_rating == 4.25
    mock_db_session.commit.assert_called_once()
