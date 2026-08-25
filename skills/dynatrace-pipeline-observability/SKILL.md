---
name: dynatrace-pipeline-observability
description: Procedimientos operativos, comandos y consultas DQL para Observabilidad de pipelines y eventos SDLC en Dynatrace. Basada en documentación oficial de Dynatrace Docs. Úsala cuando pidan "Observabilidad de pipelines y eventos SDLC", "operar openpipeline", "configurar openpipeline" o diagnosticar componentes relacionados.
---

# DYNATRACE PIPELINE OBSERVABILITY

Esta skill proporciona las instrucciones técnicas, validaciones y procedimientos estandarizados para **Observabilidad de pipelines y eventos SDLC** en Dynatrace.

## 1. Fuentes Oficiales de Evidencia

Esta skill ha sido generada y validada contra la documentación oficial de Dynatrace:
- [Settings API - Ingest pipelines configuration (events.sdlc) schema table — Dynatrace Docs](https://docs.dynatrace.com/docs/dynatrace-api/environment-api/settings/schemas/builtin-openpipeline-events-sdlc-pipelines) (*openpipeline*)
- [Observe GitLab pipelines and merge requests with Dashboards and SDLC events — Dynatrace Docs](https://docs.dynatrace.com/docs/deliver/pipeline-observability-sdlc-events/tutorials/pipeline-observability-use-case-gitlab) (*openpipeline*)
- [Observe Azure DevOps pipelines and pull requests with Dashboards and SDLC events — Dynatrace Docs](https://docs.dynatrace.com/docs/deliver/pipeline-observability-sdlc-events/tutorials/pipeline-observability-use-case-azdo) (*openpipeline*)
- [Settings API - Ingest pipelines configuration (application.snapshots) schema table — Dynatrace Docs](https://docs.dynatrace.com/docs/dynatrace-api/environment-api/settings/schemas/builtin-openpipeline-application-snapshots-pipelines) (*openpipeline*)

## 2. Consultas y Comandos Operativos

A continuación se presentan los comandos y consultas verificados para este dominio:

```powershell
# Consultar estado vía CLI dtx
.\dtx.cmd dql "fetch dt.entity.openpipeline | limit 10"
```

## 3. Procedimiento Operativo Paso a Paso

1. **Identificación y Descubrimiento:**
   - Comprobar la existencia de entidades y estado en Grail o mediante el CLI `dtx`.
2. **Diagnóstico y Telemetría:**
   - Ejecutar consultas DQL acotadas con filtros de tiempo y dimensiones específicas.
3. **Validación de Configuración y Alertas:**
   - Verificar la consistencia con las mejores prácticas documentadas en las referencias técnicas.

## 4. Trazabilidad y Validación Documental

- La evidencia técnica, fragmentos de código originales y enlaces de respaldo se encuentran registrados en `references/evidence.json`.
