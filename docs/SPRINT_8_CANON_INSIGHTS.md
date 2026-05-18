# Sprint 8 - Canon TAUROS de Insights

Fecha de cierre: 2026-05-18

## Objetivo

Convertir el baseline anual de TAUROS en una primera capa de criterios reales para insights de SANARTE, evitando frases obvias y separando KPI, baseline, anomalia, dependencia y revision manual.

## Resultado

- **Estado**: cerrado.
- **Baseline usado**: mayo 2025 a abril 2026.
- **Movimientos base**: 6.172.
- **Reglas configurables**: `config/insight_rules.json`.
- **Candidatos persistidos**: 160.
- **Pendientes para revision humana**: 24.
- **KPI/baseline ignorados automaticamente**: 136.
- **Backup previo a Canon SP8**: `backend/toro_prime.backup_sp8_pre_canon_20260518_041153.db`.

## Ajustes Implementados

### Motor

- `income_dependency` ahora permite excluir fuentes no operativas desde configuracion con `excluded_sources`.
- `category_variation` ahora puede agrupar por `category_subcategory` para evitar alertas vagas como `Ingresos` o `Gastos` sin detalle.
- `category_variation` permite `excluded_labels` y `min_abs_delta` desde configuracion.
- El matching de entidades configuradas queda exacto tras normalizacion para evitar falsos positivos como `Cheques` matcheando `Comisiones Cheques`.

### Canon inicial

Se definieron como estructurales o esperadas:

- OSPACA / Obra social.
- Cuenta propia / SANARTE.
- Cuotas afiliados.
- Financiacion.
- Extracapita.
- Sueldos / Nomina.
- AFIP.
- Visa.
- Alquileres.
- Proveedores recurrentes y servicios operativos: farmacias, Sancor, agua, gas, internet/TV, nube, ERP y telefonia.

Se excluyeron como ruido de insight destacado:

- Transferencias de entrada/salida.
- FCI/intereses/devoluciones/descuentos como fuentes de dependencia.
- Impuestos bancarios, IVA, comisiones y percepciones para variaciones operativas.

## Resultado por Periodo

| Periodo | Candidatos | Pendientes | Ignorados |
|---|---:|---:|---:|
| 2025-05 | 0 | 0 | 0 |
| 2025-06 | 0 | 0 | 0 |
| 2025-07 | 12 | 0 | 12 |
| 2025-08 | 14 | 0 | 14 |
| 2025-09 | 14 | 1 | 13 |
| 2025-10 | 17 | 4 | 13 |
| 2025-11 | 19 | 4 | 15 |
| 2025-12 | 17 | 2 | 15 |
| 2026-01 | 14 | 1 | 13 |
| 2026-02 | 19 | 4 | 15 |
| 2026-03 | 19 | 5 | 14 |
| 2026-04 | 15 | 3 | 12 |

## Pendientes Destacados Generados

- Variaciones por subcategoria: `Ingresos > Cuotas Afiliados`, `Sueldos > Nomina`, `Pagos a Proveedores > Cheques`, `Gastos > Comida`, `Tarjetas > Visa`, `Prestadores > Farmacias`, `Impuestos > AFIP`.
- Dependencia relevante: `Ingresos > OSPACA` en febrero 2026 se mantiene como pendiente porque supera umbral critico o cambia contra baseline.
- Revision manual: `DOCUMENTO 27963963144` sigue como unico movimiento sin categoria.

## Validaciones

- Tests del motor de insights: `7 passed`.
- El motor sigue cargando reglas desde archivo externo.
- No se agregaron reglas hardcodeadas para SANARTE dentro de la logica central.
- No aparecen candidatos pendientes por ranking simple tipo "mayor ingreso del mes".
- La bandeja queda lista para SP9 con estados `pending` e `ignored` ya diferenciados.

## Siguiente Sprint

**SP9 - Bandeja de Revision**

- UI para revisar candidatos `pending`.
- Acciones: aprobar, rechazar, ignorar o convertir a regla.
- Bandeja especial de movimientos sin categoria.
- Trazabilidad visible para decisiones humanas.
