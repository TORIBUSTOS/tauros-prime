import json
from datetime import date

from sqlalchemy.orm import Session

from src.models.movement import InsightCandidate, Movimiento
from src.services.insights_engine import InsightsEngineService


def _write_rules(tmp_path, rules):
    path = tmp_path / "insight_rules.json"
    path.write_text(json.dumps({"version": 1, "rules": rules}), encoding="utf-8")
    return path


def _add_movement(db: Session, fecha: date, descripcion: str, monto: float, categoria: str, subcategoria: str | None = None):
    mov = Movimiento(
        fecha=fecha,
        descripcion=descripcion,
        monto=monto,
        categoria=categoria,
        subcategoria=subcategoria,
        tipo="ingreso" if monto > 0 else "egreso",
        confianza=1.0 if categoria != "Sin categorizar" else 0.0,
    )
    db.add(mov)
    return mov


def test_uncategorized_rule_generates_review_candidate_from_external_config(db: Session, tmp_path):
    rules_path = _write_rules(tmp_path, [
        {
            "id": "uncategorized_test",
            "enabled": True,
            "kind": "uncategorized_movement",
            "tipo": "revision_manual",
            "classification": "revision_manual",
            "severity": "medium",
            "thresholds": {"high_amount": 100000, "medium_amount": 30000, "high_count": 3},
            "title_template": "Sin categoría",
            "description_template": "{count} pendiente(s) en {periodo}",
            "suggested_action": "Categorizar o crear regla.",
        }
    ])
    _add_movement(db, date(2026, 4, 3), "Documento 27963963144", 140000, "Sin categorizar")
    db.commit()

    candidates = InsightsEngineService.evaluate_period("2026-04", db, rules_path)

    assert len(candidates) == 1
    assert candidates[0].tipo == "revision_manual"
    assert candidates[0].severidad == "high"
    assert candidates[0].estado_revision == "pending"
    assert json.loads(candidates[0].datos_utilizados)["movement_ids"]


def test_income_dependency_skips_stable_structural_income(db: Session, tmp_path):
    rules_path = _write_rules(tmp_path, [
        {
            "id": "dependency_test",
            "enabled": True,
            "kind": "income_dependency",
            "tipo": "dependencia",
            "classification": "insight",
            "severity": "high",
            "thresholds": {
                "critical_share": 0.9,
                "change_vs_baseline": 0.2,
                "min_baseline_periods": 2,
                "max_candidates": 3,
            },
            "exclude_structural_entities": True,
            "structural_entities": ["OSPACA"],
            "title_template": "Dependencia {source}",
            "description_template": "{source} {share_pct}%",
            "suggested_action": "Revisar concentración.",
        }
    ])
    for month in [1, 2]:
        _add_movement(db, date(2026, month, 5), "OSPACA", 800, "OSPACA")
        _add_movement(db, date(2026, month, 6), "Otro ingreso", 200, "Otro")
    _add_movement(db, date(2026, 3, 5), "OSPACA", 800, "OSPACA")
    _add_movement(db, date(2026, 3, 6), "Otro ingreso", 200, "Otro")
    db.commit()

    candidates = InsightsEngineService.evaluate_period("2026-03", db, rules_path)

    assert candidates == []


def test_category_variation_requires_baseline_and_persists_trace(db: Session, tmp_path):
    rules_path = _write_rules(tmp_path, [
        {
            "id": "variation_test",
            "enabled": True,
            "kind": "category_variation",
            "tipo": "anomalia",
            "classification": "anomalia",
            "severity": "medium",
            "thresholds": {
                "change_vs_baseline": 0.5,
                "min_baseline_periods": 2,
                "min_current_amount": 1000,
                "max_candidates": 5,
            },
            "title_template": "Variación {category}",
            "description_template": "{category} {change_pct}%",
            "suggested_action": "Revisar detalle.",
        }
    ])
    _add_movement(db, date(2026, 1, 10), "Farmacia", -1000, "Farmacias")
    _add_movement(db, date(2026, 2, 10), "Farmacia", -1000, "Farmacias")
    _add_movement(db, date(2026, 3, 10), "Farmacia", -2500, "Farmacias")
    db.commit()

    candidates = InsightsEngineService.evaluate_period("2026-03", db, rules_path)

    assert len(candidates) == 1
    data = json.loads(candidates[0].datos_utilizados)
    assert data["category"] == "Farmacias"
    assert data["baseline_periods"] == 2
    assert db.query(InsightCandidate).count() == 1


def test_expected_recurrent_is_stored_as_ignored_kpi_not_pending_insight(db: Session, tmp_path):
    rules_path = _write_rules(tmp_path, [
        {
            "id": "recurrent_test",
            "enabled": True,
            "kind": "expected_recurrent",
            "tipo": "kpi",
            "classification": "kpi",
            "severity": "info",
            "default_review_status": "ignored",
            "thresholds": {"min_baseline_periods": 2, "min_current_count": 1},
            "structural_entities": ["Sueldos"],
            "title_template": "Baseline {source}",
            "description_template": "{source} esperado",
            "suggested_action": "No destacar.",
        }
    ])
    for month in [1, 2, 3]:
        _add_movement(db, date(2026, month, 10), "Nómina", -1000, "Sueldos")
    db.commit()

    candidates = InsightsEngineService.evaluate_period("2026-03", db, rules_path)

    assert len(candidates) == 1
    assert candidates[0].tipo == "kpi"
    assert candidates[0].estado_revision == "ignored"


def test_review_status_can_be_updated(db: Session, tmp_path):
    rules_path = _write_rules(tmp_path, [
        {
            "id": "uncategorized_test",
            "enabled": True,
            "kind": "uncategorized_movement",
            "tipo": "revision_manual",
            "classification": "revision_manual",
            "severity": "medium",
            "thresholds": {"high_amount": 100000, "medium_amount": 30000, "high_count": 3},
            "title_template": "Sin categoría",
            "description_template": "{count} pendiente(s) en {periodo}",
            "suggested_action": "Categorizar o crear regla.",
        }
    ])
    _add_movement(db, date(2026, 4, 3), "Pendiente", -500, "Sin categorizar")
    db.commit()
    candidate = InsightsEngineService.evaluate_period("2026-04", db, rules_path)[0]

    updated = InsightsEngineService.update_review_status(db, candidate.id, "approved")

    assert updated.estado_revision == "approved"
