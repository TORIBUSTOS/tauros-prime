import pytest
from datetime import date
from src.models.movement import Movimiento
from src.services.reports import ReportService


class TestReportService:
    """Tests para ReportService.get_pl_report()"""

    def test_get_pl_report_basic_structure(self, db):
        """Verifica estructura básica del reporte P&L"""
        # Arrange: Crear movimientos de prueba
        mov1 = Movimiento(
            fecha=date(2025, 6, 1),
            descripcion="INGRESO CLIENTE",
            monto=5000.0,
            categoria="Ingresos",
            tipo="ingreso",
            confianza=0.9
        )
        mov2 = Movimiento(
            fecha=date(2025, 6, 5),
            descripcion="PAGO PROVEEDOR",
            monto=-1500.0,
            categoria="Proveedores",
            tipo="egreso",
            confianza=0.85
        )
        db.add(mov1)
        db.add(mov2)
        db.commit()

        # Act
        report = ReportService.get_pl_report("2025-06", db)

        # Assert
        assert report["period"] == "2025-06"
        assert report["ingresos_total"] == 5000.0
        assert report["egresos_total"] == 1500.0
        assert report["resultado_neto"] == 3500.0
        assert len(report["nodos"]) == 2  # INGRESOS y EGRESOS


    def test_get_pl_report_hierarchical_structure(self, db):
        """Verifica estructura jerárquica: raíz → categoría → subcategoría"""
        # Arrange
        movimientos = [
            Movimiento(
                fecha=date(2025, 6, 1),
                descripcion="SUSCRIPCION ANUAL",
                monto=12000.0,
                categoria="Suscripciones",
                subcategoria="Anual Plan",
                tipo="ingreso",
                confianza=0.95
            ),
            Movimiento(
                fecha=date(2025, 6, 5),
                descripcion="SUSCRIPCION MENSUAL",
                monto=6000.0,
                categoria="Suscripciones",
                subcategoria="Monthly Plan",
                tipo="ingreso",
                confianza=0.95
            ),
            Movimiento(
                fecha=date(2025, 6, 10),
                descripcion="SERVICIOS ADDON",
                monto=27000.0,
                categoria="Servicios",
                subcategoria="Premium",
                tipo="ingreso",
                confianza=0.9
            ),
        ]
        for mov in movimientos:
            db.add(mov)
        db.commit()

        # Act
        report = ReportService.get_pl_report("2025-06", db)

        # Assert
        ingresos_node = report["nodos"][0]  # INGRESOS
        assert ingresos_node.nombre == "INGRESOS"
        assert ingresos_node.total == 45000.0
        assert len(ingresos_node.hijos) == 2  # Suscripciones + Servicios

        # Verificar Suscripciones
        suscripciones = next((h for h in ingresos_node.hijos if h.nombre == "Suscripciones"), None)
        assert suscripciones is not None
        assert suscripciones.total == 18000.0
        assert len(suscripciones.hijos) == 2  # Anual + Monthly


    def test_get_pl_report_empty_period(self, db):
        """Verifica comportamiento con período sin movimientos"""
        # Act
        report = ReportService.get_pl_report("2025-09", db)

        # Assert
        assert report["period"] == "2025-09"
        assert report["ingresos_total"] == 0.0
        assert report["egresos_total"] == 0.0
        assert report["resultado_neto"] == 0.0
        assert len(report["nodos"]) == 2
        assert len(report["nodos"][0].hijos) == 0  # Sin hijos
        assert len(report["nodos"][1].hijos) == 0


    def test_get_pl_report_null_subcategories(self, db):
        """Verifica que null subcategorías se convierten a 'General'"""
        # Arrange
        mov = Movimiento(
            fecha=date(2025, 6, 1),
            descripcion="MOVIMIENTO SIN SUBCATEGORIA",
            monto=1000.0,
            categoria="Ingresos",
            subcategoria=None,  # Sin subcategoría
            tipo="ingreso",
            confianza=0.8
        )
        db.add(mov)
        db.commit()

        # Act
        report = ReportService.get_pl_report("2025-06", db)

        # Assert
        ingresos_node = report["nodos"][0]
        assert ingresos_node.total == 1000.0
        ingresos = next((h for h in ingresos_node.hijos if h.nombre == "Ingresos"), None)
        assert ingresos is not None
        general = next((h for h in ingresos.hijos if h.nombre == "General"), None)
        assert general is not None
        assert general.total == 1000.0


    def test_get_pl_report_mixed_ingresos_egresos(self, db):
        """Verifica cálculos correctos con ingresos y egresos mezclados"""
        # Arrange
        movimientos = [
            Movimiento(fecha=date(2025, 6, 1), descripcion="ING1", monto=5000.0,
                      categoria="Ingresos", tipo="ingreso", confianza=0.9),
            Movimiento(fecha=date(2025, 6, 2), descripcion="ING2", monto=3000.0,
                      categoria="Ingresos", tipo="ingreso", confianza=0.9),
            Movimiento(fecha=date(2025, 6, 3), descripcion="EGR1", monto=-2000.0,
                      categoria="Gastos", tipo="egreso", confianza=0.8),
            Movimiento(fecha=date(2025, 6, 4), descripcion="EGR2", monto=-1500.0,
                      categoria="Gastos", tipo="egreso", confianza=0.8),
            Movimiento(fecha=date(2025, 6, 5), descripcion="EGR3", monto=-500.0,
                      categoria="Otros", tipo="egreso", confianza=0.7),
        ]
        for mov in movimientos:
            db.add(mov)
        db.commit()

        # Act
        report = ReportService.get_pl_report("2025-06", db)

        # Assert
        assert report["ingresos_total"] == 8000.0
        assert report["egresos_total"] == 4000.0
        assert report["resultado_neto"] == 4000.0

        ingresos_node = report["nodos"][0]
        egresos_node = report["nodos"][1]
        assert ingresos_node.total == 8000.0
        assert egresos_node.total == 4000.0


    def test_get_pl_report_multiple_subcategories(self, db):
        """Verifica que múltiples subcategorías se agreguen correctamente"""
        # Arrange
        subcategories = [
            ("Proveedores", "Hosting", -1000.0),
            ("Proveedores", "Bases de Datos", -500.0),
            ("Proveedores", "Licencias", -800.0),
        ]
        for cat, subcat, monto in subcategories:
            mov = Movimiento(
                fecha=date(2025, 6, 1),
                descripcion=f"{cat} - {subcat}",
                monto=monto,
                categoria=cat,
                subcategoria=subcat,
                tipo="egreso",
                confianza=0.9
            )
            db.add(mov)
        db.commit()

        # Act
        report = ReportService.get_pl_report("2025-06", db)

        # Assert
        egresos_node = report["nodos"][1]
        proveedores = next((h for h in egresos_node.hijos if h.nombre == "Proveedores"), None)
        assert proveedores is not None
        assert proveedores.total == 2300.0
        assert len(proveedores.hijos) == 3


    def test_get_pl_report_movimientos_attached_to_subcategory(self, db):
        """Verifica que MovimientoResponse esté adjunto a nivel de subcategoría"""
        # Arrange
        mov = Movimiento(
            fecha=date(2025, 6, 1),
            descripcion="TEST MOVIMIENTO",
            monto=1000.0,
            categoria="Test",
            subcategoria="Test Sub",
            tipo="ingreso",
            confianza=0.9
        )
        db.add(mov)
        db.commit()

        # Act
        report = ReportService.get_pl_report("2025-06", db)

        # Assert
        ingresos_node = report["nodos"][0]
        test_cat = next((h for h in ingresos_node.hijos if h.nombre == "Test"), None)
        assert test_cat is not None
        test_sub = test_cat.hijos[0]
        assert test_sub.movimientos is not None
        assert len(test_sub.movimientos) == 1
        assert test_sub.movimientos[0].descripcion == "TEST MOVIMIENTO"


    def test_get_pl_report_large_dataset(self, db):
        """Verifica performance con gran volumen de datos"""
        # Arrange: Crear 500+ movimientos
        for i in range(500):
            tipo = "ingreso" if i % 2 == 0 else "egreso"
            monto = 100.0 if tipo == "ingreso" else -100.0
            mov = Movimiento(
                fecha=date(2025, 6, (i % 30) + 1),
                descripcion=f"MOV{i}",
                monto=monto,
                categoria=f"CAT{i % 10}",
                subcategoria=f"SUB{i % 3}",
                tipo=tipo,
                confianza=0.9
            )
            db.add(mov)
        db.commit()

        # Act
        report = ReportService.get_pl_report("2025-06", db)

        # Assert
        assert report["ingresos_total"] == 25000.0  # 250 * 100
        assert report["egresos_total"] == 25000.0   # 250 * 100
        assert report["resultado_neto"] == 0.0
        assert len(report["nodos"][0].hijos) > 0
        assert len(report["nodos"][1].hijos) > 0
