from fastapi import APIRouter, Response, status, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.db_interface.items import (
    create_item,
    get_item,
    get_item_by_lister,
    update_item,
    delete_item,
    list_items,
    add_interested_buyer,
    get_product_details,
    get_interested_items
)
from backend.db_interface.seller_profiles import get_seller_profile, create_seller_profile, increment_num_listings, decrement_num_listings
from backend.models.seller_profile import SellerProfile
from backend.db_models.items import ItemsOrm, ProductEmbeddingsOrm
from backend.api_responses import ApiResponse, ErrMessage
from backend.db_models.connection import Session as DefaultSession, get_db
from backend.models.item import Item, ProductListQueryParams
import uuid as uuid_pkg
from sqlalchemy.sql import func
from backend.openai_integration.openai_client import OpenAIClient
from backend.models.item import GenerateDescriptionRequest


router = APIRouter()

@router.get("/search", summary="Search products with AI enhancement", response_model=ApiResponse)
async def search_products(
    query: str,
    db: Session = Depends(get_db)
):
    try:
        if not query:
            return ApiResponse(data=list_items(db))

        # Get all product embeddings from database
        product_embeddings = db.query(ProductEmbeddingsOrm).all()
        
        # Search products using embeddings
        search_results = await OpenAIClient.search_products(
            query, 
            [{"product_id": pe.product_id, **{
                f"{field}_embedding": getattr(pe, f"{field}_embedding")
                for field in ["name", "category", "address", "price", "description", "condition"]
            }} for pe in product_embeddings]
        )
        
        # Get full product details for matches
        results = []
        for result in search_results:
            product = db.query(ItemsOrm).filter(ItemsOrm.id == result["product_id"]).first()
            if product:
                product_details = get_product_details(product, db)
                results.append(product_details)
                
        return ApiResponse(data=results)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/list", summary="List filtered products", response_model=ApiResponse)
async def get_product_list(
    response: Response,
    db: Session = Depends(get_db),
    params: ProductListQueryParams = Depends()
):
    """
    Get a filtered list of products with pagination.

    This endpoint retrieves products based on the provided filters and pagination parameters.
    It returns a list of products matching the specified criteria.

    Parameters are provided through query parameters, validated by ProductListQueryParams.

    Responses:
    - **200 OK**: Returns a list of filtered products.
    - **400 Bad Request**: If the input parameters are invalid.
    - **500 Internal Server Error**: If an unexpected error occurs during processing.
    """
    try:
        # Build the base query once
        query = (
            db.query(
                ItemsOrm.id,
                ItemsOrm.name,
                ItemsOrm.price,
                ItemsOrm.category,
                ItemsOrm.condition,
                ItemsOrm.latitude,
                ItemsOrm.longitude,
            )
            .filter(ItemsOrm.deleted_at.is_(None))
        )

        # Apply filters
        print("Reached part 1")
        if params.category:
            query = query.filter(ItemsOrm.category == params.category)
        print("Reached part 2")
        if params.condition:
            query = query.filter(ItemsOrm.condition == params.condition)
        print("Reached part 3")
        if params.price_min is not None:
            query = query.filter(ItemsOrm.price >= params.price_min)
        print("Reached part 4")
        if params.price_max is not None:
            query = query.filter(ItemsOrm.price <= params.price_max)
        print("Reached part 5")
        # Location-based filtering
        if all(coord is not None for coord in [params.latitude, params.longitude, params.radius]):
            distance = func.acos(
                func.sin(func.radians(params.latitude)) * 
                func.sin(func.radians(ItemsOrm.latitude)) +
                func.cos(func.radians(params.latitude)) * 
                func.cos(func.radians(ItemsOrm.latitude)) * 
                func.cos(func.radians(ItemsOrm.longitude) - 
                func.radians(params.longitude))
            ) * 6371
            query = query.filter(distance <= params.radius)
        print("Reached part 6")
        # Apply sorting
        if params.sort:
            sort_mapping = {
                "price_asc": ItemsOrm.price.asc(),
                "price_desc": ItemsOrm.price.desc(),
                "created_at_asc": ItemsOrm.created_at.asc(),
                "created_at_desc": ItemsOrm.created_at.desc()
            }
            query = query.order_by(sort_mapping[params.sort])
        print("Reached part 7")
        # Get total count and paginated results in a single transaction
        total = query.count()
        items = query.offset((params.page - 1) * params.limit).limit(params.limit).all()
        print("Reached part 8")
        # Transform items efficiently
        product_list = [
            {
                "id": str(item.id),
                "name": item.name,
                "price": item.price,
                "category": item.category.value,
                "condition": item.condition.value,
            }
            for item in items
        ]
        print("Reached part 9")
        return ApiResponse(data={
            "items": product_list,
            "total": total,
            "page": params.page,
            "limit": params.limit
        })

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

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
    try:
        if not item.images or not isinstance(item.images, list):
            raise ValueError("Images must be provided as a list.")

        lister_uuid = uuid_pkg.UUID(str(item.lister_id))
        seller_profile = get_seller_profile(lister_uuid, db)
        
        if not seller_profile:
            new_profile = SellerProfile(
                num_listings=0,
                total_transactions=0,
                average_rating=0.0
            )
            create_seller_profile(new_profile, lister_uuid, db)

        # Create the product first
        result = create_item(item, db)
        
        # Generate embeddings for the product
        embeddings = await OpenAIClient.generate_product_embeddings(
            name=item.name,
            category=item.category.value,
            address=item.location.address if item.location else "",
            price=item.price,
            description=item.description or "",
            condition=item.condition.value
        )
        
        # Create embedding record
        product_embedding = ProductEmbeddingsOrm(
            id=uuid_pkg.uuid4(),
            product_id=uuid_pkg.UUID(result["item_id"]),
            **embeddings
        )
        db.add(product_embedding)
        db.commit()

        response.status_code = status.HTTP_201_CREATED
        increment_num_listings(lister_uuid, db)
        return ApiResponse(data=result)
        
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
        
        # Generate new embeddings
        embeddings = await OpenAIClient.generate_product_embeddings(
            name=item.name,
            category=item.category.value,
            address=item.location.address if item.location else "",
            price=item.price,
            description=item.description or "",
            condition=item.condition.value
        )
        
        # Update or create embedding record
        product_embedding = db.query(ProductEmbeddingsOrm).filter(
            ProductEmbeddingsOrm.product_id == uuid_pkg.UUID(product_id)
        ).first()
        
        if product_embedding:
            # Update existing embeddings
            for field, value in embeddings.items():
                setattr(product_embedding, field, value)
        else:
            # Create new embedding record
            product_embedding = ProductEmbeddingsOrm(
                id=uuid_pkg.uuid4(),
                product_id=uuid_pkg.UUID(product_id),
                **embeddings
            )
            db.add(product_embedding)
            
        db.commit()
        
        return ApiResponse(data=get_product_details(result, db))
        
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
        decrement_num_listings(item.lister.id, db)
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
    
