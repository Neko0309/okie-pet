# Okie Pet

An e-commerce web app for pet supplies, built as a full-stack learning project covering API design, authentication, payments, and cloud deployment.

## Tech stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Python + FastAPI
- **Database**: PostgreSQL (via SQLAlchemy + Alembic migrations)
- **Payments**: Stripe
- **Deployment**: AWS (target)

## Project structure

```
okie-pet/
├── backend/          # FastAPI app
│   ├── app/
│   │   ├── core/     # config, db session
│   │   ├── models/   # SQLAlchemy models
│   │   ├── schemas/  # Pydantic schemas
│   │   ├── routers/  # API route handlers
│   │   └── services/ # business logic
│   ├── alembic/      # DB migrations
│   └── requirements.txt
└── frontend/         # React + Vite app
    └── src/
```

## Roadmap

- [x] **Phase 0 — Scaffolding**: project structure, local dev environment (Postgres), backend/frontend talking to each other
- [ ] **Phase 1 — Core commerce**: auth (JWT), product catalog, cart, checkout with Stripe, order management, admin product/stock management, shipping cost display
- [ ] **Phase 2 — Cloud deployment**: AWS (EC2/Elastic Beanstalk + RDS + S3), custom domain + HTTPS, CI/CD via GitHub Actions
- [ ] **Phase 3 — Polish**: test coverage, logging/monitoring, API docs
- [ ] **Phase 4 — AI features**: product recommendations / semantic search

## Local development

### Prerequisites

- Python 3.13+, Node 22+, PostgreSQL 16 (`brew install postgresql@16`)

### Backend

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in real values
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

API docs available at `http://localhost:8000/docs`.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

App available at `http://localhost:5173`.
