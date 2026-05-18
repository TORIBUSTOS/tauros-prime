# TAUROS v2: Financial Intelligence Hub

TAUROS transforma extractos bancarios de SANARTE/TORO en una base financiera categorizada, auditable y preparada para generar insights reales. Es un sistema de **solo inteligencia**: no ejecuta pagos, no opera bancos y no realiza gestiones fiscales externas.

## Estado Actual

- **Sprint 7**: cerrado y validado.
- **Datos cargados**: mayo 2025 a abril 2026.
- **Base actual**: 6.172 movimientos.
- **Duplicados exactos**: 0.
- **Sin categoria**: 1 movimiento aceptado manualmente (`DOCUMENTO 27963963144`, marzo 2026).
- **Importacion Supervielle**: soporta formato normalizado (`fecha`, `descripcion`, `monto`) y extracto crudo (`Fecha`, `Concepto`, `Detalle`, `Debito`, `Credito`, `Saldo`).
- **Insights Engine**: base configurable creada en `config/insight_rules.json`.

## Modulos Core

- **Cascada Engine**: categorizacion por reglas editables en DB.
- **Insights Engine**: candidatos trazables con reglas externas, estados de revision y bandeja de sin categoria.
- **Forecast**: proyeccion a 3 meses sobre datos historicos.
- **Reportes P&L**: lectura jerarquica por tipo, categoria y subcategoria.
- **Auditoria**: historial de recategorizaciones y aprendizaje de reglas.
- **Imperial UI**: dashboard Next.js con navegacion responsive y layout visual TAUROS.

## Estructura

- `backend/`: API FastAPI, servicios, modelos SQLAlchemy, migraciones Alembic y tests Pytest.
- `frontend/`: Next.js App Router, componentes, servicios API y tests Vitest.
- `config/`: configuracion editable, incluyendo reglas de insights.
- `docs/`: arquitectura, contexto, auditorias, sprint notes y guias operativas.
- `prd/`: documentos base de producto/protocolo.

## Ejecucion Local

Backend:

```powershell
cd backend
.\venv\Scripts\python.exe -m uvicorn src.main:app --host 0.0.0.0 --port 9000
```

Frontend:

```powershell
cd frontend
npm run dev
```

URLs:

- Frontend: `http://localhost:7000`
- Backend API: `http://localhost:9000/api`
- Health: `http://localhost:9000/health`
- OpenAPI: `http://localhost:9000/docs`

## Verificacion

Backend:

```powershell
cd backend
.\venv\Scripts\python.exe -m pytest -q
```

Frontend:

```powershell
cd frontend
npm test -- --run
npm run build
```

## Documentacion Clave

- Arquitectura: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- Contexto actual: [docs/PROJECT_CONTEXT.md](docs/PROJECT_CONTEXT.md)
- Insights Engine: [docs/INSIGHTS_ENGINE.md](docs/INSIGHTS_ENGINE.md)
- Sprint 5: [docs/SPRINT_5_CONSOLIDACION.md](docs/SPRINT_5_CONSOLIDACION.md)
- Sprint 6: [docs/SPRINT_6_CONSOLIDACION.md](docs/SPRINT_6_CONSOLIDACION.md)
- Sprint 7: [docs/SPRINT_7_CONSOLIDACION.md](docs/SPRINT_7_CONSOLIDACION.md)
- Roadmap: [docs/ROADMAP.md](docs/ROADMAP.md)
- Auditoria visual Sprint 5: [docs/ui-audit/taurus-sprint-5/INDEX.md](docs/ui-audit/taurus-sprint-5/INDEX.md)
- Referencia tecnica: [docs/TECHNICAL_REFERENCE.md](docs/TECHNICAL_REFERENCE.md)

## Roadmap Inmediato

1. **SP8**: Canon TAUROS de Insights sobre baseline anual.
2. **SP9**: UI de revision/aprobacion de candidatos de insights.
3. **SP10**: forecast anualizado y proyecciones reales.
4. **SP11**: cierre v1.1 ejecutivo.

---

TORO LAB v2 Protocol - Financial Intelligence.
