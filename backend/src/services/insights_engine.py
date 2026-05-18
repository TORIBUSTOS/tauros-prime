from __future__ import annotations

import hashlib
import json
import re
from collections import defaultdict
from datetime import date, datetime
from pathlib import Path
from typing import Any

from sqlalchemy import and_, func
from sqlalchemy.orm import Session

from src.models.movement import InsightCandidate, Movimiento


VALID_REVIEW_STATES = {
    "pending",
    "approved",
    "rejected",
    "ignored",
    "converted_to_rule",
}


class InsightRulesConfigError(ValueError):
    pass


class InsightRuleLoader:
    DEFAULT_RULES_PATH = Path(__file__).resolve().parents[3] / "config" / "insight_rules.json"

    @staticmethod
    def load(path: str | Path | None = None) -> list[dict[str, Any]]:
        rules_path = Path(path) if path else InsightRuleLoader.DEFAULT_RULES_PATH
        if not rules_path.exists():
            raise InsightRulesConfigError(f"No existe el archivo de reglas: {rules_path}")

        with rules_path.open("r", encoding="utf-8") as fh:
            raw = json.load(fh)

        rules = raw.get("rules")
        if not isinstance(rules, list):
            raise InsightRulesConfigError("El archivo de reglas debe contener una lista 'rules'.")

        enabled_rules = []
        for rule in rules:
            if not rule.get("enabled", True):
                continue
            for field in ("id", "kind", "tipo", "classification", "severity"):
                if not rule.get(field):
                    raise InsightRulesConfigError(f"Regla incompleta: falta '{field}'.")
            enabled_rules.append(rule)
        return enabled_rules


