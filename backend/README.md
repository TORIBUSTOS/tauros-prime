# TORO_Prime Backend

FastAPI + SQLAlchemy. BN-001 (Parser + Categorizer + Learning).

## Setup

```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

## Tests

```bash
pytest -v --cov=src
```

## Run

```bash
python -m uvicorn src.main:app --reload --port 9000
```

API: http://localhost:9000/docs
