# CHECKLIST — INICIO DE REPO
> Se ejecuta una sola vez, al crear el proyecto nuevo.  
> En orden estricto. No se salta ningún paso.  
> Tori ejecuta los pasos marcados [TORI]. Claude ejecuta los marcados [CLAUDE].  
> No se toca `src/` hasta que todos los pasos estén completos.

---

## GATE PREVIO — ANTES DE CREAR EL REPO

Estos puntos deben estar resueltos antes de crear la primera carpeta:

- [ ] **[TORI]** La Visión está escrita y entregada a Claude
- [ ] **[CLAUDE]** La Misión fue devuelta con feedback crítico
- [ ] **[TORI]** Gate 1 aprobado — misión y stack confirmados
- [ ] **[TORI + CLAUDE]** Gate 2 aprobado — misión bloqueada y firmada
- [ ] **[ROSARIO]** PRD generado con Bloques Negros definidos
- [ ] **[CLAUDE]** Gate 3 aprobado — PRD y BN validados

**Si alguno de estos no está completo, no se crea el repo.**

---

## PASO 1 — CREAR LA CARPETA RAÍZ

- [ ] **[TORI]** Crear la carpeta del proyecto en la ubicación correcta del sistema local
- [ ] **[TORI]** Nombrar la carpeta con el código corto del proyecto (ej: `TAUROS`, `ARGOS`, `COCKPIT`)
- [ ] **[TORI]** Abrir Claude Code apuntando a esa carpeta

---

## PASO 2 — ARCHIVOS DE AGENTES (PRIMERO, SIEMPRE)

- [ ] **[CLAUDE]** Crear `CLAUDE.md` — copiar template y completar campos `[COMPLETAR]`
- [ ] **[TORI]** Completar campos `[TORI]` en `CLAUDE.md`
- [ ] **[CLAUDE]** Crear `ANTIGRAVITY.md` — copiar template y completar campos `[COMPLETAR]`
- [ ] **[TORI]** Completar campos `[TORI]` en `ANTIGRAVITY.md`
- [ ] **[CLAUDE]** Crear carpeta `.agents/`
- [ ] **[CLAUDE]** Crear `.agents/claude.md` — copiar template y completar
- [ ] **[CLAUDE]** Crear `.agents/gemini.md` — copiar template y completar

**`src/` no existe todavía. Es correcto.**

---

## PASO 3 — ESTRUCTURA DE CARPETAS

- [ ] **[CLAUDE]** Crear carpeta `docs/`
- [ ] **[CLAUDE]** Crear carpeta `src/` — vacía por ahora
- [ ] **[CLAUDE]** Crear carpeta `config/` — vacía por ahora
- [ ] **[CLAUDE]** Crear carpeta `mocks/` — vacía por ahora
- [ ] **[CLAUDE]** Crear carpeta `tests/` — vacía por ahora
- [ ] **[CLAUDE]** Crear `.gitignore` con: `.env`, `node_modules/`, `__pycache__/`, `.claude/`, archivos de build
- [ ] **[CLAUDE]** Crear `.env.example` con los nombres de variables de entorno requeridas (sin valores)

---

## PASO 4 — DOCUMENTOS LEY EN `docs/`

En este orden:

- [ ] **[CLAUDE]** Crear `docs/LEYES_DE_CODIGO.md` — copiar el documento universal (no se modifica)
- [ ] **[CLAUDE + TORI]** Crear `docs/PROJECT_CONTEXT.md` — completar todos los campos
- [ ] **[CLAUDE]** Crear `docs/TECNOLOGIAS.md` — completar con el stack de la Misión aprobada
- [ ] **[CLAUDE]** Crear `docs/ARQUITECTURA.md` — completar la estructura inicial (sin código todavía)
- [ ] **[CLAUDE]** Crear `docs/CONTRATOS_API.md` — definir los contratos del BN-001 antes de ejecutarlo
- [ ] **[CLAUDE]** Crear `docs/DECISIONES.md` — inicializar con ADR-001 (inicio del proyecto)
- [ ] **[CLAUDE]** Crear `docs/CHANGELOG.md` — inicializar con v0.1.0
- [ ] **[CLAUDE]** Crear `docs/README.md` — descripción del proyecto, cómo levantarlo, estado actual

---

## PASO 5 — VERIFICACIÓN ANTES DEL PRIMER CÓDIGO

- [ ] **[CLAUDE]** Verificar que `CLAUDE.md` no tiene campos `[COMPLETAR]` vacíos
- [ ] **[CLAUDE]** Verificar que `docs/LEYES_DE_CODIGO.md` está presente e intacto
- [ ] **[CLAUDE]** Verificar que `docs/CONTRATOS_API.md` tiene al menos un contrato definido
- [ ] **[CLAUDE]** Verificar que `.agents/gemini.md` tiene los BN asignados completos
- [ ] **[TORI]** Smoke check visual: la estructura de carpetas coincide con `ARQUITECTURA.md`

---

## GATE 4 — LECTURA DE LEYES

- [ ] **[CLAUDE]** Confirmar: "Leí `docs/LEYES_DE_CODIGO.md` completo. Estoy listo para ejecutar."
- [ ] **[TORI → GEMINI]** Pegar `ANTIGRAVITY.md` completo al inicio de la sesión de Gemini
- [ ] **[GEMINI]** Confirmar: "Leí el briefing completo. Track [A/B] listo para BN-[número]."

**Recién acá empieza el código.**

---

## ESTRUCTURA FINAL ESPERADA ANTES DEL PRIMER BN

```
[NOMBRE-PROYECTO]/
├── CLAUDE.md                    ✓
├── ANTIGRAVITY.md               ✓
├── .agents/
│   ├── claude.md                ✓
│   └── gemini.md                ✓
├── .gitignore                   ✓
├── .env.example                 ✓
├── docs/
│   ├── README.md                ✓
│   ├── LEYES_DE_CODIGO.md       ✓
│   ├── PROJECT_CONTEXT.md       ✓
│   ├── TECNOLOGIAS.md           ✓
│   ├── ARQUITECTURA.md          ✓
│   ├── CONTRATOS_API.md         ✓
│   ├── DECISIONES.md            ✓
│   └── CHANGELOG.md             ✓
├── src/                         (vacío — listo para BN-001)
├── config/                      (vacío)
├── mocks/                       (vacío)
└── tests/                       (vacío)
```

**Si esta estructura no coincide con lo que ves en pantalla, algo salió mal. Resolver antes de continuar.**

---

*Proyecto: `[COMPLETAR]`*  
*Fecha de inicio: `[COMPLETAR]`*  
*Ejecutado por: Tori + Claude*
