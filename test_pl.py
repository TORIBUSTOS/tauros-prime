import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from src.models.movement import Base, Movimiento, engine
from src.services.reports import ReportService
from src.schemas.responses import PLReportResponse

engine = create_engine("sqlite:///backend/toro_prime.db", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

try:
    report = ReportService.get_pl_report('2025-06', db)
    resp = PLReportResponse(**report)
    print("SUCCESS")
except Exception as e:
    import traceback
    traceback.print_exc()
finally:
    db.close()
