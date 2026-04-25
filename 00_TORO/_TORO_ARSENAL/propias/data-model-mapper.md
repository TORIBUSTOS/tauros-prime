---
name: data-model-mapper
description: |
  Mapea integralmente el modelo de datos de un proyecto — entidades, atributos, relaciones, restricciones.
  
  Usa esta skill cuando necesites:
  - Documentar la estructura de datos de un sistema
  - Entender el "schema mental" del proyecto
  - Ver qué datos existen, cómo se relacionan, qué restricciones hay
  - Crear referencia clara para desarrollo, migrations, queries
  - Identificar entidades clave y atributos sin código
  - Comparar modelos de datos entre sistemas
  - Planificar cambios de schema o migraciones
  
  Triggers: "mapea el modelo de datos", "entidades y relaciones de", "schema de este proyecto", "qué datos guarda", "modelo conceptual de datos", "estructura de BD de", "entidades principales"
  
  Funciona con código (ORM models, migrations), documentación, esquemas SQL, descripciones textuales.
compatibility: ~
---

## Cuándo usar esta skill

Usa **data-model-mapper** cuando:

1. **Necesitas entender "la verdad" de datos de un sistema** — qué entidades existen, qué información guardan, cómo se relacionan.
2. **Documentas schema para un equipo nuevo** — alguien necesita saber "qué datos existen" sin leer código.
3. **Planificas migraciones o cambios de schema** — necesitas clarity del estado actual antes de cambiar.
4. **Comparas modelos de datos** entre sistemas (TAUROS vs ARGOS, por ejemplo).
5. **Necesitas ERD (Entity-Relationship Diagram) conceptual** sin herramientas de dibujo.
6. **Diseñas integraciones** — necesitas saber exactamente qué datos otro sistema maneja.
7. **Auditas consistencia de datos** — entidades duplicadas, relaciones rotas, etc.

## Cuándo NO usar esta skill

- **Si solo necesitas ver queries SQL** → usa herramientas de BD directo.
- **Si necesitas analizar performance de queries** → usa herramientas de query optimization.
- **Si necesitas diagnóstico de schema** (normalización, deuda técnica) → usa `project-intelligence-mapper`.
- **Si es un proyecto sin datos** (CLI puro, biblioteca) → no aplica.

---

## Inputs que puede analizar

✓ Modelos ORM (SQLAlchemy, Django ORM, Sequelize, TypeORM, etc)  
✓ SQL CREATE TABLE statements  
✓ Migraciones de BD (Alembic, Django migrations, Flyway)  
✓ Esquemas en comentarios o documentación  
✓ Descripciones textuales de entidades  
✓ Diagramas ERD (verifica contra código)  
✓ Exported schema desde BD (DESCRIBE, INFORMATION_SCHEMA)  
✓ Modelos de múltiples idiomas y frameworks  

---

## Estructura de Output

SIEMPRE produce un "Data Model Map" con EXACTAMENTE esta estructura:

```
# Data Model Map: [Nombre del Sistema]

## Visión General
- **Entidades Totales**: [N]
- **Relaciones Principales**: [tipo: 1-N, M-N, etc]
- **Fuente de Verdad**: [BD primaria, caché, API]

## Entidades Principales

### [Nombre Entidad 1]
**Descripción**: [qué representa]
**Ubicación**: [tabla SQL, archivo modelo, etc]

**Atributos**:
| Nombre | Tipo | Nullable | Default | Constraints | Notas |
|--------|------|----------|---------|-------------|-------|
| id | UUID | No | auto-gen | PK | Identificador único |
| nombre | VARCHAR(255) | No | - | UNIQUE | Nombre de la entidad |
| created_at | TIMESTAMP | No | NOW() | - | Auditoría |
| [atributo N] | [tipo] | [S/No] | [value] | [constraints] | [notas] |

**Índices**:
- PRIMARY KEY: id
- UNIQUE: nombre
- INDEX: created_at
- [índice N]: [campos]

**Relaciones**:
- Muchos a Uno: [Entidad X] (FK: empresa_id → companies.id)
- Uno a Muchos: [Entidad Y] (inversa: esta entidad tiene muchos Y)
- Muchos a Muchos: [Entidad Z] (tabla de unión: entity1_entity2)

---

### [Nombre Entidad 2]
[mismo formato]

---

### [Nombre Entidad N]
[mismo formato]

## Tablas de Unión (M-N)

### [Tabla de Unión 1]
**Entidades**: [Entidad A] ↔ [Entidad B]

| Campo | Tipo | Constraints |
|-------|------|-------------|
| entity_a_id | UUID | FK → [Entidad A].id, PK |
| entity_b_id | UUID | FK → [Entidad B].id, PK |
| [atributo adicional] | [tipo] | [constraints] |

---

## Relaciones Diagrama (ASCII o descripción)

```
[Entidad A] 
    │
    ├─→ 1:N → [Entidad B]
    │
    ├─→ M:N → [Entidad C] (vía tabla_union)
    │
    └─→ 1:1 → [Entidad D]