@router.get("/interested/{user_id}", summary="Get all products a user is interested in", response_model=ApiResponse)
async def get_interested_products(user_id: str, response: Response, db: Session = Depends(get_db)):
    """
    Retrieve all products that a user is interested in.

    This endpoint allows clients to fetch a list of products that a specific user 
    has expressed interest in. The response includes detailed information about each 
    product, such as the product's name, description, price, seller information, 
    interested buyers, location, images, and category. 

    Parameters:
    - **user_id**: The unique identifier of the user whose interested products are being retrieved.

    Responses:
    - **200 OK**: Returns a list of products that the user is interested in.
    - **500 Internal Server Error**: If an unexpected error occurs during processing.
    """
    try:
        result = get_interested_items(user_id, db)

        product_list = []
        for item in result:
            product_details = get_product_details(item, db)
            product_list.append(product_details)

        return ApiResponse(data=product_list)
    except Exception as e:
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return ApiResponse(error=ErrMessage(message=str(e)))

@router.get("/{product_id}/generate-description", summary="Generate product description using AI", response_model=ApiResponse)
async def generate_product_description(product_id: str, response: Response, db: Session = Depends(get_db)):
    """
    Generate an AI-powered product description based on the product's images and details.

    This endpoint uses OpenAI's GPT-4o-mini model to analyze product images and information
    to generate a detailed, compelling product description.

    Parameters:
    - **product_id**: The unique identifier of the product

    Responses:
    - **200 OK**: Returns the generated product description
    - **404 Not Found**: If the product with the specified ID does not exist
    - **500 Internal Server Error**: If an error occurs during description generation
    """
    try:
        item = get_item(product_id, db)
        if not item:
            response.status_code = status.HTTP_404_NOT_FOUND
            return ApiResponse(error=ErrMessage(message="Product not found"))

        # Get all images for the product
        images = [img.image_data for img in item.item_images]
        
        if not images:
            raise ValueError("Product must have at least one image")

        # Generate description using OpenAI
        description = await OpenAIClient.generate_product_description(
            name=item.name,
            images=images,
            category=item.category.value,
            condition=item.condition.value
        )

        return ApiResponse(data={"description": description})
    except ValueError as e:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return ApiResponse(error=ErrMessage(message=str(e)))
    except Exception as e:
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return ApiResponse(error=ErrMessage(message=str(e)))

@router.post("/generate-description", summary="Generate product description using AI", response_model=ApiResponse)
async def generate_description(request: GenerateDescriptionRequest, response: Response):
    """
    Generate an AI-powered product description based on provided product details.

    This endpoint uses OpenAI's GPT-4o-mini model to analyze product images and information
    to generate a detailed, compelling product description.

    Parameters:
    - **name**: Product name
    - **images**: List of image URLs/base64 strings
    - **category**: Product category
    - **condition**: Product condition

    Responses:
    - **200 OK**: Returns the generated product description
    - **400 Bad Request**: If the input parameters are invalid
    - **500 Internal Server Error**: If an error occurs during description generation
    """
    try:
        if not request.images:
            raise ValueError("At least one image must be provided")

        # Generate description using OpenAI
        description = await OpenAIClient.generate_product_description(
            name=request.name,
            images=request.images,
            category=request.category,
            condition=request.condition
        )

        return ApiResponse(data={"description": description})
    except ValueError as e:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return ApiResponse(error=ErrMessage(message=str(e)))
    except Exception as e:
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return ApiResponse(error=ErrMessage(message=str(e)))
