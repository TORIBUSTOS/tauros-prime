from __future__ import annotations

import statistics
from collections import Counter, defaultdict
from datetime import date

from sqlalchemy.orm import Session

from src.models.movement import ManualObligation, Movimiento


class ForecastService:
    MIN_BASELINE_MONTHS = 3
    STRUCTURAL_MIN_ACTIVE_MONTHS = 4
    STABLE_CV_THRESHOLD = 0.65

    @staticmethod
    def forecast_3months(desde: str, db: Session) -> dict:
        year, month = map(int, desde.split("-"))
        start = date(year, month, 1)
        hist_start = ForecastService._add_months(start, -12)

        hist_movs = db.query(Movimiento).filter(
            Movimiento.fecha >= hist_start,
            Movimiento.fecha < start,
            Movimiento.categoria != "Sin categorizar",
        ).all()

        if not hist_movs:
            return {"error": "Insufficient historical data"}

        obligations = db.query(ManualObligation).filter(ManualObligation.pagado == 0).all()

        forecast = []
        for offset in range(3):
            target = ForecastService._add_months(start, offset)
            month_str = target.strftime("%Y-%m")
            month_forecast = ForecastService._forecast_month(target, hist_movs)
            month_forecast.extend(ForecastService._manual_obligations_for_month(target, obligations))
            forecast.append({"period": month_str, "forecast": month_forecast})

        scenarios = ForecastService._generate_scenarios(forecast)
        return {
            "period": desde,
            "forecast": forecast,
            "scenarios": scenarios,
            "metadata": {
                "baseline_start": hist_start.isoformat(),
                "baseline_end": ForecastService._add_months(start, -1).strftime("%Y-%m"),
                "baseline_months": ForecastService._count_periods(hist_movs),
                "method": "annual_baseline_structural_forecast",
            },
        }

    @staticmethod
    def _forecast_month(target: date, hist_movs: list[Movimiento]) -> list[dict]:
        by_group = defaultdict(list)
        for movement in hist_movs:
            by_group[ForecastService._group_label(movement)].append(movement)

        month_forecast = []
        for label, movs in by_group.items():
            monthly_totals = ForecastService._monthly_totals(movs)
            active_months = len(monthly_totals)
            if active_months < ForecastService.MIN_BASELINE_MONTHS:
                continue

            totals = list(monthly_totals.values())
            same_month_total = sum(m.monto for m in movs if m.fecha.month == target.month)
            has_seasonality = same_month_total != 0
            baseline_total = ForecastService._weighted_average(totals)
            expected_total = same_month_total if has_seasonality else baseline_total
            if expected_total == 0:
                continue

            std_dev = statistics.stdev(totals) if len(totals) > 1 else 0.0
            cv = abs(std_dev / baseline_total) if baseline_total else 0.0
            forecast_class = ForecastService._classify(active_months, cv, has_seasonality)
            confidence = ForecastService._confidence(active_months, cv, has_seasonality, forecast_class)
            days = [m.fecha.day for m in movs]
            suggested_day = Counter(days).most_common(1)[0][0] if days else None
            monthly_count = max(1, round(len(movs) / active_months))

            month_forecast.append({
                "categoria": label,
                "expected_count": monthly_count,
                "expected_total": round(expected_total, 2),
                "expected_avg": round(expected_total / monthly_count, 2),
                "std_dev": round(std_dev, 2),
                "confidence": confidence,
                "metadata": {
                    "forecast_class": forecast_class,
                    "active_months": active_months,
                    "baseline_months": ForecastService._count_periods(movs),
                    "baseline_avg": round(baseline_total, 2),
                    "coefficient_variation": round(cv, 4),
                    "method": "same_month_seasonality" if has_seasonality else "weighted_monthly_baseline",
                    "suggested_day": suggested_day,
                    "is_periodic": active_months >= ForecastService.STRUCTURAL_MIN_ACTIVE_MONTHS,
                },
            })

        return sorted(month_forecast, key=lambda item: abs(item["expected_total"]), reverse=True)

    @staticmethod
    def _manual_obligations_for_month(target: date, obligations: list[ManualObligation]) -> list[dict]:
        month_obligations = [
            obligation
            for obligation in obligations
            if obligation.fecha_limite.year == target.year and obligation.fecha_limite.month == target.month
        ]
        if not month_obligations:
            return []

        total = sum(obligation.monto for obligation in month_obligations)
        return [{
            "categoria": "Obligaciones Manuales",
            "expected_count": len(month_obligations),
            "expected_total": round(-total, 2),
            "expected_avg": round(total / len(month_obligations), 2),
            "std_dev": 0.0,
            "confidence": 0.95,
            "metadata": {
                "forecast_class": "manual",
                "method": "manual_obligations",
                "details": [obligation.concepto for obligation in month_obligations],
            },
        }]

    @staticmethod
    def _generate_scenarios(forecast: list) -> dict:
        total_realistic = sum(item["expected_total"] for period in forecast for item in period["forecast"])
        structural_total = sum(
            item["expected_total"]
            for period in forecast
            for item in period["forecast"]
            if item.get("metadata", {}).get("forecast_class") in {"structural", "seasonal", "manual"}
        )
        extraordinary_total = total_realistic - structural_total
        return {
            "realistic": {
                "total_3m": total_realistic,
                "structural_3m": structural_total,
                "extraordinary_3m": extraordinary_total,
                "description": "Baseline anual ponderado con recurrencias estructurales",
            },
            "optimistic": {
                "total_3m": total_realistic * 1.15,
                "description": "+15%",
            },
            "pessimistic": {
                "total_3m": total_realistic * 0.85,
                "description": "-15%",
            },
        }

    @staticmethod
    def _group_label(movement: Movimiento) -> str:
        if movement.subcategoria:
            return f"{movement.categoria} > {movement.subcategoria}"
        return movement.categoria

    @staticmethod
    def _monthly_totals(movements: list[Movimiento]) -> dict[str, float]:
        totals = defaultdict(float)
        for movement in movements:
            totals[movement.fecha.strftime("%Y-%m")] += movement.monto
        return dict(totals)

    @staticmethod
    def _weighted_average(values: list[float]) -> float:
        if not values:
            return 0.0
        weights = list(range(1, len(values) + 1))
        return sum(value * weight for value, weight in zip(values, weights)) / sum(weights)

    @staticmethod
    def _classify(active_months: int, cv: float, has_seasonality: bool) -> str:
        if has_seasonality:
            return "seasonal"
        if active_months >= ForecastService.STRUCTURAL_MIN_ACTIVE_MONTHS and cv <= ForecastService.STABLE_CV_THRESHOLD:
            return "structural"
        return "extraordinary"

    @staticmethod
    def _confidence(active_months: int, cv: float, has_seasonality: bool, forecast_class: str) -> float:
        base = 0.55 + min(active_months, 12) * 0.03
        if has_seasonality:
            base += 0.08
        if forecast_class == "structural":
            base += 0.08
        if forecast_class == "extraordinary":
            base -= 0.08
        base -= min(cv, 1.5) * 0.08
        return round(max(0.5, min(0.95, base)), 2)

    @staticmethod
    def _count_periods(movements: list[Movimiento]) -> int:
        return len({movement.fecha.strftime("%Y-%m") for movement in movements})

    @staticmethod
    def _add_months(value: date, months: int) -> date:
        month_index = value.month - 1 + months
        year = value.year + month_index // 12
        month = month_index % 12 + 1
        return date(year, month, 1)
