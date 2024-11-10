"""Load testing configuration"""

# Test scenarios
SCENARIOS = {
    "normal_load": {
        "users": 50,
        "spawn_rate": 10,
        "duration": "10m"
    },
    "peak_load": {
        "users": 200,
        "spawn_rate": 20,
        "duration": "5m"
    },
    "stress_test": {
        "users": 500,
        "spawn_rate": 50,
        "duration": "3m"
    }
}

# Test endpoints
BASE_URL = "http://localhost:6050"  # Your backend API URL 