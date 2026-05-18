# TAUROS Insights Engine

Base interna para generar candidatos de insight sin hardcodear criterios dentro del motor.

## Ubicación

- Reglas editables: `config/insight_rules.json`
- Motor evaluador: `backend/src/services/insights_engine.py`
- Persistencia: tabla `insight_candidates`
- API nueva: endpoints bajo `/api/insights-engine/*`
- Migración: `backend/alembic/versions/20260517_add_insight_candidates.py`

El endpoint legacy `/api/insights` sigue existiendo para no romper la UI actual.

## Flujo

1. Se cargan reglas desde `config/insight_rules.json`.
2. Se evalúan movimientos del período solicitado.
3. El motor genera candidatos trazables, no frases genéricas.
4. Cada candidato se persiste de forma idempotente con `candidate_uid`.
5. El usuario o una futura UI de revisión marca el estado:
   `pending`, `approved`, `rejected`, `ignored`, `converted_to_rule`.

## Modelo conceptual

- `kpi`: métrica o baseline esperado. No debe elevarse como insight destacado.
- `alerta`: señal operativa que requiere atención.
- `insight`: cambio relevante contra baseline o dependencia real.
- `anomalia`: desvío contra comportamiento histórico suficiente.
- `ruido`: evento esperable o sin evidencia suficiente.
- `revision_manual`: caso que necesita criterio humano, por ejemplo sin categoría.

Cada candidato incluye:

- `id`
- `tipo`
- `titulo`
- `descripcion`
- `severidad`
- `periodo_analizado`
- `regla_disparadora`
- `datos_utilizados`
- `explicacion`
- `accion_sugerida`
- `estado_revision`

## Reglas iniciales

Las reglas incluidas son demostrativas y configurables:

- `uncategorized_movement_review`: separa movimientos sin categoría como bandeja de revisión.
- `income_dependency_shift`: detecta concentración de ingresos solo si cambia contra baseline o supera umbral crítico. Permite entidades estructurales y fuentes excluidas desde config.
- `category_variation_vs_baseline`: detecta variaciones por categoría/subcategoría con baseline mínimo, monto mínimo, delta absoluto mínimo y exclusiones configurables.
- `expected_recurrent_baseline`: registra recurrencias estructurales como KPI/baseline e inicia en `ignored`.

## Cómo evitar insights obvios

No crear reglas que disparen por ranking simple, por ejemplo “mayor ingreso del mes”.
Toda regla destacada debe exigir al menos una de estas evidencias:

- cambio contra baseline histórico;
- anomalía por monto, frecuencia o concentración;
- riesgo operativo;
- dependencia nueva o concentración crítica;
- movimiento sin categoría;
- evento que requiera revisión humana.

Si algo es recurrente y esperado, debe clasificarse como `kpi` o `ruido`, no como `insight`.

## API operativa

Evaluar y persistir candidatos:

```bash
curl -X POST "http://localhost:9000/api/insights-engine/evaluate?period=2026-04"
```

Listar candidatos:

```bash
curl "http://localhost:9000/api/insights-engine/candidates?period=2026-04"
```

Filtrar pendientes:

```bash
curl "http://localhost:9000/api/insights-engine/candidates?period=2026-04&estado_revision=pending"
```

Actualizar revisión:

```bash
curl -X PATCH "http://localhost:9000/api/insights-engine/candidates/1/review" \
  -H "Content-Type: application/json" \
  -d "{\"estado_revision\":\"approved\"}"
```

Bandeja especial de sin categoría:

```bash
curl "http://localhost:9000/api/insights-engine/review/uncategorized?period=2026-04"
```

## Agregar reglas

Editar `config/insight_rules.json`.

Campos mínimos:

- `id`: identificador estable.
- `enabled`: permite apagar la regla sin borrar configuración.
- `kind`: evaluador interno disponible.
- `tipo`: salida funcional (`kpi`, `anomalia`, `dependencia`, `revision_manual`, etc.).
- `classification`: clasificación conceptual.
- `severity`: `info`, `low`, `medium`, `high`, `critical`.
- `thresholds`: umbrales editables.
- `suggested_action`: recomendación operativa.

El motor puede incorporar nuevos `kind` más adelante, pero los umbrales y entidades no deben quedar embebidos en la lógica central.

## Canon SP8

SP8 deja un canon inicial en `config/insight_rules.json`:

- Entidades estructurales: OSPACA, cuenta propia, cuotas afiliados, financiacion, extracapita, sueldos/nomina, AFIP, Visa, alquileres y servicios/proveedores recurrentes.
- Fuentes excluidas para dependencia: transferencias de entrada, FCI, intereses, devoluciones, cheques rechazados y descuentos.
- Variaciones evaluadas por `category_subcategory`, no solo por categoría amplia.
- Ruido excluido de variaciones: transferencias, impuestos bancarios, IVA, comisiones, percepciones y descuentos.

Validacion SP8 sobre mayo 2025 - abril 2026:

- 160 candidatos persistidos.
- 24 pendientes de revision humana.
- 136 KPI/baseline ignorados automaticamente.
