# DECISIONES.md — Log de Decisiones Arquitectónicas (ADR)

> Architecture Decision Records (ADR) de TORO_Prime.  
> Cada decisión importante se documenta aquí.  
> Las decisiones NO se borran, se marcan como Superadas si cambian.  
> Responsable: Claude (CTO)

---

## Estados de Decisión

- 🟢 **Activa** — Decisión vigente, en efecto
- 🟡 **En revisión** — Se está cuestionando
- ⚫ **Superada** — Reemplazada por otra (se indica cuál)
- 🔴 **Rechazada** — Evaluada y descartada

---

## Formato de ADR

Copiar este template para cada nueva decisión:

```markdown
### ADR-[número] — [Título corto]

**Fecha:** YYYY-MM-DD  
**Estado:** 🟢 Activa  
**Propuesta por:** Claude / Tori  
**Aprobada por:** Tori  

**Contexto:**  
¿Qué situación generó esta decisión?

**Decisión:**  
¿Qué se decidió exactamente?

**Alternativas evaluadas:**

| Alternativa | Por qué se descartó |
|---|---|
| Opción A | ... |
| Opción B | ... |

**Consecuencias:**  
¿Qué implica? ¿Ganamos/resignamos qué?

**BN relacionados:** BN-001, BN-002 (o Ninguno)

---
```

---

## Registro de Decisiones

---

### ADR-001 — Inicio del Proyecto TORO_Prime

**Fecha:** 2026-04-08  
**Estado:** 🟢 Activa  
**Propuesta por:** Claude  
**Aprobada por:** Tori  

**Contexto:**

TAUROS v1 (MVP de aprendizaje) dejó lecciones:
- ✅ Valor de tener extractos ordenados
- ❌ Pero no entrega insights estratégicos
- ❌ Categorización imprecisa en casos edge
- ❌ Código con hardcoding, difícil de mantener

Se decide **reconstruir desde cero** con arquitectura profesional, bajo el **Protocolo TORO LAB v2**.

**Decisión:**

Arrancar TORO_Prime bajo el Protocolo TORO LAB v2:
- Visión, Misión, PRD completados
- Stack técnico FIJO: FastAPI + SQLite + Next.js
- Arquitectura: API-First Modular
- 8 Bloques Negros (4 Backend, 4 Frontend)
- Desarrollo paralelo: Track A (Claude) + Track B (Gemini)
- Documentación de Ley creada antes de código

**Alternativas evaluadas:**

| Alternativa | Por qué se descartó |
|---|---|
| Refactorizar TAUROS | Demasiado técnico deuda, más rápido empezar from scratch |
| Monolito sin modularidad | Less flexible, harder to test, no reutilizable |
| Full cloud deployment | Out of scope, usuario quiere local only |

**Consecuencias:**

- Iniciamos con documentación robusta (inversión inicial en docs)
- Código más limpio, sin hardcoding
- Reutilizable si other entities lo necesitan
- Desarrollo más lento pero más confiable

**BN relacionados:** Todos (ADR de inicio)

---

### ADR-002 — API-First Architecture vs Monolito

**Fecha:** 2026-04-08  
**Estado:** 🟢 Activa  
**Propuesta por:** Claude  
**Aprobada por:** Tori  

**Contexto:**

Necesitamos estructura que soporte:
- Reutilización de lógica (motor de insights, forecasting)
- Futuras integraciones con otros sistemas
- Testing independiente de componentes
- Pero también: desarrollo rápido sin over-engineering

**Decisión:**

**API-First Modular Architecture**:
- Backend: FastAPI con servicios desacoplados
- Frontend: Next.js consumiendo API REST
- Interfaces claras (contratos OpenAPI)
- Servicios independientes (Import, Categorizer, Insights, Forecast)
- Reutilizable si otro sistema necesita insights financieros

**Alternativas evaluadas:**

| Alternativa | Por qué se descartó |
|---|---|
| Monolito FastAPI (todo en main.py) | Difícil de testear, no reutilizable, acoplado |
| GraphQL | Overkill para single-user, REST es suficiente |
| Microservicios con Docker | No necesario para v1, local only |

