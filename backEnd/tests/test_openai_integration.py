import pytest
from unittest.mock import MagicMock, patch
from backend.openai_integration.openai_client import OpenAIClientWrapper

@pytest.fixture
def mock_openai_client():
    with patch('backend.openai_integration.openai_client.OpenAI') as mock:
        client_instance = MagicMock()
        mock.return_value = client_instance
        yield client_instance

@pytest.fixture
def sample_product_data():
    return {
        "name": "Vintage Leather Jacket",
        "images": ["http://example.com/image1.jpg", "http://example.com/image2.jpg"],
        "category": "Clothing",
        "condition": "Good"
    }

@pytest.mark.asyncio
async def test_generate_product_description_success(mock_openai_client, sample_product_data):
    # Arrange
    expected_description = "Beautiful vintage leather jacket in good condition. Features classic styling with durable construction. Perfect for casual wear."
    
    # Mock the OpenAI response
    mock_response = MagicMock()
    mock_response.choices = [MagicMock(message=MagicMock(content=expected_description))]
    mock_openai_client.chat.completions.create.return_value = mock_response
    
    # Create client instance with OpenAIClientWrapper instead of OpenAIClient
    client = OpenAIClientWrapper()
    
    # Act
    result = await client.generate_product_description(
        name=sample_product_data["name"],
        images=sample_product_data["images"],
        category=sample_product_data["category"],
        condition=sample_product_data["condition"]
    )
    
    # Assert
    assert result == expected_description
    mock_openai_client.chat.completions.create.assert_called_once()
    
    # Verify the prompt structure
    call_args = mock_openai_client.chat.completions.create.call_args[1]
    assert call_args["model"] == "gpt-4o-mini"
    assert len(call_args["messages"]) == 1
    assert call_args["messages"][0]["role"] == "user"

@pytest.mark.asyncio
async def test_generate_product_description_error(mock_openai_client, sample_product_data):
    # Arrange
    mock_openai_client.chat.completions.create.side_effect = Exception("API Error")
    client = OpenAIClientWrapper()
    
    # Act & Assert
    with pytest.raises(Exception) as exc_info:
        await client.generate_product_description(
            name=sample_product_data["name"],
            images=sample_product_data["images"],
            category=sample_product_data["category"],
            condition=sample_product_data["condition"]
        )
    assert "Error generating product description" in str(exc_info.value)