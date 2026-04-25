---
name: system-blueprint
description: |
  Mapea la estructura técnica y funcional pura de un proyecto software sin evaluación ni diagnóstico.
  
  Usa esta skill cuando necesites:
  - Documentar qué es un sistema y cómo está construido
  - Capturar identidad, funcionalidad, dominio y arquitectura de forma clara
  - Crear un blueprint factual del proyecto para referencia rápida
  - Entender el modelo de datos y flujos sin análisis de calidad
  - Generar mapa técnico para onboarding o comunicación
  
  Triggers: "mapea la estructura de", "blueprint de este proyecto", "qué módulos tiene", "arquitectura de", "mapa técnico", "estructura de este sistema", "datos y flujos de"
  
  Funciona con código fuente, README, estructura de carpetas, documentación, diagrama — proyectos completos o parciales.
compatibility: ~
---

## Cuándo usar esta skill

Usa **system-blueprint** cuando:

1. **Necesitas documentación clara y factual** sin opiniones sobre calidad o mejora.
2. **Haces onboarding** — alguien nuevo necesita entender "qué existe y cómo funciona".
3. **Comunicas estructura** a stakeholders que no necesitan diagnóstico, solo entender el sistema.
4. **Eres auditor o documentador** — capturando realidad actual sin evaluación.
5. **Creas diagramas o documentación técnica** basados en mapeo factual.
6. **Necesitas blueprint rápido** sin análisis profundo de deuda técnica o rebuild.

## Cuándo NO usar esta skill

- **Si necesitas diagnóstico** (calidad, deuda técnica, riesgos) → usa `project-intelligence-mapper`.
- **Si necesitas recomendaciones de mejora** → usa `project-intelligence-mapper`.
- **Si solo necesitas leer código** → usa herramientas de código directo.
- **Si el proyecto es trivial** (< 200 líneas) → probablemente no agrega valor.

---

## Inputs que puede analizar

✓ Código fuente (cualquier lenguaje)  
✓ README.md, documentación técnica  
✓ Estructura de carpetas  
✓ Diagramas de arquitectura  
✓ Configuración (package.json, docker-compose.yml, etc)  
✓ Git history (commits, changelog)  
✓ Descripciones textuales del usuario  
✓ Proyectos completos o parciales  
✓ Sistemas sin documentación  

---

## Estructura de Output

SIEMPRE produce un "System Blueprint" con EXACTAMENTE esta estructura:

```
# System Blueprint: [Nombre del Sistema]

## 1. Identidad
- **Nombre**: 
- **Tipo de Sistema**: 
- **Propósito Principal**: 
- **Usuarios/Stakeholders**: 
- **Resultado Principal que Entrega**: 

## 2. Mapa Funcional
- **Funciones Principales**: 
  - [Función 1]: [breve descripción]
  - [Función 2]: [breve descripción]
  
- **Entradas del Sistema**: 
  - [Entrada 1]: [formato/fuente]
  - [Entrada 2]: [formato/fuente]
  
- **Procesos Clave**: 
  - [Proceso 1]: [entrada] → [salida]
  - [Proceso 2]: [entrada] → [salida]
  
- **Salidas del Sistema**: 
  - [Salida 1]: [formato/destino]
  - [Salida 2]: [formato/destino]

## 3. Dominio y Lógica
- **Entidades Principales**: 
  - [Entidad 1]: [atributos clave]
  - [Entidad 2]: [atributos clave]
  
- **Reglas de Negocio Críticas**: 
  - [Regla 1]
  - [Regla 2]
  
- **Flujos Principales**: 
  - [Flujo 1]: [paso 1] → [paso 2] → ... → [resultado]
  - [Flujo 2]: [paso 1] → [paso 2] → ... → [resultado]
  
- **Decisiones de Diseño**: 
  - [Decisión 1]: [razón o evidencia]
  - [Decisión 2]: [razón o evidencia]

## 4. Arquitectura Técnica
- **Stack Principal**: 
  - Frontend: [tecnologías]
  - Backend: [tecnologías]
  - Base de Datos: [tipo y estructura]
  - Infraestructura: [cloud/on-prem, herramientas]
  
- **Componentes/Módulos Principales**: 
  - [Módulo 1]: [responsabilidad]
  - [Módulo 2]: [responsabilidad]
  - [Módulo 3]: [responsabilidad]
  
- **Relaciones entre Componentes**: 
  - [Módulo A] → [Módulo B]: [tipo de relación]
  - [Módulo B] → [Módulo C]: [tipo de relación]
  
- **Patrones Usados**: 
  - [Patrón 1]: [dónde se aplica]
  - [Patrón 2]: [dónde se aplica]
  
- **Integraciones Externas**: 
  - [Sistema Externo 1]: [qué se integra]
  - [Sistema Externo 2]: [qué se integra]
  
- **Estructura de Carpetas**: 
  ```
  proyecto/
  ├── [carpeta principal]/
  │   ├── [componente 1]
  │   └── [componente 2]
  └── [config/deployment]
  ```
  
- **Dependencias Principales**: 
  - [Librería/Framework 1]: [versión, propósito]
  - [Librería/Framework 2]: [versión, propósito]

- **Base de Datos - Esquema Clave**: 
  - [Tabla 1]: [columnas principales]
  - [Tabla 2]: [columnas principales]
  - [Relaciones]: [PK-FK]
```

