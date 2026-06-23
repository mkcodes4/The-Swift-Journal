import os
import json
import hashlib
from datetime import datetime, timedelta

CACHE_DIR = "server/cache"
CACHE_FILE = os.path.join(CACHE_DIR, "response_cache.json")
MAX_CACHE_SIZE = 1000
TTL_DAYS = 7

class ResponseCache:
    def __init__(self):
        if not os.path.exists(CACHE_DIR):
            os.makedirs(CACHE_DIR)
        self.cache = self._load_cache()

    def _load_cache(self):
        if os.path.exists(CACHE_FILE):
            try:
                with open(CACHE_FILE, 'r') as f:
                    return json.load(f)
            except (json.JSONDecodeError, IOError):
                return {}
        return {}

    def _save_cache(self):
        # Trimming logic: If cache is too big, remove oldest 10%
        if len(self.cache) > MAX_CACHE_SIZE:
            sorted_keys = sorted(self.cache.keys(), key=lambda x: self.cache[x].get('timestamp', ''))
            num_to_delete = int(MAX_CACHE_SIZE * 0.1)
            for i in range(num_to_delete):
                del self.cache[sorted_keys[i]]

        try:
            with open(CACHE_FILE, 'w') as f:
                json.dump(self.cache, f, indent=2)
        except IOError as e:
            print(f"[Cache] Error saving: {e}")

    def _get_query_hash(self, query: str):
        return hashlib.md5(query.lower().strip().encode()).hexdigest()

    def get(self, query: str):
        q_hash = self._get_query_hash(query)
        entry = self.cache.get(q_hash)
        
        if entry:
            # Check TTL
            ts = datetime.fromisoformat(entry['timestamp'])
            if datetime.now() - ts > timedelta(days=TTL_DAYS):
                return None
            return entry['response']
        return None

    def set(self, query: str, response: any):
        q_hash = self._get_query_hash(query)
        self.cache[q_hash] = {
            "query": query,
            "response": response,
            "timestamp": datetime.now().isoformat()
        }
        self._save_cache()
