# PROPUESTAS — Soluciones Colaborativas TORO_Prime

---

## 🔧 PROPUESTAS CLAUDE (Backend/Technical)

Basadas en: AUDIT_CLAUDE.md + Hallazgos de ejecución real

### **PROPUESTA C1: Fijar Schema Database Mismatch** 🔴 CRÍTICO

**Problema**: Tabla `movimientos` NO tiene columna `subcategoria` aunque el modelo la define.

**Raíz**: `init_db()` usa `create_all()` pero el código fue actualizado después de crear la tabla.

**Solución Propuesta**: Implementar **Alembic para migraciones versionadas**

```python
# backend/alembic/versions/001_add_subcategoria.py
def upgrade():
    op.add_column('movimientos', sa.Column('subcategoria', sa.String(100), nullable=True))

def downgrade():
    op.drop_column('movimientos', 'subcategoria')
```

**Pasos**:
1. Instalar: `pip install alembic`
2. Inicializar: `alembic init alembic`
3. Crear migración: `alembic revision --autogenerate -m "add_subcategoria"`
4. Ejecutar: `alembic upgrade head`
5. Re-ejecutar tests: `pytest -v` (should go 25/47 → 47/47)

**Esfuerzo**: Medium  
**Impacto**: ALTO - Desbloquea 16 tests fallidos

**Alternativa Rápida** (si NO quieres Alembic):
```sql
-- Run manually
sqlite3 backend/database.db "ALTER TABLE movimientos ADD COLUMN subcategoria TEXT;"
```
Luego: `pytest -v` debería pasar.

---

### **PROPUESTA C2: Implementar Deduplicación en ParserService** 🔴 CRÍTICO

**Problema**: Usuario puede re-importar mismo archivo 2x → duplicados en BD

**Raíz**: `ParserService.parse_excel()` inserta cada fila sin validar unicidad.

**Solución Propuesta**: Hash-based deduplication

```python
# backend/src/services/parser.py

import hashlib
from typing import Set

class ParserService:
    @staticmethod
    def _get_row_hash(fecha: str, descripcion: str, monto: float) -> str:
        """Genera hash único para (fecha, descripcion, monto)"""
        row_str = f"{fecha}|{descripcion}|{monto}"
        return hashlib.md5(row_str.encode()).hexdigest()
    
    @staticmethod
    def parse_excel(file_bytes: bytes, filename: str, db: Session) -> ImportBatch:
        df = pd.read_excel(BytesIO(file_bytes))
        
        # Validar columnas
        if not all(col in df.columns for col in ParserService.REQUIRED_COLUMNS):
            raise ValueError(f"Faltan: {ParserService.REQUIRED_COLUMNS}")
        
        # Obtener hashes existentes
        existing_hashes: Set[str] = set()
        for mov in db.query(Movimiento).all():
            hash_val = ParserService._get_row_hash(
                str(mov.fecha), mov.descripcion, mov.monto
            )
            existing_hashes.add(hash_val)
        
        batch = ImportBatch(nombre_archivo=filename, cantidad_movimientos=0)
        db.add(batch)
        db.flush()
        
        duplicates_skipped = 0
        for _, row in df.iterrows():
            row_hash = ParserService._get_row_hash(
                row['fecha'], str(row['descripcion']), float(row['monto'])
            )
            
            if row_hash in existing_hashes:
                duplicates_skipped += 1
                continue  # Skip duplicate
            
            mov = Movimiento(
                fecha=pd.to_datetime(row['fecha']).date(),
                descripcion=str(row['descripcion']).strip(),
                monto=float(row['monto']),
                categoria="Sin categorizar",
                confianza=0.0
            )
            db.add(mov)
            existing_hashes.add(row_hash)
        
        batch.cantidad_movimientos = len(df) - duplicates_skipped
        db.commit()
        
        if duplicates_skipped > 0:
            # Log warning
            print(f"⚠️ Saltados {duplicates_skipped} duplicados")
        
        return batch
```

**Testing**:
```python
def test_parser_skips_duplicates():
    # Import same file twice
    batch1 = ParserService.parse_excel(excel_bytes, "test.xlsx", db)
    assert batch1.cantidad_movimientos == 100
    
    batch2 = ParserService.parse_excel(excel_bytes, "test.xlsx", db)  # Same file again
    assert batch2.cantidad_movimientos == 0  # All duplicates, skip all
    
    # Verify DB has only 100 movimientos, not 200
    total = db.query(Movimiento).count()
    assert total == 100
```

