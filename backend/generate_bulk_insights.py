import sys
import os

# Añadir el directorio actual al path para importar src
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.models.movement import SessionLocal
from src.services.insights import InsightsService

def generate_bulk_insights():
    db = SessionLocal()
    periods = ["2026-01", "2026-02", "2026-03"]
    
    try:
        for period in periods:
            print(f"Generando insights para {period}...")
            insights = InsightsService.generate_insights(period, db)
            print(f"Detectados {len(insights)} hallazgos para {period}.")
        
        db.commit()
        print("Todos los insights han sido generados y persistidos.")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    generate_bulk_insights()
