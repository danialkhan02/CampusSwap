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

    def clear_all_caches(self):
        # Clear all cache keys
        self.delete_all_keys()

    def delete_all_keys(self):
        keys = self.redis.keys('*')  # Get all keys
        for key in keys:
            self.redis.delete(key)

redis_client = RedisClient()