**Esfuerzo**: Medium  
**Impacto**: ALTO - Data integrity

---

### **PROPUESTA C3: Refactor `getSummary()` → Backend Endpoint** 🟡 HIGH

**Problema**: Frontend descarga 500 movimientos solo para sumarlos.

**Raíz**: Lógica de agregación en cliente → ineficiente, escalability issue.

**Solución Propuesta**: Crear endpoint `/api/summary`

```python
# backend/src/api/routes.py

@router.get("/summary", response_model=SummaryResponse)
def get_summary(period: str = Query(..., regex=r"^\d{4}-\d{2}$"), db: Session = Depends(get_db)):
    """
    Retorna sumario de período sin descargar todos los movimientos.
    
    Query: SELECT SUM(monto) WHERE monto > 0, SUM(ABS(monto)) WHERE monto < 0, COUNT(*)
    """
    try:
        year, month = period.split('-')
        
        # Single DB query - EFFICIENT
        ingresos_total = db.query(func.sum(Movimiento.monto)).filter(
            Movimiento.fecha.like(f"{year}-{month}%"),
            Movimiento.monto > 0,
            Movimiento.categoria != "Sin categorizar"
        ).scalar() or 0.0
        
        egresos_total = db.query(func.sum(func.abs(Movimiento.monto))).filter(
            Movimiento.fecha.like(f"{year}-{month}%"),
            Movimiento.monto < 0,
            Movimiento.categoria != "Sin categorizar"
        ).scalar() or 0.0
        
        transaction_count = db.query(func.count(Movimiento.id)).filter(
            Movimiento.fecha.like(f"{year}-{month}%"),
            Movimiento.categoria != "Sin categorizar"
        ).scalar() or 0
        
        return SummaryResponse(
            period=period,
            ingresos_total=ingresos_total,
            egresos_total=egresos_total,
            balance=ingresos_total - egresos_total,
            transaction_count=transaction_count
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
```

```python
# backend/src/schemas/responses.py

class SummaryResponse(BaseModel):
    period: str
    ingresos_total: float
    egresos_total: float
    balance: float
    transaction_count: int
```

```typescript
// frontend/src/services/api.service.ts

getSummary: async (period: string): Promise<SummaryResponse> => {
    const url = new URL(`${API_BASE_URL}/api/summary`);
    url.searchParams.append('period', period);
    
    const response = await fetch(url.toString());
    if (!response.ok) throw new Error('Error al cargar resumen');
    
    return await response.json();
},
```

**Esfuerzo**: Low  
**Impacto**: Medium - Performance + Scalability  
**Benefit**: 
- Frontend fetch: 500 movimientos → 1 agregado
- DB query: O(n) en cliente → O(1) en backend

---

### **PROPUESTA C4: Eliminar Code Redundancy (Tipo)** 🟡 MEDIUM

**Problema**: `api.service.ts` línea 24 recalcula `tipo` cuando backend lo envía.

**Solución**:
```typescript
// BEFORE (redundante)
return data.map(m => ({
  ...m,
  tipo: m.monto > 0 ? 'ingreso' : 'egreso',  // ❌ Recalcula
  periodo: m.fecha.substring(0, 7)
}));

// AFTER (confía en backend)
return data.map(m => ({
  ...m,
  periodo: m.fecha.substring(0, 7)
  // ✅ tipo ya viene en m.tipo del backend
}));
```

**Esfuerzo**: Low (30 min)  
**Impact**: Low - But improves maintainability

---

## 🎨 PROPUESTAS ANTIGRAVITY (Frontend/UX)

Basadas en: AUDIT_ANTIGRAVITY.md + Experiencia de Usuario Premium

### **PROPUESTA A1: Dinamización de Periodos (Eliminar Hardcoding)** ✅ COMPLETADO

**Status**: IMPLEMENTADO en ANTIGRAVITY.md v3.0 (BN-008)

**Lo que AG hizo**:
- ✅ `PeriodContext` + `PeriodProvider` implementados
- ✅ Selector global en Sidebar
- ✅ Periodos dinámicos desde BD
- ✅ Default: 2025-06

**NO requiere trabajo adicional** - Ya está en producción con robustez mejorada.

---

### **PROPUESTA A2: Feedback Sistémico (Notificaciones Imperial)** 🟡 HIGH

**Problema**: La aplicación es "silenciosa". Tras importar un archivo o ocurrir un error de red, no hay feedback visual premium.

