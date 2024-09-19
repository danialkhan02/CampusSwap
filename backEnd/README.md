# Backend
API Gateway


### External Name: API Gateway

### Stack: Python 3.12.3, FastAPI 0.111.0, Poetry 1.8, Black 24.2, Ruff 0.

## Getting started

  ### Running the server
  1. `poetry install --sync`
  2. `poetry run start`

  ### Setup
  0. Update/install [Homebrew](https://brew.sh/), Xcode CLI Tools

  1. Install pyenv (recommended)
    1. `brew install pyenv`
    2. [init your shell](https://github.com/pyenv/pyenv?tab=readme-ov-file#set-up-your-shell-environment-for-pyenv)

  2. Install python v3.12.3 - `pyenv install 3.12.3`

  3. Install Poetry
    1. `brew install pipx`
    2. `pipx ensurepath`
    3. `pipx install poetry==1.8`

  4. Install dot-env plugin for poetry
    `poetry self add poetry-dotenv-plugin`

## Creating Migrations
   We use [alembic](https://alembic.sqlalchemy.org/) for migrations. We create & run migrations locally and then raise a pull request. We always keep our migrations [**backwards compatible**](https://planetscale.com/blog/backward-compatible-databases-changes)
  1. Autogenerate the migration using: `alembic revision --autogenerate -m "<insert message>"`
  2. Generate empty migration using `alembic revision -m "<insert message>"`
