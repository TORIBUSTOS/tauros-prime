# DECISIONES.md — Log de Decisiones Arquitectónicas
> ADR: Architecture Decision Record  
> Cada decisión importante que afecte el diseño, el stack o el scope se documenta aquí.  
> Este documento nunca se borra. Las decisiones superadas se marcan como Superadas, no se eliminan.  
> Responsable de mantenerlo: Claude (CTO)

---

## CÓMO LEER ESTE DOCUMENTO

Cada entrada tiene un estado:

- 🟢 **Activa** — decisión vigente, se aplica hoy
- 🟡 **En revisión** — se está cuestionando, no cambió todavía
- ⚫ **Superada** — fue reemplazada por otra decisión (se indica cuál)
- 🔴 **Rechazada** — se evaluó y se descartó (se documenta el motivo)

---

## FORMATO DE ENTRADA ADR

Copiar este bloque por cada decisión nueva.

---

### ADR-[número] — [Título corto de la decisión]

**Fecha:** `[YYYY-MM-DD]`  
**Estado:** `🟢 Activa`  
**Propuesta por:** `[Tori / Claude / Rosario / Gemini]`  
**Aprobada por:** `[Tori / Claude]`

**Contexto:**  
`¿Qué situación o problema generó esta decisión? ¿Qué restricciones existían?`

**Decisión:**  
`¿Qué se decidió hacer exactamente?`

**Alternativas evaluadas:**

| Alternativa | Por qué se descartó |
|-------------|-------------------|
| `[opción]` | `[razón]` |
| `[opción]` | `[razón]` |

**Consecuencias:**  
`¿Qué implica esta decisión? ¿Qué se gana? ¿Qué se resigna?`

**BN relacionados:** `[BN-001, BN-002 — o Ninguno si es pre-código]`

---

## REGISTRO DE DECISIONES

---

### ADR-001 — Inicio del proyecto

**Fecha:** `[COMPLETAR]`  
**Estado:** 🟢 Activa  
**Propuesta por:** Tori  
**Aprobada por:** Tori + Claude

**Contexto:**  
Proyecto iniciado bajo el Protocolo TORO LAB v2. Stack y scope definidos en la Misión aprobada.

**Decisión:**  
Arrancar el proyecto con el stack definido en `docs/TECNOLOGIAS.md` y el scope de la Misión bloqueada.

**Alternativas evaluadas:**  
No aplica — decisión de inicio.

**Consecuencias:**  
El stack es fijo hasta nueva decisión documentada aquí. Cualquier cambio requiere nuevo ADR.

**BN relacionados:** Ninguno — pre-código.

---

*Las próximas decisiones se agregan debajo en orden cronológico.*

---

*Última actualización: `[COMPLETAR]`*
