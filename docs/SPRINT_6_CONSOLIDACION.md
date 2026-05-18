# Sprint 6 - Consolidacion Base 9 Meses

Fecha de cierre: 2026-05-18

## Objetivo

Extender TAUROS desde la base de 6 meses Nov 2025 - Abr 2026 hacia una base de 9 meses incorporando Ago/Sep/Oct 2025, manteniendo deduplicacion, categorizacion y trazabilidad.

## Resultado

Sprint 6 queda cerrado.

- Base cubierta: Ago 2025 - Abr 2026.
- Total movimientos: 4.407.
- Duplicados exactos: 0.
- Sin categoria nuevos de Ago/Sep/Oct: 0.
- Sin categoria total: 1 excepcion aceptada manualmente (`DOCUMENTO 27963963144`, marzo 2026).
- Backup previo a reglas SP6 creado: `backend/toro_prime.backup_sp6_pre_rules_20260518_033959.db`.

## Periodos Validados

| Periodo | Movimientos | Sin categoria | Ingresos | Egresos |
|---|---:|---:|---:|---:|
| 2025-08 | 586 | 0 | 37.680.260,66 | 37.970.770,31 |
| 2025-09 | 412 | 0 | 23.261.410,60 | 25.247.145,92 |
| 2025-10 | 461 | 0 | 22.827.126,31 | 19.605.402,17 |
| 2025-11 | 507 | 0 | 40.277.564,83 | 26.668.056,36 |
| 2025-12 | 527 | 0 | 23.705.880,10 | 25.401.893,39 |
| 2026-01 | 488 | 0 | 10.496.225,87 | 19.728.455,82 |
| 2026-02 | 428 | 0 | 39.106.819,15 | 20.017.639,30 |
| 2026-03 | 505 | 1 | 18.797.280,86 | 25.174.042,38 |
| 2026-04 | 493 | 0 | 6.683.800,14 | 22.305.159,78 |

## Reglas y Decisiones Aplicadas

### Reglas automaticas/obvias

- FCI: `Suscripcion / Rescate FCI`, `Corto Plazo (3)` -> `Inversiones > FCI`.
- SANARTE cuenta propia/salida -> `Ingresos > Cuenta Propia` o `Transferencias > Salida` segun signo y descripcion.
- IIBB Cordoba -> `Impuestos > Ingresos Brutos`.
- Comisiones bancarias -> `Impuestos y Comisiones > Comisiones Bancarias`.

### Decisiones del usuario

- `Descto. Docum.- Acreditacion` -> `Ingresos > Financiacion`.
- `FLORES, MARCOS` -> `Gastos > Juicios`.
- `Gladys Elisa Saavedra` -> `Ingresos > Cuotas Afiliados`.
- `Fernando Alberto Canen` -> `Ingresos > Cuotas Afiliados`.
- `ZIRIUS S.A.S.` -> `Ingresos > Cuotas Afiliados`.
- `ana belen cuetti arevalo` -> `Ingresos > Cuotas Afiliados`.
- `CASTRO BUSICO PABLO JAVIER` -> `Honorarios > Profesionales`.
- `GONZALES RODRIGUEZ MARIA ELENA` -> `Honorarios > Profesionales`.
- `DIAZ ELIO JAVIER` -> `Honorarios > Profesionales`.
- `NAZARIO ALAYO JOSE RAUL` -> `Honorarios > Profesionales`.
- `Comercios First Data - SANARTE` -> `Ingresos > Cuotas Afiliados`.
- `Lucas Daniel Bonaldi` -> `Ingresos > Cuotas Afiliados`.
- `FRANCO ALEJANDRO FURLAN` -> `Ingresos > Extracapita`.
- `VARLEOTT` y `VARAGUILER` -> `Honorarios > Profesionales`.

## Validacion

Consultas ejecutadas:

- Conteo por periodo.
- Conteo de duplicados exactos por `fecha + descripcion + monto`.
- Conteo de movimientos sin categoria.

Resultado:

- Duplicados exactos: 0.
- Ago/Sep/Oct sin categoria: 0.
- Unica excepcion total: movimiento ID 141, `DOCUMENTO 27963963144`.

## Proximo Sprint

SP7 - Expansion a 12 meses:

- Cargar May/Jun/Jul 2025.
- Verificar duplicados.
- Resolver sin categoria.
- Cerrar baseline anual May 2025 - Abr 2026.