class InsightsEngineService:
    @staticmethod
    def evaluate_period(
        periodo: str,
        db: Session,
        rules_path: str | Path | None = None,
        persist: bool = True,
    ) -> list[InsightCandidate]:
        rules = InsightRuleLoader.load(rules_path)
        start, end = InsightsEngineService._period_range(periodo)
        movements = db.query(Movimiento).filter(
            and_(Movimiento.fecha >= start, Movimiento.fecha < end)
        ).all()

        candidates: list[dict[str, Any]] = []
        for rule in rules:
            kind = rule["kind"]
            if kind == "uncategorized_movement":
                candidates.extend(InsightsEngineService._evaluate_uncategorized(rule, periodo, movements))
            elif kind == "income_dependency":
                candidates.extend(InsightsEngineService._evaluate_income_dependency(rule, periodo, db, movements, start))
            elif kind == "category_variation":
                candidates.extend(InsightsEngineService._evaluate_category_variation(rule, periodo, db, movements, start))
            elif kind == "expected_recurrent":
                candidates.extend(InsightsEngineService._evaluate_expected_recurrent(rule, periodo, db, movements, start))

        if not persist:
            return [InsightsEngineService._candidate_from_payload(payload) for payload in candidates]

        return [InsightsEngineService._upsert_candidate(db, payload) for payload in candidates]

    @staticmethod
    def list_candidates(
        db: Session,
        periodo: str | None = None,
        estado_revision: str | None = None,
    ) -> list[InsightCandidate]:
        query = db.query(InsightCandidate)
        if periodo:
            query = query.filter(InsightCandidate.periodo_analizado == periodo)
        if estado_revision:
            query = query.filter(InsightCandidate.estado_revision == estado_revision)
        return query.order_by(InsightCandidate.created_at.desc()).all()

    @staticmethod
    def update_review_status(db: Session, candidate_id: int, estado_revision: str) -> InsightCandidate:
        if estado_revision not in VALID_REVIEW_STATES:
            raise ValueError(f"Estado inválido: {estado_revision}")
        candidate = db.query(InsightCandidate).filter(InsightCandidate.id == candidate_id).first()
        if not candidate:
            raise LookupError("Insight candidate no encontrado")
        candidate.estado_revision = estado_revision
        candidate.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(candidate)
        return candidate

    @staticmethod
    def get_uncategorized_review_queue(db: Session, periodo: str | None = None) -> list[Movimiento]:
        query = db.query(Movimiento).filter(Movimiento.categoria == "Sin categorizar")
        if periodo:
            start, end = InsightsEngineService._period_range(periodo)
            query = query.filter(and_(Movimiento.fecha >= start, Movimiento.fecha < end))
        return query.order_by(func.abs(Movimiento.monto).desc(), Movimiento.fecha.desc()).all()

    @staticmethod
    def serialize_candidate(candidate: InsightCandidate) -> dict[str, Any]:
        return {
            "id": candidate.id,
            "candidate_uid": candidate.candidate_uid,
            "tipo": candidate.tipo,
            "titulo": candidate.titulo,
            "descripcion": candidate.descripcion,
            "severidad": candidate.severidad,
            "periodo_analizado": candidate.periodo_analizado,
            "regla_disparadora": candidate.regla_disparadora,
            "datos_utilizados": json.loads(candidate.datos_utilizados or "{}"),
            "explicacion": candidate.explicacion,
            "accion_sugerida": candidate.accion_sugerida,
            "estado_revision": candidate.estado_revision,
            "created_at": candidate.created_at,
            "updated_at": candidate.updated_at,
        }

    @staticmethod
    def _evaluate_uncategorized(rule: dict[str, Any], periodo: str, movements: list[Movimiento]) -> list[dict[str, Any]]:
        uncategorized = [m for m in movements if m.categoria == "Sin categorizar"]
        if not uncategorized:
            return []

        thresholds = rule.get("thresholds", {})
        max_abs = max(abs(m.monto) for m in uncategorized)
        count = len(uncategorized)
        severity = rule["severity"]
        if max_abs >= thresholds.get("high_amount", float("inf")) or count >= thresholds.get("high_count", float("inf")):
            severity = "high"
        elif max_abs >= thresholds.get("medium_amount", float("inf")):
            severity = "medium"

        data = {
            "count": count,
            "total_abs": round(sum(abs(m.monto) for m in uncategorized), 2),
            "max_abs": round(max_abs, 2),
            "movement_ids": [m.id for m in uncategorized],
            "sample": [
                {
                    "id": m.id,
                    "fecha": m.fecha.isoformat(),
                    "descripcion": m.descripcion,
                    "monto": m.monto,
                }
                for m in uncategorized[:10]
            ],
        }
        return [
            InsightsEngineService._build_payload(
                rule=rule,
                periodo=periodo,
                severity=severity,
                template_data={"count": count, "periodo": periodo},
                data=data,
                explanation="Los movimientos sin categoría no alimentan baseline confiable y requieren decisión humana.",
                fingerprint=f"{count}:{','.join(str(m.id) for m in uncategorized)}",
            )
        ]

    @staticmethod
    def _evaluate_income_dependency(
        rule: dict[str, Any],
        periodo: str,
        db: Session,
        movements: list[Movimiento],
        current_start: date,
    ) -> list[dict[str, Any]]:
        incomes = [m for m in movements if m.monto > 0]
        total_income = sum(m.monto for m in incomes)
        if total_income <= 0:
            return []

        thresholds = rule.get("thresholds", {})
        critical_share = thresholds.get("critical_share", 1.0)
        change_threshold = thresholds.get("change_vs_baseline", 1.0)
        min_periods = thresholds.get("min_baseline_periods", 99)
        max_candidates = thresholds.get("max_candidates", 3)
        structural = {InsightsEngineService._normalize(v) for v in rule.get("structural_entities", [])}

        current_by_source = InsightsEngineService._sum_by_source(incomes, income_mode=True)
        historical = db.query(Movimiento).filter(
            Movimiento.fecha < current_start,
            Movimiento.monto > 0,
        ).all()
        baseline_shares = InsightsEngineService._monthly_source_shares(historical)

        payloads = []
        for source, amount in sorted(current_by_source.items(), key=lambda item: item[1], reverse=True):
            share = amount / total_income
            source_norm = InsightsEngineService._normalize(source)
            history = baseline_shares.get(source, [])
            if len(history) < min_periods:
                continue
            baseline_share = sum(history) / len(history)
            change = share - baseline_share
            is_structural = source_norm in structural
            if is_structural and share < critical_share and abs(change) < change_threshold:
                continue
            if share < critical_share and abs(change) < change_threshold:
                continue

            data = {
                "source": source,
                "current_income": round(amount, 2),
                "period_income_total": round(total_income, 2),
                "share": round(share, 4),
                "share_pct": round(share * 100, 1),
                "baseline_share": round(baseline_share, 4),
                "baseline_share_pct": round(baseline_share * 100, 1),
                "change_vs_baseline": round(change, 4),
                "baseline_periods": len(history),
                "structural_entity": is_structural,
            }
            payloads.append(
                InsightsEngineService._build_payload(
                    rule=rule,
                    periodo=periodo,
                    severity=rule["severity"],
                    template_data={"source": source, "share_pct": data["share_pct"]},
                    data=data,
                    explanation="Se dispara solo cuando la concentración supera un umbral crítico o cambia contra el baseline histórico.",
                    fingerprint=f"{source}:{share:.4f}:{baseline_share:.4f}",
                )
            )
            if len(payloads) >= max_candidates:
                break
        return payloads

    @staticmethod
    def _evaluate_category_variation(
        rule: dict[str, Any],
        periodo: str,
        db: Session,
        movements: list[Movimiento],
        current_start: date,
    ) -> list[dict[str, Any]]:
        thresholds = rule.get("thresholds", {})
        change_threshold = thresholds.get("change_vs_baseline", 1.0)
        min_periods = thresholds.get("min_baseline_periods", 99)
        min_current_amount = thresholds.get("min_current_amount", float("inf"))
        max_candidates = thresholds.get("max_candidates", 5)

        current_by_category = InsightsEngineService._sum_abs_by_category(
            [m for m in movements if m.categoria != "Sin categorizar"]
        )
        historical = db.query(Movimiento).filter(
            Movimiento.fecha < current_start,
            Movimiento.categoria != "Sin categorizar",
        ).all()
        baseline = InsightsEngineService._monthly_category_totals(historical)

        payloads = []
        for category, current_total in sorted(current_by_category.items(), key=lambda item: item[1], reverse=True):
            if current_total < min_current_amount:
                continue
            history = baseline.get(category, [])
            if len(history) < min_periods:
                continue
            baseline_avg = sum(history) / len(history)
            if baseline_avg <= 0:
                continue
            change = (current_total - baseline_avg) / baseline_avg
            if abs(change) < change_threshold:
                continue

            data = {
                "category": category,
                "current_total_abs": round(current_total, 2),
                "baseline_avg_abs": round(baseline_avg, 2),
                "change_vs_baseline": round(change, 4),
                "change_pct": round(change * 100, 1),
                "baseline_periods": len(history),
            }
            payloads.append(
                InsightsEngineService._build_payload(
                    rule=rule,
                    periodo=periodo,
                    severity=rule["severity"],
                    template_data={"category": category, "change_pct": data["change_pct"]},
                    data=data,
                    explanation="Compara la categoría contra su promedio mensual histórico y exige baseline suficiente.",
                    fingerprint=f"{category}:{current_total:.2f}:{baseline_avg:.2f}",
                )
            )
            if len(payloads) >= max_candidates:
                break
        return payloads

    @staticmethod
    def _evaluate_expected_recurrent(
        rule: dict[str, Any],
        periodo: str,
        db: Session,
        movements: list[Movimiento],
        current_start: date,
    ) -> list[dict[str, Any]]:
        thresholds = rule.get("thresholds", {})
        min_periods = thresholds.get("min_baseline_periods", 99)
        min_current_count = thresholds.get("min_current_count", 1)
        structural = {InsightsEngineService._normalize(v) for v in rule.get("structural_entities", [])}
        if not structural:
            return []

        historical = db.query(Movimiento).filter(Movimiento.fecha < current_start).all()
        historical_periods_by_source = InsightsEngineService._periods_by_source(historical)
        current_counts = defaultdict(int)
        for movement in movements:
            source = InsightsEngineService._movement_source(movement)
            if InsightsEngineService._normalize(source) in structural:
                current_counts[source] += 1

        payloads = []
        for source, count in current_counts.items():
            if count < min_current_count:
                continue
            history_periods = historical_periods_by_source.get(source, set())
            if len(history_periods) < min_periods:
                continue
            data = {
                "source": source,
                "current_count": count,
                "baseline_periods": len(history_periods),
                "classification": rule["classification"],
                "highlight": False,
            }
            payloads.append(
                InsightsEngineService._build_payload(
                    rule=rule,
                    periodo=periodo,
                    severity=rule["severity"],
                    template_data={"source": source},
                    data=data,
                    explanation="Se registra como baseline esperado para evitar elevar recurrencias estructurales como insights obvios.",
                    fingerprint=f"{source}:{count}:{len(history_periods)}",
                )
            )
        return payloads

    @staticmethod
    def _build_payload(
        rule: dict[str, Any],
        periodo: str,
        severity: str,
        template_data: dict[str, Any],
        data: dict[str, Any],
        explanation: str,
        fingerprint: str,
    ) -> dict[str, Any]:
        title = rule.get("title_template", rule["id"]).format(**template_data)
        description = rule.get("description_template", title).format(**template_data)
        uid_source = f"{periodo}|{rule['id']}|{rule['classification']}|{fingerprint}"
        candidate_uid = hashlib.sha256(uid_source.encode("utf-8")).hexdigest()[:32]
        return {
            "candidate_uid": candidate_uid,
            "tipo": rule["tipo"],
            "titulo": title,
            "descripcion": description,
            "severidad": severity,
            "periodo_analizado": periodo,
            "regla_disparadora": rule["id"],
            "datos_utilizados": data,
            "explicacion": explanation,
            "accion_sugerida": rule.get("suggested_action", "Revisar manualmente antes de tomar decisiones."),
            "estado_revision": rule.get("default_review_status", "pending"),
        }

    @staticmethod
    def _upsert_candidate(db: Session, payload: dict[str, Any]) -> InsightCandidate:
        candidate = db.query(InsightCandidate).filter(
            InsightCandidate.candidate_uid == payload["candidate_uid"]
        ).first()
        if candidate:
            candidate.tipo = payload["tipo"]
            candidate.titulo = payload["titulo"]
            candidate.descripcion = payload["descripcion"]
            candidate.severidad = payload["severidad"]
            candidate.datos_utilizados = json.dumps(payload["datos_utilizados"], ensure_ascii=False)
            candidate.explicacion = payload["explicacion"]
            candidate.accion_sugerida = payload["accion_sugerida"]
            candidate.updated_at = datetime.utcnow()
        else:
            candidate = InsightsEngineService._candidate_from_payload(payload)
            db.add(candidate)
        db.commit()
        db.refresh(candidate)
        return candidate

    @staticmethod
    def _candidate_from_payload(payload: dict[str, Any]) -> InsightCandidate:
        return InsightCandidate(
            candidate_uid=payload["candidate_uid"],
            tipo=payload["tipo"],
            titulo=payload["titulo"],
            descripcion=payload["descripcion"],
            severidad=payload["severidad"],
            periodo_analizado=payload["periodo_analizado"],
            regla_disparadora=payload["regla_disparadora"],
            datos_utilizados=json.dumps(payload["datos_utilizados"], ensure_ascii=False),
            explicacion=payload["explicacion"],
            accion_sugerida=payload["accion_sugerida"],
            estado_revision=payload["estado_revision"],
        )

    @staticmethod
    def _period_range(periodo: str) -> tuple[date, date]:
        year, month = map(int, periodo.split("-"))
        start = date(year, month, 1)
        end = date(year + 1, 1, 1) if month == 12 else date(year, month + 1, 1)
        return start, end

    @staticmethod
    def _movement_source(movement: Movimiento) -> str:
        return movement.subcategoria or movement.categoria or movement.descripcion

    @staticmethod
    def _sum_by_source(movements: list[Movimiento], income_mode: bool = False) -> dict[str, float]:
        totals = defaultdict(float)
        for movement in movements:
            source = InsightsEngineService._movement_source(movement)
            totals[source] += movement.monto if income_mode else abs(movement.monto)
        return dict(totals)

    @staticmethod
    def _sum_abs_by_category(movements: list[Movimiento]) -> dict[str, float]:
        totals = defaultdict(float)
        for movement in movements:
            totals[movement.categoria] += abs(movement.monto)
        return dict(totals)

    @staticmethod
    def _monthly_source_shares(movements: list[Movimiento]) -> dict[str, list[float]]:
        totals_by_period = defaultdict(float)
        source_by_period = defaultdict(lambda: defaultdict(float))
        for movement in movements:
            period = movement.fecha.strftime("%Y-%m")
            source = InsightsEngineService._movement_source(movement)
            totals_by_period[period] += movement.monto
            source_by_period[period][source] += movement.monto

        shares = defaultdict(list)
        for period, total in totals_by_period.items():
            if total <= 0:
                continue
            for source, amount in source_by_period[period].items():
                shares[source].append(amount / total)
        return dict(shares)

    @staticmethod
    def _monthly_category_totals(movements: list[Movimiento]) -> dict[str, list[float]]:
        totals = defaultdict(lambda: defaultdict(float))
        for movement in movements:
            period = movement.fecha.strftime("%Y-%m")
            totals[movement.categoria][period] += abs(movement.monto)
        return {category: list(period_totals.values()) for category, period_totals in totals.items()}

    @staticmethod
    def _periods_by_source(movements: list[Movimiento]) -> dict[str, set[str]]:
        periods = defaultdict(set)
        for movement in movements:
            source = InsightsEngineService._movement_source(movement)
            periods[source].add(movement.fecha.strftime("%Y-%m"))
        return dict(periods)

    @staticmethod
    def _normalize(value: str) -> str:
        return re.sub(r"[^a-z0-9 ]", "", value.lower()).strip()