[Entidad B]
    ├─→ 1:N → [Entidad E]
    └─→ FK → [Entidad A]
```

---

## Enumeraciones / Tipos

**[Enum 1]**: [campo donde se usa]
- `valor1`: descripción
- `valor2`: descripción
- `valor3`: descripción

**[Enum 2]**: [campo donde se usa]
- `estado_activo`: ...
- `estado_inactivo`: ...

---

## Restricciones y Reglas

- **[Restricción 1]**: [descripción y campos afectados]
- **[Restricción 2]**: [descripción y campos afectados]
- **[Regla de Negocio 1]**: [qué garantiza, dónde se valida]

---

## Historial / Auditoría

- **Tabla de auditoría**: [nombre tabla]
- **Campos tracked**: [lista]
- **Estrategia**: [Column, Table, Event-sourcing]

---

## Denormalizaciones Intencionales

[Si existen campos desnormalizados, documenta por qué]
- **Campo desnormalizado**: [nombre] en [tabla]
  - **Razón**: [performance, reporting, etc]
  - **Sincronización**: [trigger, batch job, manual]

---

## Notas sobre Evolución

- **Migraciones pendientes**: [si aplica]
- **Schema en transición**: [descripción del cambio]
- **Compatibilidad hacia atrás**: [considera versiones anteriores si aplica]
```

---

## Principios de Mapeo

1. **Ser Exhaustivo pero Conciso**
   - Documenta TODAS las entidades, pero sin sobrecarga
   - Enfócate en lo importante: atributos clave, relaciones, restricciones

2. **Usar Convenciones Claras**
   - Nombres de tablas/campos exactos (no resúmenes)
   - Tipos de BD reales (VARCHAR, UUID, TIMESTAMP)
   - Convenciones de PK/FK claras

3. **Documentar el Por Qué**
   - Si hay índices, explica qué optimiza
   - Si hay denormalización, explica razón
   - Si hay relaciones complejas, aclara

4. **Marcar Incertidumbres**
   - `[Requiere verificación: ...]` si algo no está claro
   - `[No implementado aún]` si es parte del design pero no código
   - `[Legacy, considera migrar]` si hay datos antiguos

5. **Separar Modelo Lógico de Físico**
   - Muestra entidades conceptuales (lo que el negocio ve)
   - Muestra implementación física (tablas, campos, tipos)
   - A veces no coinciden (ej: archivos JSON en campos)

---

## Heurísticas de Mapeo

| Situación | Qué Documenta |
|-----------|--------------|
| Campo JSON sin definición | `[Estructura: requiere inspección]` + ejemplo |
| Tabla sin PK explícita | Marca como `[Sin PK claro]` |
| Relaciones implícitas en código | Infiere e documenta como `[Implícita]` |
| Tabla de auditoría genérica | Documenta estructura + campos tracked |
| Tipos custom/enums no explícitos | Infiere desde valores en BD |
| Migraciones recientes | Nota estado pre/post migración |
| Campos deprecated pero no borrados | Marca como `[Deprecated, usar YYYY en su lugar]` |

---

## Ejemplo de Output

