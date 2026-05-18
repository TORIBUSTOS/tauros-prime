# Auditoría Visual TAUROS - Sprint 5

Generado desde capturas locales en desktop `1920x1080`. La auditoría se basa solo en evidencia visible de las capturas.

## Resumen Ejecutivo

- Rutas capturadas: 7/7.
- Raw PNG: `screens/raw/`.
- Láminas anotadas: `screens/annotated/`.
- Implementación P1: [P1_IMPLEMENTACION.md](P1_IMPLEMENTACION.md).
- Implementación P2: [P2_IMPLEMENTACION.md](P2_IMPLEMENTACION.md).
- QA final P3: [P3_QA_FINAL.md](P3_QA_FINAL.md).
- Hallazgos principales: truncamiento de montos, densidad de tablas/cards, estados vacíos sin acción, redundancia de módulos analíticos y componentes fuera de alcance actual como Cortex.

## Índice de Láminas

### Dashboard

- Ruta: `/`
- Raw: [dashboard.png](screens/raw/dashboard.png)
- Anotada: [dashboard.png](screens/annotated/dashboard.png)
- Estado visible: Carga correctamente; hay truncamiento visible en KPIs y un módulo Cortex todavía presente.

| Prioridad | Tipo | Hallazgo visible |
|---|---|---|
| P1 | UI Bug | Los importes de Ingresos/Egresos aparecen truncados con ellipsis; el dato financiero pierde precisión. |
| P1 | UX | El módulo Cortex Hub compite con el dashboard y queda fuera del alcance operativo actual. |
| P2 | UX | La carga de extractos queda debajo del primer bloque visible y puede pasar desapercibida. |
| P2 | Componente | Evolución y Top Categorías están bien agrupados, pero el contraste de ejes/textos secundarios es bajo. |

### Movimientos

- Ruta: `/movimientos`
- Raw: [movimientos.png](screens/raw/movimientos.png)
- Anotada: [movimientos.png](screens/annotated/movimientos.png)
- Estado visible: Carga correctamente; la tabla es potente pero densa y varias descripciones quedan truncadas.

| Prioridad | Tipo | Hallazgo visible |
|---|---|---|
| P1 | UX | Las descripciones se cortan con ellipsis sin vista de detalle visible; afecta auditoría de movimientos. |
| P1 | UI Bug | La tabla ocupa todo el ancho y puede requerir scroll/lectura horizontal mental en pantallas menores. |
| P2 | UX | Filtros Todos/Ingresos/Egresos están claros, pero no muestra conteos por estado. |
| P2 | Componente | Validación AI aporta confianza, aunque el significado de colores no está explicado en pantalla. |

### Categorías

- Ruta: `/categorias`
- Raw: [categorias.png](screens/raw/categorias.png)
- Anotada: [categorias.png](screens/annotated/categorias.png)
- Estado visible: Carga correctamente; la vista resume bien, pero mezcla métricas, reglas y subcategorías en filas muy largas.

| Prioridad | Tipo | Hallazgo visible |
|---|---|---|
| P1 | UX | Filas con demasiadas métricas laterales; cuesta comparar gasto, porcentaje, reglas y subcategorías a la vez. |
| P1 | Redundancia | Los tabs y contadores compiten con las métricas de cada fila; jerarquía mejorable. |
| P2 | UI Bug | La columna derecha concentra números pequeños con bajo contraste. |
| P2 | Componente | El tab Sin Categorizar es clave y debería destacar el estado final aceptado. |

### Reportes

- Ruta: `/reportes`
- Raw: [reportes.png](screens/raw/reportes.png)
- Anotada: [reportes.png](screens/annotated/reportes.png)
- Estado visible: Carga correctamente; comunica el resultado, pero la tabla jerárquica necesita mejor lectura operativa.

| Prioridad | Tipo | Hallazgo visible |
|---|---|---|
| P1 | UX | Los porcentajes aparecen como 0% en múltiples filas, lo que reduce confianza en la lectura jerárquica. |
| P1 | UI Bug | La instrucción “interactúa con las filas” queda muy tenue y lejos del punto de acción. |
| P2 | Componente | KPIs superiores están bien separados y el resultado negativo se entiende rápido. |
| P2 | UX | Exportar está visible, pero no queda claro si exporta P&L completo o vista actual. |

### Análisis

- Ruta: `/analytics`
- Raw: [analytics.png](screens/raw/analytics.png)
- Anotada: [analytics.png](screens/annotated/analytics.png)
- Estado visible: Carga correctamente; es la pantalla con mayor densidad analítica y más riesgo de saturación visual.

| Prioridad | Tipo | Hallazgo visible |
|---|---|---|
| P1 | UX | Demasiados módulos analíticos compiten en el primer viewport; falta jerarquía de lectura. |
| P1 | UI Bug | La leyenda del donut queda cortada en la parte inferior del card. |
| P2 | Redundancia | Evolución Balance se repite respecto del dashboard sin diferenciar propósito. |
| P2 | UX | Lista Hormiga es útil pero tiene textos muy comprimidos para montos y frecuencia. |

### Insights

- Ruta: `/insights`
- Raw: [insights.png](screens/raw/insights.png)
- Anotada: [insights.png](screens/annotated/insights.png)
- Estado visible: Carga correctamente; aparecen valores en cero que contrastan con otros datos del sistema.

| Prioridad | Tipo | Hallazgo visible |
|---|---|---|
| P1 | UI Bug | Estado de salud muestra tasa de ahorro 0%, balance neto $0 e impacto anual $0; posible inconsistencia de datos. |
| P1 | UX | Toast “1 Issue” tapa parte del control visual inferior izquierdo. |
| P2 | Componente | Patrones de conducta están claros, pero confianza de 50% necesita explicación. |
| P2 | UX | Ritmo de gasto/proyección mezcla monto grande, barra y próximos cargos; revisar prioridad visual. |

### Auditoría

- Ruta: `/auditoria`
- Raw: [auditoria.png](screens/raw/auditoria.png)
- Anotada: [auditoria.png](screens/annotated/auditoria.png)
- Estado visible: Carga correctamente en estado vacío; el empty state es claro pero ocupa mucho espacio sin siguiente acción.

| Prioridad | Tipo | Hallazgo visible |
|---|---|---|
| P1 | UX | Estado vacío no ofrece acción siguiente ni explica cómo generar logs. |
| P2 | UI Bug | Tabla header queda visible aunque no hay filas; puede parecer contenido incompleto. |
| P2 | Componente | Actualizar logs está visible, pero no comunica si refrescó, falló o no encontró datos. |
| P2 | UX | El área vacía consume casi todo el viewport; podría compactarse con ayuda contextual. |

## Checklist de Corrección Sugerido

- [ ] P1: Evitar truncamiento de importes financieros críticos en Dashboard.
- [ ] P1: Resolver consistencia de datos en Insights cuando muestra valores $0/0%.
- [ ] P1: Definir si Cortex se oculta hasta estar listo o queda como módulo explícitamente experimental.
- [ ] P1: Agregar expansión/tooltip para descripciones truncadas en Movimientos.
- [ ] P1: Mejorar estados vacíos con acción siguiente, especialmente Auditoría.
- [x] P2: Reordenar jerarquía/densidad en Analytics y Categorías.
- [x] P2: Mejorar contraste de textos secundarios, ayudas e instrucciones.

## Validación

- Capturas raw generadas para las 7 rutas.
- Láminas anotadas generadas desde las capturas raw.
- Cada callout apunta a una zona visible en la captura.
- No se aplicaron cambios de UI en esta actividad.
