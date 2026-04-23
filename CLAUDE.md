# CLAUDE.md — Briefing para Claude en TORO_Prime

> Contexto de trabajo para Claude sessions en este proyecto.  
> Léelo al iniciar, actualiza si descubres nuevos patrones.

---

## Protocolo TORO LAB v2

Este proyecto **SIGUE ESTRICTAMENTE** el Protocolo TORO LAB v2:

- **Gates** (4): Validación progresiva antes de código
- **Bloques Negros** (8): Unidades de trabajo independientes
- **ADRs**: Decisiones arquitectónicas documentadas en `docs/DECISIONES.md`
- **Tracks**: A (Backend/Claude) + B (Frontend/Gemini) en paralelo

**Documentos base** (léelos en orden):
1. `prd/VISION.md` — Visión estratégica, 3 pilares, diferenciador
2. `prd/MISION.md` — Stack + BN + dependencias
3. `prd/PRD.md` — Requisitos detallados
4. `docs/ARQUITECTURA.md` — Diseño del sistema
5. `docs/DECISIONES.md` — Log de ADRs (FIJO hasta nueva ADR)
6. `docs/TECNOLOGIAS.md` — Stack detallado (FIJO)

---

## Quick Start

### Backend (puerto 9000)
```bash
cd backend
python -m venv venv && venv\Scripts\activate   # Windows
pip install -r requirements.txt
uvicorn src.main:app --reload --port 9000
```

### Frontend (puerto 7000)
```bash
cd frontend
npm install
npm run dev      # → http://localhost:7000
```

### Tests
```bash
# Backend
cd backend && pytest -v --cov=src tests/

# Frontend
cd frontend && npm run test:run
```

---

## Stack Técnico (FIJO - No cambiar sin ADR)

### Backend (Track A)
- **Runtime**: Python 3.12+
- **Framework**: FastAPI ^0.104
- **ORM**: SQLAlchemy ^2.0
- **Database**: SQLite v3 (local)
- **Validation**: Pydantic v2
- **Data Processing**: Pandas ^2.0
- **Testing**: Pytest ^7.0, >85% coverage

### Frontend (Track B)
- **Runtime**: Node.js 18+
- **Framework**: Next.js 14+ (App Router)
- **UI**: React 18 + Hooks + Context API
- **Styling**: CSS Vanilla + CSS Variables
- **HTTP**: Axios ^1.6
- **Testing**: Vitest + React Testing Library, >70% coverage

### Communication
- **Protocol**: REST/JSON
- **Base URL**: `http://localhost:9000/api`
- **Docs**: `http://localhost:9000/docs` (OpenAPI interactivo)
- **CORS**: FastAPI configura para `localhost:7000` (frontend)

---

## El Diferenciador: Motor de INSIGHTS Inteligente

**TORO_Prime NO es**: "Dashboard bonito que ordena extractos bancarios"

**TORO_Prime SÍ es**: Plataforma que entrega **INSIGHTS ESTRATÉGICOS REALES**

### Ejemplo: OSPACA (Obra Social)
- ❌ **TAUROS diría**: "OSPACA es 40% de ingresos, categoria más grande"
- ✅ **TORO_Prime dice**: "OSPACA este mes: 2x su monto normal porque pagó en el siguiente mes del anterior. No es cambio estructural, es timing."

### Clave
- **Filtra RUIDO**: anomalías de timing, calendario, desfasajes puntuales
- **Resalta REAL**: cambios en patrones, nuevas recurrencias, riesgos de liquidez

---

## Arquitectura Base: API-First Modular

```
Frontend (Next.js)
   ↓ HTTP/REST
Backend (FastAPI)
   ├── Services (Import, Categorizer, Insights, Forecast)
   ├── Models (SQLAlchemy)
   └── Database (SQLite)
```

**No hay hardcoding**. Todos los valores viven en:
- `config/` (env vars)
- Database (categorías, reglas, configuraciones)
- Schemas (validación Pydantic)

---

## Estado del Proyecto — 2026-04-15

