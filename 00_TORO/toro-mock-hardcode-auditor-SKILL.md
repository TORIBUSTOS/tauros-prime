# SKILL: toro-mock-hardcode-auditor-SKILL v1.0

## PURPOSE
Detectar mocks, hardcode, placeholders y datos falsamente dinámicos.

## INPUT
- Código
- JSON
- Screenshot
- API responses

## DETECCIÓN

### A. MOCKS
- mock.ts / fakeData
- arrays fijos
- funciones con datos constantes

### B. HARDCODE
- valores repetidos
- fechas fijas
- porcentajes sin cálculo

### C. PLACEHOLDERS
- lorem ipsum
- test/demo
- labels genéricos

### D. FALSE LIVE
- “en línea” sin datos reales
- dashboards que no cambian

## EVIDENCE
CONFIRMED / PROBABLE / POSSIBLE

## OUTPUT

### Data Integrity Audit Summary
Estado: OK / WARNING / ERROR

### Findings
- Evidencia:
- Impacto:
- Validación:

### Final Verdict
REAL / MIXED / MOCKED