---

## Principios de Mapeo

1. **Ser Factual**
   - Solo documenta lo que ves, no lo que crees que debería existir
   - Si hay incertidumbre, marca como `[Requiere verificación: ...]`

2. **Ser Conciso**
   - Detalles, pero no exhaustivo
   - Enfócate en lo "que existe", no en "cómo debería ser"

3. **Separar Capas Claramente**
   - Identidad: qué ES el sistema
   - Funcional: qué HACE
   - Dominio: cómo PIENSA el negocio
   - Arquitectura: cómo ESTÁ CONSTRUIDO

4. **No Evalúes**
   - No juzgues calidad, deuda técnica, o decisiones
   - Documenta, sin opinión
   - Si la arquitectura parece extraña, documéntala igual

5. **Usa Diagramas Mentales**
   - Visualiza flujos, relaciones, arquitectura
   - Ayuda a capturar la "topología" del sistema

6. **Marca Vacíos Explícitamente**
   - Si no encuentras info sobre algo, di `[No documentado]` o `[Requiere investigación]`
   - No inventes componentes

---

## Heurísticas de Mapeo

| Situación | Qué Documentas |
|-----------|----------------|
| Código sin comentarios | Estructura visible + naming = lógica inferida |
| Multiple carpetas con mismo propósito | Todas se documentan, relación se clarifica |
| Módulos nombrados pero sin implementación | Se documenta como "placeholder" o "diseño" |
| Integraciones parciales | Se documenta el estado actual, no el "plan" |
| Cambios recientes en git | Refleja estado actual, menciona si hay refactors en progreso |
| Código "mágico" sin contexto | Documenta lo que hace, marca como `[Lógica implícita]` |
| Stack fragmentado | Documenta cada pieza, sin juzgar |

---

## Ejemplos de Output