| BN | Nombre | Track | Estado | Coverage |
|:---|:---|:---|:---|:---|
| **001** | Parser + Categorización | A | ✅ INTEGRADO | 100% |
| **002** | Motor de INSIGHTS | A | ✅ OPTIMIZADO | 95% |
| **003** | Forecasting 3 meses | A | ✅ INTEGRADO | 96% |
| **004** | API REST | A | ✅ INTEGRADO | 74% |
| **005** | Dashboard Base | B | ✅ COMPLETADO | - |
| **006** | Reportes (P&L) | B | ✅ COMPLETADO | - |
| **007** | Analytics | B | ✅ COMPLETADO | - |
| **008** | Integración Frontend | B | ✅ COMPLETADO | - |
| **009** | Estabilización Final | B | ✅ COMPLETADO | - |
| **010** | Motor de Proyecciones | A/B | 🔄 EN PROGRESO | - |

**Backend Coverage Total: 88%** ✅ | **Test Suite: 86/86 passing** ✅
**Performance: /insights 0.47s** ✅ | **Datos: 1,776 movs / 100% categorizados** ✅
**Categorías: /categorias page** ✅ (CRUD motor cascada sin tocar código)

**Dependencias**:
```
BN-001 → (BN-002 + BN-003) → BN-004
                   ↓
         BN-005 → (BN-006 + BN-007) → BN-008
```

---

## Endpoints API Disponibles (para AG/Frontend)

### POST `/api/import`
Carga archivos Excel/CSV con movimientos bancarios.
- **Input**: Archivo Excel con columnas: `fecha`, `descripcion`, `monto`
- **Output**: `{batch_id, movimientos, status}`
- **Ejemplo**: Testeado con 653 movimientos Supervielle en 1.75s ✅

### GET `/api/movements`
Obtiene movimientos con filtros opcionales.
- **Parámetros**: 
  - `period` (YYYY-MM): Filtrar por período
  - `categoria` (string): Filtrar por categoría
- **Output**: `List[MovimientoResponse]` (max 500)
- **Fields**: `id, fecha, descripcion, monto, categoria, confianza`

### GET `/api/insights`
Genera insights inteligentes (patrones, outliers, anomalías).
- **Parámetro**: `period` (YYYY-MM, obligatorio)
- **Output**: `InsightsResponse`
  - `type`: pattern | outlier | context_anomaly
  - `confidence`: 0.50-0.95
  - `data`: Estructura con detalles del insight
- **Ejemplo**: 14 insights detectados en 653 movimientos ✅

### GET `/api/forecast`
Proyecciones de 3 meses con 3 escenarios.
- **Parámetro**: `desde` (YYYY-MM, obligatorio)
- **Output**: `ForecastResponse`
  - `forecast`: Array de 3 meses
  - `scenarios`: {realistic, optimistic, pessimistic}
  - Cada scenario incluye `total_3m`
- **Testeo**: Generó proyecciones realistas ✅

### GET `/api/insights/projections`
Retorna proyecciones de gasto para el mes en curso.
- **Output**: `ProjectionsResponse`
  - `proyeccion_total`: Gasto estimado a fin de mes.
  - `gasto_actual`: Gasto real hasta hoy.
  - `pendientes_recurrentes`: Suma de patrones que aún no ocurrieron.
  - `patrones_pendientes`: Lista de objetos `{concepto, monto, dia}`.
  - `dia_del_mes`: Día actual.

### GET `/health`
Health check básico.
- **Output**: `{status: "ok"}`

### GET `/api/categories`
Estadísticas de todas las categorías (todos los períodos).
- **Output**: `List[CategoryStatsResponse]` — `{categoria, n_movimientos, gasto, ingreso, pct_movimientos, pct_gasto, n_reglas, subcategorias[]}`

### GET `/api/rules`
Lista todas las reglas cascada activas, ordenadas por peso desc.
- **Output**: `List[CascadaRuleResponse]` — `{id, patron, categoria, subcategoria, peso, veces_usada, activo}`

