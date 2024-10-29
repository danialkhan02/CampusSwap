from fastapi import APIRouter, Response, status, Depends
from sqlalchemy.orm import Session
from backend.db_interface.items import (
    create_item,
    get_item,
    get_item_by_lister,
    update_item,
    delete_item,
    list_items,
    add_interested_buyer,
    get_product_details
)
from backend.api_responses import ApiResponse, ErrMessage
from backend.db_models.connection import Session as DefaultSession, get_db
from backend.models.item import Item

router = APIRouter()

@router.get("/list", summary="List all products", response_model=ApiResponse)
async def get_product_list(response: Response, db: Session = Depends(get_db)):
    """
    Get a list of all available products in the marketplace.

    This endpoint retrieves all products currently listed in the marketplace. 
    It returns a comprehensive list of product details, including information 
    about the seller, interested buyers, location, images, and other relevant 
    attributes. The response is structured to facilitate easy consumption by 
    clients, providing all necessary data in a single request.

    Responses:
    - **200 OK**: Returns a list of products with their details.
    - **500 Internal Server Error**: If an unexpected error occurs during processing.

    Example Response:
    {
        "data": [
            {
                "id": "product_id_1",
                "name": "Product Name",
                "price": 10.99,
                "images": ["image_data_1", "image_data_2"],
                "status": "STATUS_NEW",
                "seller": {
                    "id": "seller_id",
                    "first_name": "Seller First Name",
                    "last_name": "Seller Last Name",
                    "email": "seller@example.com"
                },
                "interested_buyers": [
                    {
                        "id": "buyer_id",
                        "first_name": "Buyer First Name",
                        "last_name": "Buyer Last Name",
                        "email": "buyer@example.com"
                    }
                ],
                "location": {
                    "latitude": 43.6532,
                    "longitude": -79.3832,
                    "address": "123 Test St"
                },
                "category": "TEXTBOOKS",
                "description": "Product Description"
            },
            ...
        ]
    }
    """
    try:
        with DefaultSession() as session:
            items = list_items(session)
            
            # Transform items into the required response format
            product_list = []
            for item in items:
                product_details = get_product_details(item, session)
                product_list.append(product_details)

            return ApiResponse(data=product_list)
            
    except Exception as e:
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return ApiResponse(error=ErrMessage(message=str(e)))

@router.get("/{product_id}", summary="Get a product by ID", response_model=ApiResponse)
async def get_product(product_id: str, response: Response, db: Session = Depends(get_db)) -> ApiResponse:
    """
    Retrieve a product by its unique identifier.

    This endpoint allows clients to fetch detailed information about a specific product 
    using its unique product ID. The response includes comprehensive details such as the 
    product's name, description, price, seller information, interested buyers, location, 
    images, and category. 

    Parameters:
    - **product_id**: The unique identifier of the product to be retrieved.

    Responses:
    - **200 OK**: Returns the product details if found.
    - **404 Not Found**: If the product with the specified ID does not exist.
    - **400 Bad Request**: If the input parameters are invalid.
    - **500 Internal Server Error**: If an unexpected error occurs during processing.
    """
    try:
        item = get_item(product_id, db)
        if not item:
            response.status_code = status.HTTP_404_NOT_FOUND
            return ApiResponse(error=ErrMessage(message="Product not found"))
        
        product_details = get_product_details(item, db)

        return ApiResponse(data=product_details)
    except ValueError as e:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return ApiResponse(error=ErrMessage(message=str(e)))
    except Exception as e:
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return ApiResponse(error=ErrMessage(message=str(e)))    

@router.get("/lister/{lister_id}", summary="Get a product by lister ID", response_model=ApiResponse)
async def get_products_by_lister(lister_id: str, response: Response, db: Session = Depends(get_db)):
    """
    Retrieve all products listed by a specific user.

    This endpoint allows clients to fetch a list of products that have been 
    created by a particular lister identified by their unique lister ID. 
    The response includes detailed information about each product, such as 
    the product's name, description, price, seller information, interested buyers, 
    location, images, and category. 

    Parameters:
    - **lister_id**: The unique identifier of the user who listed the products.

    Responses:
    - **200 OK**: Returns a list of products associated with the specified lister.
    - **400 Bad Request**: If the input parameters are invalid or the lister ID format is incorrect.
    - **500 Internal Server Error**: If an unexpected error occurs during processing.
    """
    try:
        with DefaultSession() as session:
            items = get_item_by_lister(lister_id, session)
            
            # Transform items into the required response format
            product_list = []
            for item in items:
                product_details = get_product_details(item, session)
                product_list.append(product_details)

            return ApiResponse(data=product_list)
            
    except ValueError as e:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return ApiResponse(error=ErrMessage(message=str(e)))
    except Exception as e:
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return ApiResponse(error=ErrMessage(message=str(e)))

@router.post("/create", summary="Create a new product", response_model=ApiResponse)
async def create_product(item: Item, response: Response, db: Session = Depends(get_db)):
    """
    Create a new product listing in the marketplace.

    This endpoint allows clients to create a new product listing by providing 
    the necessary details. The product will be added to the marketplace, 
    making it available for other users to view and interact with. 

    Required Fields:
    - **name**: The name of the product (string).
    - **price**: The price of the product (float).
    - **lister_id**: The ID of the user who is listing the product (string).
    - **location**: Optional location information (Location object).
    - **category**: The category of the product (string).
    - **images**: A list of base64-encoded images representing the product.

    Responses:
    - **201 Created**: Returns the details of the newly created product.
    - **400 Bad Request**: If the input parameters are invalid, such as missing required fields or incorrect data types.
    - **500 Internal Server Error**: If an unexpected error occurs during processing.
    """
    try:
        # Ensure that item.images is provided and is a list
        if not item.images or not isinstance(item.images, list):
            raise ValueError("Images must be provided as a list.")

        result = create_item(item, db)
        return ApiResponse(data=result)
    except ValueError as e:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return ApiResponse(error=ErrMessage(message=str(e)))
    except Exception as e:
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return ApiResponse(error=ErrMessage(message=str(e)))