```
# Data Model Map: TAUROS Financial System

## Visión General
- **Entidades Totales**: 12
- **Relaciones Principales**: 1:N (companies→transactions), M:N (companies↔gl_accounts)
- **Fuente de Verdad**: PostgreSQL 13, replicado a analytics-db

## Entidades Principales

### companies
**Descripción**: Entidad jurídica, una compañía dentro del holding

**Atributos**:
| Nombre | Tipo | Nullable | Default | Constraints | Notas |
|--------|------|----------|---------|-------------|-------|
| id | UUID | No | uuid_generate_v4() | PK | Identificador único |
| name | VARCHAR(255) | No | - | UNIQUE | Nombre legal de la empresa |
| code | VARCHAR(10) | No | - | UNIQUE | Código interno (SAP, etc) |
| parent_id | UUID | Sí | NULL | FK→companies.id | Empresa padre (si aplica) |
| holding_id | UUID | No | - | FK→holdings.id | Holding de pertenencia |
| status | VARCHAR(20) | No | 'active' | CHECK(status IN (...)) | active, inactive, archived |
| created_at | TIMESTAMP | No | NOW() | - | Auditoría |
| updated_at | TIMESTAMP | No | NOW() | - | Auditoría |

**Índices**:
- PRIMARY KEY: id
- UNIQUE: name, code
- INDEX: parent_id (para jerarquía)
- INDEX: holding_id (para búsquedas rápidas)

**Relaciones**:
- Muchos a Uno: holdings (FK: holding_id → holdings.id)
- Auto-referencia (Uno a Muchos): parent_id apunta a otra company
- Uno a Muchos: tiene muchas transactions

---

### gl_accounts
**Descripción**: Plan de cuentas contable, cuentas del balance/P&L

**Atributos**:
| Nombre | Tipo | Nullable | Default | Constraints | Notas |
|--------|------|----------|---------|-------------|-------|
| id | UUID | No | uuid_generate_v4() | PK | - |
| code | VARCHAR(20) | No | - | UNIQUE | Ej: 1000, 1100, 1200 |
| name | VARCHAR(255) | No | - | - | Ej: "Cash", "Accounts Receivable" |
| account_type | VARCHAR(50) | No | - | CHECK(...) | asset, liability, equity, revenue, expense |
| parent_code | VARCHAR(20) | Sí | NULL | - | Para jerarquía contable (1000 es parent de 1100) |
| is_header | BOOLEAN | No | false | - | True si es cuenta resumen (no puede tener transacciones) |
| created_at | TIMESTAMP | No | NOW() | - | - |

**Índices**:
- PRIMARY KEY: id
- UNIQUE: code
- INDEX: account_type (para reportes rápidos)

**Relaciones**:
- Muchos a Muchos: companies (via company_gl_accounts)
- Uno a Muchos: tiene muchas transactions

---

### transactions
**Descripción**: Asientos contables (journal entries), detalles de cada movimiento

**Atributos**:
| Nombre | Tipo | Nullable | Default | Constraints | Notas |
|--------|------|----------|---------|-------------|-------|
| id | UUID | No | uuid_generate_v4() | PK | - |
| company_id | UUID | No | - | FK→companies.id | Empresa origen |
| gl_account_id | UUID | No | - | FK→gl_accounts.id | Cuenta contable |
| cost_center_id | UUID | Sí | NULL | FK→cost_centers.id | Centro de costo (opcional) |
| amount | NUMERIC(15,2) | No | - | CHECK(amount != 0) | Monto (+ o -) |
| description | VARCHAR(500) | Sí | NULL | - | Descripción del movimiento |
| source | VARCHAR(50) | No | - | CHECK(source IN (...)) | sap, netsuitte, xero, manual, auto |
| source_id | VARCHAR(255) | Sí | NULL | UNIQUE(source,source_id) | ID en sistema origen (previene duplicados) |
| transaction_date | DATE | No | - | - | Fecha del movimiento |
| consolidated | BOOLEAN | No | false | - | ¿Fue incluida en consolidación? |
| validated | BOOLEAN | No | false | - | ¿Pasó validación? |
| created_at | TIMESTAMP | No | NOW() | - | - |
| created_by | VARCHAR(100) | No | - | - | Usuario creador |

**Índices**:
- PRIMARY KEY: id
- UNIQUE: (source, source_id) — previene duplicados de fuentes externas
- INDEX: company_id (búsquedas por empresa)
- INDEX: transaction_date (reportes por período)
- INDEX: consolidated (encuentra no-consolidadas rápidamente)
- COMPOSITE INDEX: (consolidated, transaction_date) — filtro común

**Relaciones**:
- Muchos a Uno: companies
- Muchos a Uno: gl_accounts
- Muchos a Uno: cost_centers

---

### consolidations
**Descripción**: Ejecución de una consolidación (snapshot de un cierre de período)

**Atributos**:
| Nombre | Tipo | Nullable | Default | Constraints | Notas |
|--------|------|----------|---------|-------------|-------|
| id | UUID | No | uuid_generate_v4() | PK | - |
| period_date | DATE | No | - | UNIQUE | Mes de cierre (YYYY-MM-01) |
| status | VARCHAR(20) | No | 'pending' | CHECK(...) | pending, running, completed, failed |
| transactions_count | INTEGER | No | - | - | Desnormalizado: cuántas transacciones se consolidaron |
| totals_json | JSONB | Sí | NULL | - | Totales desnormalizados por account_type |
| started_at | TIMESTAMP | Sí | NULL | - | Cuándo empezó el job |
| completed_at | TIMESTAMP | Sí | NULL | - | Cuándo terminó |
| error_message | TEXT | Sí | NULL | - | Si failed, qué pasó |
| created_by | VARCHAR(100) | No | - | - | Usuario que inició |

**Índices**:
- PRIMARY KEY: id
- UNIQUE: period_date
- INDEX: status (para encontrar consolidaciones en progreso)

**Relaciones**:
- Uno a Muchos: tiene consolidation_items

---

### consolidation_items
**Descripción**: Desglose de una consolidación, totales por cuenta/empresa

**Atributos**:
| Nombre | Tipo | Nullable | Default | Constraints | Notas |
|--------|------|----------|---------|-------------|-------|
| id | UUID | No | uuid_generate_v4() | PK | - |
| consolidation_id | UUID | No | - | FK→consolidations.id | Consolidación padre |
| company_id | UUID | No | - | FK→companies.id | Empresa |
| gl_account_id | UUID | No | - | FK→gl_accounts.id | Cuenta |
| total_amount | NUMERIC(15,2) | No | - | - | Suma final |

**Índices**:
- PRIMARY KEY: id
- COMPOSITE UNIQUE: (consolidation_id, company_id, gl_account_id) — una línea por cuenta/empresa
- INDEX: consolidation_id (búsquedas rápidas)

**Relaciones**:
- Muchos a Uno: consolidations
- Muchos a Uno: companies
- Muchos a Uno: gl_accounts

---

### cost_centers
**Descripción**: Centro de costo (departamento, proyecto, línea de negocio)

**Atributos**:
| Nombre | Tipo | Nullable | Default | Constraints | Notas |
|--------|------|----------|---------|-------------|-------|
| id | UUID | No | uuid_generate_v4() | PK | - |
| code | VARCHAR(20) | No | - | UNIQUE | Ej: "CC001", "SALES", "IT" |
| name | VARCHAR(255) | No | - | - | Nombre descriptivo |
| company_id | UUID | No | - | FK→companies.id | Empresa propietaria |
| parent_id | UUID | Sí | NULL | FK→cost_centers.id | CC padre (jerarquía) |

**Relaciones**:
- Muchos a Uno: companies
- Uno a Muchos: transactions (vía cost_center_id)

---

## Tablas de Unión

### company_gl_accounts
**Entidades**: companies ↔ gl_accounts
**Descripción**: Define qué cuentas usa cada empresa (no todas usan todas)

| Campo | Tipo | Constraints |
|-------|------|-------------|
| company_id | UUID | FK→companies.id, PK |
| gl_account_id | UUID | FK→gl_accounts.id, PK |
| is_consolidation_level | BOOLEAN | ¿Se consolida a nivel holding? |

---

## Relaciones - Diagrama

```
holdings
    │
    └─→ 1:N → companies (parent_id es self-reference para jerarquía)
            │
            ├─→ 1:N → transactions
            │           │
            │           ├─→ FK → gl_accounts
            │           └─→ FK → cost_centers
            │
            └─→ M:N → gl_accounts (via company_gl_accounts)

