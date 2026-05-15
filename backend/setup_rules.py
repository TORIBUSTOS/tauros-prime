import sys
import os

# Añadir el directorio actual al path para importar src
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.models.movement import Movimiento, CascadaRule, SessionLocal
from src.services.categorizer import CategorizerService

def setup_initial_rules():
    db = SessionLocal()
    try:
        rules = [
            # Categoría, Subcategoría, Patrón, Peso
            ("Impuestos", "Bancarios", "Impuesto Débitos y Créditos", 0.9),
            ("Impuestos", "Ingresos Brutos", "IIBB- Acreditaciones Bancarias", 0.9),
            ("Inversiones", "Intereses", "Remuneración de Saldo", 0.9),
            ("Beneficios", "Descuentos", "Descuento por Promociones", 0.8),
            ("Ajustes", "Devoluciones", "Devolución de Compras", 0.8),
            ("Ajustes", "Devoluciones", "Devolución Imp. Débitos", 0.8),
            ("Transferencias", "Salida", "Transferencia por CBU", 0.7),
            ("Transferencias", "Entrada", "Crédito por Transferencia", 0.7),
            ("Gastos", "Tarjeta", "Compra Visa Débito", 0.6),
            ("Gastos", "Comida", "PEDIDOSYA", 0.85),
            ("Gastos", "Comida", "RAPPI", 0.85),
            ("Gastos", "Comida", "PedidosYa", 0.85),
            ("Servicios", "Nube", "GOOGLE", 0.8),
            ("Servicios", "Nube", "AWS", 0.8),
            ("Servicios", "Suscripciones", "NETFLIX", 0.8),
            ("Servicios", "Suscripciones", "SPOTIFY", 0.8),
        ]

        print("Insertando reglas iniciales...")
        for cat, sub, pat, peso in rules:
            # Evitar duplicados
            exists = db.query(CascadaRule).filter(CascadaRule.patron == pat).first()
            if not exists:
                rule = CascadaRule(categoria=cat, subcategoria=sub, patron=pat, peso=peso, activo=1)
                db.add(rule)
        
        db.commit()
        print("Reglas insertadas.")

        # Re-categorizar
        print("Re-categorizando movimientos existentes...")
        movs = db.query(Movimiento).all()
        categorizer = CategorizerService()
        count = 0
        for m in movs:
            old_cat = m.categoria
            new_cat = categorizer.categorize(m, db)
            if old_cat != new_cat:
                count += 1
        
        db.commit()
        print(f"Se actualizaron {count} movimientos con las nuevas reglas.")

    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    setup_initial_rules()