**Consecuencias:**

- (+) Código modular, testeable, reutilizable
- (+) API documentada automáticamente (OpenAPI)
- (+) Escalable si hay integraciones futuras
- (-) Más boilerplate inicial (modelos, schemas, endpoints)
- (-) Necesita disciplina para NO acoplar

**BN relacionados:** BN-004 (API contracts)

---

### ADR-003 — FastAPI + SQLAlchemy vs Django + PostgreSQL

**Fecha:** 2026-04-08  
**Estado:** 🟢 Activa  
**Propuesta por:** Claude  
**Aprobada por:** Tori  

**Contexto:**

Backend necesita:
- Parsing/procesamiento de datos (pandas-friendly)
- ORM con validación de tipos
- OpenAPI documentation
- Performance acceptable para single-user
- Simplicidad (no over-engineering)

**Decisión:**

**FastAPI + SQLAlchemy + SQLite**:
- FastAPI: async, OpenAPI nativo, rápido de desarrollar
- SQLAlchemy: ORM maduro, type-safe con Pydantic
- SQLite: Simple, local, zero-config
- Python 3.12: Data science ready, async/await native

**Alternativas evaluadas:**

| Alternativa | Por qué se descartó |
|---|---|
| Django + PostgreSQL | Pesado, Django completo no necesario, Postgres overkill |
| Node.js + Express | No, Python es mejor para data processing |
| Go + SQLite | Overkill, usuario prefiere Python si es posible |

**Consecuencias:**

- (+) Python unificado (fácil para mantenimiento)
- (+) Pandas integrado (procesamiento de Excel/CSV)
- (+) SQLAlchemy con validación de tipos (fewer bugs)
- (+) SQLite local (no requiere servidor externo)
- (-) Single-process (no concurrency de writing a DB)
- (-) SQLite tiene límites en escala (pero OK para 100K rows)

**BN relacionados:** BN-001, BN-002, BN-003

---

### ADR-004 — Next.js + CSS Vanilla vs React + Tailwind

**Fecha:** 2026-04-08  
**Estado:** 🟢 Activa  
**Propuesta por:** Claude  
**Aprobada por:** Tori  

**Contexto:**

Frontend necesita:
- Modern UX (dark mode premium, glassmorphism)
- Componentes reutilizables
- Control total sobre diseño (para UI transmutable)
- Performance
- DX buena (hot reload, debugging)

**Decisión:**

**Next.js 14+ + CSS Vanilla + React Hooks + Context**:
- Next.js: App Router, optimizaciones built-in, SSR/CSR flexible
- CSS Vanilla: Control total, no abstracción, performance
- React Hooks: Suficiente para single-user (no Redux)
- Context API: State management ligero

**Alternativas evaluadas:**

| Alternativa | Por qué se descartó |
|---|---|
| Tailwind CSS | Less control, abstracción que puede limitar diseño custom |
| SvelteKit | Overkill, ecosystem menos maduro que Next.js |
| Vue.js | User prefiere React |
| Redux | Overkill para single-user, Context suficiente |

**Consecuencias:**

- (+) Control total sobre CSS (transmutabilidad)
- (+) Performance (CSS vanilla es minimal)
- (+) Compatibilidad con kit de marca TORO
- (+) Simple state management (Context + hooks)
- (-) Más CSS to write (no utility classes como Tailwind)
- (-) Riesgo: CSS puede crecer, necesita organización

**BN relacionados:** BN-005, BN-006, BN-007, BN-008

---

### ADR-005 — Single-User, Local-Only vs Multi-Tenant Cloud

**Fecha:** 2026-04-08  
**Estado:** 🟢 Activa  
**Propuesta por:** Claude  
**Aprobada por:** Tori  

**Contexto:**

Usuario es single-user (CFO de TORO). Futuro podría prestar a otra empresa (copia, no compartida).

Necesitamos decidir:
- Authentication / Authorization?
- Cloud deployment?
- Multi-user support en v1?

**Decisión:**

