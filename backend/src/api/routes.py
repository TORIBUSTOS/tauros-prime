from fastapi import APIRouter, File, UploadFile, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from src.models.movement import get_db, Movimiento
from src.services.parser import ParserService
from src.services.categorizer import CategorizerService
from src.services.insights import InsightsService
from src.services.forecast import ForecastService
from src.services.reports import ReportService
from src.schemas.responses import *
from typing import List

router = APIRouter(prefix="/api", tags=["toro-prime"])

@router.post("/import", response_model=ImportResponse)
async def import_file(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith(('.xlsx', '.csv')):
        raise HTTPException(status_code=400, detail="Solo .xlsx o .csv")
    try:
        contents = await file.read()
        batch = ParserService.parse_excel(contents, file.filename, db)
        movs = db.query(Movimiento).filter(Movimiento.categoria == "Sin categorizar").all()
        for mov in movs:
            CategorizerService.categorize(mov, db)
        db.commit()
        return ImportResponse(batch_id=batch.id, movimientos=batch.cantidad_movimientos, status="procesado")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/movements", response_model=List[MovimientoResponse])
def get_movements(period: str = Query(None, pattern=r"^\d{4}-\d{2}$"), categoria: str = None, db: Session = Depends(get_db)):
    query = db.query(Movimiento)
    if period:
        query = query.filter(Movimiento.fecha.like(f"{period}%"))
    if categoria:
        query = query.filter(Movimiento.categoria == categoria)
    return query.order_by(Movimiento.fecha.desc()).limit(500).all()

@router.get("/summary", response_model=SummaryResponse)
def get_summary(period: str = Query(..., pattern=r"^\d{4}-\d{2}$"), db: Session = Depends(get_db)):
    """Retorna el resumen financiero de un periodo sin descargar todos los movimientos."""
    try:
        ingresos = db.query(func.sum(Movimiento.monto)).filter(
            Movimiento.fecha.like(f"{period}%"),
            Movimiento.monto > 0
        ).scalar() or 0.0
        
        egresos = db.query(func.sum(func.abs(Movimiento.monto))).filter(
            Movimiento.fecha.like(f"{period}%"),
            Movimiento.monto < 0
        ).scalar() or 0.0
        
        count = db.query(func.count(Movimiento.id)).filter(
            Movimiento.fecha.like(f"{period}%")
        ).scalar() or 0
        
        return SummaryResponse(
            period=period,
            ingresos_total=ingresos,
            egresos_total=egresos,
            balance=ingresos - egresos,
            transaction_count=count
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/reports/periods", response_model=List[str])
def get_periods(db: Session = Depends(get_db)):
    """Retorna lista de periodos únicos con datos."""
    periods = db.query(func.strftime('%Y-%m', Movimiento.fecha)).distinct().all()
    # periods viene como lista de tuplas [('2025-06',), ('2025-07',)]
    return sorted([p[0] for p in periods], reverse=True)

@router.get("/insights", response_model=InsightsResponse)
def get_insights(period: str = Query(..., pattern=r"^\d{4}-\d{2}$"), db: Session = Depends(get_db)):
    try:
        insights = InsightsService.generate_insights(period, db)
        return InsightsResponse(period=period, insights=insights)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/forecast", response_model=ForecastResponse)
def get_forecast(desde: str = Query(..., pattern=r"^\d{4}-\d{2}$"), db: Session = Depends(get_db)):
    try:
        forecast = ForecastService.forecast_3months(desde, db)
        return ForecastResponse(**forecast)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/reports/pl", response_model=PLReportResponse)
def get_pl_report(period: str = Query(..., pattern=r"^\d{4}-\d{2}$"), db: Session = Depends(get_db)):
    try:
        report = ReportService.get_pl_report(period, db)
        return PLReportResponse(**report)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
