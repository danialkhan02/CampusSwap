import pytest
import uuid as uuid_pkg
from unittest.mock import Mock, patch
from backend.models.seller_feedback import SellerFeedback
from backend.db_models.seller_feedbacks import SellerFeedbackOrm
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

    # Mock UUID generation
    test_uuid = uuid_pkg.uuid4()
    with patch('uuid.uuid4', return_value=test_uuid):
        from backend.db_interface.seller_feedbacks import create_seller_feedback
        result = create_seller_feedback(feedback, mock_db_session)

        # Verify database operations
        mock_db_session.add.assert_called_once()
        mock_db_session.commit.assert_called_once()

        assert result == {"feedback_id": str(test_uuid)}

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
    mock_feedback = Mock(spec=SellerFeedbackOrm)
    
    mock_db_session.query.return_value.filter.return_value.first.return_value = mock_feedback
    
    updated_feedback = SellerFeedback(
        seller_id=uuid_pkg.uuid4(),
        buyer_id=uuid_pkg.uuid4(),
        rating=4,
        feedback_message="Updated feedback",
        verified_purchase=True
    )
    
    from backend.db_interface.seller_feedbacks import update_seller_feedback
    result = update_seller_feedback(feedback_id, updated_feedback, mock_db_session)
    
    mock_db_session.query.assert_called_once_with(SellerFeedbackOrm)
    mock_db_session.commit.assert_called_once()
    assert result == mock_feedback

def test_delete_seller_feedback(mock_db_session):
    feedback_id = str(uuid_pkg.uuid4())
    mock_feedback = Mock(spec=SellerFeedbackOrm)
    
    mock_db_session.query.return_value.filter.return_value.first.return_value = mock_feedback
    
    from backend.db_interface.seller_feedbacks import delete_seller_feedback
    result = delete_seller_feedback(feedback_id, mock_db_session)
    
    mock_db_session.query.assert_called_once_with(SellerFeedbackOrm)
    
    # Instead of deleting, we set the deleted_at timestamp
    mock_feedback.deleted_at = datetime.now()  # Simulate soft delete
    mock_db_session.commit.assert_called_once()
    
    assert result is True

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
