from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from src.models.movement import Movimiento
import statistics
from collections import defaultdict, Counter

class InsightsService:
    @staticmethod
    def generate_insights(periodo: str, db: Session) -> list[dict]:
        year, month = periodo.split('-')
        movs = db.query(Movimiento).filter(
            Movimiento.fecha.like(f"{year}-{month}%"),
            Movimiento.categoria != "Sin categorizar"
        ).all()
        if not movs:
            return []
        insights = []
        insights.extend(InsightsService._detect_patterns(movs, db))
        insights.extend(InsightsService._detect_outliers(movs, db))
        insights.extend(InsightsService._detect_context_anomalies(movs, db, periodo))
        return sorted(insights, key=lambda x: x['confidence'], reverse=True)

    @staticmethod
    def _detect_patterns(movs: list, db: Session) -> list[dict]:
        categorias = Counter([m.categoria for m in movs])
        insights = []
        for cat, count in categorias.most_common(3):
            if count >= 2:
                total = sum(m.monto for m in movs if m.categoria == cat)
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
    def _detect_outliers(movs: list, db: Session) -> list[dict]:
        insights = []
        by_categoria = {}
        for m in movs:
            if m.categoria not in by_categoria:
                by_categoria[m.categoria] = []
            by_categoria[m.categoria].append(m)

        for categoria, movs_cat in by_categoria.items():
            if len(movs_cat) < 2:
                continue
            amounts = [m.monto for m in movs_cat]
            mean = statistics.mean(amounts)
            std = statistics.stdev(amounts) if len(amounts) > 1 else 0

            for mov in movs_cat:
                if std > 0:
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
    def _detect_context_anomalies(movs: list, db: Session, periodo: str) -> list[dict]:
        year, month = periodo.split('-')
        insights = []
        prev_month = int(month) - 1
        prev_year = year
        if prev_month == 0:
            prev_month = 12
            prev_year = str(int(year) - 1)

        prev_movs = db.query(Movimiento).filter(
            Movimiento.fecha.like(f"{prev_year}-{prev_month:02d}%"),
            Movimiento.categoria != "Sin categorizar"
        ).all()

        if not prev_movs:
            return insights

        curr_by_cat = defaultdict(lambda: {'count': 0, 'total': 0})
        prev_by_cat = defaultdict(lambda: {'count': 0, 'total': 0})

        for m in movs:
            curr_by_cat[m.categoria]['count'] += 1
            curr_by_cat[m.categoria]['total'] += m.monto
        for m in prev_movs:
            prev_by_cat[m.categoria]['count'] += 1
            prev_by_cat[m.categoria]['total'] += m.monto

        for cat in curr_by_cat:
            if cat in prev_by_cat:
                curr_total = curr_by_cat[cat]['total']
                prev_total = prev_by_cat[cat]['total']
                change = (curr_total - prev_total) / prev_total if prev_total > 0 else 0
                if 0.5 < change < 2.0 and curr_by_cat[cat]['count'] >= 2 * prev_by_cat[cat]['count']:
                    insights.append({
                        'type': 'context_anomaly',
                        'categoria': cat,
                        'insight': f"{cat}: +{change*100:.0f}% pero 2x transacciones (timing, no cambio real)",
                        'confidence': 0.8,
                        'data': {'categoria': cat, 'change_pct': change*100}
                    })
        return insights
