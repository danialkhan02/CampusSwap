from pydantic import BaseModel
import uuid as uuid_pkg
from typing import Optional

class Notification(BaseModel):
    user_id: uuid_pkg.UUID
    notif_type: str
    notif_string: str
    delete_flag: Optional[bool] = False

class NotificationInDB(Notification):
    id: uuid_pkg.UUID