### POST `/api/rules`
Crea nueva regla. Devuelve 409 si el patrón ya existe.
- **Input**: `{patron, categoria, subcategoria?, peso?}`

### PATCH `/api/rules/{id}`
Edita patrón, categoría, subcategoría, peso o activo de una regla.

### DELETE `/api/rules/{id}`
Soft-delete: pone `activo=0`, no borra el registro.

### POST `/api/recategorize`
Re-corre el motor cascada sobre **todos** los movimientos de la DB.
- Llamar siempre después de crear/editar reglas.
- **Output**: `{total, recategorizados}`

### PATCH `/api/movements/{id}/categoria`
Reasigna categoría manualmente a un movimiento individual.
- **Input**: `{categoria, subcategoria?}` — fija `confianza=1.0`

### GET `/api/summary`
Resumen financiero de un período sin descargar movimientos.
- **Parámetro**: `period` (YYYY-MM)
- **Output**: `{period, ingresos_total, egresos_total, balance, transaction_count}`

### GET `/api/categories/{categoria}/subcategorias`
Stats por subcategoría para una categoría dada. Lazy — se llama on-demand al expandir en UI.
- **Parámetro**: `{categoria}` en path (URL-encoded, ej: `Impuestos%20y%20Comisiones`)
- **Output**: `List[SubcategoriaStatsResponse]` — `{subcategoria, n_movimientos, gasto, ingreso, pct_gasto, pct_movimientos}`
- Porcentajes relativos al total de la categoría padre. Ordenado por gasto desc.

---

## Notas Operacionales para Importación de Datos

### Archivos Supervielle
- Nombrados: `Movimientos_Supervielle_MM_YYYY.xlsx` (con prefijo "Movimientos_")
- Columnas: Fecha | Concepto | Detalle | Débito | Crédito | Saldo
- **REQUIERE TRANSFORMACIÓN**: Débito/Crédito → monto neto (Crédito - Débito)
- Transformar ANTES de importar con pandas

### Deduplicación
- Si archivos con nombres diferentes tienen datos idénticos → se crean duplicados en BD
- Detectar: `SELECT fecha, descripcion, monto, COUNT(*) FROM movimientos GROUP BY fecha, descripcion, monto HAVING COUNT(*) > 1`
- Eliminar con `ROW_NUMBER() OVER PARTITION BY fecha, descripcion, monto ORDER BY id`

### Workflow de Categorización
- Motor cascada en `backend/src/services/categorizer.py`
- **59 reglas activas** en tabla `cascada_rules` (desde 2026-04-15)
- Sin categorizar: **0%** (1776/1776 movimientos categorizados)
- UI de gestión en `/categorias` — crear/editar/desactivar reglas sin tocar código
- Después de editar reglas: llamar `POST /api/recategorize` para aplicar a toda la DB

#### Bug crítico resuelto — I.V.A. vs IVA
El motor normaliza descripciones antes de comparar (elimina puntos):
```python
# "I.V.A. Percep. Resp. Inscripto" → "iva percep resp inscripto"
desc_norm = re.sub(r'[^a-z0-9 ]', '', desc.lower())
```
Sin esto, `IVA` no matcheaba `I.V.A.` ni `Percepción I.V.A.`

#### Categorías activas (resumen)
- `Impuestos y Comisiones` — 67% movimientos / 5.9% del gasto (impuesto al cheque: 1 fila por movimiento)
- `Pagos y Transferencias` — 11% movimientos / 81% del gasto
- `Ingresos` — 8.7% movimientos
- `Comidas y Delivery` — 8.5%
- `Suscripciones Digitales`, `Servicios`, `Inversiones`, `Transporte`, `Entretenimiento`

⚠️ El 67% en Impuestos NO significa que el 67% del dinero sea impuestos — son registros del impuesto al cheque (1 por cada operación bancaria). En monto son el 5.9%.

### Schema Base de Datos
- Tablas en plural: `movimientos`, `import_batches`, `cascada_rules`
- Usar `sqlite3` module en Python, NO CLI (frecuentemente no disponible en entorno)

