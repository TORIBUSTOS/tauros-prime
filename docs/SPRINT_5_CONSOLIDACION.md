# Sprint 5 - Consolidacion TAUROS v1.0

Fecha de apertura: 2026-05-16

## Objetivo

Blindar TAUROS v1.0 antes de importar abril 2026. El foco no es agregar features nuevas, sino verificar que el producto actual compile, responda con datos reales y deje trazabilidad clara para medir categorias e insights despues de la carga de abril.

## Alcance

- Verificacion backend/frontend.
- Auditoria de contratos Pydantic <-> TypeScript.
- Revision de datos cargados hasta marzo 2026.
- Preparacion del gate de importacion de abril.
- Limpieza de inconsistencias operativas detectadas durante la verificacion.

## Evidencia Ejecutada

### Backend

Comando:

```powershell
cd backend
.\venv\Scripts\python.exe -m pytest -q
```

Resultado:

- 89 tests passing.
- Warnings existentes por deprecaciones de Pydantic/SQLAlchemy/datetime, no bloqueantes para Sprint 5.

### Frontend

Comando:

```powershell
cd frontend
npm run build
```

Resultado:

- Build productivo exitoso.
- TypeScript exitoso.
- Rutas generadas: `/`, `/analytics`, `/auditoria`, `/categorias`, `/insights`, `/movimientos`, `/reportes`.

Comando:

```powershell
cd frontend
npm run test:run
```

Resultado:

- 222 tests passing.
- 19 test files passing.
- Suite frontend completa verde despues de actualizar contratos paginados, providers/mocks de paginas y expectativas visuales vigentes.

## Estado de Datos Antes de Abril

Base revisada: `backend/toro_prime.db`

Snapshot inicial, antes de aplicar las reglas aprobadas del Sprint 5:

| Periodo | Movimientos | Sin categorizar | % sin categorizar | Monto absoluto sin categorizar |
|---|---:|---:|---:|---:|
| 2025-12 | 2 | 1 | 50.0% | 300000.00 |
| 2026-01 | 488 | 72 | 14.8% | 12723629.17 |
| 2026-02 | 428 | 77 | 18.0% | 42936212.42 |
| 2026-03 | 505 | 67 | 13.3% | 25489133.51 |

Total actual:

- 1423 movimientos.
- 217 movimientos sin categorizar.
- 0 grupos duplicados por `(fecha, descripcion, monto)`.
- 16 reglas activas de categorizacion.
- 0 obligaciones manuales cargadas.
- 1 patron recurrente persistido.

## Reglas Aprobadas y Aplicadas

Backup previo a cambios:

- `backend/toro_prime.backup_sprint5_20260516_060223.db`
- `backend/toro_prime.backup_sprint5_rules2_20260516_061517.db`
- `backend/toro_prime.backup_sprint5_names_20260516_062158.db`

Reglas creadas/aplicadas sobre `backend/toro_prime.db`:

