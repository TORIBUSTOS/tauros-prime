# FIX_CRITICOS.md — Audit Frontend TAUROS v2
> Relevamiento completo página por página. Fecha: 2026-04-20
> Estado: PENDIENTE DE FIX

---

## CROSS-CUTTING (afectan múltiples páginas)

| ID | Issue | Páginas | Severidad |
|---|---|---|---|
| CC-01 | Límite 500 movimientos en backend — datos incompletos en toda la app | Dashboard, Movimientos, Analytics | 🔴 CRÍTICO |
| CC-02 | Botones sin onClick (dead buttons) | Dashboard x2, Movimientos, Reportes | 🟡 MEDIO |
| CC-03 | Charts con sizing bug (width/height = -1) | Dashboard (FlowChart), Analytics (PieChart) | 🟡 MEDIO |

---

## DASHBOARD `/`

### Mocks / Hardcoded
| ID | Ubicación | Problema |
|---|---|---|
| D-01 | `page.tsx:139` | `trend={2.4}` en Balance Imperial — inventado, no calculado |
| D-02 | `page.tsx:76` | `confidence` fallback hardcoded `0.85` |
| D-03 | `page.tsx:121` | `"TAUROS v2.5"` — versión fija en el subtítulo del header |
| D-04 | `CortexHub.tsx:138` | `"Every 24h"` en footer — string fijo |
| D-05 | `CortexHub.tsx:116-124` | Widget "Análisis de Tendencia" — barra hardcodeada al 66%, completamente disabled. Puro placeholder. |

### Botones muertos
| ID | Componente | Botón |
|---|---|---|
| D-06 | `CortexHub.tsx:142` | "OPTIMIZAR" — sin onClick |
| D-07 | `LiquidityAlert.tsx:64` | "MITIGAR RIESGO" — sin onClick |

### Bugs de datos
| ID | Ubicación | Problema |
|---|---|---|
| D-08 | `page.tsx:74` | `projectedNet` suma `expected_total` de todas las categorías del mes 1 del forecast → representa gasto proyectado, no saldo. Se usa como `projectedBalance` en LiquidityAlert — comparación semánticamente incorrecta. |
| D-09 | `TopCategorias.tsx` | Calcula categorías client-side desde max 500 movs → muestra $33.4M vs $37.9M real (faltan $4.4M). Debe usar `/api/categories`. |

### Código muerto
| ID | Ubicación | Problema |
|---|---|---|
| D-10 | `MetricCard.tsx:30` | `useTheme()` importado, `currentTheme` no se usa |
| D-11 | `LiquidityAlert.tsx:19` | `useTheme()` importado, `currentTheme` no se usa |
| D-12 | `MetricCard.tsx` | Prop `colorizeValue` — ningún caller la usa |

---

## MOVIMIENTOS `/movimientos`

| ID | Ubicación | Problema | Severidad |
|---|---|---|---|
| M-01 | `page.tsx:95` | "EXPORTAR AUDITORÍA" — botón sin onClick | 🟡 |
| M-02 | Backend `/api/movements` | Límite hardcoded 500. La UI muestra "500 de 500 registros" sin avisar que hay 1.276 más (71% oculto). | 🔴 CRÍTICO |

---

## CATEGORÍAS `/categorias`

| ID | Ubicación | Problema | Severidad |
|---|---|---|---|
| C-01 | `page.tsx` | Muestra datos ALL-TIME (no filtrados por período). El selector de período del header no afecta esta página. Genera confusión: $81M vs $21M para la misma categoría. | 🟡 |
| C-02 | `TabSinCategorizar:395` | `getMovements()` sin período — busca "sin categorizar" solo en los primeros 500 movimientos de toda la DB | 🟡 |

---

## REPORTES `/reportes`

| ID | Ubicación | Problema | Severidad |
|---|---|---|---|
| R-01 | `page.tsx:63` | "EXPORTAR" — botón sin onClick | 🟡 |
| R-02 | `SummaryCard:139` | `value.toLocaleString()` sin locale → muestra `$37.606.874,01` con decimales, inconsistente con Dashboard (sin decimales) | 🟡 |
| R-03 | `HierarchicalTable` | Categorías de egreso (Inversiones $13M, Pagos y Transf. $7.3M) aparecen bajo sección INGRESOS porque tienen créditos. Confunde al usuario. | 🟡 |

---

## ANALYTICS `/analytics`

| ID | Ubicación | Problema | Severidad |
|---|---|---|---|
| A-01 | `page.tsx:45` | `burnRate = egresos_total / 30` — hardcoded 30 días. Agosto tiene 31. | 🟡 |
| A-02 | `CategoryPieChart` | Solo renderiza la leyenda, sin el gráfico visual (bug de sizing/contenedor) | 🟡 |
| A-03 | `page.tsx:54` | `avgConfianza` calculado sobre max 500 movs (misma limitación CC-01) | 🟡 |

---

## INSIGHTS `/insights`

| ID | Ubicación | Problema | Severidad |
|---|---|---|---|
| I-01 | `page.tsx:73` | `"mediante redes neuronales"` — copy falso, TAUROS usa matching estadístico, no ML | 🟡 |
| I-02 | `page.tsx:100` | `"98.4%"` Precisión — hardcodeado, no viene de ningún dato real | 🔴 |
| I-03 | `page.tsx:104` | `"12ms"` Latencia — hardcodeado | 🟡 |
| I-04 | `page.tsx:95` | Texto del banner fijo — nunca cambia con los datos reales del período | 🟡 |
| I-05 | `page.tsx:112` | Sin deduplicación de insights: la misma categoría aparece N veces. CortexHub deduplica, esta página no. | 🔴 |
| I-06 | `page.tsx:112` | `key={idx}` en el map — antipattern, usar identificador único | 🟢 |

---

## PRIORIDAD DE FIX SUGERIDA

### 🔴 CRÍTICOS (datos incorrectos / engañosos)
1. **CC-01 + M-02** — Límite 500 movimientos. Solución: paginación server-side o aumentar límite en backend.
2. **D-09** — TopCategorías debe usar `/api/categories` en vez de calcular client-side.
3. **D-08** — projectedBalance usa dato semánticamente incorrecto.
4. **I-02 + I-05** — Precisión falsa y duplicados en Insights.

### 🟡 IMPORTANTES (mocks / UX rota)
5. **D-01 a D-05** — Mocks hardcodeados en Dashboard.
6. **D-06, D-07, M-01, R-01** — Botones muertos.
7. **CC-03** — Charts sin dimensiones.
8. **R-02** — Formato de números inconsistente.
9. **A-01** — Burn rate con días fijos.

### 🟢 MENOR (deuda técnica)
10. **D-10, D-11, D-12** — Código muerto.
11. **I-06** — key={idx}.

---

*Generado en sesión de audit con Claude Code — 2026-04-20*
*Próximo paso: ejecutar fixes en orden de prioridad*