---

## Notas Técnicas para AG (Antigravity)

### Integración Frontend-Backend
- ✅ CORS configurado en FastAPI para `localhost:7000`
- ✅ Endpoints devuelven JSON con tipos Pydantic (serialización automática)
- ✅ Errores: HTTPException con status codes y detalle
- ✅ Rate limiting: No implementado

## TAUROS Development Standards

### Core Philosophy: Intelligence-Only
- **NO OPERATIONAL CODE**: Do not implement payment execution, bank APIs for transfers, or official tax billing (AFIP/SAT).
- **FOCUS**: Data visualization, predictive analytics, and executive reporting.

### Design System: Imperial Tech
- **Theme**: Pure Dark Mode (#000000 background).
- **Visuals**: Use *Financial Glassmorphism* (blur + transparency).
- **Rim Lighting**: All cards must have a 1px border with a subtle gradient (`--border-imperial`).
- **Typography**: Precision-focused. Numbers must be clear and semantically colored (Green for flow-in, Red for flow-out).

### Technical Stack
- **Backend**: FastAPI (Python 3.12). Use Service pattern for logic (ForecastService, InsightsService).
- **Frontend**: Next.js 14. Use Client Components only when strictly necessary.
- **State**: Global period context for synchronized dashboard updates.

### Categorías Dinámicas
- Las categorías se crean automáticamente al importar
- `cascada_rules` en DB aprenden con cada uso (peso y veces_usada aumentan)
- Nuevo patrón = nueva categoría posible

### Limitaciones Actuales (AG debe saber)
- Parser espera columnas exactas: `fecha, descripcion, monto`
- SQLite (local) — no hay sincronización remota
- Sin autenticación (dev mode)
- Sin paginación explícita en endpoints (hardcoded limit 500)

---

## Principios de Código

### 1. Sin Hardcoding
```python
# ✅ SÍ
MANUAL_CATEGORIES = {"Prestadores", "Otros"}  # En config
if categoria in MANUAL_CATEGORIES:
    # Handle manual entry
```

### 2. Funciones Pequeñas
- Una responsabilidad por función
- Testeable en aislamiento
- Nombre describe qué hace

### 3. Type Safety
```python
# ✅ Siempre type hints
def detect_patterns(periodo: str) -> List[PatronRecurrente]:
    ...
```

### 4. Testing First
- Backend: >85% coverage (Pytest)
- Frontend: >70% coverage (Vitest)
- Critical paths: 100% (parser, insights, forecast)

---

## Estructura de Carpetas Esperada

```
toro-prime/
├── CLAUDE.md                    # Este archivo
├── ANTIGRAVITY.md               # Briefing de Antigravity
├── .agents/                     # Perfiles de agentes
├── prd/                         # Documentación base
├── backend/                     # Track A
├── frontend/                    # Track B
├── docs/                        # Documentos ley
├── config/
├── mocks/
├── tests/
├── .gitignore
└── README.md
```

---

## 🧪 Testing Protocol — Verificación ANTES de Claims

**REGLA DE ORO**: Nunca reportes "X está done" sin evidencia ejecutable.

**Verificación Requerida por Tipo**:

| Claim | Verificación | Comando |
|-------|-------------|---------|
| "Tests pasan" | Ejecutar suite completa | `pytest -v` |
| "Schema correcto" | Inspeccionar tabla | `sqlite3 db.db ".schema movimientos"` |
| "API funciona" | Test real en endpoint | `curl http://localhost:9000/api/health` |
| "No hay duplicados" | Query COUNT + GROUP BY | `sqlite3 db.db "SELECT COUNT(*) FROM movimientos WHERE (fecha,desc,monto) IN (SELECT fecha,desc,monto FROM movimientos GROUP BY fecha,desc,monto HAVING COUNT(*)>1)"` |
| "Integración OK" | Ejecutar flujo end-to-end | Cargar Excel + GET `/api/movements` |

**Antipatrón Detectado en Auditoría**:
- ❌ Claim: "47/47 tests passing"
- ✅ Realidad tras verificar: 25/47 pass, 6 fail, 16 error
- **Lección**: Confiar en documentación sin ejecutar = invisible blocker

---

## 🗄️ Database Migration Strategy — Alembic + SQLite

**Problema Base**: `create_all()` no detecta cambios en modelos posteriores.

**Solución**: Alembic para versionado de cambios.

```bash
# 1. Instalar
pip install alembic

# 2. Inicializar en proyecto
alembic init alembic

# 3. Configurar env.py para usar SQLAlchemy target_metadata

# 4. Generar migración automática
alembic revision --autogenerate -m "add_subcategoria_to_movimientos"

# 5. Ejecutar migración
alembic upgrade head

# 6. Verificar en sqlite3
sqlite3 backend/database.db ".schema movimientos"
```

**Archivo Clave**: `alembic/versions/001_add_subcategoria.py`

```python
def upgrade():
    op.add_column('movimientos', sa.Column('subcategoria', sa.String(100), nullable=True))

def downgrade():
    op.drop_column('movimientos', 'subcategoria')
```

**CRÍTICO**: No usar `ALTER TABLE` manual sin rastreo en Alembic. La BD se desincrona con el código.

---

## 👥 Cross-team Audit Methodology

**Hallazgo en AG-001 + AUDIT_COMPARATIVA**:
- Claude (Backend) y Antigravity (UX/Frontend) detectaron ~60% de problemas c/u, con ~60% overlap.
- Juntos = 100% cobertura.

**Protocol para Auditorías Futuras**:

**Claude (Track A) debe**:
- [ ] Ejecutar `pytest -v` (no confiar en claims)
- [ ] Revisar DB schema con sqlite3
- [ ] Testear endpoints con curl/Postman
- [ ] Revisar código fuente en detalle (redundancia, types)

**Antigravity (Track B) debe**:
- [ ] Ejecutar `npm test` o `vitest` (no confiar en claims)
- [ ] Revisar componentes React para loading states
- [ ] Testear UX/accesibilidad (WCAG)
- [ ] Verificar sincronización TypeScript ↔ Pydantic

**AMBOS deben**:
- [ ] Ejecutar aplicación en local (`npm run dev` + `python main.py`)
- [ ] Hacer requests reales a endpoints
- [ ] Verificar DB schema
- [ ] NO confiar en documentación sin verificación

---

## ⚠️ Antipatterns to Avoid (Basado en Hallazgos)

### 1. Hardcoding de Periodos
❌ **Visto en**: `PeriodContext` (v2.0)
✅ **Fijo en**: ANTIGRAVITY.md v3.0 (BN-008)
```python
# ❌ NO
PERIODS = ["2025-06", "2025-07", "2025-08"]  # Hardcoded

# ✅ SÍ
# Consultar backend: GET /api/available-periods
```

### 2. Lógica de Agregación en Cliente
❌ **Visto en**: `getSummary()` en frontend
✅ **Solución**: C3 Proposal (`/api/summary` endpoint)
```typescript
// ❌ NO - Descargar 500 movimientos para sumarlos
const summary = movements.reduce((acc, m) => {...})

// ✅ SÍ - 1 query en backend
const summary = await fetch('/api/summary?period=2025-06')
```

### 3. Recalcular Datos que el Backend Envía
❌ **Visto en**: `api.service.ts` línea 24
```typescript
// ❌ NO
tipo: m.monto > 0 ? 'ingreso' : 'egreso'  // Backend ya envía tipo

// ✅ SÍ
// Confía en backend.tipo
```

### 4. Sin Validación de Unicidad en Importación
❌ **Visto en**: `ParserService` (original)
✅ **Solución**: C2 Proposal (hash-based deduplication)
```python
# ❌ NO - Insertar cada fila sin validar
for row in df.iterrows():
    db.add(Movimiento(...))

# ✅ SÍ - Hash check
if row_hash not in existing_hashes:
    db.add(Movimiento(...))
```

---

## 🪟 Bash Gotchas (Windows + PowerShell)

**Aprendizajes de trabajar con bash en esta máquina**:

### 1. PowerShell `-Filter` no funciona con múltiples condiciones
```bash
# ❌ NO (falla)
ls -Filter "*.md" -Filter "AUDIT*"

# ✅ SÍ
ls -Include "AUDIT*.md" | ...
```

### 2. Comillas en rutas largas
```bash
# ❌ NO (falla con rutas UNC)
cp "C:\Users\mauri\...\file.txt" dest

# ✅ SÍ (usar PowerShell Copy-Item)
Copy-Item -Path "C:\Users\mauri\OneDrive\..." -Destination dest
```

### 3. Comandos nativos de bash no siempre disponibles
```bash
# ❌ NO (sqlite3 CLI a veces falta)
sqlite3 db.db "SELECT ..."

# ✅ SÍ (usar Python)
python -c "import sqlite3; ..."
```

### 4. Rutas UNC en OneDrive
```bash
# ❌ Problemas con rutas relativas
cd backend && npm run dev

# ✅ Usar rutas absolutas
cd C:\Users\mauri\OneDrive\... && npm run dev
```

---

## 📥 Data Import Workflow Pattern

**Para archivos Excel/CSV nuevos**:

1. **Validación de Formato**
   ```python
   required_columns = ['fecha', 'descripcion', 'monto']
   if not all(col in df.columns for col in required_columns):
       raise ValueError(f"Faltan columnas: {required_columns}")
   ```

2. **Transformación (si es Supervielle)**
   ```python
   # Supervielle tiene Débito/Crédito, transformar a monto
   df['monto'] = df['Crédito'] - df['Débito']
   ```

3. **Deduplicación**
   ```python
   existing_hashes = set()
   for mov in db.query(Movimiento).all():
       hash_val = hashlib.md5(f"{mov.fecha}|{mov.descripcion}|{mov.monto}".encode()).hexdigest()
       existing_hashes.add(hash_val)
   
   # Skip if exists
   if row_hash in existing_hashes:
       continue
   ```

4. **Inserción + Categorización**
   ```python
   batch = ImportBatch(nombre_archivo=filename)
   db.add(batch)
   db.flush()
   
   for row in df.iterrows():
       mov = Movimiento(..., categoria="Sin categorizar", confianza=0.0)
       db.add(mov)
   
   db.commit()
   CategorizerService.categorize_batch(batch.id)
   ```

5. **Auditoría**
   ```sql
   SELECT COUNT(*) as total,
          SUM(CASE WHEN confianza > 0.5 THEN 1 ELSE 0 END) as categorized,
          ROUND(100.0 * SUM(CASE WHEN confianza > 0.5 THEN 1 ELSE 0 END) / COUNT(*), 1) as pct
   FROM movimientos
   WHERE batch_id = ?
   ```

---

---

## 🎯 Próximos Pasos (al 2026-04-15)

| Prioridad | Tarea | Contexto |
|---|---|---|
| 1 | **BN-008 Finalización** | Implementar estados de carga globales (`LoadingImperial`) en transiciones de página y refinar manejo de errores en `apiService`. |
| 2 | **Auditoría de Tipos** | Sincronizar interfaces TypeScript con modelos Pydantic actualizados (especialmente en nuevos campos de Analytics). |
| 3 | **Paginación Backend** | Evaluar migración de paginación client-side a server-side si el volumen supera los 2000 registros. |
| 4 | **Refactorización** | Extraer componente `Pagination` de `/movimientos` para uso global. |

---

*Versión: 3.4*  
*Última actualización: 2026-04-23*  
*Responsables: Claude (Backend) + Antigravity (Frontend)*  
*Status: BN-001-009 ✅ COMPLETO | BN-010 🔄 EN PROGRESO*  
*Datos Reales: 1,776 movimientos Supervielle | Motor de Proyecciones: Activo*
