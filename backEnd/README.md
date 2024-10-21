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
   ROLLBAR_SERVER_ACCESS_TOKEN=token
   SERVER_PORT=6050
   ```

### Running the server
1. Install dependencies: `poetry install --sync`
2. Run migrations: `poetry run alembic upgrade head`
3. Start the server: `poetry run start`

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
