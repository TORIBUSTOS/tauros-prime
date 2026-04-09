# TECNOLOGIAS.md — Stack Técnico de TORO_Prime

> Documento definitorio del stack. FIJO hasta nueva ADR.

## Stack Summary

| Capa | Tecnología | Versión | Justificación |
|:---|:---|:---|:---|
| **Backend** | FastAPI | ^0.104 | Async, OpenAPI nativo, desarrollo rápido |
| **Runtime Backend** | Python | 3.12+ | Data science ready, ORM maduro |
| **DB** | SQLite | v3 | Local, simple, suficiente para single-user |
| **ORM** | SQLAlchemy | ^2.0 | Type-safe, migraciones, relaciones |
| **Frontend** | Next.js | 14+ | App Router, SSR/CSR flexible, modern DX |
| **Runtime Frontend** | Node.js | 18+ | Ecosystem maduro |
| **Styling** | CSS Vanilla + Variables | - | Control total, performance, no dependencias |
| **HTTP Client** | Axios | ^1.6 | Control total, interceptores |
| **Testing Backend** | Pytest | ^7.0 | Gold standard en Python |
| **Testing Frontend** | Vitest + RTL | ^1.0 | Fast, ESM, React Testing Library |

---
*Versión: 1.0 (Reflejando prd/TECNOLOGIAS.md)*
