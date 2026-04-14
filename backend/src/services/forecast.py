from datetime import datetime
from sqlalchemy.orm import Session
from src.models.movement import Movimiento
import statistics
from collections import defaultdict, Counter

class ForecastService:
    @staticmethod
    def forecast_3months(desde: str, db: Session) -> dict:
        year, month = map(int, desde.split('-'))
        hist_start = datetime(year - 1, month, 1)
        hist_movs = db.query(Movimiento).filter(
            Movimiento.fecha >= hist_start.date(),
            Movimiento.categoria != "Sin categorizar"
        ).all()

        if not hist_movs:
            return {'error': 'Insufficient historical data'}

        forecast = []
        for offset in range(3):
            f_month = month + offset
            f_year = year
            if f_month > 12:
                f_month -= 12
                f_year += 1
            month_str = f"{f_year}-{f_month:02d}"
            month_forecast = ForecastService._forecast_month(f_year, f_month, hist_movs, db)
            forecast.append({'period': month_str, 'forecast': month_forecast})

        scenarios = ForecastService._generate_scenarios(forecast)
        return {'period': desde, 'forecast': forecast, 'scenarios': scenarios}

    @staticmethod
    def _forecast_month(year: int, month: int, hist_movs: list, db: Session) -> list[dict]:
        by_categoria = defaultdict(list)
        for m in hist_movs:
            by_categoria[m.categoria].append(m)

        month_forecast = []
        for categoria, movs in by_categoria.items():
            # 1. Detección de Periodicidad (Día del Mes)
            days = [m.fecha.day for m in movs]
            most_common_day, day_freq = Counter(days).most_common(1)[0] if days else (None, 0)
            
            # 2. Filtrar por este mes específico en años anteriores
            same_month_movs = [m for m in movs if m.fecha.month == month]
            
            if same_month_movs:
                amounts = [m.monto for m in same_month_movs]
                count = len(same_month_movs)
                total = sum(amounts)
                avg = total / count
                std = statistics.stdev(amounts) if len(amounts) > 1 else 0
                
                # Aumentar confianza si hay un día muy común (ej. sueldos el 30)
                is_periodic = (day_freq / len(movs)) > 0.4 if movs else False
                base_confidence = 0.75 + (min(len(movs), 5) * 0.04)
                final_confidence = min(0.98, base_confidence + (0.1 if is_periodic else 0))

                month_forecast.append({
                    'categoria': categoria,
                    'expected_count': count,
                    'expected_total': total,
                    'expected_avg': avg,
                    'std_dev': std,
                    'confidence': final_confidence,
                    'metadata': {
                        'is_periodic': is_periodic,
                        'suggested_day': most_common_day
                    }
                })
            else:
                # 3. Fallback: Promedio global si no hay datos de este mes específico
                amounts = [m.monto for m in movs]
                if amounts:
                    avg = statistics.mean(amounts)
                    month_forecast.append({
                        'categoria': categoria,
                        'expected_count': 1,
                        'expected_total': avg,
                        'expected_avg': avg,
                        'std_dev': statistics.stdev(amounts) if len(amounts) > 1 else 0,
                        'confidence': 0.45,
                        'metadata': {'fallback': True}
                    })
        return month_forecast

    @staticmethod
    def _generate_scenarios(forecast: list) -> dict:
        total_realistic = sum(f['expected_total'] for period in forecast for f in period['forecast'])
        return {
            'realistic': {'total_3m': total_realistic, 'description': 'Basado en histórico'},
            'optimistic': {'total_3m': total_realistic * 1.15, 'description': '+15%'},
            'pessimistic': {'total_3m': total_realistic * 0.85, 'description': '-15%'}
        }