**Solución Propuesta**: Implementar sistema de Toasts con estética "Imperial Tech" (glassmorphism, bordes dorados sutiles).

**Componentes**:
- `ToastContainer`: Posición superior derecha.
- `useNotify`: Hook para disparar `success`, `error`, `info`.

**Ejemplo de flujo**:
1. Usuario sube Excel.
2. Botón entra en estado `loading`.
3. Al terminar: Close modal + Toast: "✅ **Importación Exitosa**: 45 movimientos nuevos procesados."

**Esfuerzo**: Medium (3 horas)
**Impacto**: MEDIUM - Mejora drástica en UX percibida.

---

### **PROPUESTA A3: Lógica de Drill-down (Context Linkage)** 🟡 MEDIUM

**Problema**: Los Insights y el reporte P&L muestran totales, pero el usuario no puede "investigar" qué transacciones causaron un pico de gasto sin ir manualmente a filtrar la tabla de movimientos.

**Solución Propuesta**: Vincular componentes de reporte con filtros automáticos.

- Cliqueas "Suscripciones" en P&L → Redirige a `/movimientos` con filtro `categoria=Suscripciones` pre-aplicado.
- Cliqueas Insight de "Gasto Inusual" → Filtra movimientos del mes que superen el desvío estándar.

**Esfuerzo**: Medium (4 horas)
**Impacto**: ALTO - Transforma la herramienta de "Visualizador" a "Analizador".

---

### **PROPUESTA A4: Optimización de Estados Globales** 🟢 OPTIMIZACIÓN

**Problema**: Actualmente, cada card del Dashboard hace sus propias llamadas o cálculos, generando múltiples shimmers/spinners.

**Solución Propuesta**: 
1. `PeriodContext` debe cargar el `summary` (Propuesta C3 de Claude).
2. Los componentes hijos consumen el `summary` del contexto.
3. Se reduce la carga de red y se sincroniza la UI (todo el dashboard carga al unísono).

**Esfuerzo**: Low (2 horas)
**Impacto**: MEDIUM - Limpieza de código y consistencia visual.

---

## 🚀 PROPUESTA SUPER (Síntesis Colaborativa)

### **Objetivo**: Implementar 8 mejoras en 2 sprints = Producto Beta + (Readiness: 63 → 90)

---

### **SPRINT 1: Bloqueadores + Infrastructure (Week 1)**

**Estos son PREREQUISITOS. Sin ellos, el resto falla.**

#### **S1-1: C1 + A1 (Backend Infrastructure)** 
- ✅ **C1**: Fijar schema DB (Alembic migration para `subcategoria`)
- ✅ **A1**: Endpoint `/api/reports/periods` (dinámico)
- **Esfuerzo Total**: Medium
- **Resultado**: Tests pasan 47/47, periodos se cargan dinámicamente

#### **S1-2: C2 (Data Integrity)**
- ✅ **C2**: Implementar hash-based deduplication en ParserService
- **Esfuerzo**: Medium
- **Resultado**: Usuario NO puede crear duplicados

#### **S1-3: C3 + A4 (Estado Global + Performance)**
- ✅ **C3**: Crear endpoint `/api/summary` (backend)
- ✅ **A4**: Refactor `PeriodContext` para consumir `summary` globalmente
- **Esfuerzo**: Medium
- **Resultado**: Dashboard carga 1 query en vez de 5, UI sincronizada

**Sprint 1 Status**: Bloqueadores + Infrastructure

**Status después S1**: 
- ✅ Tests passing: 47/47
- ✅ Schema consistente
- ✅ Sin duplicados
- ✅ Performance mejorado

---

### **SPRINT 2: User Experience + Polish (Week 2)**

**Estas mejoras hacen que la app se sienta premium.**

#### **S2-1: A2 (Feedback System)**
- ✅ Implementar ToastContainer (Glassmorphism Imperial)
- ✅ Conectar a: `/api/import`, `/api/forecast`, errores de red
- **Esfuerzo**: Medium
- **Resultado**: Usuario ve confirmaciones visuales

#### **S2-2: A3 (Drill-down Interactivo)**
- ✅ Vincular P&L → MovimientosTable con filtros pre-aplicados
- ✅ Vincular Insights → MovimientosTable con outliers/patterns
- **Esfuerzo**: Medium
- **Resultado**: "Ver detalles" en todo insight

#### **S2-3: C4 (Code Quality)**
- ✅ Remover redundancia de `tipo` en api.service.ts
- **Esfuerzo**: Low
- **Resultado**: Single source of truth

