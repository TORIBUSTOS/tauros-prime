from sqlalchemy.orm import Session
from sqlalchemy import func
from src.models.movement import Movimiento
from src.schemas.responses import PLReportResponse, ReportNode, MovimientoResponse
from datetime import datetime, date
from typing import List, Dict

class ReportService:
    @staticmethod
    def get_pl_report(period: str, db: Session) -> Dict:
        # Cargar movimientos del periodo actual
        movimientos = db.query(Movimiento).filter(Movimiento.fecha.like(f"{period}%")).all()
        
        # Calcular totales generales
        ingresos_total = sum(m.monto for m in movimientos if m.monto > 0)
        egresos_total = sum(abs(m.monto) for m in movimientos if m.monto < 0)
        resultado_neto = ingresos_total - egresos_total
        
        # Estructura jerárquica
        # Raíces: Ingresos y Egresos
        nodos_raiz = {
            "ingreso": ReportNode(nombre="INGRESOS", total=ingresos_total, tipo="tipo", hijos=[]),
            "egreso": ReportNode(nombre="EGRESOS", total=egresos_total, tipo="tipo", hijos=[])
        }
        
        # Agrupación temporal
        temp_data = {
            "ingreso": {}, # {categoria: {subcategoria: [movimientos]}}
            "egreso": {}
        }
        
        for m in movimientos:
            t = "ingreso" if m.monto > 0 else "egreso"
            cat = m.categoria or "Otros"
            sub = m.subcategoria or "General"
            
            if cat not in temp_data[t]:
                temp_data[t][cat] = {}
            if sub not in temp_data[t][cat]:
                temp_data[t][cat][sub] = []
            
            temp_data[t][cat][sub].append(m)
            
        # Construir árbol
        for t in ["ingreso", "egreso"]:
            root = nodos_raiz[t]
            for cat_nome, subcats in temp_data[t].items():
                cat_total = sum(abs(m.monto) for sub in subcats.values() for m in sub)
                cat_node = ReportNode(nombre=cat_nome, total=cat_total, tipo="categoria", hijos=[])
                
                for sub_nome, movs in subcats.items():
                    sub_total = sum(abs(m.monto) for m in movs)
                    sub_node = ReportNode(
                        nombre=sub_nome, 
                        total=sub_total, 
                        tipo="subcategoria", 
                        movimientos=[MovimientoResponse.from_orm(m) for m in movs]
                    )
                    cat_node.hijos.append(sub_node)
                
                root.hijos.append(cat_node)
                
        return {
            "period": period,
            "ingresos_total": ingresos_total,
            "egresos_total": egresos_total,
            "resultado_neto": resultado_neto,
            "nodos": [nodos_raiz["ingreso"], nodos_raiz["egreso"]]
        }
