import math
from sqlalchemy.orm import Session
from src.models.movement import Movimiento, CascadaRule

class CategorizerService:
    @staticmethod
    def categorize(movimiento: Movimiento, db: Session) -> str:
        desc = movimiento.descripcion.lower()
        # Determinar tipo basado en monto
        movimiento.tipo = "ingreso" if movimiento.monto > 0 else "egreso"
        
        rules = db.query(CascadaRule).filter(CascadaRule.activo == 1).order_by(CascadaRule.peso.desc()).all()
        for rule in rules:
            if rule.patron.lower() in desc:
                movimiento.categoria = rule.categoria
                movimiento.subcategoria = rule.subcategoria
                movimiento.confianza = rule.peso
                return rule.categoria
        
        movimiento.categoria = "Sin categorizar"
        movimiento.subcategoria = "Otros"
        movimiento.confianza = 0.0
        return "Sin categorizar"

    @staticmethod
    def save_rule(descripcion: str, categoria: str, confianza: float, db: Session) -> CascadaRule:
        patron = CategorizerService._extract_pattern(descripcion)
        existing = db.query(CascadaRule).filter(
            CascadaRule.patron == patron,
            CascadaRule.categoria == categoria
        ).first()

        if existing:
            existing.veces_usada += 1
            existing.peso = min(0.99, existing.peso + 0.05)
            db.commit()
            return existing
        else:
            rule = CascadaRule(categoria=categoria, patron=patron, peso=confianza, veces_usada=1, activo=1)
            db.add(rule)
            db.commit()
            return rule

    @staticmethod
    def _extract_pattern(descripcion: str) -> str:
        words = descripcion.split()
        for word in words:
            clean_word = word.upper().strip('.,')
            if len(clean_word) > 3:
                return clean_word
        return descripcion.upper()[:10]

    @staticmethod
    def update_rule_usage(rule: CascadaRule, db: Session):
        rule.veces_usada += 1
        factor = 1 + (0.5 / math.log(rule.veces_usada + 2))
        rule.peso = min(0.99, rule.peso * factor)
        db.commit()
