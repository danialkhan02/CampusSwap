import os
from openai import OpenAI
from dotenv import load_dotenv

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

OpenAIClient = OpenAIClientWrapper()