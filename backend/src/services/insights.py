from datetime import datetime, timedelta, date
from sqlalchemy.orm import Session
from sqlalchemy import and_
from src.models.movement import Movimiento, Insight, PatronRecurrente
import statistics
import json
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

        # Persistir hallazgos si es necesario
        InsightsService._persist_insights(insights, db, periodo)

        return sorted(insights, key=lambda x: x['confidence'], reverse=True)

    @staticmethod
    def _persist_insights(insights_data: list[dict], db: Session, periodo: str):
        """Persiste los insights generados en la base de datos"""
        for data in insights_data:
            # Evitar duplicados simples (mismo tipo y concepto en el mismo periodo)
            exists = db.query(Insight).filter(
                and_(
                    Insight.periodo == periodo,
                    Insight.tipo == data['type'],
                    Insight.concepto == data['categoria']
                )
            ).first()

            if not exists:
                new_insight = Insight(
                    periodo=periodo,
                    tipo=data['type'],
                    concepto=data['categoria'],
                    valor=data.get('data', {}).get('monto') or data.get('data', {}).get('total'),
                    contexto=data['insight'],
                    score_importancia=data['confidence'],
                    data_json=json.dumps(data.get('data')),
                    created_at=datetime.utcnow()
                )
                db.add(new_insight)
        
        try:
            db.commit()
        except Exception:
            db.rollback()

    @staticmethod
    def get_hormigas_analysis(db: Session) -> dict:
        """Detecta 'gastos hormiga': pequeños montos con alta frecuencia"""
        # Analizamos los últimos 90 días para tener mejor perspectiva
        tres_meses_atras = date.today() - timedelta(days=90)
        movs = db.query(Movimiento).filter(
            and_(
                Movimiento.fecha >= tres_meses_atras,
                Movimiento.monto < 0 # Solo gastos
            )
        ).all()

        if not movs:
            return {"items": [], "total_mensual_hormiga": 0, "recomendacion": "No hay suficientes datos."}

        # Agrupar por categoría
        by_cat = defaultdict(list)
        for m in movs:
            by_cat[m.categoria].append(abs(m.monto))

        hormiga_items = []
        total_acumulado = 0

        for cat, montos in by_cat.items():
            frecuencia_total = len(montos)
            if frecuencia_total < 6: continue # Al menos 2 veces por mes promedio

            monto_promedio = sum(montos) / frecuencia_total
            # Criterio: Monto pequeño (menor a $15 o similar, ajustable)
            if monto_promedio > 20: continue 

            frecuencia_mensual = frecuencia_total / 3
            impacto_anual = monto_promedio * frecuencia_mensual * 12
            
            total_acumulado += (monto_promedio * frecuencia_mensual)
            
            hormiga_items.append({
                "categoria": cat,
                "monto_promedio": round(monto_promedio, 2),
                "frecuencia_mensual": round(frecuencia_mensual, 1),
                "impacto_anual_estimado": round(impacto_anual, 2)
            })

        reco = "Tus gastos hormiga están bajo control."
        if total_acumulado > 100:
            reco = f"Podrías ahorrar ${total_acumulado*12:,.2f} al año si reduces estos pequeños gastos recurrentes."

        return {
            "items": sorted(hormiga_items, key=lambda x: x['impacto_anual_estimado'], reverse=True),
            "total_mensual_hormiga": round(total_acumulado, 2),
            "recomendacion": reco
        }

    @staticmethod
    def get_financial_health_flags(db: Session) -> dict:
        """Calcula indicadores de salud financiera con comparación histórica"""
        today = date.today()
        mes_actual = today.month
        mes_prev = (today.replace(day=1) - timedelta(days=1)).month
        
        # Obtenemos datos de los últimos 2 meses
        hace_dos_meses = today.replace(day=1) - timedelta(days=60)
        movs = db.query(Movimiento).filter(Movimiento.fecha >= hace_dos_meses).all()

        if not movs:
            return {"ahorro_tasa": 0, "variabilidad_gastos": 0, "balance_ingresos_gastos": 0, "score_general": 0, "alertas": []}

        # Datos mes actual
        ingresos_act = sum(m.monto for m in movs if m.monto > 0 and m.fecha.month == mes_actual)
        gastos_act = sum(abs(m.monto) for m in movs if m.monto < 0 and m.fecha.month == mes_actual)
        
        # Datos mes anterior
        gastos_prev = sum(abs(m.monto) for m in movs if m.monto < 0 and m.fecha.month == mes_prev)

        # 1. Tasa de ahorro
        ahorro_tasa = (ingresos_act - gastos_act) / ingresos_act if ingresos_act > 0 else 0
        
        # 2. Balance
        balance = ingresos_act - gastos_act
        
        # 3. Alertas y Score
        alertas = []
        score = 60 # Base imperial
        
        if ahorro_tasa < 0.1:
            alertas.append("Tu tasa de ahorro es baja (menor al 10%).")
            score -= 15
        elif ahorro_tasa > 0.3:
            score += 15

        if gastos_act > ingresos_act:
            alertas.append("¡Alerta! Gastos superan ingresos este mes.")
            score -= 25
            
        # Comparación histórica
        if gastos_prev > 0:
            cambio_gastos = (gastos_act - gastos_prev) / gastos_prev
            if cambio_gastos > 0.2:
                alertas.append(f"Tus gastos han subido un {cambio_gastos*100:.0f}% respecto al mes anterior.")
                score -= 10
            elif cambio_gastos < -0.1:
                score += 10

        score = max(0, min(100, score))

        return {
            "ahorro_tasa": round(ahorro_tasa, 2),
            "variabilidad_gastos": round(cambio_gastos, 2) if 'cambio_gastos' in locals() else 0,
            "balance_ingresos_gastos": round(balance, 2),
            "score_general": round(score, 0),
            "alertas": alertas
        }

    @staticmethod
    def get_projections(db: Session) -> dict:
        """Proyecta gastos al finalizar el mes basado en ritmo y patrones"""
        today = date.today()
        # Días en el mes actual
        if today.month == 12:
            days_in_month = 31
        else:
            days_in_month = (date(today.year, today.month + 1, 1) - timedelta(days=1)).day
            
        elapsed_days = today.day
        remaining_days = days_in_month - elapsed_days

        # 1. Gasto lineal (ritmo actual)
        movs_mes = db.query(Movimiento).filter(
            and_(
                Movimiento.fecha >= today.replace(day=1),
                Movimiento.monto < 0
            )
        ).all()
        
        gasto_actual = sum(abs(m.monto) for m in movs_mes)
        ritmo_diario = gasto_actual / elapsed_days if elapsed_days > 0 else 0
        proyeccion_lineal = gasto_actual + (ritmo_diario * remaining_days)

        # 2. Gasto por patrones (lo que falta ocurrir)
        patrones = db.query(PatronRecurrente).filter(PatronRecurrente.activo == True).all()
        gasto_patrones_pendiente = 0
        patrones_pendientes_list = []
        for p in patrones:
            # Si el día del mes del patrón es mayor al día actual, es un gasto pendiente
            if p.dia_mes and p.dia_mes > elapsed_days:
                gasto_patrones_pendiente += p.monto_promedio
                patrones_pendientes_list.append({
                    "concepto": p.concepto,
                    "monto": round(p.monto_promedio, 2),
                    "dia": p.dia_mes
                })

        return {
            "mes_actual": today.strftime("%Y-%m"),
            "dia_del_mes": elapsed_days,
            "gasto_actual": round(gasto_actual, 2),
            "proyeccion_lineal": round(proyeccion_lineal, 2),
            "pendientes_recurrentes": round(gasto_patrones_pendiente, 2),
            "proyeccion_total": round(proyeccion_lineal + (gasto_patrones_pendiente * 0.5), 2), # Ajuste mixto
            "patrones_pendientes": sorted(patrones_pendientes_list, key=lambda x: x['dia']),
            "confianza": 0.8 if elapsed_days > 10 else 0.5
        }

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
        """Detecta y persiste patrones recurrentes"""
        insights = []
        for cat, movs in by_categoria.items():
            if len(movs) < 2: continue
            
            # Solo para gastos
            gastos = [m for m in movs if m.monto < 0]
            if not gastos: continue

            days = [m.fecha.day for m in gastos]
            most_common_day, freq = Counter(days).most_common(1)[0]
            recurrence_score = freq / len(gastos)
            
            if recurrence_score > 0.4:
                avg_monto = statistics.mean([abs(m.monto) for m in gastos])
                
                # Actualizar o crear en tabla de patrones
                patron = db.query(PatronRecurrente).filter(PatronRecurrente.concepto == cat).first()
                if not patron:
                    patron = PatronRecurrente(
                        concepto=cat,
                        monto_promedio=avg_monto,
                        dia_mes=most_common_day,
                        frecuencia="mensual",
                        confianza=recurrence_score,
                        ultimo_movimiento=max(m.fecha for m in gastos)
                    )
                    db.add(patron)
                else:
                    patron.monto_promedio = (patron.monto_promedio + avg_monto) / 2
                    patron.dia_mes = most_common_day
                    patron.confianza = recurrence_score
                    patron.ultimo_movimiento = max(m.fecha for m in gastos)

                insights.append({
                    'type': 'recurrence',
                    'categoria': cat,
                    'insight': f"Patrón detectado: {cat} suele ocurrir alrededor del día {most_common_day}. Estimado: ${abs(avg_monto):,.2f}",
                    'confidence': min(0.95, 0.6 + recurrence_score),
                    'data': {'day': most_common_day, 'avg_monto': avg_monto, 'score': recurrence_score}
                })
        
        try:
            db.commit()
        except Exception:
            db.rollback()
            
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
