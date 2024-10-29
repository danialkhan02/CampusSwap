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
from backend.db_models.items import interested_buyers
from backend.api_responses import ApiResponse, ErrMessage
from backend.db_models.connection import Session as DefaultSession, get_db
from backend.models.item import Item, Location
from backend.db_models.item_images import ItemImagesOrm
from backend.models.user import User
from backend.models.provider import Provider
from backend.db_models.users import UsersOrm
from typing import List
import uuid as uuid_pkg

router = APIRouter()

@router.get("/list", summary="List all products", response_model=ApiResponse)
async def get_product_list(response: Response, db: Session = Depends(get_db)):
    """
    Get a list of all available products in the marketplace.
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
    Get a product by its unique identifier.
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

@router.post("/create", summary="Create a new product", response_model=ApiResponse)
async def create_product(item: Item, response: Response, db: Session = Depends(get_db)):
    """
    Create a new product listing with the following details:
    - **name**: Name of the product
    - **price**: Price of the product
    - **location**: Optional location information
    - **category**: Product category
    - **images**: List of base64-encoded images for the product
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
    
@router.get("/lister/{lister_id}", summary="Get a product by lister ID", response_model=ApiResponse)
async def get_products_by_lister(lister_id: str, response: Response, db: Session = Depends(get_db)):
    """
    Get all products by a specific lister.
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

@router.put("/{product_id}")
async def update_product(product_id: str, item: Item, response: Response, db: Session = Depends(get_db)) -> ApiResponse:
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