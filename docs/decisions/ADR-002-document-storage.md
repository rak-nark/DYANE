# ADR-002: Document Storage Strategy

## Estado

**Pendiente de investigación**

## Contexto

DYANE necesita almacenar documentos y sus versiones. El contenido puede crecer significativamente.

## Opciones evaluadas

### Opción A — Grail

Almacenar documentos en Dynatrace/Grail.

**Ventajas:**
- Dentro del ecosistema Dynatrace
- Integración natural con AppEngine
- Consultable desde la plataforma
- Observabilidad del crawler integrada

**Riesgos:**
- Capacidad de almacenamiento desconocida para este caso de uso
- Coste potencial por volumen
- Limitaciones de API para escritura masiva

### Opción B — Almacenamiento externo

PostgreSQL + pgvector u otra base de datos externa.

**Ventajas:**
- Libertad total de esquema
- Excelente para documentos/versiones
- Cómodo para RAG posterior
- Separación Knowledge Engine ↔ Dynatrace App

**Riesgos:**
- Infraestructura adicional
- Mantenimiento propio
- Integración más compleja

## Decisión

**No decidir todavía.**

Primero realizar una prueba pequeña en el entorno Dynatrace para determinar:
1. Capacidades de almacenamiento persistente disponibles
2. Límites de volumen y escritura
3. Coste real para el caso de uso de documentación versionada

## Criterios de decisión futuros

- Volumen esperado de documentos
- Frecuencia de actualización
- Necesidad de búsqueda semántica (RAG)
- Coste operativo
- Complejidad de integración
