# Sprint 7 - Consolidacion Baseline Anual

Fecha de cierre: 2026-05-18

## Objetivo

Completar el baseline anual operativo de TAUROS cargando mayo, junio y julio 2025, validar deduplicacion, resolver categorias pendientes y dejar la base lista para el Canon TAUROS de Insights.

## Resultado

- **Estado**: cerrado.
- **Rango operativo**: mayo 2025 a abril 2026.
- **Total movimientos**: 6.172.
- **Duplicados exactos**: 0.
- **Sin categoria**: 1 excepcion aceptada manualmente.
- **Excepcion vigente**: `DOCUMENTO 27963963144` en marzo 2026.

## Importacion SP7

| Archivo / origen | Resultado |
|---|---:|
| `docs/Movimientos_Supervielle_06_2025.xlsx` | 636 nuevos |
| `docs/Movimientos_Supervielle_07_2025.xlsx` | 527 nuevos |
| `20260107_021718_Movimientos_Supervielle_JUNIO.xlsx` | 0 nuevos, duplicado controlado |
| `20260107_021718_Movimientos_Supervielle_JULIO.xlsx` | 0 nuevos, duplicado controlado |
| `20260107_021719_Movimientos_Supervielle_MAYO.xlsx` | 602 nuevos |

Backups operativos creados antes de la carga oficial:

- `backend/toro_prime.backup_sp7_pre_import_20260518_035358.db`
- `backend/toro_prime.backup_sp7_official_files_20260518_035459.db`

## Baseline Mensual

| Periodo | Movimientos | Sin categoria | Ingresos | Egresos |
|---|---:|---:|---:|---:|
| 2025-05 | 608 | 0 | $22.559.584,07 | $28.601.741,79 |
| 2025-06 | 630 | 0 | $27.977.663,57 | $32.499.257,91 |
| 2025-07 | 527 | 0 | $30.398.409,44 | $30.336.601,00 |
| 2025-08 | 586 | 0 | $37.680.260,66 | $37.970.770,31 |
| 2025-09 | 412 | 0 | $23.261.410,60 | $25.247.145,92 |
| 2025-10 | 461 | 0 | $22.827.126,31 | $19.605.402,17 |
| 2025-11 | 507 | 0 | $40.277.564,83 | $26.668.056,36 |
| 2025-12 | 527 | 0 | $23.705.880,10 | $25.401.893,39 |
| 2026-01 | 488 | 0 | $10.496.225,87 | $19.728.455,82 |
| 2026-02 | 428 | 0 | $39.106.819,15 | $20.017.639,30 |
| 2026-03 | 505 | 1 | $18.797.280,86 | $25.174.042,38 |
| 2026-04 | 493 | 0 | $6.683.800,14 | $22.305.159,78 |

## Decisiones de Categorizacion Aplicadas

- `REF:VAR` -> `Honorarios > Profesionales`.
- `Impuesto al Valor Agregado` -> `Impuestos y Comisiones > IVA`.
- `Comision Rechazo Chq. Tercero` -> `Impuestos y Comisiones > Comisiones Cheques`.
- Cheques acreditados/rechazados puntuales -> `Ajustes > Cheques Rechazados`.
- `AMUCHASTEGUI, VERONICA` -> `Gastos > Juicios`.
- `MASSIMINO RICARDO ALDO`, `AMPOLI MATIAS NICOLAS`, `NIGRO MARIO ROBERTO` -> `Honorarios > Abogado Laboral`.
- `Nora Cecilia Dovi`, `Melisa Johana Gallesio` -> `Ingresos > Cuotas Afiliados`.
- `YASKULOSKI JUAN AGUSTIN` -> `Sueldos > Nomina`.
- `REINALDI ALEJANDRO`, `PARRA ADRIANA IRENE` -> `Ajustes > Devoluciones`.

## Validaciones

- May/Jun/Jul 2025 quedan en 0 movimientos sin categoria.
- Ago 2025 - Abr 2026 mantiene el estado validado del Sprint 6.
- La carga oficial de junio/julio no duplico movimientos ya importados.
- El unico pendiente sin categoria sigue siendo una decision consciente: `DOCUMENTO 27963963144`.

## Cierre

SP7 deja a TAUROS con un año operativo completo. La siguiente etapa ya no es cargar datos, sino explotar el baseline anual para separar KPIs, ruido, alertas e insights reales de SANARTE.

## Siguiente Sprint

**SP8 - Canon TAUROS de Insights**

- Definir entidades estructurales.
- Ajustar reglas reales en `config/insight_rules.json`.
- Evaluar candidatos con baseline anual.
- Evitar insights obvios sobre movimientos esperados.
- Preparar bandeja humana de revision para SP9.