**Single-User, Local-Only, No Auth en v1**:
- No authentication (usuario es único)
- No authorization (N/A)
- Deploy local/on-prem (no cloud)
- SQLite local (datos en máquina del usuario)
- Si otra empresa necesita: copia completa del repo + DB

**Alternativas evaluadas:**

| Alternativa | Por qué se descartó |
|---|---|
| Multi-tenant desde v1 | Complejidad innecesaria, usuario es single-user |
| Cloud (AWS/GCP) | User prefiere local, sin dependencias externas |
| Auth (JWT/OAuth2) | Single-user, no necesario |

**Consecuencias:**

- (+) Arquitectura más simple
- (+) Data privacy (todo local)
- (+) Zero setup (solo descargar + run)
- (+) Zero operational overhead
- (-) Si hay 2+ usuarios simultáneos: no funciona
- (-) Necesita git + manual para copiar a otra empresa (future)

**BN relacionados:** Todos (decisión de scope)

---

### ADR-006 — Motor de Insights: Agnóstico de Período

**Fecha:** 2026-04-08  
**Estado:** 🟢 Activa  
**Propuesta por:** Claude  
**Aprobada por:** Tori  

**Contexto:**

TAUROS era rígido: solo analizaba períodos completos.

TORO_Prime debe ser flexible: si usuario sube 15 días, debe:
- Analizar esos 15 días (charts, flujos, categorización)
- Pero análisis estratégico (forecasting, patrones) requiere 3+ meses

**Decisión:**

**Análisis agnóstico de período**:
- **Análisis ágil** (movimientos, categorización): funciona con N días
- **Análisis estratégico** (insights, forecast, patrones): requiere 3+ meses histórico
- Sistema detecta automáticamente: "Tienes 2 meses, forecast confianza baja"

**Alternativas evaluadas:**

| Alternativa | Por qué se descartó |
|---|---|
| Require monthly data | Rigid, user might need to analyze 15 days |
| Full analysis on any period | Inaccurate insights con poco histórico |

**Consecuencias:**

- (+) Flexible, user-friendly
- (+) Charts funcionan siempre
- (+) Insights son honestos (avisan si hay poca data)
- (-) Más lógica en backend (detectar período, ajustar análisis)

**BN relacionados:** BN-002, BN-003

---

### ADR-007 — Categorización: Motor Cascada Mejorado

**Fecha:** 2026-04-08  
**Estado:** 🟢 Activa  
**Propuesta por:** Claude  
**Aprobada por:** Tori  

**Contexto:**

TAUROS: categorización imprecisa, muchos "Otros".

TORO_Prime necesita: >99% confianza en casos normales, >95% en casos difíciles.

**Decisión:**

**Motor Cascada Mejorado v2.2**:
- Rules basadas en patrones (keywords, regex)
- Scoring por match quality
- Metadata extraction (CUIT, nombres, referencias)
- User-locked classifications (manual override bloquea actualización automática)
- Confidence score por movimiento

**Alternativas evaluadas:**

| Alternativa | Por qué se descartó |
|---|---|
| Simple keyword matching | Impreciso, muchos false positives |
| Full ML/NLP | Overkill, cascada rules es suficiente |
| User trains model | Data science overhead, user no es dev |

**Consecuencias:**

- (+) >99% confianza en casos normales
- (+) User puede bloquear clasificación manual
- (+) Metadata enriches el dato
- (-) Necesita reglas de negocio curadas
- (-) Si reglas son malas, resultados malos

**BN relacionados:** BN-001

---

### ADR-008 — Testing: >80% Coverage Mínimo

**Fecha:** 2026-04-08  
**Estado:** 🟢 Activa  
**Propuesta por:** Claude  
**Aprobada por:** Tori  

**Contexto:**

TAUROS: <50% testing, bugs en producción.

TORO_Prime: código crítico (insights, categorización) que debe ser confiable.

**Decisión:**

**Testing requirement**:
- Backend: >85% coverage (pytest)
- Frontend: >70% coverage (Vitest + RTL)
- Critical paths: 100% (parser, insights, forecast)
- Integration tests: API ↔ DB

**Alternativas evaluadas:**

