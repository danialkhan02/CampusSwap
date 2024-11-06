import pytest
import numpy as np
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
        "condition": "Good",
        "description": "Beautiful vintage leather jacket",
        "address": "123 Test St",
        "price": 99.99
    }

@pytest.mark.asyncio
async def test_generate_product_description_success(mock_openai_client, sample_product_data):
    expected_description = "Beautiful vintage leather jacket in good condition."
    mock_response = MagicMock()
    mock_response.choices = [MagicMock(message=MagicMock(content=expected_description))]
    mock_openai_client.chat.completions.create.return_value = mock_response
    
    client = OpenAIClientWrapper()
    result = await client.generate_product_description(
        name=sample_product_data["name"],
        images=sample_product_data["images"],
        category=sample_product_data["category"],
        condition=sample_product_data["condition"]
    )
    
    assert result == expected_description
    mock_openai_client.chat.completions.create.assert_called_once()

@pytest.mark.asyncio
async def test_generate_embedding_success(mock_openai_client):
    expected_embedding = [0.1, 0.2, 0.3]
    mock_response = MagicMock()
    mock_response.data = [MagicMock(embedding=expected_embedding)]
    mock_openai_client.embeddings.create.return_value = mock_response
    
    client = OpenAIClientWrapper()
    result = await client.generate_embedding("test text")
    
    assert result == expected_embedding
    mock_openai_client.embeddings.create.assert_called_once_with(
        model="text-embedding-3-small",
        input="test text",
        encoding_format="float"
    )

@pytest.mark.asyncio
async def test_generate_product_embeddings_success(mock_openai_client, sample_product_data):
    expected_embedding = [0.1, 0.2, 0.3]
    mock_response = MagicMock()
    mock_response.data = [MagicMock(embedding=expected_embedding)]
    mock_openai_client.embeddings.create.return_value = mock_response
    
    client = OpenAIClientWrapper()
    result = await client.generate_product_embeddings(
        name=sample_product_data["name"],
        category=sample_product_data["category"],
        address=sample_product_data["address"],
        price=sample_product_data["price"],
        description=sample_product_data["description"],
        condition=sample_product_data["condition"]
    )
    
    assert len(result) == 6  # One embedding for each field
    assert all(key.endswith('_embedding') for key in result.keys())
    assert all(isinstance(embedding, list) for embedding in result.values())
    assert mock_openai_client.embeddings.create.call_count == 6

@pytest.mark.asyncio
async def test_search_products_success(mock_openai_client):
    query = "leather jacket"
    product_embeddings = [
        {
            "product_id": "1",
            "name_embedding": [0.1, 0.2, 0.3],
            "description_embedding": [0.4, 0.5, 0.6]
        },
        {
            "product_id": "2",
            "name_embedding": [0.7, 0.8, 0.9],
            "description_embedding": [0.1, 0.1, 0.1]
        }
    ]
    
    mock_response = MagicMock()
    mock_response.data = [MagicMock(embedding=[0.1, 0.2, 0.3])]
    mock_openai_client.embeddings.create.return_value = mock_response
    
    client = OpenAIClientWrapper()
    results = await client.search_products(query, product_embeddings)
    
    assert isinstance(results, list)
    assert all("product_id" in result for result in results)
    assert all("similarity" in result for result in results)
    assert all(0 <= result["similarity"] <= 1 for result in results)

def test_calculate_similarity():
    client = OpenAIClientWrapper()
    embedding1 = [1.0, 0.0, 0.0]
    embedding2 = [1.0, 0.0, 0.0]
    embedding3 = [-1.0, 0.0, 0.0]
    
    similarity_same = client._calculate_similarity(embedding1, embedding2)
    similarity_opposite = client._calculate_similarity(embedding1, embedding3)
    
    assert np.isclose(similarity_same, 1.0)
    assert np.isclose(similarity_opposite, -1.0)

@pytest.mark.asyncio
async def test_generate_embedding_error(mock_openai_client):
    mock_openai_client.embeddings.create.side_effect = Exception("API Error")
    client = OpenAIClientWrapper()
    
    with pytest.raises(Exception):
        await client.generate_embedding("test text")

@pytest.mark.asyncio
async def test_search_products_empty_results(mock_openai_client):
    query = "nonexistent product"
    product_embeddings = []
    
    mock_response = MagicMock()
    mock_response.data = [MagicMock(embedding=[0.1, 0.2, 0.3])]
    mock_openai_client.embeddings.create.return_value = mock_response
    
    client = OpenAIClientWrapper()
    results = await client.search_products(query, product_embeddings)
    
    assert isinstance(results, list)
    assert len(results) == 0