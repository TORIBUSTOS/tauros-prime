"""add missing columns to movimientos and cascada_rules

Revision ID: 001_add_missing_columns
Revises:
Create Date: 2026-04-09

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "001_add_missing_columns"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add subcategoria to movimientos if not exists
    try:
        op.add_column('movimientos', sa.Column('subcategoria', sa.String(100), nullable=True))
    except Exception:
        pass  # Column already exists

    # Add tipo to movimientos if not exists
    try:
        op.add_column('movimientos', sa.Column('tipo', sa.String(50), nullable=False, server_default='egreso'))
    except Exception:
        pass  # Column already exists

    # Add subcategoria to cascada_rules if not exists
    try:
        op.add_column('cascada_rules', sa.Column('subcategoria', sa.String(100), nullable=True))
    except Exception:
        pass  # Column already exists


def downgrade() -> None:
    # Drop columns
    try:
        op.drop_column('movimientos', 'subcategoria')
    except Exception:
        pass

    try:
        op.drop_column('movimientos', 'tipo')
    except Exception:
        pass

    try:
        op.drop_column('cascada_rules', 'subcategoria')
    except Exception:
        pass
