FROM python:3.12

WORKDIR '/app'

COPY backend/ backend/
COPY alembic/ alembic/
COPY alembic.ini ./
COPY pyproject.toml poetry.lock ./

ENV POETRY_VERSION=1.8.0
RUN pip install "poetry==$POETRY_VERSION"
RUN poetry config virtualenvs.create false
RUN poetry install --no-interaction --no-ansi

# Run migrations and start the application
CMD ["python", "-m", "backend.main"]