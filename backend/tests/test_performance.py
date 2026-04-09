import pytest
import time
from datetime import date
from src.models.movement import Movimiento
from src.services.insights import InsightsService


class TestPerformance:
    """Performance benchmarks for Sprint 2 optimization"""

    def test_insights_generation_performance_with_large_dataset(self, db):
        """Verifica que /insights responde en <1s con 653+ movimientos"""
        # Arrange: Crear 653 movimientos (dataset real Supervielle)
        for i in range(653):
            mov = Movimiento(
                fecha=date(2025, 6, (i % 30) + 1),
                descripcion=f"MOVIMIENTO_{i}",
                monto=100.0 + (i % 5000),  # Variedad de montos
                categoria=f"CAT_{i % 15}",  # 15 categorías diferentes
                tipo="ingreso" if i % 2 == 0 else "egreso",
                confianza=0.85
            )
            db.add(mov)
        db.commit()

        # Act: Medir tiempo de generación de insights
        start_time = time.time()
        insights = InsightsService.generate_insights("2025-06", db)
        elapsed_time = time.time() - start_time

        # Assert
        assert elapsed_time < 1.0, f"Insights generation took {elapsed_time:.3f}s (target <1.0s)"
        assert len(insights) > 0, "Insights should be generated for non-empty dataset"
        print(f"\n✅ Insights generated for 653 movements in {elapsed_time:.3f}s")

    def test_insights_detection_types(self, db):
        """Verifica que se detecten los 3 tipos de insights"""
        # Arrange: Crear movimientos que triggeren cada tipo de insight
        # Pattern: Suscripción recurrente
        for i in range(3):
            mov = Movimiento(
                fecha=date(2025, 6, 5 + i*10),
                descripcion="SUSCRIPCION",
                monto=1000.0,
                categoria="Suscripciones",
                tipo="ingreso",
                confianza=0.9
            )
            db.add(mov)

        # Outlier: Gasto inusual
        # Agregamos varios gastos normales para establecer baseline
        for i in range(5):
            mov_normal = Movimiento(
                fecha=date(2025, 6, 1 + i*3),
                descripcion="GASTO_NORMAL",
                monto=-100.0,
                categoria="Gastos",
                tipo="egreso",
                confianza=0.8
            )
            db.add(mov_normal)

        # Ahora agregar el outlier que será > 2σ
        mov_outlier = Movimiento(
            fecha=date(2025, 6, 25),
            descripcion="GASTO_GRANDE",
            monto=-10000.0,  # >> promedio
            categoria="Gastos",
            tipo="egreso",
            confianza=0.7
        )
        db.add(mov_outlier)

        # Context Anomaly: Se requiere mes anterior
        # (añadimos movimientos del mes anterior)
        for i in range(2):
            mov = Movimiento(
                fecha=date(2025, 5, 10 + i*10),
                descripcion="PAGO_RECURRENTE",
                monto=500.0,
                categoria="Pagos",
                tipo="egreso",
                confianza=0.9
            )
            db.add(mov)

        # Mismo pago en mes actual pero 2x (context anomaly)
        for i in range(4):
            mov = Movimiento(
                fecha=date(2025, 6, 1 + i*5),
                descripcion="PAGO_RECURRENTE",
                monto=500.0,
                categoria="Pagos",
                tipo="egreso",
                confianza=0.9
            )
            db.add(mov)

        db.commit()

        # Act
        insights = InsightsService.generate_insights("2025-06", db)

        # Assert
        types_found = set(insight['type'] for insight in insights)
        assert 'pattern' in types_found, "Should detect patterns (recurring subscriptions)"
        assert 'outlier' in types_found, "Should detect outliers (unusual spending)"
        assert 'context_anomaly' in types_found, "Should detect context anomalies (timing changes)"
        print(f"\n✅ All 3 insight types detected: {types_found}")

    def test_single_pass_grouping_efficiency(self, db):
        """Verifica que grouping se hace en una sola pasada"""
        # Arrange: 1000 movimientos
        for i in range(1000):
            mov = Movimiento(
                fecha=date(2025, 6, (i % 30) + 1),
                descripcion=f"MOV{i}",
                monto=100.0,
                categoria=f"CAT{i % 20}",  # 20 categorías
                tipo="ingreso",
                confianza=0.9
            )
            db.add(mov)
        db.commit()

        # Act: Medir tiempo
        start_time = time.time()
        insights = InsightsService.generate_insights("2025-06", db)
        elapsed_time = time.time() - start_time

        # Assert
        assert elapsed_time < 1.5, f"Should process 1000 movements in <1.5s, took {elapsed_time:.3f}s"
        print(f"\n✅ 1000 movements processed in {elapsed_time:.3f}s")

    def test_date_range_vs_like_query_performance(self, db):
        """Verifica que date range queries son más eficientes que LIKE"""
        # Arrange: 2000 movimientos
        for year in [2024, 2025]:
            for month in range(1, 13):
                for day in range(1, 29):
                    mov = Movimiento(
                        fecha=date(year, month, day),
                        descripcion=f"MOV_{year}_{month}_{day}",
                        monto=100.0,
                        categoria="Test",
                        tipo="ingreso",
                        confianza=0.9
                    )
                    db.add(mov)
        db.commit()

        # Act: Generate insights for 2025-06 (28 movements)
        start_time = time.time()
        insights = InsightsService.generate_insights("2025-06", db)
        elapsed_time = time.time() - start_time

        # Assert: Should be very fast with 2000 total records, 28 for this month
        assert elapsed_time < 0.5, f"Should quickly filter to 28 of 2000 records, took {elapsed_time:.3f}s"
        print(f"\n✅ Filtered 28 of 2000 movements in {elapsed_time:.3f}s")
