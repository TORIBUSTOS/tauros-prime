from datetime import datetime, timedelta, date
from sqlalchemy.orm import Session
from sqlalchemy import and_
from src.models.movement import Movimiento
import statistics
from collections import defaultdict, Counter

class InsightsService:
    @staticmethod
    def generate_insights(periodo: str, db: Session) -> list[dict]:
        """Optimized insights generation with caching and efficient queries"""
        year, month = periodo.split('-')
        year_int, month_int = int(year), int(month)

        # Build date range for efficient filtering (instead of LIKE)
        start_date = date(year_int, month_int, 1)
        if month_int == 12:
            end_date = date(year_int + 1, 1, 1)
        else:
            end_date = date(year_int, month_int + 1, 1)

        # Single optimized query with date range
        movs = db.query(Movimiento).filter(
            and_(
                Movimiento.fecha >= start_date,
                Movimiento.fecha < end_date,
                Movimiento.categoria != "Sin categorizar"
            )
        ).all()

        if not movs:
            return []

        # Pre-process data to avoid multiple iterations
        by_categoria = InsightsService._group_by_categoria(movs)

        insights = []
        insights.extend(InsightsService._detect_patterns(by_categoria))
        insights.extend(InsightsService._detect_outliers(by_categoria))
        insights.extend(InsightsService._detect_context_anomalies(by_categoria, db, year_int, month_int))

        return sorted(insights, key=lambda x: x['confidence'], reverse=True)

    @staticmethod
    def _group_by_categoria(movs: list) -> dict:
        """Single-pass categorization grouping"""
        by_categoria = defaultdict(list)
        for m in movs:
            by_categoria[m.categoria].append(m)
        return by_categoria

    @staticmethod
    def _detect_patterns(by_categoria: dict) -> list[dict]:
        """Detect recurring categories - O(n) instead of O(n²)"""
        insights = []
        # Sort by count descending, limit to top 3
        sorted_cats = sorted(by_categoria.items(), key=lambda x: len(x[1]), reverse=True)[:3]

        for cat, movs_cat in sorted_cats:
            count = len(movs_cat)
            if count >= 2:
                total = sum(m.monto for m in movs_cat)
                avg = total / count
                insights.append({
                    'type': 'pattern',
                    'categoria': cat,
                    'insight': f"{cat}: {count} transacciones, promedio ${avg:.2f}",
                    'confidence': 0.85,
                    'data': {'categoria': cat, 'count': count, 'total': total, 'avg': avg}
                })
        return insights

    @staticmethod
    def _detect_outliers(by_categoria: dict) -> list[dict]:
        """Detect outliers using pre-grouped data"""
        insights = []

        for categoria, movs_cat in by_categoria.items():
            if len(movs_cat) < 2:
                continue

            amounts = [m.monto for m in movs_cat]
            mean = statistics.mean(amounts)
            std = statistics.stdev(amounts) if len(amounts) > 1 else 0

            if std == 0:
                continue

            for mov in movs_cat:
                z = abs((mov.monto - mean) / std)
                if z > 2:
                    insights.append({
                        'type': 'outlier',
                        'categoria': categoria,
                        'insight': f"{categoria} en {mov.fecha}: ${mov.monto} (3x promedio ${mean:.2f})",
                        'confidence': 0.9,
                        'data': {'fecha': str(mov.fecha), 'categoria': categoria, 'monto': mov.monto}
                    })
        return insights

    @staticmethod
    def _detect_recurrences(by_categoria: dict, db: Session) -> list[dict]:
        """Detect recurring payments that the user should be aware of"""
        insights = []
        for cat, movs in by_categoria.items():
            if len(movs) < 2: continue
            
            days = [m.fecha.day for m in movs]
            most_common_day, freq = Counter(days).most_common(1)[0]
            recurrence_score = freq / len(movs)
            
            if recurrence_score > 0.5:
                avg_monto = statistics.mean([m.monto for m in movs])
                insights.append({
                    'type': 'recurrence',
                    'categoria': cat,
                    'insight': f"Patrón detectado: {cat} suele ocurrir alrededor del día {most_common_day}. Estimado: ${abs(avg_monto):,.2f}",
                    'confidence': min(0.95, 0.6 + recurrence_score),
                    'data': {'day': most_common_day, 'avg_monto': avg_monto, 'score': recurrence_score}
                })
        return insights

    @staticmethod
    def _detect_context_anomalies(by_categoria: dict, db: Session, year_int: int, month_int: int) -> list[dict]:
        """Detect context anomalies by comparing with previous month"""
        insights = []
        insights.extend(InsightsService._detect_recurrences(by_categoria, db))

        # Calculate previous month
        prev_month = month_int - 1
        prev_year = year_int
        if prev_month == 0:
            prev_month = 12
            prev_year = year_int - 1

        # Query previous month with date range (efficient)
        prev_start = date(prev_year, prev_month, 1)
        if prev_month == 12:
            prev_end = date(prev_year + 1, 1, 1)
        else:
            prev_end = date(prev_year, prev_month + 1, 1)

        prev_movs = db.query(Movimiento).filter(
            and_(
                Movimiento.fecha >= prev_start,
                Movimiento.fecha < prev_end,
                Movimiento.categoria != "Sin categorizar"
            )
        ).all()

        if not prev_movs:
            return insights

        # Single-pass aggregation for both current and previous months
        prev_by_cat = defaultdict(lambda: {'count': 0, 'total': 0})
        for m in prev_movs:
            prev_by_cat[m.categoria]['count'] += 1
            prev_by_cat[m.categoria]['total'] += m.monto

        # Compare current vs previous
        for cat, movs_cat in by_categoria.items():
            if cat not in prev_by_cat:
                continue

            curr_count = len(movs_cat)
            curr_total = sum(m.monto for m in movs_cat)
            prev_total = prev_by_cat[cat]['total']
            prev_count = prev_by_cat[cat]['count']

            change = (curr_total - prev_total) / prev_total if prev_total > 0 else 0

            # Context anomaly: significant increase but count doubled (timing, not trend)
            if 0.5 < change < 2.0 and curr_count >= 2 * prev_count:
                insights.append({
                    'type': 'context_anomaly',
                    'categoria': cat,
                    'insight': f"{cat}: +{change*100:.0f}% pero 2x transacciones (timing, no cambio real)",
                    'confidence': 0.8,
                    'data': {'categoria': cat, 'change_pct': change*100}
                })

        return insights