consolidations
    │
    └─→ 1:N → consolidation_items
            ├─→ FK → companies
            ├─→ FK → gl_accounts
            └─→ FK → consolidations (parent)

audit_log
    └─→ registra cambios en companies, transactions, consolidations
```

---

## Enumeraciones

**transaction.source**:
- `sap`: Importado desde SAP
- `netsuites`: NetSuite feed
- `xero`: Xero API
- `manual`: Entrada manual
- `auto`: Generado automáticamente (ej: provisiones)

**transaction.status**:
- `draft`: Borrador
- `validated`: Validado, listo para consolidar
- `consolidated`: Ya fue consolidado
- `archived`: Eliminado lógicamente

**consolidation.status**:
- `pending`: Esperando ejecutarse
- `running`: En progreso
- `completed`: Terminó exitosamente
- `failed`: Error durante consolidación
- `rolled_back`: Se revirtió manualmente

**company.status**:
- `active`: En operación
- `inactive`: Cerrada pero datos históricos presentes
- `archived`: Datos históricos solamente

---

## Restricciones y Reglas

- **Deduplicación de Transacciones**: UNIQUE(source, source_id) previene duplicados de APIs externas
- **No Eliminar en Cascada**: transactions NO se borran, se archivan (data integrity)
- **Consolidación Inmutable**: Una consolidation completada no puede modificarse (audit trail)
- **Validación Previa**: Una transaction debe pasar validation = true antes de ser consolidada
- **Jerarquía Válida**: parent_id en companies no puede crear ciclos (validación en app)

---

## Auditoría

**Tabla**: audit_log
- **Tracking**: Todos los cambios en companies, transactions, consolidations
- **Estrategia**: Trigger PostgreSQL que registra cambios automáticamente
- **Retención**: 7 años (compliance)
- **Campos**: id, table_name, record_id, action (INSERT/UPDATE/DELETE), old_values, new_values, timestamp, user

---

## Denormalizaciones Intencionales

1. **consolidations.transactions_count**
   - **Razón**: Queries de reportes rápidas (no hay que COUNT)
   - **Sincronización**: Actualizado al completar consolidation (app logic)

2. **consolidations.totals_json**
   - **Razón**: Evita JOIN a consolidation_items para totales rápidos
   - **Sincronización**: Calculado al completar consolidation

3. **transactions.source_id (denorm de source + source_id)**
   - **Razón**: Búsquedas rápidas "dame todas las de SAP"
   - **Sincronización**: Siempre presente, indexada

---

## Evolución y Migraciones

- **Campos deprecated**: Ninguno en este momento
- **En transición**: 
  - Migrando `cost_center_code` (string) a `cost_center_id` (FK)
  - Plazo: antes de consolidation 2026-05
- **Compatibilidad hacia atrás**: 
  - v1 (legacy): queries aún soportan búsquedas por code
  - v2 (actual): prefer IDs, codes mapeados via vista
```

---

## Prompts Que Resuelve

```
1. "Mapea el modelo de datos de TAUROS"
2. "Qué entidades hay y cómo se relacionan?"
3. "Quiero entender el schema de este proyecto"
4. "Cómo están organizados los datos?"
5. "Documenta las tablas principales"
6. "Necesito un data model map para onboarding"
7. "Compara el modelo de TAUROS vs ARGOS"
8. "Qué entidades y relaciones puedo ver en el código?"
```

---

## Notas Prácticas

- **Si hay código ORM (SQLAlchemy, Django)**, úsalo como fuente de verdad directa.
- **Si solo hay SQL**, infiere modelo lógico desde CREATE TABLE.
- **Si hay Migraciones**, revisa orden para entender evolución.
- **Si hay documentación desactualizada**, verifica contra código actual.
- **Si hay campos JSONB o tipos custom**, documenta estructura con ejemplos.
- **Marcar siempre [Requiere Verificación]** si no estás 100% seguro.

---

## Tags

`#data-model` `#database` `#entities` `#schema` `#mapping` `#relational` `#blueprint`
