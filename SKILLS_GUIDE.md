# SKILLS_GUIDE.md — Custom Skills para TORO_Prime

**Instalados**: 2026-04-09 por Antigravity  
**Ubicación**: `.agents/skills/`

---

## 🔧 Skill 1: code-documentation-doc-generate

**Propósito**: Generar automáticamente documentación desde código (API docs, architecture, guides)

**Cuándo usarlo**:
- ✅ Generar/actualizar API documentation desde código
- ✅ Crear architecture diagrams desde análisis de código
- ✅ Estandarizar docs across el repositorio
- ✅ Crear "living documentation" que sync con código

**Cuándo NO usarlo**:
- ❌ El proyecto no tiene codebase
- ❌ Solo necesitas explicación ad-hoc
- ❌ No tienes acceso a código o requirements

**Caso de Uso para TORO_Prime**:

Post S1-Sprint (cuando tests pasen y schema esté correcto):
```bash
/code-documentation-doc-generate

Generar:
- API Documentation: Endpoints `/api/import`, `/api/movements`, `/api/insights`, `/api/forecast`, `/api/summary`, `/api/reports/periods`, `/api/reports/pl`
- Architecture Diagrams: Backend layers, data flow, service interactions
- User Guide: Cómo importar datos, interpretar insights, usar forecast
- Technical Reference: Schema, Pydantic models, ForecastService, InsightsService
```

**Output esperado**:
- `docs/API.md` - Documentación de endpoints
- `docs/ARCHITECTURE_DIAGRAMS.md` - Diagramas (mermaid)
- `docs/USER_GUIDE.md` - Guía para usuarios
- `docs/TECHNICAL_REFERENCE.md` - Referencia técnica

---

## 🎨 Skill 2: ui-visual-validator

**Propósito**: Validación visual rigurosa de UI (diseño, accesibilidad, visual regression)

**Fortalezas**:
- Screenshot analysis con precisión pixel-perfect
- Visual regression testing (Chromatic, Percy, etc.)
- Design system compliance verification
- Accessibility validation (WCAG 2.1/2.2)
- Cross-browser visual consistency
- Responsive design breakpoint testing

**Cuándo usarlo**:
- ✅ Validar que implementación UI cumple design goals
- ✅ Verificar design system compliance (Imperial Tech)
- ✅ Test accessibility (contrast ratios, focus indicators)
- ✅ Validar responsive design en breakpoints
- ✅ Visual regression testing antes de merge

**Cuándo NO usarlo**:
- ❌ Task no es visual validation related
- ❌ No tienes screenshots o visual evidence

**Caso de Uso para TORO_Prime**:

Post S2-Sprint (cuando UI improvements se implementen):

**A2: Notificaciones (Toasts Imperial)**
```bash
/ui-visual-validator

Validar:
- Toast component renders con estética Glassmorphism ✅
- Bordes dorados sutiles presentes ✅
- Posición superior derecha correcta ✅
- Color scheme matches Imperial Tech palette ✅
- Accessibility: WCAG contrast ratios OK ✅
- Focus indicators visible y styled correctamente ✅
- Responsive: Toast visible en mobile/tablet ✅
```

**A3: Drill-down (Context Linkage)**
```bash
/ui-visual-validator

Validar:
- Clickear "Suscripciones" en P&L → Navega correctamente ✅
- Filtro `categoria=Suscripciones` pre-aplicado en MovimientosTable ✅
- Breadcrumb muestra navegación ✅
- Back button retorna a reporte ✅
- Visual hierarchy mantiene consistencia ✅
```

**A4: Global State Optimization**
```bash
/ui-visual-validator

Validar:
- Dashboard carga al unísono (sin staggered loads) ✅
- Skeleton states mantienen layout estructura ✅
- No layout shifts (CLS = 0) ✅
- Loading feedback visible pero no intrusivo ✅
- Final content aparece sin jank ✅
```

**Output esperado**:
- Visual regression report (si usas Percy/Chromatic)
- Accessibility audit results (contrast, focus, keyboard nav)
- Responsive breakpoint validation report
- Edge case findings (error states, loading states)
- Remediation recommendations

---

## 📋 Workflow: Usando ambos skills en Sprint 2

```
SPRINT 2 WORKFLOW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. S2-1: Implementar A2 (Notificaciones)
   ↓
   /ui-visual-validator → Validar Toasts
   ↓
   PRs approved si visual validation pasa

2. S2-2: Implementar A3 (Drill-down)
   ↓
   /ui-visual-validator → Validar navegación + visual linkage
   ↓
   PRs approved si navigation works + visual OK

3. Post S2: Documentación Final
   ↓
   /code-documentation-doc-generate → Generar docs finales
   ↓
   Generar API + Architecture + User Guide
   ↓
   Beta release ready ✅
```

---

## 🚀 Integración en CI/CD

**Para futuro**: Agregar a GitHub Actions

```yaml
# .github/workflows/visual-validation.yml
name: Visual Validation

on: [pull_request]

jobs:
  validate-ui:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run UI Visual Validator
        run: claude-code /ui-visual-validator
      - name: Upload visual diff
        if: failure()
        uses: actions/upload-artifact@v2
        with:
          name: visual-diffs
          path: visual-diffs/
```

---

## 📚 Referencias Rápidas

| Skill | Cuándo | Output |
|-------|--------|--------|
| **code-documentation-doc-generate** | Post tests passing | API docs + Architecture + Guides |
| **ui-visual-validator** | Post UI implementation | Visual reports + Accessibility audit |

---

**Instalado por**: Antigravity  
**Próximo uso**: Sprint 2 UI improvements  
**Versión**: 2026-04-09