| Alternativa | Por qué se descartó |
|---|---|
| No testing | Risky, bugs en insights son expensive |
| 100% coverage | Overkill, >85% is sufficient |

**Consecuencias:**

- (+) Confianza en código
- (+) Refactoring sin miedo
- (-) Escribir tests toma tiempo
- (-) Mantener tests cuando cambios

**BN relacionados:** Todos

---

### ADR-009 — Documentación: Leyes de Código

**Fecha:** 2026-04-08  
**Estado:** 🟢 Activa  
**Propuesta por:** Claude  
**Aprobada por:** Tori  

**Contexto:**

TAUROS: documentación minimal, código era "self-documenting" (no realmente).

TORO_Prime: arquitectura compleja (insights, forecasting, módulos), necesita docs.

**Decisión:**

**Documentación de Ley (Protocolo TORO LAB v2)**:
- CLAUDE.md: Briefing para agentes
- docs/ARQUITECTURA.md: Estructura del sistema
- docs/DECISIONES.md: Este archivo (ADRs)
- docs/CONTRATOS_API.md: Contracts de endpoints
- docs/TECNOLOGIAS.md: Stack detallado
- Code comments: Explicar WHY, no WHAT
- Docstrings: En funciones complejas

**Alternativas evaluadas:**

| Alternativa | Por qué se descartó |
|---|---|
| No documentation | Unmaintainable, knowledge loss |
| Over-documentation | Waste of time, harder to keep in sync |

**Consecuencias:**

- (+) Codebase es navigable
- (+) Decisions are captured
- (+) Onboarding es más rápido (futuro)
- (-) Investment inicial en docs
- (-) Necesita mantenimiento cuando cambios

**BN relacionados:** Todos

---

### ADR-010 — Protocolo TORO LAB v2: Gates + Bloques Negros

**Fecha:** 2026-04-08  
**Estado:** 🟢 Activa  
**Propuesta por:** Claude  
**Aprobada por:** Tori  

**Contexto:**

TAUROS: sin estructura, "código while true" sin gates o validaciones.

TORO_Prime: respeta el Protocolo TORO LAB v2 con Gates + Bloques Negros.

**Decisión:**

**Protocolo TORO LAB v2 Completo**:
- Gate 1: Visión aprobada
- Gate 2: Misión + stack confirmados
- Gate 3: PRD + contratos validados
- Gate 4: Leyes de código leídas
- Bloques Negros: 8 unidades de trabajo (4 Backend, 4 Frontend)
- Track A (Claude): Backend BN-001 a BN-004
- Track B (Gemini): Frontend BN-005 a BN-008
- Desarrollo paralelo, integración en BN-008

**Alternativas evaluadas:**

| Alternativa | Por qué se descartó |
|---|---|
| Ad-hoc development | Chaotic, no clear structure |
| Waterfall (secuencial) | Slower, waiting on dependencies |

**Consecuencias:**

- (+) Clear milestones (Gates)
- (+) Parallel work (Track A + B)
- (+) Documented decisions
- (-) More overhead than agile
- (-) Requires discipline to follow protocol

**BN relacionados:** Todos

---

## Próximas Decisiones (TBD)

### ADR-011 — UI Component Library: shadcn/ui vs Custom

**Status**: 🔴 Pendiente decisión  
**Depende de**: Kit de marca TORO entregado

### ADR-012 — Moneda / Localización

**Status**: 🔴 Pendiente decisión  
**Pregunta**: ¿USD, ARS, EUR? ¿Soporte multi-moneda?

### ADR-013 — Exportación de Reportes: PDF vs Excel vs Ambos

**Status**: 🔴 Pendiente decisión  
**Pregunta**: ¿Qué formatos necesita para compartir reportes?

---

## Registro de Cambios

| Versión | Fecha | Cambios |
|---|---|---|
| 1.0 | 2026-04-08 | ADR-001 al ADR-010 creados (inicio del proyecto) |

---

*Última actualización: 2026-04-08*  
*Responsable: Claude (CTO)*  
*Si el código y este documento no coinciden, el código está mal o este está desactualizado.*
