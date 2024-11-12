FROM python:3.12

WORKDIR '/app'

# Install netcat for database connection check
RUN apt-get update && apt-get install -y netcat-traditional && rm -rf /var/lib/apt/lists/*

COPY backend/ backend/
COPY alembic/ alembic/
COPY alembic.ini ./
COPY pyproject.toml poetry.lock ./

ENV POETRY_VERSION=1.8.0
RUN pip install "poetry==$POETRY_VERSION"
RUN poetry config virtualenvs.create false
RUN poetry install --no-interaction --no-ansi

# Add an entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Use the entrypoint script
ENTRYPOINT ["docker-entrypoint.sh"]

# Run the application
CMD ["python", "-m", "backend.main"]