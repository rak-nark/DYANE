# Document Versioning Algorithm

## Modelo de datos

### Document
Representa la identidad de una página.

```json
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
```

### DocumentVersion
Representa cómo estaba esa página en un momento determinado.

```json
{
  "documentId": "dynatrace-doc-123",
  "version": 3,
  "retrievedAt": "2026-08-19T23:00:00Z",
  "contentHash": "abc123...",
  "content": "...",
  "metadata": {}
}
```

## Algoritmo

```
CRAWLER
   │
   ↓
Obtener documento
   │
   ↓
Normalizar contenido
   │
   ↓
Calcular SHA-256
   │
   ↓
¿Existe el documento?
      /        \
    NO          SÍ
    │            │
    ↓            ↓
Version 1    comparar hash
                   │
              ┌────┴────┐
              │         │
            IGUAL    DIFERENTE
              │         │
              ↓         ↓
            Nada    nueva versión
```

## Flujo detallado

### 1. Crawler visita una página
El crawler obtiene el contenido crudo de la fuente (ej: Dynatrace Docs).

### 2. Normalización
Se limpia el contenido: se eliminan elementos de UI, se preserva solo el texto relevante.

### 3. Cálculo de hash
Se calcula SHA-256 sobre el contenido normalizado.

```
SHA-256("contenido normalizado") → "abc123..."
```

### 4. Comparación

| Escenario | Acción |
|---|---|
| Documento no existe | Crear Document + Version 1 |
| Hash igual | No hacer nada |
| Hash diferente | Crear nueva version (N+1) |

### 5. Detección de cambios
Cuando se crea una nueva version, se puede generar un diff contra la version anterior para identificar:
- Contenido agregado
- Contenido modificado
- Contenido eliminado

## Tipos TypeScript

Ver `ui/app/types/document.ts`.

## Decisiones pendientes

- **Almacenamiento**: ¿Grail o almacenamiento externo (PostgreSQL + pgvector)?
- **Normalización**: ¿Qué elementos se eliminan del contenido crudo?
- **Diff**: ¿Qué librería se usa para generar diffs?
- **Retención**: ¿Cuántas versiones se mantienen?
