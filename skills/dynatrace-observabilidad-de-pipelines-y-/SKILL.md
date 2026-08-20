---
name: dynatrace-observabilidad-de-pipelines-y-
description: Procedimientos operativos, comandos y consultas DQL para Observabilidad de pipelines y eventos SDLC en Dynatrace. Basada en documentación oficial de Dynatrace Docs. Úsala cuando pidan "Observabilidad de pipelines y eventos SDLC", "operar openpipeline", "configurar openpipeline" o diagnosticar componentes relacionados.
---

# DYNATRACE OBSERVABILIDAD DE PIPELINES Y 

Esta skill proporciona las instrucciones técnicas, validaciones y procedimientos estandarizados para **Observabilidad de pipelines y eventos SDLC** en Dynatrace.

## 1. Fuentes Oficiales de Evidencia

Esta skill ha sido generada y validada contra la documentación oficial de Dynatrace:
- [Analyze SDLC events from your pipeline — Dynatrace Docs](https://docs.dynatrace.com/docs/deliver/pipeline-observability-sdlc-events/pipeline-observability-analyze) (*openpipeline*)
- [Pipeline observability — Dynatrace Docs](https://docs.dynatrace.com/docs/deliver/pipeline-observability-sdlc-events) (*openpipeline*)
- [Test pipeline observability — Dynatrace Docs](https://docs.dynatrace.com/docs/deliver/test-pipeline-observability) (*openpipeline*)

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
