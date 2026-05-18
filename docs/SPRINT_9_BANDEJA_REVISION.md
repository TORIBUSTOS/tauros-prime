# Sprint 9 - Bandeja de Revision de Insights

Fecha de cierre: 2026-05-18

## Objetivo

Crear una primera interfaz operativa para revisar los candidatos generados por el Canon TAUROS de Insights, sin modificar el motor ni convertir automaticamente criterios en reglas.

## Resultado

- **Estado**: cerrado.
- **Pantalla integrada**: `/auditoria`.
- **Candidatos pendientes visibles**: 24.
- **Movimientos sin categoria visibles**: 1.
- **Acciones disponibles**: aprobar, rechazar, ignorar, convertir a regla.
- **Trazabilidad**: cada cambio de estado genera un `audit_log` con acción `revision_insight`.

## Implementacion

### Frontend

- Nuevo componente `frontend/src/components/insights/InsightReviewQueue.tsx`.
- Integracion en `frontend/src/app/auditoria/page.tsx`.
- Nuevos clientes API en `frontend/src/services/api.service.ts`:
  - `getInsightCandidates`
  - `updateInsightCandidateReview`
  - `getUncategorizedReviewQueue`
  - `evaluateInsightsEngine`
- Tipos nuevos en `frontend/src/types/api.ts`:
  - `InsightCandidate`
  - `InsightReviewStatus`
  - `InsightEvaluationResponse`

### Backend

- `PATCH /api/insights-engine/candidates/{candidate_id}/review` ahora registra auditoria cuando cambia el estado.
- La auditoria conserva:
  - estado anterior;
  - estado nuevo;
  - periodo analizado;
  - regla disparadora;
  - titulo del candidato.

## Flujo Operativo

1. TAUROS muestra candidatos `pending` en `/auditoria`.
2. El usuario decide si el candidato es señal real o ruido.
3. La acción actualiza `estado_revision`.
4. El cambio queda trazado en historial de auditoria.
5. Los movimientos sin categoria aparecen como bandeja especial.

## Validaciones

- Backend: `97 passed`.
- Frontend API tests: `19 passed`.
- Frontend build: OK.
- Endpoint local `/api/insights-engine/candidates?estado_revision=pending`: 24.
- Endpoint local `/api/insights-engine/review/uncategorized`: 1.
- Página local `/auditoria`: HTTP 200.

## Pendiente Para Siguiente Sprint

SP9 deja la bandeja funcional. El próximo paso es mejorar el flujo de conversion real a regla:

- Si el usuario marca `converted_to_rule`, abrir formulario guiado con patrón, categoría y subcategoría.
- Conectar esa conversión con `POST /api/rules/from-movement` o una ruta específica para candidatos.
- Mostrar historial de decisiones por candidato.