| Patron | Categoria | Subcategoria | Nota |
|---|---|---|---|
| `OBRA SOC.PERS.ACTIV. CERVECER` | Ingresos | OSPACA | Obra social / OSPACA. |
| `Credito DEBIN - LEYENDA: Transferencia recibida TIPO_DEBIN: 05 NOMBRE: SANARTE SRL` | Ingresos | Cuenta Propia | Regla refinada a credito recibido para no capturar egresos hacia SANARTE. |
| `Pago Cheque de Camara Recibida` | Pagos a Proveedores | Cheques | Cheques de camara. |
| `Pago Sueldos` | Sueldos | Nomina | Pago general de nomina. |
| `AFIP VEP` | Impuestos | AFIP | Pagos fiscales VEP. |
| `Cobranzas Resumen Visa` | Tarjetas | Visa | Movimientos Visa. |
| `FARMACIAS LIDER` | Prestadores | Farmacias | Prestador farmacia. |
| `ALVAREZ, MIRIAM` | Sueldos | Nomina | Persona fisica validada como sueldo. |
| `BUSTOS, ANYELEN` | Sueldos | Nomina | Persona fisica validada como sueldo. |
| `BUSTOS RODRIGO` | Sueldos | Nomina | Persona fisica validada como sueldo. |
| `Debito Automatico de Servicio - AFIP` | Impuestos | AFIP | Debitos automaticos AFIP. |
| `Debito Automatico de Servicio - CABLEVISION` | Servicios | Internet/TV | Servicio recurrente. |
| `Debito Automatico de Servicio - SANCOR COOP.SEG.` | Seguros | Sancor | Seguro recurrente. |
| `Pago de Servicios - COD_ENTIDAD: CTI ENTIDAD: Claro` | Servicios | Telefonia | Servicio telefonico. |
| `Debito Automatico de Servicio - AGUAS CORDOBESAS` | Servicios | Agua | Servicio de agua. |
| `Debito Automatico de Servicio - D.GAS DEL CENTRO` | Servicios | Gas | Servicio de gas. |
| `Comision Mantenimiento Paquete` | Impuestos y Comisiones | Comisiones Bancarias | Paquete bancario. |
| `COMIS.TRANSFERENCIAS` | Impuestos y Comisiones | Comisiones Bancarias | Comisiones por transferencias. |
| `Com.Cheque Pagado por clearing` | Impuestos y Comisiones | Comisiones Cheques | Comision por clearing. |
| `Comisiones Cheques O/Bancos` | Impuestos y Comisiones | Comisiones Cheques | Comision por cheques. |
| `IVA - OPERACION` | Impuestos y Comisiones | IVA | IVA asociado a operaciones. |
| `IVA` | Impuestos y Comisiones | IVA | IVA generico remanente. |
| `I.V.A. Percep. Resp. Inscripto` | Impuestos y Comisiones | Percepciones IVA | Percepcion IVA. |
| `Percepcion I.V.A. RG. 3337` | Impuestos y Comisiones | Percepciones IVA | Percepcion IVA. |
| `Percepcion RG 5617` | Impuestos y Comisiones | Percepciones | Percepcion RG 5617. |
| `Impuesto a las Ganancias` | Impuestos | Ganancias | Impuesto nacional. |
| `Devolucion Imp. Ley 25413` | Impuestos y Comisiones | Devolucion Impuesto al Cheque | Devolucion fiscal. |
| `Acreditacion Cheque Dep.48 Hs.` | Ingresos | Cuotas Afiliados | Pago de cuota prepago con cheque. |
| `DIAZ GUSTAVO MARCELO` | Honorarios | Profesionales | Honorarios. |
| `MORELLO JOSE ALFREDO` | Honorarios | Anestesia | Honorarios Dr. Morello anestesia. |
| `Gabriel Alberto Hernandez` | Ingresos | Cuotas Afiliados | Pago de cuota afiliado por transferencia. |
| `MERCADO PEDRO SEBASTIAN` | Servicios | Sistema ERP | Sistema ERP / ingenieria. |
| `PEREYRA YANINA BEATRIZ` | Honorarios | Profesionales | Honorarios. |
| `Nestor Raul Mansilla` | Ingresos | Cuotas Afiliados | Pago de cuota afiliado por transferencia. |
| `adolfo marcelo villalon h` | Ingresos | Cuotas Afiliados | Pago de cuota afiliado por transferencia. |
| `OXANDABURU PABLO FRANCISCO` | Honorarios | Abogado Laboral | Abogado laboral de SANARTE. |
| `LUIS ALFONSO LIZONDO GARC` | Ingresos | Cuotas Afiliados | Pago de cuota afiliado por transferencia. |
| `DANIEL ROLANDO ARTEAGA` | Ingresos | Cuotas Afiliados | Pago de cuota afiliado por transferencia. |
| `GUADALUPE ANAHI TOSIN` | Ingresos | Alquiler | Alquiler. |

Despues de aplicar reglas aprobadas y recategorizar 1423 movimientos:

| Periodo | Movimientos | Sin categorizar | % sin categorizar | Monto absoluto sin categorizar |
|---|---:|---:|---:|---:|
| 2025-12 | 2 | 0 | 0.0% | 0.00 |
| 2026-01 | 488 | 0 | 0.0% | 0.00 |
| 2026-02 | 428 | 0 | 0.0% | 0.00 |
| 2026-03 | 505 | 1 | 0.2% | 140000.00 |

Control especifico SANARTE:

- 0 movimientos con monto negativo quedaron en `Ingresos > Cuenta Propia`.
- Se evita clasificar transferencias enviadas a SANARTE como ingreso.

## Riesgo Principal Antes de Cargar Abril

