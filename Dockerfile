FROM node:current-alpine3.22 AS frontend_builder

WORKDIR /app/
COPY src/unary/client /app
RUN yarn install

# =================================================

FROM python:3.13-alpine3.22 AS backend_builder

COPY --from=ghcr.io/astral-sh/uv:0.8 /uv /bin/uv

ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy
WORKDIR /app

RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    uv sync --no-dev --locked --no-install-project --no-editable

COPY . /app
COPY --from=frontend_builder /app /app/src/unary/client

RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --no-dev --frozen --no-editable

# =================================================

FROM python:3.13-alpine3.22
ENV PATH="/app/.venv/bin:$PATH"
COPY --from=backend_builder --chown=app:app /app/.venv /app/.venv

ENTRYPOINT ["python", "-m", "unary"]
