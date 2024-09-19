FROM python:3.12

#create app directory
WORKDIR '/app'

ADD backend backend

ADD alembic alembic
COPY alembic.ini ./

#setup poetry for dependencies
ENV POETRY_VERSION=1.8.0
ENV FRONTEND_URL=https://localhost:7041
ENV SERVER_PORT=6050
ENV DB_USER=backend
ENV DB_PASSWORD=secret
ENV DB_HOST=host.docker.internal
ENV DB_NAME=backend
ENV DB_PORT=5433
ENV ENVIRONMENT="test"

RUN pip install "poetry==$POETRY_VERSION"

RUN poetry config virtualenvs.create false

COPY poetry.lock pyproject.toml ./

RUN poetry install --no-interaction --no-ansi -vvv --without dev

#start server
CMD ["poetry", "run", "start"]
