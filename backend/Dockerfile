FROM python:3.13-slim

WORKDIR /app

# psycopg2-binary needs libpq at runtime; build tools only needed
# transiently for the pip install layer below.
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# Runs pending migrations before serving, so a deploy that adds a
# migration doesn't need a separate manual step.
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
