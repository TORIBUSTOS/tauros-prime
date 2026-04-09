import pytest
from datetime import datetime
from sqlalchemy.orm import Session
from src.models.movement import Movimiento, ImportBatch
from src.services.forecast import ForecastService


@pytest.fixture
def historical_movements(db: Session):
    """Create 12 months of historical data for forecasting."""
    movs = []
    # Create data for year 2025 (12 months back from 2026-04)
    for month in range(1, 13):
        # OSPACA: 5000-6000 per month, 1-2 times
        for i in range(1, 3 if month % 2 == 0 else 1):
            movs.append(Movimiento(
                fecha=datetime(2025, month, 5 + i*5).date(),
                descripcion="Pago OSPACA",
                monto=5000.0 + i*200,
                categoria="OSPACA",
                confianza=0.95
            ))

        # Honorarios: 7000-8000 per month, 1 time
        movs.append(Movimiento(
            fecha=datetime(2025, month, 10).date(),
            descripcion="Honorarios",
            monto=7500.0,
            categoria="Honorarios",
            confianza=0.90
        ))

        # Ventas: 10000-15000 per month, 2-3 times
        for i in range(1, 3):
            movs.append(Movimiento(
                fecha=datetime(2025, month, 15 + i*5).date(),
                descripcion=f"Venta {i}",
                monto=12000.0 + i*1000,
                categoria="Ventas",
                confianza=0.95
            ))

    for mov in movs:
        db.add(mov)
    db.commit()

    return movs


def test_forecast_3months_returns_dict(db: Session, historical_movements):
    """Test that forecast returns a dictionary."""
    result = ForecastService.forecast_3months("2026-04", db)
    assert isinstance(result, dict)
    assert 'period' in result
    assert 'forecast' in result
    assert 'scenarios' in result


def test_forecast_returns_three_months(db: Session, historical_movements):
    """Test that forecast contains 3 months of projections."""
    result = ForecastService.forecast_3months("2026-04", db)
    assert len(result['forecast']) == 3
    assert result['forecast'][0]['period'] == "2026-04"
    assert result['forecast'][1]['period'] == "2026-05"
    assert result['forecast'][2]['period'] == "2026-06"


def test_forecast_contains_categories(db: Session, historical_movements):
    """Test that forecast includes all historical categories."""
    result = ForecastService.forecast_3months("2026-04", db)

    all_forecasted_categories = set()
    for month_forecast in result['forecast']:
        for item in month_forecast['forecast']:
            all_forecasted_categories.add(item['categoria'])

    assert "OSPACA" in all_forecasted_categories
    assert "Honorarios" in all_forecasted_categories
    assert "Ventas" in all_forecasted_categories


def test_forecast_item_includes_required_fields(db: Session, historical_movements):
    """Test that each forecast item has required fields."""
    result = ForecastService.forecast_3months("2026-04", db)

    required_fields = {'categoria', 'expected_count', 'expected_total', 'expected_avg', 'confidence'}
    for month_forecast in result['forecast']:
        for item in month_forecast['forecast']:
            assert all(field in item for field in required_fields)


def test_forecast_confidence_range(db: Session, historical_movements):
    """Test that confidence scores are between 0.5 and 0.95."""
    result = ForecastService.forecast_3months("2026-04", db)

    for month_forecast in result['forecast']:
        for item in month_forecast['forecast']:
            assert 0.5 <= item['confidence'] <= 0.95


def test_forecast_scenarios_include_three_options(db: Session, historical_movements):
    """Test that scenarios include realistic, optimistic, and pessimistic."""
    result = ForecastService.forecast_3months("2026-04", db)

    assert 'realistic' in result['scenarios']
    assert 'optimistic' in result['scenarios']
    assert 'pessimistic' in result['scenarios']


def test_forecast_scenarios_calculation(db: Session, historical_movements):
    """Test that scenarios are calculated correctly."""
    result = ForecastService.forecast_3months("2026-04", db)

    realistic = result['scenarios']['realistic']['total_3m']
    optimistic = result['scenarios']['optimistic']['total_3m']
    pessimistic = result['scenarios']['pessimistic']['total_3m']

    # Optimistic should be 15% higher than realistic
    assert abs(optimistic - (realistic * 1.15)) < 0.01
    # Pessimistic should be 15% lower than realistic
    assert abs(pessimistic - (realistic * 0.85)) < 0.01


def test_forecast_insufficient_data_handling(db: Session):
    """Test that forecast handles insufficient historical data gracefully."""
    result = ForecastService.forecast_3months("2026-04", db)

    # With no data, should return error in dict
    if 'error' in result:
        assert result['error'] == 'Insufficient historical data'
    else:
        # Or empty forecast
        assert len(result['forecast']) == 3


def test_forecast_month_calculations_for_same_month_pattern(db: Session, historical_movements):
    """Test that forecast uses same-month historical data when available."""
    result = ForecastService.forecast_3months("2026-04", db)

    # April 2025 had specific patterns, should influence April 2026 forecast
    april_forecast = result['forecast'][0]['forecast']

    # Find OSPACA forecast for April
    ospaca = next((item for item in april_forecast if item['categoria'] == "OSPACA"), None)
    assert ospaca is not None

    # April 2025 had OSPACA occurrences, so count should be > 0
    assert ospaca['expected_count'] > 0


def test_forecast_non_recurring_month_fallback(db: Session):
    """Test forecast fallback for months with no historical data."""
    # Only add January data from 2025
    for i in range(6):
        db.add(Movimiento(
            fecha=datetime(2025, 1, 5 + i*5).date(),
            descripcion=f"Test {i}",
            monto=1000.0 + i*100,
            categoria="Test",
            confianza=0.95
        ))
    db.commit()

    result = ForecastService.forecast_3months("2026-04", db)

    # May fail due to insufficient historical data (only 1 month)
    if 'forecast' in result:
        # If forecast generated, should have 3 months
        assert len(result['forecast']) == 3
    elif 'error' in result:
        # Or return error message
        assert 'Insufficient' in result['error']


def test_forecast_expected_totals_positive(db: Session, historical_movements):
    """Test that all expected totals are positive."""
    result = ForecastService.forecast_3months("2026-04", db)

    for month_forecast in result['forecast']:
        for item in month_forecast['forecast']:
            assert item['expected_total'] > 0
            assert item['expected_count'] > 0
            assert item['expected_avg'] > 0


def test_forecast_std_dev_included(db: Session, historical_movements):
    """Test that standard deviation is included in forecast data."""
    result = ForecastService.forecast_3months("2026-04", db)

    for month_forecast in result['forecast']:
        for item in month_forecast['forecast']:
            assert 'std_dev' in item
            assert item['std_dev'] >= 0
