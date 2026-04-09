import pytest
from datetime import date
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from src.main import app
from src.models.movement import Base, Movimiento, get_db


# Setup test database
engine = create_engine("sqlite:///./test_routes.db", connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)

# Global session for TestClient
_test_db = None

def override_get_db():
    global _test_db
    if _test_db:
        yield _test_db
    else:
        db = TestingSessionLocal()
        yield db
        db.close()

app.dependency_overrides[get_db] = override_get_db


@pytest.fixture
def db():
    """Fixture que proporciona una sesión compartida para el TestClient"""
    global _test_db
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    _test_db = session
    yield session
    _test_db = None
    session.close()
    transaction.rollback()
    connection.close()


# Create client AFTER dependency override
client = TestClient(app)


class TestRoutesHealth:
    """Tests para health check y root endpoint"""

    def test_health_endpoint(self):
        """Verifica que /health retorna ok"""
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "ok"

    def test_root_endpoint(self):
        """Verifica que root endpoint funciona"""
        response = client.get("/")
        assert response.status_code == 200


class TestMovementsEndpoint:
    """Tests para GET /movements"""

    def test_get_movements_empty(self, db):
        """Verifica que GET /movements retorna [] cuando no hay datos"""
        response = client.get("/api/movements")
        assert response.status_code == 200
        assert response.json() == []

    def test_get_movements_returns_all(self, db):
        """Verifica que GET /movements retorna todos los movimientos"""
        # Arrange
        for i in range(3):
            mov = Movimiento(
                fecha=date(2025, 6, i+1),
                descripcion=f"MOV{i}",
                monto=100.0 + i*10,
                categoria="Test",
                tipo="ingreso",
                confianza=0.9
            )
            db.add(mov)
        db.commit()

        # Act
        response = client.get("/api/movements")

        # Assert
        assert response.status_code == 200
        assert len(response.json()) == 3

    def test_get_movements_filters_by_period(self, db):
        """Verifica que period parameter filtra correctamente"""
        # Arrange
        for month in [6, 7, 8]:
            mov = Movimiento(
                fecha=date(2025, month, 1),
                descripcion=f"MOV{month}",
                monto=100.0,
                categoria="Test",
                tipo="ingreso",
                confianza=0.9
            )
            db.add(mov)
        db.commit()

        # Act
        response = client.get("/api/movements?period=2025-06")

        # Assert
        assert response.status_code == 200
        assert len(response.json()) == 1
        assert response.json()[0]["descripcion"] == "MOV6"

    def test_get_movements_filters_by_category(self, db):
        """Verifica que categoria parameter filtra correctamente"""
        # Arrange
        for cat in ["Ingresos", "Gastos", "Otros"]:
            mov = Movimiento(
                fecha=date(2025, 6, 1),
                descripcion=cat,
                monto=100.0,
                categoria=cat,
                tipo="ingreso",
                confianza=0.9
            )
            db.add(mov)
        db.commit()

        # Act
        response = client.get("/api/movements?categoria=Ingresos")

        # Assert
        assert response.status_code == 200
        assert len(response.json()) == 1
        assert response.json()[0]["categoria"] == "Ingresos"

    def test_get_movements_filters_by_both(self, db):
        """Verifica que ambos filtros funcionan juntos"""
        # Arrange
        movimientos = [
            Movimiento(fecha=date(2025, 6, 1), descripcion="A", monto=100.0,
                      categoria="Test", tipo="ingreso", confianza=0.9),
            Movimiento(fecha=date(2025, 7, 1), descripcion="B", monto=100.0,
                      categoria="Test", tipo="ingreso", confianza=0.9),
            Movimiento(fecha=date(2025, 6, 1), descripcion="C", monto=100.0,
                      categoria="Other", tipo="ingreso", confianza=0.9),
        ]
        for mov in movimientos:
            db.add(mov)
        db.commit()

        # Act
        response = client.get("/api/movements?period=2025-06&categoria=Test")

        # Assert
        assert response.status_code == 200
        assert len(response.json()) == 1
        assert response.json()[0]["descripcion"] == "A"

    def test_get_movements_invalid_period_format(self, db):
        """Verifica que periodo inválido falla"""
        response = client.get("/api/movements?period=2025/06")
        assert response.status_code == 422  # Validation error

    def test_get_movements_respects_limit(self, db):
        """Verifica que máximo 500 registros se retornan"""
        # Arrange
        for i in range(600):
            mov = Movimiento(
                fecha=date(2025, 6, (i % 30) + 1),
                descripcion=f"MOV{i}",
                monto=100.0,
                categoria="Test",
                tipo="ingreso",
                confianza=0.9
            )
            db.add(mov)
        db.commit()

        # Act
        response = client.get("/api/movements")

        # Assert
        assert response.status_code == 200
        assert len(response.json()) == 500


class TestSummaryEndpoint:
    """Tests para GET /summary"""

    def test_get_summary_requires_period(self, db):
        """Verifica que period es requerido"""
        response = client.get("/api/summary")
        assert response.status_code == 422

    def test_get_summary_empty_period(self, db):
        """Verifica summary con periodo sin datos"""
        response = client.get("/api/summary?period=2025-06")
        assert response.status_code == 200
        data = response.json()
        assert data["period"] == "2025-06"
        assert data["ingresos_total"] == 0.0
        assert data["egresos_total"] == 0.0
        assert data["balance"] == 0.0
        assert data["transaction_count"] == 0

    def test_get_summary_calculates_correctly(self, db):
        """Verifica cálculos de summary"""
        # Arrange
        movimientos = [
            Movimiento(fecha=date(2025, 6, 1), descripcion="ING", monto=5000.0,
                      categoria="Ingresos", tipo="ingreso", confianza=0.9),
            Movimiento(fecha=date(2025, 6, 2), descripcion="EGR", monto=-1500.0,
                      categoria="Gastos", tipo="egreso", confianza=0.9),
        ]
        for mov in movimientos:
            db.add(mov)
        db.commit()

        # Act
        response = client.get("/api/summary?period=2025-06")

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["ingresos_total"] == 5000.0
        assert data["egresos_total"] == 1500.0
        assert data["balance"] == 3500.0
        assert data["transaction_count"] == 2


