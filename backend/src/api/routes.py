from fastapi import APIRouter, File, UploadFile, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from src.models.movement import get_db, Movimiento, CascadaRule
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
    return query.order_by(Movimiento.fecha.desc()).limit(5000).all()

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


# ── CATEGORÍAS ─────────────────────────────────────────────────────────────

@router.get("/categories", response_model=List[CategoryStatsResponse])
def get_categories(db: Session = Depends(get_db)):
    """Estadísticas de todas las categorías en toda la base."""
    total_movs = db.query(func.count(Movimiento.id)).scalar() or 1
    total_gasto = db.query(func.sum(func.abs(Movimiento.monto))).filter(Movimiento.monto < 0).scalar() or 1

    rows = db.query(
        Movimiento.categoria,
        func.count(Movimiento.id).label("n"),
        func.sum(func.abs(func.min(Movimiento.monto, 0))).label("gasto"),
        func.sum(func.max(Movimiento.monto, 0)).label("ingreso"),
    ).group_by(Movimiento.categoria).all()

    result = []
    for row in rows:
        cat = row.categoria
        n = row.n
        # Calcular gasto e ingreso manualmente (SQLite compat)
        gasto = db.query(func.sum(func.abs(Movimiento.monto))).filter(
            Movimiento.categoria == cat, Movimiento.monto < 0
        ).scalar() or 0.0
        ingreso = db.query(func.sum(Movimiento.monto)).filter(
            Movimiento.categoria == cat, Movimiento.monto > 0
        ).scalar() or 0.0

        subcats = db.query(Movimiento.subcategoria).filter(
            Movimiento.categoria == cat, Movimiento.subcategoria != None
        ).distinct().all()

        n_reglas = db.query(func.count(CascadaRule.id)).filter(
            CascadaRule.categoria == cat, CascadaRule.activo == 1
        ).scalar() or 0

        result.append(CategoryStatsResponse(
            categoria=cat,
            n_movimientos=n,
            gasto=round(gasto, 2),
            ingreso=round(ingreso, 2),
            pct_movimientos=round(n / total_movs * 100, 1),
            pct_gasto=round(gasto / total_gasto * 100, 1),
            n_reglas=n_reglas,
            subcategorias=[s[0] for s in subcats if s[0]],
        ))

    return sorted(result, key=lambda x: x.gasto, reverse=True)


@router.get("/categories/{categoria}/subcategorias", response_model=List[SubcategoriaStatsResponse])
def get_subcategoria_stats(categoria: str, db: Session = Depends(get_db)):
    """Retorna stats por subcategoría para una categoría dada."""
    # Totales de la categoría padre (denominadores)
    total_cat_movs = db.query(func.count(Movimiento.id)).filter(
        Movimiento.categoria == categoria
    ).scalar() or 1
    total_cat_gasto = db.query(func.sum(func.abs(Movimiento.monto))).filter(
        Movimiento.categoria == categoria, Movimiento.monto < 0
    ).scalar() or 1

    # Subcategorías distintas (excluyendo None)
    subcats = db.query(Movimiento.subcategoria).filter(
        Movimiento.categoria == categoria,
        Movimiento.subcategoria != None,
        Movimiento.subcategoria != "",
    ).distinct().all()

    result = []
    for (sub,) in subcats:
        n = db.query(func.count(Movimiento.id)).filter(
            Movimiento.categoria == categoria,
            Movimiento.subcategoria == sub,
        ).scalar() or 0
        gasto = db.query(func.sum(func.abs(Movimiento.monto))).filter(
            Movimiento.categoria == categoria,
            Movimiento.subcategoria == sub,
            Movimiento.monto < 0,
        ).scalar() or 0.0
        ingreso = db.query(func.sum(Movimiento.monto)).filter(
            Movimiento.categoria == categoria,
            Movimiento.subcategoria == sub,
            Movimiento.monto > 0,
        ).scalar() or 0.0

        result.append(SubcategoriaStatsResponse(
            subcategoria=sub,
            n_movimientos=n,
            gasto=round(gasto, 2),
            ingreso=round(ingreso, 2),
            pct_gasto=round(gasto / total_cat_gasto * 100, 1),
            pct_movimientos=round(n / total_cat_movs * 100, 1),
        ))

    return sorted(result, key=lambda x: x.gasto, reverse=True)


# ── REGLAS CASCADA ─────────────────────────────────────────────────────────

@router.get("/rules", response_model=List[CascadaRuleResponse])
def get_rules(db: Session = Depends(get_db)):
    return db.query(CascadaRule).order_by(CascadaRule.peso.desc()).all()

@router.post("/rules", response_model=CascadaRuleResponse, status_code=201)
def create_rule(body: CascadaRuleCreate, db: Session = Depends(get_db)):
    existing = db.query(CascadaRule).filter(CascadaRule.patron == body.patron).first()
    if existing:
        raise HTTPException(status_code=409, detail=f"Ya existe una regla con patrón '{body.patron}'")
    rule = CascadaRule(
        patron=body.patron,
        categoria=body.categoria,
        subcategoria=body.subcategoria,
        peso=body.peso,
        veces_usada=0,
        activo=1,
    )
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return rule

@router.patch("/rules/{rule_id}", response_model=CascadaRuleResponse)
def update_rule(rule_id: int, body: CascadaRuleUpdate, db: Session = Depends(get_db)):
    rule = db.query(CascadaRule).filter(CascadaRule.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Regla no encontrada")
    for field, val in body.model_dump(exclude_none=True).items():
        setattr(rule, field, val)
    db.commit()
    db.refresh(rule)
    return rule

@router.delete("/rules/{rule_id}", status_code=204)
def delete_rule(rule_id: int, db: Session = Depends(get_db)):
    rule = db.query(CascadaRule).filter(CascadaRule.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Regla no encontrada")
    rule.activo = 0
    db.commit()

@router.post("/recategorize", response_model=RecategorizeResponse)
def recategorize_all(db: Session = Depends(get_db)):
    """Re-corre el motor cascada sobre todos los movimientos."""
    movs = db.query(Movimiento).all()
    for mov in movs:
        CategorizerService.categorize(mov, db)
    db.commit()
    return RecategorizeResponse(total=len(movs), recategorizados=len(movs))

@router.patch("/movements/{mov_id}/categoria")
def patch_movement_categoria(mov_id: int, body: dict, db: Session = Depends(get_db)):
    """Reasigna categoría y subcategoría a un movimiento individual."""
    mov = db.query(Movimiento).filter(Movimiento.id == mov_id).first()
    if not mov:
        raise HTTPException(status_code=404, detail="Movimiento no encontrado")
    mov.categoria = body.get("categoria", mov.categoria)
    mov.subcategoria = body.get("subcategoria", mov.subcategoria)
    mov.confianza = 1.0  # asignación manual = confianza total
    db.commit()
    return {"id": mov_id, "categoria": mov.categoria, "subcategoria": mov.subcategoria}
