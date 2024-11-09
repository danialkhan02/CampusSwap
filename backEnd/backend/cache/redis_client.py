from redis import Redis, ConnectionError
import json
from typing import Any, Optional
from datetime import timedelta
import os
from dotenv import load_dotenv
import logging

load_dotenv()

logger = logging.getLogger(__name__)

class RedisClient:
    def __init__(self):
        try:
            self.redis = Redis(
                    host=os.getenv('REDIS_HOST', 'localhost'),
                    port=int(os.getenv('REDIS_PORT', '6379')),
                    db=int(os.getenv('REDIS_DB', '0')),
                    socket_connect_timeout=1
                )
            self.default_ttl = timedelta(minutes=15)
            self.redis.ping()  # Test connection
            self.default_ttl = timedelta(minutes=15)
            self._connected = True
        except ConnectionError as e:
            logger.error(f"Failed to connect to Redis: {e}")
            self._connected = False

    def get(self, key: str) -> Optional[Any]:
        if not self._connected:
            return None
        try:
            value = self.redis.get(key)
            return json.loads(value) if value else None
        except Exception as e:
            logger.error(f"Redis get error: {str(e)}")
            return None

    def set(self, key: str, value: Any, ttl: Optional[timedelta] = None):
        if not self._connected:
            return
        try:
            json_value = json.dumps(value)
            self.redis.set(key, json_value, ex=int(ttl.total_seconds()) if ttl else int(self.default_ttl.total_seconds()))
        except Exception as e:
            logger.error(f"Redis set error: {str(e)}")

    def get_total_count(self, category: Optional[str] = None) -> Optional[int]:
        key = f"total_products:{category if category else 'all'}"
        count = self.get(key)
        return int(count) if count is not None else None

    def set_total_count(self, count: int, category: Optional[str] = None):
        key = f"total_products:{category if category else 'all'}"
        self.set(key, count, ttl=timedelta(hours=1))

redis_client = RedisClient()