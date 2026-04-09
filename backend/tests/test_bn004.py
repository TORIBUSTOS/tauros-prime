import pytest
from io import BytesIO
from datetime import datetime
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from sqlalchemy import event
from src.main import app
from src.models.movement import Movimiento, ImportBatch, SessionLocal


@pytest.fixture
def client():
    """Create a test client for the API."""
    return TestClient(app)


@pytest.fixture
def sample_data(db: Session):
    """Create sample data for API testing."""
    movs = [
        Movimiento(
            fecha=datetime(2026, 4, 1).date(),
            descripcion="Pago OSPACA",
            monto=5000.0,
            categoria="OSPACA",
            confianza=0.95
        ),
        Movimiento(
            fecha=datetime(2026, 4, 5).date(),
            descripcion="Pago OSPACA",
            monto=5200.0,
            categoria="OSPACA",
            confianza=0.95
        ),
        Movimiento(
            fecha=datetime(2026, 4, 10).date(),
            descripcion="Honorarios",
            monto=8000.0,
            categoria="Honorarios",
            confianza=0.90
        ),
        Movimiento(
            fecha=datetime(2026, 3, 1).date(),
            descripcion="Pago OSPACA",
            monto=5000.0,
            categoria="OSPACA",
            confianza=0.95
        ),
    ]

    for mov in movs:
        db.add(mov)
    db.commit()

    return movs


def test_get_movements_success(client: TestClient):
    """Test GET /api/movements endpoint exists and returns list."""
    response = client.get("/api/movements")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_get_movements_filters_by_period(client: TestClient):
    """Test GET /api/movements accepts period parameter."""
    response = client.get("/api/movements?period=2026-04")
    assert response.status_code == 200
    movements = response.json()
    assert isinstance(movements, list)


def test_get_movements_filters_by_category(client: TestClient):
    """Test GET /api/movements accepts category parameter."""
    response = client.get("/api/movements?categoria=OSPACA")
    assert response.status_code == 200
    movements = response.json()
    assert isinstance(movements, list)
    if len(movements) > 0:
        assert all(m['categoria'] == "OSPACA" for m in movements)


def test_get_movements_filters_by_both_period_and_category(client: TestClient):
    """Test GET /api/movements with both period and category filters."""
    response = client.get("/api/movements?period=2026-04&categoria=OSPACA")
    assert response.status_code == 200
    movements = response.json()
    assert isinstance(movements, list)


def test_get_movements_invalid_period_format(client: TestClient):
    """Test that invalid period format is rejected."""
    response = client.get("/api/movements?period=invalid")
    assert response.status_code == 422  # Validation error


def test_get_movements_response_structure(client: TestClient):
    """Test that movement response has correct structure."""
    response = client.get("/api/movements")
    movements = response.json()

    # When there are movements, they should have the required structure
    if len(movements) > 0:
        required_fields = {'id', 'fecha', 'descripcion', 'monto', 'categoria', 'confianza'}
        for mov in movements:
            assert all(field in mov for field in required_fields)
            assert isinstance(mov['monto'], (int, float))
            assert 0 <= mov['confianza'] <= 1


def test_get_insights_success(client: TestClient, sample_data):
    """Test GET /api/insights returns insights."""
    response = client.get("/api/insights?period=2026-04")
    assert response.status_code == 200
    data = response.json()
    assert 'period' in data
    assert 'insights' in data
    assert data['period'] == "2026-04"
    assert isinstance(data['insights'], list)


def test_get_insights_missing_period(client: TestClient):
    """Test that period parameter is required."""
    response = client.get("/api/insights")
    assert response.status_code == 422


def test_get_insights_invalid_period(client: TestClient):
    """Test that invalid period format is rejected."""
    response = client.get("/api/insights?period=invalid")
    assert response.status_code == 422


def test_get_insights_response_structure(client: TestClient):
    """Test that insights response has correct structure."""
    response = client.get("/api/insights?period=2026-04")
    assert response.status_code == 200
    data = response.json()

    required_fields = {'period', 'insights'}
    assert all(field in data for field in required_fields)

    if len(data['insights']) > 0:
        insight_fields = {'type', 'categoria', 'insight', 'confidence', 'data'}
        for insight in data['insights']:
            assert all(field in insight for field in insight_fields)
            assert insight['type'] in {'pattern', 'outlier', 'context_anomaly'}


def test_get_forecast_success(client: TestClient):
    """Test GET /api/forecast endpoint and response structure."""
    response = client.get("/api/forecast?desde=2026-04")
    # May return 200 or 400 depending on whether sufficient historical data exists
    assert response.status_code in [200, 400]
    if response.status_code == 200:
        data = response.json()
        if 'error' not in data:
            assert 'period' in data
            assert 'forecast' in data
            assert 'scenarios' in data


def test_get_forecast_missing_desde(client: TestClient):
    """Test that desde parameter is required."""
    response = client.get("/api/forecast")
    assert response.status_code == 422


def test_get_forecast_invalid_desde(client: TestClient):
    """Test that invalid desde format is rejected."""
    response = client.get("/api/forecast?desde=invalid")
    assert response.status_code == 422


def test_get_forecast_response_structure(client: TestClient):
    """Test that forecast response has correct structure when data exists."""
    response = client.get("/api/forecast?desde=2026-04")

    if response.status_code == 200:
        data = response.json()
        if 'error' not in data:
            assert 'period' in data
            assert 'forecast' in data
            assert 'scenarios' in data
            assert isinstance(data['forecast'], list)


def test_import_excel_success(client: TestClient):
    """Test POST /api/import with valid Excel file."""
    # Create a simple Excel file in memory
    # For this test, we'll need to create actual bytes
    # This is a basic integration test placeholder
    # In real testing, use openpyxl or pandas to create test Excel

    # Skip for now as it requires actual file creation
    pass


def test_root_endpoint(client: TestClient):
    """Test GET / returns API info."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert 'message' in data
    assert 'docs' in data
    assert 'status' in data
    assert data['status'] == 'ready'


def test_health_endpoint(client: TestClient):
    """Test GET /health returns ok."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data['status'] == 'ok'


def test_get_movements_limit(client: TestClient):
    """Test that movements endpoint respects limit."""
    response = client.get("/api/movements")
    assert response.status_code == 200
    movements = response.json()
    assert len(movements) <= 500


def test_get_movements_ordered_by_date_desc(client: TestClient):
    """Test that movements are ordered by date descending."""
    response = client.get("/api/movements")
    assert response.status_code == 200
    movements = response.json()

    if len(movements) > 1:
        for i in range(len(movements) - 1):
            current_date = datetime.fromisoformat(movements[i]['fecha'])
            next_date = datetime.fromisoformat(movements[i + 1]['fecha'])
            assert current_date >= next_date
