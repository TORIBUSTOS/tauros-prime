# Alembic Migrations

This directory contains Alembic database migrations for TORO_Prime.

## Quick Start

```bash
# Install Alembic (if not already)
pip install -r requirements.txt

# Run migrations
python src/migrate.py

# Or with Alembic directly
alembic upgrade head
```

## Creating New Migrations

Whenever you modify SQLAlchemy models in `src/models/`, create a migration:

```bash
# Auto-generate a migration
alembic revision --autogenerate -m "description_of_change"

# Or create a blank migration
alembic revision -m "description_of_change"
```

Then edit the generated file in `versions/` to add your changes.

## Migrations History

| Revision | Description | Status |
|----------|-------------|--------|
| 001_add_missing_columns | Add subcategoria, tipo to movimientos and cascada_rules | ✅ Applied |

## Database Schema Verification

After running migrations, verify the schema:

```bash
sqlite3 toro_prime.db ".schema movimientos"
sqlite3 toro_prime.db ".schema cascada_rules"
```

Expected output for `movimientos`:
```
CREATE TABLE movimientos (
    id INTEGER PRIMARY KEY,
    fecha DATE,
    descripcion VARCHAR(500),
    monto FLOAT,
    categoria VARCHAR(100),
    subcategoria VARCHAR(100),  -- Added by migration
    tipo VARCHAR(50),           -- Added by migration
    confianza FLOAT,
    created_at DATETIME
);
```
