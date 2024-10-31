from backend.api.routes.users import router as users
from backend.api.routes.products import router as products
from backend.api.routes.seller_profiles import router as seller_profiles
from backend.api.routes.notifications import router as notifications

__all__ = ["users", "products", "seller_profiles", "notifications"]