```
# System Blueprint: TAUROS

## 1. Identidad
- **Nombre**: TAUROS
- **Tipo de Sistema**: Financial Consolidation & Reporting Platform
- **Propósito Principal**: Consolidar datos financieros dispersos en múltiples sistemas en una vista unificada
- **Usuarios/Stakeholders**: CFO, Controllers, Audit team, Finance analysts
- **Resultado Principal que Entrega**: Consolidated P&L, Balance Sheet, Cash Flow reports + audit trail

## 2. Mapa Funcional
- **Funciones Principales**: 
  - Data ingestion from multiple sources
  - Data validation and transformation
  - Financial consolidation
  - Report generation (PDF, XLS, Dashboard)
  - Audit logging
  
- **Entradas del Sistema**: 
  - CSV uploads: monthly financial exports
  - XLS files: SAP exports, NetSuite feeds
  - API integrations: Xero, QuickBooks
  - Manual entries: adjustments, corrections
  
- **Procesos Clave**: 
  - Ingestion → Validation → Mapping → Consolidation → Reporting
  - Source dedupe → GL reconciliation → Period close
  
- **Salidas del Sistema**: 
  - P&L reports (PDF, XLS, interactive dashboard)
  - Balance sheet (multi-period)
  - Cash flow statements
  - Variance analysis
  - Audit logs (CSV export)

## 3. Dominio y Lógica
- **Entidades Principales**: 
  - Company (with hierarchy/holding structure)
  - Cost Center (inherits from parent company)
  - GL Account (standard chart of accounts)
  - Transaction (journal entry, validated)
  - Consolidation Period (monthly/quarterly/annual)
  
- **Reglas de Negocio Críticas**: 
  - Only validated transactions can be consolidated
  - One transaction cannot appear in two consolidations (deduplication required)
  - Cost centers inherit rules from parent company
  - Consolidation runs are immutable once completed
  - Manual entries require approval before consolidation
  
- **Flujos Principales**: 
  - Monthly Close: Data load → Validation → GL Reconciliation → Period Lock → Consolidation → Report generation
  - Variance Investigation: Report anomaly → Query transactions → Manual adjustment → Re-consolidate
  
- **Decisiones de Diseño**: 
  - Separation of "raw incoming data" vs "validated data" (prevents bad data from propagating)
  - Immutable consolidation records (audit trail + reproducibility)
  - Multi-level consolidation (entity → division → holding)

## 4. Arquitectura Técnica
- **Stack Principal**: 
  - Frontend: React + Highcharts, Bootstrap for styling
  - Backend: Django 4.x + Django REST Framework
  - Async jobs: Celery + Redis
  - Database: PostgreSQL 13+ (primary), Redis (cache/queue)
  - Infrastructure: AWS (EC2, RDS, S3), Docker containers
  
- **Componentes/Módulos Principales**: 
  - `ingester`: Receives data from sources (CSV, XLS, API), initial validation
  - `transformer`: Maps source schemas to internal GL format
  - `consolidator`: Core logic for consolidation (dedup, aggregation)
  - `reporter`: Generates reports (PDF, XLS, dashboard queries)
  - `auditor`: Logs all changes, provides audit trail
  
- **Relaciones entre Componentes**: 
  - ingester → raw_data_store
  - transformer → ingester outputs, validates against GL schema
  - consolidator → transformer outputs
  - reporter → consolidated data
  - auditor → all changes across all modules
  
- **Patrones Usados**: 
  - Factory pattern: Source adapters (SAP adapter, Xero adapter, etc all inherit from BaseSource)
  - Observer pattern: Consolidation changes trigger audit events
  - Pipeline pattern: Data flows through ingestion → transformation → consolidation
  
- **Integraciones Externas**: 
  - SAP: Real-time GL export via API
  - NetSuite: Monthly journal extract
  - Xero: API for bank feed reconciliation
  - Email: Consolidation completion notifications
  
- **Estructura de Carpetas**: 
  ```
  tauros/
  ├── apps/
  │   ├── ingester/
  │   │   ├── models.py (RawData, DataSource)
  │   │   ├── views.py (upload endpoints)
  │   │   └── tasks.py (async ingestion)
  │   ├── transformer/
  │   │   ├── mappers.py (schema mapping logic)
  │   │   └── validators.py (GL validation)
  │   ├── consolidator/
  │   │   ├── engine.py (core consolidation)
  │   │   └── dedup.py (transaction deduplication)
  │   ├── reporter/
  │   │   ├── queries.py (report SQL)
  │   │   └── exports.py (PDF, XLS generation)
  │   └── auditor/
  │       └── models.py (audit log)
  ├── models/ (shared domain models)
  ├── utils/ (helpers, decorators)
  ├── tests/
  └── config/ (Django settings, Docker)
  ```
  
- **Dependencias Principales**: 
  - Django 4.2: Web framework
  - djangorestframework: API endpoints
  - Celery: Async task processing
  - pandas: Data transformation
  - sqlalchemy: Advanced SQL queries
  - reportlab: PDF generation
  - openpyxl: XLS generation
  - psycopg2: PostgreSQL driver
  - redis: Caching and task queue
  
- **Base de Datos - Esquema Clave**: 
  - `companies` (id, name, parent_id, holding_id)
  - `gl_accounts` (id, code, description, account_type)
  - `transactions` (id, company_id, gl_account_id, amount, source_id)
  - `consolidations` (id, period, status, created_at)
  - `audit_logs` (id, action, entity_type, entity_id, user_id, timestamp)
```

---

## Ejemplos de Prompts Que Resuelve

```
1. "Hazme un blueprint de TAUROS"
2. "Mapea la estructura técnica de este proyecto"
3. "Qué módulos tiene y cómo se relacionan?"
4. "Documenta la arquitectura de este sistema"
5. "Blueprint factual de este código sin evaluación"
6. "Flujos principales y entidades de este dominio"
7. "Estructura y componentes de este backend"
8. "Mapa técnico puro de este proyecto"
```

---

## Notas Prácticas

- **Prioriza claridad sobre completitud** — un blueprint que se entiende es mejor que uno exhaustivo que confunde.
- **Si hay diagrama existente**, úsalo como referencia pero verifica contra el código.
- **Si el sistema está en refactor**, documenta el estado actual + nota "en transición".
- **Nombres de entidades y módulos son vitales** — no abrevies, mantén nomenclatura exacta.
- **Si faltan detalles**, marca como `[Requiere investigación]` — no inventes.

---

## Tags

`#mapping` `#architecture` `#blueprint` `#factual` `#documentation` `#onboarding` `#technical-reference`