El sistema funciona y el bloque de mayor impacto ya fue limpiado. El unico movimiento restante sin categoria queda aceptado asi por falta de identificacion suficiente.

Motivo: marzo todavia tiene 1 movimiento sin categorizar. El monto absoluto bajo de 25489133.51 a 140000.00. Se decidio no categorizarlo porque el registro solo informa `DOCUMENTO: 27963963144 NOMBRE: 27963963144`.

Esto no bloquea la carga de abril.

## Pendientes de Clasificacion

Archivo operativo para completar decisiones:

- `docs/SIN_CATEGORIA_PARA_DECIDIR.txt`

| Movimiento pendiente | Monto | Fecha | Nota |
|---|---:|---|---|
| `Debito DEBIN ... DOCUMENTO: 27963963144 NOMBRE: 27963963144` | 140000.00 | 2026-03-19 | Decision: dejar sin categoria por origen no identificado. |

## Fixes Aplicados en Sprint 5

- Corregido JSX invalido en `/insights` que rompia el build.
- Alineado `apiService.getMovements` con la respuesta paginada real del backend.
- Corregidas llamadas viejas que pasaban `period` como string.
- Corregida carga de movimientos sin categorizar para traer todas las paginas, no solo la primera.
- Corregidos payloads de `createRuleFromMovement` en frontend para usar los nombres reales del backend.
- Actualizados tests de paginas principales para el contrato server-side actual: dashboard, analytics, categorias, insights, movimientos y reportes.
- Actualizados tests de componentes compartidos segun UI vigente.
- Alineados tipos TypeScript con Pydantic:
  - `SummaryResponse.equity`.
  - `PatronRecurrenteResponse.dia_mes`.
  - `ProjectionsResponse.confianza`.
  - tipos de obligaciones manuales.
- Actualizado test de `apiService` para contrato paginado actual.

## Gate Antes de Importar Abril

Antes de cargar abril:

- [x] Validar y aplicar reglas aprobadas de categorizacion.
- [x] Crear backup previo de la DB.
- [x] Ejecutar recategorizacion global.
- [x] Decidir pendientes residuales de clasificacion.
- [x] Confirmar umbral operativo: queda 1 movimiento sin categoria aceptado manualmente.
- [x] Ejecutar backend tests.
- [x] Ejecutar frontend build.
- [x] Ejecutar frontend tests.

Despues de cargar abril:

- [ ] Verificar cantidad de movimientos importados.
- [ ] Verificar duplicados.
- [ ] Revisar `Sin categorizar` por periodo.
- [ ] Revisar nuevos insights de abril.
- [ ] Revisar forecast desde abril.
- [ ] Comparar categorias abril vs enero-marzo.

## Comandos Utiles

Backend tests:

```powershell
cd backend
.\venv\Scripts\python.exe -m pytest -q
```

Frontend build:

```powershell
cd frontend
npm run build
```

Consultar estado de categorizacion:

```powershell
python - <<'PY'
import sqlite3
conn = sqlite3.connect('backend/toro_prime.db')
for row in conn.execute("""
SELECT substr(fecha,1,7) periodo,
       COUNT(*) total,
       SUM(CASE WHEN categoria='Sin categorizar' THEN 1 ELSE 0 END) sin_cat
FROM movimientos
GROUP BY substr(fecha,1,7)
ORDER BY periodo
"""):
    print(row)
conn.close()
PY
```

## Estado

Sprint 5 queda cerrado para la base enero-marzo.

Resultado operativo:

- Categorizacion estabilizada con 1 movimiento sin categoria aceptado manualmente.
- Auditoria visual P1/P2/P3 aplicada y documentada.
- Dashboard, Insights, Movimientos, Categorias, Reportes, Analytics y Auditoria quedan aptos para validacion con abril.
- Proximo bloque: carga controlada de abril y comparacion contra baseline enero-marzo.

## Actualizacion Posterior - 2026-05-18

Se completo la carga extendida Nov 2025 - Abr 2026:

- Total actual: 2.948 movimientos.
- Duplicados exactos: 0.
- Noviembre y diciembre quedaron sin pendientes de categorizacion.
- Abril quedo cargado y categorizado.
- Permanece solo la excepcion aceptada `DOCUMENTO 27963963144` en marzo 2026.
- Proximo sprint: SP6, expansion del baseline a 12 meses con carga 3 meses + 3 meses.
