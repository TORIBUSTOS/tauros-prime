# CHECKLIST DE GATES — TORO LAB v2
> Un Gate es un punto de control que no se puede saltar.  
> Si un Gate no pasa, el pipeline se pausa. No se avanza, no se improvisa.  
> Responsable de verificar cada Gate: Claude (CTO) + Tori (Director)

---

## GATE 1 — Misión y Stack Confirmados
**Momento:** Al final de la Fase 2 (Misión)  
**Quién aprueba:** Tori

- [ ] La Visión de Tori fue recibida y leída por Claude
- [ ] Claude devolvió feedback crítico — riesgos, supuestos, trade-offs
- [ ] El stack técnico está propuesto y justificado
- [ ] Los skills de inicio están seleccionados
- [ ] El scope está validado — ¿está dentro de la capacidad del LAB?
- [ ] Tori aprobó la misión y el stack explícitamente

**Tori dice:** "Gate 1 aprobado" → se avanza a Fase 3  
**Si algo falla:** se vuelve a Fase 2, Claude ajusta la Misión

---

## GATE 2 — Misión Bloqueada y Firmada
**Momento:** Al final de la Fase 3 (Refinamiento)  
**Quién aprueba:** Tori + Claude

- [ ] Tori y Claude iteraron hasta que la Misión cierra
- [ ] No quedan preguntas abiertas sobre el scope
- [ ] No quedan preguntas abiertas sobre el stack
- [ ] Ambos acuerdan que lo que está escrito es lo que se va a construir
- [ ] La Misión está redactada en un documento (no solo en el chat)

**Tori dice:** "Gate 2 aprobado. Misión bloqueada." → se avanza a Fase 4  
**Regla:** Nada cambia después de este Gate sin un nuevo acuerdo explícito documentado en `DECISIONES.md`

---

## GATE 3 — PRD y Bloques Negros Aprobados
**Momento:** Al final de la Fase 4 (PRD)  
**Quién aprueba:** Claude valida → Tori aprueba

### Checklist de Claude sobre el PRD:
- [ ] El PRD tiene user stories con acceptance criteria claros
- [ ] Los edge cases están contemplados
- [ ] Los Bloques Negros tienen input/output definido
- [ ] Cada BN es independiente y ejecutable por separado
- [ ] Los BN no tienen dependencias circulares
- [ ] Ningún BN implica hardcoding implícito
- [ ] El stack de los BN coincide con el aprobado en Gate 1
- [ ] Los BN están ordenados por dependencias (cuál va primero)

### Checklist de Tori sobre los BN:
- [ ] Los BN describen lo que yo quiero construir
- [ ] El scope no se expandió sin mi conocimiento
- [ ] Entiendo qué hace cada BN en lenguaje de negocio
- [ ] Apruebo el orden de ejecución propuesto

**Claude dice:** "PRD validado" → Tori dice: "Gate 3 aprobado" → se crea el repo

---

## GATE 4 — Leyes Leídas, Repo Listo
**Momento:** Al final de la Fase 5 (Repo) y Fase 6 (Leyes)  
**Quién verifica:** Claude

### Estructura del repo:
- [ ] `CLAUDE.md` existe y no tiene campos vacíos
- [ ] `ANTIGRAVITY.md` existe y no tiene campos vacíos
- [ ] `.agents/claude.md` existe con BN asignados
- [ ] `.agents/gemini.md` existe con BN asignados
- [ ] `docs/LEYES_DE_CODIGO.md` presente e intacto
- [ ] `docs/PROJECT_CONTEXT.md` completo
- [ ] `docs/TECNOLOGIAS.md` con versiones fijadas
- [ ] `docs/ARQUITECTURA.md` con estructura inicial
- [ ] `docs/CONTRATOS_API.md` con al menos un contrato
- [ ] `docs/DECISIONES.md` con ADR-001
- [ ] `docs/CHANGELOG.md` inicializado con v0.1.0
- [ ] `docs/README.md` con descripción y cómo levantar
- [ ] `.gitignore` correcto — `.env` incluido
- [ ] `src/` vacío y listo

### Confirmación de agentes:
- [ ] Claude confirma lectura de `LEYES_DE_CODIGO.md`
- [ ] Gemini confirma lectura de `ANTIGRAVITY.md` (Tori verifica en la sesión)

**Claude dice:** "Gate 4 completo. Repo listo. Agentes listos. Primer BN autorizado." → empieza Fase 8

---

## GATE 5 — Cierre de Bloque Negro
**Momento:** Al completar cada BN individual  
**Quién verifica:** Claude + Tori

*(Copiar este bloque por cada BN completado)*

### BN-[número] — [nombre]

**Reporte de Gemini recibido:** [ ] Sí / [ ] No  
**Track:** [ ] A Backend / [ ] B Frontend

### Checklist de Claude:
- [ ] El código cumple todas las leyes de `LEYES_DE_CODIGO.md`
- [ ] Sin hardcoding de ningún tipo
- [ ] Los contratos de `CONTRATOS_API.md` están respetados
- [ ] La responsabilidad del módulo es única
- [ ] Input/output del BN coincide con lo definido en el PRD
- [ ] No se agregaron dependencias sin ADR aprobado
- [ ] No se tocaron carpetas fuera del scope asignado al agente
- [ ] `CHANGELOG.md` actualizado con este BN
- [ ] `ARQUITECTURA.md` actualizado si la estructura cambió

### Smoke test de Tori:
- [ ] Lo que veo en pantalla coincide con lo que pedí en el BN
- [ ] No hay comportamientos inesperados obvios
- [ ] El BN conecta bien con los anteriores

**BN-[número] marcado como:** ✓ Completo / ✗ Requiere corrección  
**Observaciones:** `[COMPLETAR si hay algo a resolver]`

---

## GATE RELEASE — Cierre de Versión
**Momento:** Al final de la Fase 9  
**Quién aprueba:** Tori

- [ ] Todos los BN de esta versión marcados como ✓ Completo
- [ ] `docs/README.md` refleja el estado actual del sistema
- [ ] `docs/ARQUITECTURA.md` refleja el código real
- [ ] `docs/DECISIONES.md` tiene todos los ADRs de esta versión
- [ ] `docs/CHANGELOG.md` tiene todas las entradas de esta versión
- [ ] Versión taggeada en git
- [ ] Claude entregó propuesta de backlog para el próximo ciclo
- [ ] Tori aprobó o ajustó el backlog propuesto

**Tori dice:** "Release aprobado." → Proyecto en estado "Versión Final Por Ahora"

---

*TORO LAB v2 · Sin gates no hay pipeline, solo caos con buenas intenciones.*
