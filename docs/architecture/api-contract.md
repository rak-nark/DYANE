# DYANE API Contract

API interna de DYANE. Define la responsabilidad de cada endpoint antes de su implementación.

## Endpoints

| Endpoint | Método | Responsabilidad | Estado |
|---|---|---|---|
| `/api/health` | GET | Estado de DYANE | Implementado |
| `/api/documents` | GET | Listar documentos sincronizados | Pendiente |
| `/api/documents/:id` | GET | Documento con sus versiones | Pendiente |
| `/api/documents/:id/versions/:version` | GET | Versión específica de un documento | Pendiente |
| `/api/documents/:id/diff` | GET | Diff entre dos versiones | Pendiente |
| `/api/search` | POST | Búsqueda semántica | Pendiente |
| `/api/changes` | GET | Cambios detectados | Pendiente |
| `/api/sync` | POST | Disparar sincronización | Pendiente |

## Detalle de responsabilidades

### GET /api/health
Retorna el estado operativo de DYANE.

```json
{
  "status": "online",
  "timestamp": "2026-08-19T19:47:32.000Z",
  "environment": "Dynatrace",
  "appName": "DYANE",
  "appVersion": "0.0.0"
}
```

### GET /api/documents
Lista documentos sincronizados.

**Query params:** `page`, `limit`, `source`, `category`

```json
{
  "documents": [
    {
      "id": "dynatrace-doc-123",
      "url": "https://docs.dynatrace.com/...",
      "title": "Example",
      "source": "dynatrace-docs",
      "category": "getting-started",
      "currentVersion": 3,
      "createdAt": "2026-08-19T00:00:00Z",
      "updatedAt": "2026-08-19T23:00:00Z"
    }
  ],
  "total": 42
}
```

### GET /api/documents/:id
Retorna un documento con todas sus versiones.

```json
{
  "id": "dynatrace-doc-123",
  "url": "https://docs.dynatrace.com/...",
  "title": "Example",
  "source": "dynatrace-docs",
  "category": "getting-started",
  "currentVersion": 3,
  "createdAt": "2026-08-19T00:00:00Z",
  "updatedAt": "2026-08-19T23:00:00Z",
  "versions": [
    {
      "documentId": "dynatrace-doc-123",
      "version": 1,
      "retrievedAt": "2026-08-17T10:00:00Z",
      "contentHash": "abc123...",
      "content": "...",
      "metadata": {}
    },
    {
      "documentId": "dynatrace-doc-123",
      "version": 2,
      "retrievedAt": "2026-08-18T10:00:00Z",
      "contentHash": "def456...",
      "content": "...",
      "metadata": {}
    }
  ]
}
```

### GET /api/documents/:id/versions/:version
Retorna una versión específica de un documento.

```json
{
  "documentId": "dynatrace-doc-123",
  "version": 2,
  "retrievedAt": "2026-08-18T10:00:00Z",
  "contentHash": "def456...",
  "content": "...",
  "metadata": {}
}
```

### GET /api/documents/:id/diff
Compara dos versiones y retorna las diferencias.

**Query params:** `from` (version), `to` (version)

```json
{
  "documentId": "dynatrace-doc-123",
  "fromVersion": 1,
  "toVersion": 2,
  "changes": [
    { "type": "added", "content": "Nueva sección sobre configuración" },
    { "type": "modified", "content": "Actualizado parámetro timeout" },
    { "type": "removed", "content": "Eliminada sección obsoleta" }
  ],
  "summary": "Se agregó X, se modificó Y, se eliminó Z"
}
```

### POST /api/search
Búsqueda semántica sobre documentación.

```json
{
  "query": "cómo configurar alertas",
  "filters": { "source": "dynatrace-docs", "category": "alerts" }
}
```

```json
{
  "results": [
    {
      "documentId": "dynatrace-doc-456",
      "title": "Alert Configuration",
      "relevance": 0.95,
      "snippet": "Para configurar alertas..."
    }
  ],
  "total": 5
}
```

### GET /api/changes
Lista cambios detectados en documentación.

**Query params:** `since`, `source`

```json
{
  "changes": [
    {
      "documentId": "dynatrace-doc-123",
      "title": "Example",
      "fromVersion": 1,
      "toVersion": 2,
      "detectedAt": "2026-08-18T10:00:00Z",
      "summary": "Contenido actualizado"
    }
  ],
  "total": 12
}
```

### POST /api/sync
Dispara sincronización de documentación.

```json
{
  "source": "dynatrace-docs",
  "force": false
}
```

```json
{
  "syncId": "sync-001",
  "status": "started",
  "estimatedDuration": "30s"
}
```

## Tipos TypeScript

Ver `ui/app/types/document.ts` para los modelos `Document` y `DocumentVersion`.

## Algoritmo de versionado

Ver `docs/architecture/versioning.md` para el flujo completo del crawler.

## Patrón de implementación

```
React → useAppFunction({ name: 'endpointName' }) → App Function → Response
```
