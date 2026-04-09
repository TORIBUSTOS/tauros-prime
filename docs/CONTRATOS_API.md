# CONTRATOS_API.md — Definición de Endpoints

## Backend Base URL: `http://localhost:9000/api`

### BN-001: Importación y Categorización

#### `POST /import`
- **Descripción**: Sube un archivo Excel/CSV para procesar movimientos.
- **Request**: Multipart/form-data (file).
- **Response** (201 Created):
  ```json
  {
    "batch_id": "uuid",
    "total_movimientos": 150,
    "importados": 148,
    "duplicados": 2
  }
  ```

### BN-004: API REST General

#### `GET /movements`
- **Params**: `period` (YYYY-MM), `category_id` (optional).
- **Response**: Listado de movimientos categorizados.

#### `GET /insights`
- **Params**: `period` (YYYY-MM).
- **Response**: Insights detectados (patrones, anomalías).

#### `GET /forecast`
- **Params**: `months` (default 3).
- **Response**: Proyección de flujo de caja.

---
*Versión: 0.1 (Borrador de Contratos)*
