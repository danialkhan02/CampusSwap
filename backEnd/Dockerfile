FROM python:3.12

WORKDIR '/app'

ADD backend backend
ADD alembic alembic
COPY alembic.ini ./
COPY poetry.lock pyproject.toml ./

ENV POETRY_VERSION=1.8.0
RUN pip install "poetry==$POETRY_VERSION"
RUN poetry config virtualenvs.create false
RUN poetry install --no-interaction --no-ansi -vvv --without dev

CMD ["poetry", "run", "start"]