@router.put("/{product_id}")
async def update_product(product_id: str, item: Item, response: Response, db: Session = Depends(get_db)) -> ApiResponse:
    """
    Update an existing product listing identified by its unique product ID.

    This endpoint allows clients to modify the details of a product that has 
    already been listed in the marketplace. Clients can update various attributes 
    of the product, including its name, description, price, location, category, 
    and images. 

    Parameters:
    - **product_id**: The unique identifier of the product to be updated.
    - **item**: An Item object containing the updated product details.

    Responses:
    - **200 OK**: Returns the updated product details if the update is successful.
    - **404 Not Found**: If the product with the specified ID does not exist.
    - **400 Bad Request**: If the input parameters are invalid.
    - **500 Internal Server Error**: If an unexpected error occurs during processing.
    """
    try:
        result = update_item(product_id, item, db)
        if result is None:
            response.status_code = status.HTTP_404_NOT_FOUND
            return ApiResponse(error=ErrMessage(message="Product not found"))
        
        dict_return = {
           "id": str(result.id),
           "name": result.name,
           "description": result.description,
           "price": result.price,
           "location": {
               "latitude": result.latitude,
               "longitude": result.longitude,
               "address": result.address
           },
           "category": result.category.value,
           "status": result.status.value,
           "images": [image.image_data for image in result.item_images]
        }
        
        return ApiResponse(data=dict_return)
    except ValueError as e:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return ApiResponse(error=ErrMessage(message=str(e)))
    except Exception as e:
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return ApiResponse(error=ErrMessage(message=str(e)))

@router.delete("/{product_id}", summary="Soft delete a product by ID", response_model=ApiResponse)
async def delete_product(product_id: str, user_id: str, response: Response, db: Session = Depends(get_db)) -> ApiResponse:
    """
    Soft delete a product identified by its ID.

    This endpoint allows the lister of a product to perform a soft delete operation, 
    marking the product as deleted without removing it from the database.
    All interested buyers are also soft deleted from the database.
    All images are also soft deleted from the database.
    Only the user who listed the product is authorized to delete it.

    Parameters:
    - **product_id**: The ID of the product to be deleted.
    - **user_id**: The ID of the user attempting to delete the product.

    Responses:
    - **200 OK**: If the product is successfully marked as deleted, returns a success message.
    - **403 Forbidden**: If the user is not the lister of the product, indicating they do not have permission to delete it.
    - **404 Not Found**: If the product does not exist or has already been marked as deleted.
    - **400 Bad Request**: If the input parameters are invalid.
    - **500 Internal Server Error**: If an unexpected error occurs during processing.
    """
    try:
        # Only delete if the user is the lister
        item = get_item(product_id, db)
        print(item.lister.id)
        print(user_id)
        if str(item.lister.id) != str(user_id):
            response.status_code = status.HTTP_403_FORBIDDEN
            return ApiResponse(error=ErrMessage(message="You are not the lister of this product"))
        
        result = delete_item(product_id, db)
        if not result:
            response.status_code = status.HTTP_404_NOT_FOUND
            return ApiResponse(error=ErrMessage(message="Product not found"))
        return ApiResponse(data={"success": True})
    except ValueError as e:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return ApiResponse(error=ErrMessage(message=str(e)))
    except Exception as e:
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return ApiResponse(error=ErrMessage(message=str(e)))

@router.post("/{product_id}/interested/{buyer_id}", summary="Add a buyer interest to a product", response_model=ApiResponse)
async def add_buyer_interest(product_id: str, buyer_id: str, response: Response, db: Session = Depends(get_db)) -> ApiResponse:
    """
    Add or toggle the interest of a buyer for a specific product.

    This endpoint allows a buyer to express interest in a product. 
    If the buyer does not currently exist in the interested buyers list for the product, 
    they will be added with their interest set to true. 
    If the buyer already exists, their interest status will be toggled:
    - If previously interested, their status will be set to false (not interested).
    - If previously not interested, their status will be set to true (interested).

    Parameters:
    - **product_id**: The ID of the product for which the buyer's interest is being recorded.
    - **buyer_id**: The ID of the buyer expressing interest in the product.

    Responses:
    - **200 OK**: If the operation is successful, returns the updated interest status of the buyer.
    - **404 Not Found**: If the product does not exist or the buyer ID is invalid.
    - **400 Bad Request**: If the input parameters are invalid.
    - **500 Internal Server Error**: If an unexpected error occurs during processing.
    """
    try:
        result = add_interested_buyer(product_id, buyer_id, db)
        if result is None:
            response.status_code = status.HTTP_404_NOT_FOUND
            return ApiResponse(error=ErrMessage(message="Product or buyer not found"))
        return ApiResponse(data={"interested": result})
    except ValueError as e:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return ApiResponse(error=ErrMessage(message=str(e)))
    except Exception as e:
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return ApiResponse(error=ErrMessage(message=str(e)))