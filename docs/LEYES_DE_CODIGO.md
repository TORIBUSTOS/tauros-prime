# LEYES_DE_CODIGO.md — Leyes Universales de TORO LAB

> Estos principios son inamovibles. Ignorarlos es deuda técnica inmediata.

---

## 1. La Ley del Checklist
**"No se toca `src/` hasta que el `implementation_plan.md` esté aprobado."**
- Cada tarea debe seguir el flujo: Investigación → Plan → Aprobación → Ejecución → Verificación.

## 2. La Ley de la Limpieza (Zero Hardcoding)
**"Todo valor variable vive en `config/` o en la Base de Datos."**
- Prohibido: `if category == "Sueldos":`.
- Permitido: `if category in settings.CATEGORIES_REQUIRING_TAGS:`.

## 3. La Ley de la Responsabilidad Única
**"Una función, una responsabilidad. Un archivo, un propósito."**
- Si una función tiene más de 20 líneas, probablemente está haciendo demasiado.
- Modularidad absoluta para facilitar el testing.

## 4. La Ley del Test Previo (TDD en Espíritu)
**"Código no testeado es código que no existe."**
- Backend: Coverage >85% (Pytest).
- Frontend: Coverage >70% (Vitest).
- Los "Happy Paths" de cada Bloque Negro (BN) deben estar cubiertos al 100%.

## 5. La Ley de la Transmutabilidad UI
**"El diseño debe ser premium, pero el código debe ser agnóstico al framework de CSS."**
- Uso de CSS Vanilla y Variables CSS para permitir cambios de skin sin tocar la lógica del componente.

## 6. La Ley de los Bloques Negros
**"Cada BN se entrega completo: Código + Tests + Documentación + Walkthrough."**
- No se deja un BN "a medias" para empezar otro.

## 7. La Ley de la Verdad Única (SSOT)
**"La documentación y el código deben coincidir. Si no, la documentación manda."**
- El código se corrige para cumplir con el contrato definido en `docs/`.

---

*Versión: 2.0 (Protocolo TORO LAB)*
