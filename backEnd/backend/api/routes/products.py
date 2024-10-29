from fastapi import APIRouter, Response, status, Depends
from sqlalchemy.orm import Session
from backend.db_interface.items import (
    create_item,
    get_item,
    get_item_by_lister,
    update_item,
    delete_item,
    list_items,
    add_interested_buyer
)
from backend.api_responses import ApiResponse, ErrMessage
from backend.db_models.connection import Session as DefaultSession, get_db
from backend.models.item import Item, Location
from backend.db_models.item_images import ItemImagesOrm
from backend.models.user import User
from backend.models.provider import Provider
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
                seller = User(
                    id=str(item.lister.id),
                    first_name=item.lister.first_name,
                    last_name=item.lister.last_name,
                    email=item.lister.email,
                    stytch_id=item.lister.stytch_id,
                    provider=Provider.OAUTH_AUTHENTICATION_TYPE_MICROSOFT
                )
                
                interested_buyers = []
                for buyer in item.interested_buyers:
                    interested_buyers.append(User(
                        id=str(buyer.id),
                        first_name=buyer.first_name,
                        last_name=buyer.last_name,
                        email=buyer.email,
                        stytch_id=buyer.stytch_id,
                        provider=Provider.OAUTH_AUTHENTICATION_TYPE_MICROSOFT
                    ).dict())

                location = None
                if item.latitude and item.longitude:
                    location = {
                        "latitude": item.latitude,
                        "longitude": item.longitude,
                        "address": item.address
                    }

                images = []
                #query the item_images table for the item_id
                item_images = db.query(ItemImagesOrm).filter(ItemImagesOrm.item_id == item.id).all()
                for image in item_images:
                    images.append(image.image_data)

                product_list.append({
                    "id": str(item.id),
                    "name": item.name,
                    "price": item.price,
                    "images": images,
                    "seller": seller.dict(),
                    "interested_buyers": interested_buyers,
                    "location": location,
                    "category": item.category.value,
                    "description": item.description,
                })

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
        
        seller = User(
            id=str(item.lister.id),
            first_name=item.lister.first_name,
            last_name=item.lister.last_name,
            email=item.lister.email,
            stytch_id=item.lister.stytch_id,
            provider=Provider.OAUTH_AUTHENTICATION_TYPE_MICROSOFT
                )
                
        interested_buyers = []
        for buyer in item.interested_buyers:
            interested_buyers.append(User(
                id=str(buyer.id),
                first_name=buyer.first_name,
                last_name=buyer.last_name,
                email=buyer.email,
                stytch_id=buyer.stytch_id,
                provider=Provider.OAUTH_AUTHENTICATION_TYPE_MICROSOFT
            ).dict())

        location = None
        if item.latitude and item.longitude:
            location = {
                "latitude": item.latitude,
                "longitude": item.longitude,
                "address": item.address
        }
        
        # Add images to the response
        images = []
        #query the item_images table for the item_id
        item_images = db.query(ItemImagesOrm).filter(ItemImagesOrm.item_id == item.id).all()
        print(item_images)
        for image in item_images:
            print(image.image_data)
            images.append(image.image_data)

        returned_item = {
            "id": str(item.id),
            "name": item.name,
            "price": item.price,
            "images": images,
            "seller": seller.dict(),
            "interested_buyers": interested_buyers,
            "location": location,
            "category": item.category.value,
            "description": item.description,
        }
        return ApiResponse(data=returned_item)
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
                seller = User(
                    id=str(item.lister.id),
                    first_name=item.lister.first_name,
                    last_name=item.lister.last_name,
                    email=item.lister.email,
                    stytch_id=item.lister.stytch_id,
                    provider=Provider.OAUTH_AUTHENTICATION_TYPE_MICROSOFT
                )
                
                interested_buyers = []
                for buyer in item.interested_buyers:
                    interested_buyers.append(User(
                        id=str(buyer.id),
                        first_name=buyer.first_name,
                        last_name=buyer.last_name,
                        email=buyer.email,
                        stytch_id=buyer.stytch_id,
                        provider=Provider.OAUTH_AUTHENTICATION_TYPE_MICROSOFT
                    ).dict())

                location = None
                if item.latitude and item.longitude:
                    location = {
                        "latitude": item.latitude,
                        "longitude": item.longitude,
                        "address": item.address
                    }

                images = []
                item_images = db.query(ItemImagesOrm).filter(ItemImagesOrm.item_id == item.id).all()
                for image in item_images:
                    images.append(image.image_data)

                product_list.append({
                    "id": str(item.id),
                    "name": item.name,
                    "price": item.price,
                    "images": images,
                    "seller": seller.dict(),
                    "interested_buyers": interested_buyers,
                    "location": location,
                    "category": item.category.value,
                    "description": item.description,
                })

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
        return ApiResponse(data=result)
    except ValueError as e:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return ApiResponse(error=ErrMessage(message=str(e)))
    except Exception as e:
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return ApiResponse(error=ErrMessage(message=str(e)))

@router.delete("/{product_id}", summary="Delete a product by ID", response_model=ApiResponse)
async def delete_product(product_id: str, user_id: str, response: Response, db: Session = Depends(get_db)) -> ApiResponse:
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
    try:
        result = add_interested_buyer(product_id, buyer_id, db)
        if result is None:
            response.status_code = status.HTTP_404_NOT_FOUND
            return ApiResponse(error=ErrMessage(message="Product or buyer not found"))
        if not result:
            response.status_code = status.HTTP_400_BAD_REQUEST
            return ApiResponse(error=ErrMessage(message="Buyer already interested in this product"))
        return ApiResponse(data={"success": True})
    except ValueError as e:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return ApiResponse(error=ErrMessage(message=str(e)))
    except Exception as e:
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return ApiResponse(error=ErrMessage(message=str(e)))