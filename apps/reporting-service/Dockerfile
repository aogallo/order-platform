FROM public.ecr.aws/lambda/python:3.12

COPY pyproject.toml .

RUN pip install uv && \
    uv sync --no-dev --no-cache
