import pytest
import pandas as pd
from io import BytesIO
from src.services.parser import ParserService
from src.services.categorizer import CategorizerService
from src.models.movement import Movimiento, CascadaRule

def test_parser_valid_excel(db):
    df = pd.DataFrame({'fecha': ['2024-01-01'], 'descripcion': ['Test'], 'monto': [1000.0]})
    excel = BytesIO()
    df.to_excel(excel, index=False)
    excel.seek(0)
    batch = ParserService.parse_excel(excel.getvalue(), "test.xlsx", db)
    assert batch.cantidad_movimientos == 1

def test_parser_missing_columns(db):
    df = pd.DataFrame({'fecha': ['2024-01-01']})
    excel = BytesIO()
    df.to_excel(excel, index=False)
    excel.seek(0)
    with pytest.raises(ValueError):
        ParserService.parse_excel(excel.getvalue(), "bad.xlsx", db)

def test_categorizer_applies_rule(db):
    db.add(CascadaRule(categoria="Test", patron="TEST", peso=0.9, activo=1))
    db.commit()
    mov = Movimiento(fecha="2024-01-01", descripcion="Test", monto=1000, categoria="Sin categorizar")
    categoria = CategorizerService.categorize(mov, db)
    assert categoria == "Test"
    assert mov.confianza == 0.9

def test_categorizer_no_match(db):
    mov = Movimiento(fecha="2024-01-01", descripcion="Unknown", monto=100, categoria="Sin categorizar")
    categoria = CategorizerService.categorize(mov, db)
    assert categoria == "Sin categorizar"

def test_save_rule_creates_new(db):
    rule = CategorizerService.save_rule("Pago OSPACA", "Obra Social", 0.9, db)
    assert rule.categoria == "Obra Social"
    # Pattern is first word > 3 chars, uppercased
    assert rule.patron == "PAGO"
    assert rule.peso == 0.9

def test_save_rule_increases_on_reuse(db):
    rule1 = CategorizerService.save_rule("OSPACA", "Obra Social", 0.8, db)
    rule2 = CategorizerService.save_rule("OSPACA Payment", "Obra Social", 0.85, db)
    assert rule1.id == rule2.id
    assert rule2.veces_usada == 2

def test_parser_skips_duplicates(db):
    """Verify that re-importing the same file skips duplicates."""
    df = pd.DataFrame({
        'fecha': ['2024-01-01', '2024-01-02'],
        'descripcion': ['Payment OSPACA', 'Transfer XYZ'],
        'monto': [1500.0, -500.0]
    })
    excel_bytes = BytesIO()
    df.to_excel(excel_bytes, index=False)
    excel_bytes.seek(0)

    # First import
    batch1 = ParserService.parse_excel(excel_bytes.getvalue(), "test.xlsx", db)
    assert batch1.cantidad_movimientos == 2

    # Re-import same file
    excel_bytes.seek(0)
    batch2 = ParserService.parse_excel(excel_bytes.getvalue(), "test.xlsx", db)
    assert batch2.cantidad_movimientos == 0  # All duplicates, skip all

    # Verify DB has only 2 movimientos, not 4
    total = db.query(Movimiento).count()
    assert total == 2
