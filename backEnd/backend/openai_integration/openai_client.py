import os
from openai import OpenAI
from dotenv import load_dotenv
from typing import List, Dict
import numpy as np
from backend.db_models.items import ItemsOrm
from sqlalchemy.orm import Session

load_dotenv()

class OpenAIClientWrapper:
    def __init__(self, api_key_env: str = "OPENAI_API_KEY"):
        self.client = OpenAI(api_key=os.getenv(api_key_env))

    async def generate_product_description(self, name: str, images: list[str], category: str, condition: str) -> str:
        image_content = [{"type": "image_url", "image_url": {"url": img}} for img in images]
        
        prompt = f"""Generate a detailed product description for the following item:
        Name: {name}
        Category: {category}
        Condition: {condition}
        Images: {image_content}
        
        Please analyze the provided images and create a compelling, detailed description with a maximum of 50 words that 
        highlights the key features and benefits of the product. Keep the tone professional and informative.
        Only return the description, no other text."""

        messages = [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                ]
            }
        ]

        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages,
                max_tokens=500
            )
            return response.choices[0].message.content
        except Exception as e:
            raise Exception(f"Error generating product description: {str(e)}")

    async def generate_embedding(self, text: str) -> List[float]:
        """Generate embedding for a single text string"""
        response = self.client.embeddings.create(
            model="text-embedding-3-small",
            input=text,
            encoding_format="float"
        )
        return response.data[0].embedding

    async def generate_product_embeddings(self, 
        name: str, 
        category: str, 
        address: str, 
        price: float,
        description: str,
        condition: str
    ) -> Dict[str, List[float]]:
        """Generate embeddings for all product fields"""
        embeddings = {}
        fields = {
            "name": name,
            "category": category,
            "address": address,
            "price": str(price),
            "description": description,
            "condition": condition
        }
        
        for field, value in fields.items():
            embeddings[f"{field}_embedding"] = await self.generate_embedding(str(value))
            
        return embeddings

    async def search_products(self, query: str, product_embeddings: List[Dict], db: Session) -> List[Dict]:
        """Search products using embeddings"""
        query_embedding = await self.generate_embedding(query)
        
        results = []
        for product in product_embeddings:
            max_similarity = max(
                self._calculate_similarity(query_embedding, product[field])
                for field in product.keys()
                if field.endswith('_embedding')
            )
            
            product_name = db.query(ItemsOrm).filter(ItemsOrm.id == product["product_id"]).first().name
            if max_similarity >= 0.4 or query.lower() in product_name.lower():
                results.append({
                    "product_id": product["product_id"],
                    "similarity": max_similarity
                })

        return sorted(results, key=lambda x: x["similarity"], reverse=True)

    def _calculate_similarity(self, embedding1: List[float], embedding2: List[float]) -> float:
        """Calculate cosine similarity between two embeddings"""
        epsilon = 1e-10
        dot_product = np.dot(embedding1, embedding2)
        norm1 = np.linalg.norm(embedding1)
        norm2 = np.linalg.norm(embedding2)
        return dot_product / (max(norm1 * norm2, epsilon))

OpenAIClient = OpenAIClientWrapper()