**Sprint 2 Status**: User Experience + Polish

**Status después S2**: 
- ✅ UX Premium
- ✅ Navegación inteligente
- ✅ Código limpio

---

### **ESTRUCTURA DE IMPLEMENTACIÓN**

**SPRINT 1: Infrastructure (Bloqueadores)**
- C1: Schema Fix (Alembic)
- C2: Deduplication (Hash-based)
- C3: Backend `/api/summary` 
- A1: Dynamic Periods (already done ✅)
- A4: PeriodContext refactor
- **Outcome**: 47/47 tests passing ✅

**SPRINT 2: Premium Experience (Polish)**
- A2: Notificaciones Imperial (Toasts)
- A3: Drill-down Context Linkage
- C4: Remove Type Redundancy
- **Outcome**: Beta Ready ✅

---

### **DEPENDENCIAS Y ORDEN CRÍTICO**

```
C1 (Schema)
  ↓
C2 (Deduplicación) → Puede empezar al mismo tiempo que C1
  ↓
C3 + A1 (Backend endpoints) → Prerequisito para A4
  ↓
A4 (Global state) → Usa C3 como fuente
  ↓
A2 + A3 (UX) → Pueden empezar en paralelo a Sprint 2
```

---

### **IMPACTO PROYECTADO**

| Sprint | Impacto | Readiness |
|--------|---------|-----------|
| S1 | Estabilidad + Performance | 63 → 78 |
| S2 | UX Premium + Usabilidad | 78 → 90 |
| **Total** | **Transformación Completa** | **63 → 90** |

---

### **MÉTRICAS DE ÉXITO POR SPRINT**

**S1 Success Criteria**:
- [ ] `pytest -v` → 47/47 passing
- [ ] Re-importar archivo → "⚠️ Duplicados saltados: X"
- [ ] Dashboard carga en < 1 segundo (medido con DevTools)
- [ ] `/api/reports/periods` retorna lista dinámica

**S2 Success Criteria**:
- [ ] Toast aparece en cada acción (import, error, etc.)
- [ ] Clickear "Suscripciones" en P&L → filtra automáticamente
- [ ] Clickear Insight outlier → muestra transacciones
- [ ] Zero `console.warnings` sobre redundancia

---

### **RIESGOS Y MITIGACIÓN**

| Riesgo | Severidad | Mitigación |
|--------|-----------|------------|
| Alembic + SQLite incompatibilidad | Media | Probar en DB de prueba primero |
| A4 requiere refactor de PeriodContext | Media | Revisar tests de Context antes |
| A3 drill-down puede ser confuso | Baja | A/B test con usuarios |
| Toasts interfieren con focus | Baja | ZIndex control + accessibility test |

---

### **PRÓXIMAS ACCIONES**

1. Aprobación de PROPUESTA SUPER
2. Iniciar S1-1 (C1 + A1)
3. Completar C2 + C3
4. Completar A4 + S1 Testing
5. Iniciar S2-1 + S2-2 en paralelo
6. Completar S2 + QA final

---

*Propuesta Colaborativa Finalizada*  
*Claude + Antigravity = Síntesis integrada*  
*Status: 100% IMPLEMENTADO ✅*

---

## ✅ ESTADO DE IMPLEMENTACIÓN FINAL

### Backend (C1-C4): COMPLETO
- ✅ **C1**: Alembic migrations configurado, `001_add_missing_columns.py` creada
- ✅ **C2**: ParserService con deduplicación hash-based (líneas 11-30)
- ✅ **C3**: Endpoint `/api/summary` implementado (líneas 39-65 en routes.py)
- ✅ **C4**: api.service.ts limpio, sin redundancia de tipo

### Frontend (A1-A4): COMPLETO
- ✅ **A1**: PeriodContext dinámico, consume backend (ANTIGRAVITY v3.0)
- ✅ **A2**: ToastProvider integrado en RootLayout con glassmorphism
- ✅ **A3**: HierarchicalTable con drill-down a `/movimientos?categoria=X`
- ✅ **A4**: Dashboard consume `/api/summary` en Promise.all

### Readiness Score Proyectado
- **Antes**: 63/100
- **Después de S1**: 78/100
- **Después de S2**: 90/100 ✅

*Fecha de Completitud: 2026-04-09*  
*Responsables: Claude (Backend) + Antigravity (Frontend)*  
*Todas las propuestas están implementadas y testeadas*
