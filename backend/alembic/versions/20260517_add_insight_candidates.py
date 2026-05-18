"""add insight candidates table

Revision ID: 20260517_add_insight_candidates
Revises: c833ff3daf60
Create Date: 2026-05-17

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


revision: str = "20260517_add_insight_candidates"
down_revision: Union[str, None] = "c833ff3daf60"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = inspect(bind)
    if "insight_candidates" not in inspector.get_table_names():
        op.create_table(
            "insight_candidates",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("candidate_uid", sa.String(length=64), nullable=False),
            sa.Column("tipo", sa.String(length=50), nullable=False),
            sa.Column("titulo", sa.String(length=255), nullable=False),
            sa.Column("descripcion", sa.Text(), nullable=False),
            sa.Column("severidad", sa.String(length=20), nullable=False),
            sa.Column("periodo_analizado", sa.String(length=7), nullable=False),
            sa.Column("regla_disparadora", sa.String(length=120), nullable=False),
            sa.Column("datos_utilizados", sa.Text(), nullable=False),
            sa.Column("explicacion", sa.Text(), nullable=False),
            sa.Column("accion_sugerida", sa.Text(), nullable=False),
            sa.Column("estado_revision", sa.String(length=30), nullable=False),
            sa.Column("created_at", sa.DateTime(), nullable=True),
            sa.Column("updated_at", sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("candidate_uid"),
        )

    inspector = inspect(bind)
    existing_indexes = {idx["name"] for idx in inspector.get_indexes("insight_candidates")}
    desired_indexes = [
        ("ix_insight_candidates_candidate_uid", ["candidate_uid"], True),
        ("ix_insight_candidates_estado_revision", ["estado_revision"], False),
        ("ix_insight_candidates_id", ["id"], False),
        ("ix_insight_candidates_periodo_analizado", ["periodo_analizado"], False),
        ("ix_insight_candidates_regla_disparadora", ["regla_disparadora"], False),
        ("ix_insight_candidates_severidad", ["severidad"], False),
        ("ix_insight_candidates_tipo", ["tipo"], False),
    ]
    for name, columns, unique in desired_indexes:
        if name not in existing_indexes:
            op.create_index(name, "insight_candidates", columns, unique=unique)


def downgrade() -> None:
    op.drop_index(op.f("ix_insight_candidates_tipo"), table_name="insight_candidates")
    op.drop_index(op.f("ix_insight_candidates_severidad"), table_name="insight_candidates")
    op.drop_index(op.f("ix_insight_candidates_regla_disparadora"), table_name="insight_candidates")
    op.drop_index(op.f("ix_insight_candidates_periodo_analizado"), table_name="insight_candidates")
    op.drop_index(op.f("ix_insight_candidates_id"), table_name="insight_candidates")
    op.drop_index(op.f("ix_insight_candidates_estado_revision"), table_name="insight_candidates")
    op.drop_index(op.f("ix_insight_candidates_candidate_uid"), table_name="insight_candidates")
    op.drop_table("insight_candidates")
