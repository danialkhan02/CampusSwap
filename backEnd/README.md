# Backend
API Gateway

### External Name: API Gateway

### Stack: Python 3.12.3, FastAPI 0.111.0, Poetry 1.8, Black 24.2, Ruff 0.1, PostgreSQL 14

## Getting started

### Setup
0. Update/install [Homebrew](https://brew.sh/), Xcode CLI Tools

1. Install pyenv (recommended)
   1. `brew install pyenv`
   2. [Init your shell](https://github.com/pyenv/pyenv?tab=readme-ov-file#set-up-your-shell-environment-for-pyenv)

2. Install Python v3.12.3 - `pyenv install 3.12.3`

3. Install Poetry
   1. `brew install pipx`
   2. `pipx ensurepath`
   3. `pipx install poetry==1.8`

4. Install dot-env plugin for poetry
   `poetry self add poetry-dotenv-plugin`

5. Install PostgreSQL:
   `brew install postgresql@14`

6. Start PostgreSQL service:
   `brew services start postgresql@14`

7. Create database and user:
   ```
   createuser -s backend
   createdb -U backend backend
   ```

8. Set up the database password:
   ```
   psql postgres
   ALTER USER backend WITH PASSWORD 'secret';
   \q
   ```

9. Create a `.env` file in the `backEnd` directory with the following content:
   ```
   FRONTEND_URL=http://localhost:6041
   DB_HOST=localhost
   DB_NAME=backend
   DB_PASSWORD=secret
   DB_PORT=5432
   DB_USER=backend
   ENVIRONMENT=development
   LOGGING_ENABLED=False
   SERVER_PORT=6050
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_DB=0
   ```

10. Install and start Redis for caching:
   ```
   brew install redis
   brew services start redis
   ```
   Note if you want to clear the cache, you can run `redis-cli FLUSHALL`

### Running the server
1. Install dependencies: `poetry install --sync`
2. Run migrations: `poetry run alembic upgrade head`
3. Start the server: `poetry run start`

### Running Tests
1. Ensure you have all dependencies installed: `poetry install --sync`
2. Run the tests using pytest: `poetry run pytest`
3. To run tests with coverage report: `poetry run pytest --cov=backend --cov-report=term-missing`
4. For a more detailed HTML coverage report:
   a. Run: `poetry run pytest --cov=backend --cov-report=html`
   b. Open the generated `htmlcov/index.html` file in your browser to view the report

Note: Make sure your virtual environment is activated before running these commands.

## Creating Migrations
We use [alembic](https://alembic.sqlalchemy.org/) for migrations. We create & run migrations locally and then raise a pull request. We always keep our migrations [**backwards compatible**](https://planetscale.com/blog/backward-compatible-databases-changes)
1. Autogenerate the migration: `poetry run alembic revision --autogenerate -m "<insert message>"`
2. Generate empty migration: `poetry run alembic revision -m "<insert message>"`
3. Apply migrations: `poetry run alembic upgrade head`

### Viewing the Database

To inspect and manage the database, we recommend using TablePlus:

1. Download and install TablePlus from https://tableplus.com/

2. Open TablePlus and create a new connection with the following details:
   - Name: Backend Database (or any name you prefer)
   - Host: localhost
   - Port: 5432
   - Database: backend
   - User: backend
   - Password: secret

3. Save the connection and connect to view your database structure and data.

4. You can now explore tables, run queries, and manage your data through the TablePlus interface.

Note: Ensure your PostgreSQL server is running before attempting to connect.

## Adding New APIs

### API Structure
Our API follows a RESTful structure with the following organization:
- All routes are prefixed with `/api/v1`
- Routes are grouped by resource (e.g., users, products)
- Each resource has its own router file in `backend/api/routes/`

### Steps to Add a New API Endpoint

1. Choose or create a router file in `backend/api/routes/`
   - For existing resources, use the appropriate file (e.g., `products.py` for product endpoints)
   - For new resources, create a new file and register it in `backend/api/routes/__init__.py`

2. Define your endpoint using FastAPI decorators:
   - Use `@router.get(...)`, `@router.post(...)`, etc.
   - Define the path, summary, description, and response model
   - Add the endpoint to the router and include it in `api_router` in `backend/api/main.py`

3. For database operations:
   - Add your database interface functions in `backend/db_interface/`
   - Use dependency injection with `db: Session = Depends(get_db)`
   - Handle database exceptions appropriately

4. Testing:
   - Add tests in `tests/` directory
   - Test both success and error cases
   - Use pytest fixtures for database setup


### API Response Format
All API responses should use the `ApiResponse` model:
- Success: `ApiResponse(data=your_data)`
- Error: `ApiResponse(error=ErrMessage(message="error message"))`

### Load Testing

- Make sure the backend is running for at http://localhost:6050 
- In `backEnd` Run: `poetry run locust -f load_tests/locustfile.py --host=http://localhost:6050 --web-host=127.0.0.1 --web-port=8090`

1. Open the Locust web interface:
   - Visit http://127.0.0.1:8090
   - Set number of users
   - Set spawn rate (users/second)
   - Start the test

2. Monitor Results:
   - RPS (Requests per second)
   - Response times
   - Error rates
   - Download reports in CSV format

Note: Some endpoints are whitelisted for testing in `api_auth.py`:
- `/api/v1/products/search` since it doesn't need parameters
Product search is also the request that will most likely be performed simultaneously by multiple users

### Authentication
- All endpoints are automatically protected by Stytch authentication
- To bypass auth for specific endpoints, add them to the whitelist in `api_auth.py`
- Documentation endpoints (`/docs`, `/redoc`, `/openapi.json`) are automatically whitelisted