class TestPeriodsEndpoint:
    """Tests para GET /reports/periods"""

    def test_get_periods_empty(self, db):
        """Verifica que periods retorna [] cuando no hay datos"""
        response = client.get("/api/reports/periods")
        assert response.status_code == 200
        assert response.json() == []

    def test_get_periods_returns_unique_sorted(self, db):
        """Verifica que periods retorna periodos únicos y ordenados"""
        # Arrange
        periods = ["2025-08", "2025-06", "2025-07", "2025-06"]  # Duplicado y desordenado
        for i, period in enumerate(periods):
            year, month = period.split("-")
            mov = Movimiento(
                fecha=date(int(year), int(month), 1),
                descripcion=f"MOV{i}",
                monto=100.0,
                categoria="Test",
                tipo="ingreso",
                confianza=0.9
            )
            db.add(mov)
        db.commit()

        # Act
        response = client.get("/api/reports/periods")

        # Assert
        assert response.status_code == 200
        periods_returned = response.json()
        assert periods_returned == ["2025-08", "2025-07", "2025-06"]  # Ordenado DESC, sin duplicados


class TestInsightsEndpoint:
    """Tests para GET /insights"""

    def test_get_insights_requires_period(self, db):
        """Verifica que period es requerido"""
        response = client.get("/api/insights")
        assert response.status_code == 422

    def test_get_insights_invalid_period(self, db):
        """Verifica que periodo inválido falla"""
        response = client.get("/api/insights?period=invalid")
        assert response.status_code == 422

    def test_get_insights_empty_period(self, db):
        """Verifica insights con periodo sin datos"""
        response = client.get("/api/insights?period=2025-09")
        assert response.status_code == 200
        data = response.json()
        assert data["period"] == "2025-09"
        assert isinstance(data["insights"], list)
        assert len(data["insights"]) == 0

    def test_get_insights_returns_valid_structure(self, db):
        """Verifica que insights retorna estructura correcta"""
        # Arrange
        mov = Movimiento(
            fecha=date(2025, 6, 1),
            descripcion="TEST",
            monto=100.0,
            categoria="Test",
            tipo="ingreso",
            confianza=0.9
        )
        db.add(mov)
        db.commit()

        # Act
        response = client.get("/api/insights?period=2025-06")

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["period"] == "2025-06"
        assert isinstance(data["insights"], list)


class TestForecastEndpoint:
    """Tests para GET /forecast"""

    def test_get_forecast_requires_desde(self, db):
        """Verifica que desde es requerido"""
        response = client.get("/api/forecast")
        assert response.status_code == 422

    def test_get_forecast_invalid_desde(self, db):
        """Verifica que desde inválido falla"""
        response = client.get("/api/forecast?desde=invalid")
        assert response.status_code == 422

    def test_get_forecast_empty_period(self, db):
        """Verifica forecast con periodo sin datos retorna 400"""
        # Forecast requiere datos históricos, retorna 400 si no hay
        response = client.get("/api/forecast?desde=2025-09")
        assert response.status_code == 400  # Insufficient data for forecast

    def test_get_forecast_returns_3_months(self, db):
        """Verifica que forecast retorna 3 meses"""
        # Arrange
        mov = Movimiento(
            fecha=date(2025, 6, 1),
            descripcion="TEST",
            monto=1000.0,
            categoria="Test",
            tipo="ingreso",
            confianza=0.9
        )
        db.add(mov)
        db.commit()

        # Act
        response = client.get("/api/forecast?desde=2025-06")

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert len(data["forecast"]) == 3


class TestPLReportEndpoint:
    """Tests para GET /reports/pl"""

    def test_get_pl_requires_period(self, db):
        """Verifica que period es requerido"""
        response = client.get("/api/reports/pl")
        assert response.status_code == 422

    def test_get_pl_invalid_period(self, db):
        """Verifica que periodo inválido falla"""
        response = client.get("/api/reports/pl?period=2025/06")
        assert response.status_code == 422

    def test_get_pl_empty_period(self, db):
        """Verifica P&L con periodo sin datos"""
        response = client.get("/api/reports/pl?period=2025-09")
        assert response.status_code == 200
        data = response.json()
        assert data["period"] == "2025-09"  # Campo es "period" no "periodo"
        assert data["ingresos_total"] == 0.0
        assert data["egresos_total"] == 0.0
        assert data["resultado_neto"] == 0.0
        assert isinstance(data["nodos"], list)

    def test_get_pl_returns_hierarchy(self, db):
        """Verifica que P&L retorna estructura jerárquica"""
        # Arrange
        mov = Movimiento(
            fecha=date(2025, 6, 1),
            descripcion="TEST",
            monto=5000.0,
            categoria="Ingresos",
            subcategoria="Suscripciones",
            tipo="ingreso",
            confianza=0.9
        )
        db.add(mov)
        db.commit()

        # Act
        response = client.get("/api/reports/pl?period=2025-06")

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["ingresos_total"] == 5000.0
        assert len(data["nodos"]) == 2  # INGRESOS y EGRESOS
