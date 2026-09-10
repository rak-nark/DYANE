---
name: dynatrace-pipeline-observability
description: Procedimientos operativos, comandos y consultas DQL para Observabilidad de pipelines y eventos SDLC en Dynatrace. Basada en documentación oficial de Dynatrace Docs. Úsala cuando pidan "Observabilidad de pipelines y eventos SDLC", "operar openpipeline", "configurar openpipeline" o diagnosticar componentes relacionados.
---

# DYNATRACE PIPELINE OBSERVABILITY

Esta skill proporciona las instrucciones técnicas, validaciones y procedimientos estandarizados para **Observabilidad de pipelines y eventos SDLC** en Dynatrace.

## 1. Fuentes Oficiales de Evidencia

Esta skill ha sido generada y validada contra la documentación oficial de Dynatrace:
- [Analyze SDLC events from your pipeline — Dynatrace Docs](https://docs.dynatrace.com/docs/deliver/pipeline-observability-sdlc-events/pipeline-observability-analyze) (*openpipeline*)
- [Settings API - Ingest pipelines configuration (events.sdlc) schema table — Dynatrace Docs](https://docs.dynatrace.com/docs/dynatrace-api/environment-api/settings/schemas/builtin-openpipeline-events-sdlc-pipelines) (*openpipeline*)
- [Observe GitLab pipelines and merge requests with Dashboards and SDLC events — Dynatrace Docs](https://docs.dynatrace.com/docs/deliver/pipeline-observability-sdlc-events/tutorials/pipeline-observability-use-case-gitlab) (*openpipeline*)
- [Observe Azure DevOps pipelines and pull requests with Dashboards and SDLC events — Dynatrace Docs](https://docs.dynatrace.com/docs/deliver/pipeline-observability-sdlc-events/tutorials/pipeline-observability-use-case-azdo) (*openpipeline*)

## 2. Consultas y Comandos Operativos

A continuación se presentan los comandos y consultas verificados para este dominio:

```powershell
fetch events, from:now()-7d, to:now()
| filter event.kind == "SDLC_EVENT"
| filter event.type == "test"
| summarize {
  started = takeMin(if(event.status == "started", toTimestamp(start_time))),
  finished = takeMax(if(event.status == "finished", toTimestamp(end_time)))
}, by: {test.id}
| fieldsAdd duration = finished - started
| summarize avg_test_duration = avg(duration)

---

fetch events, from:now()-7d, to:now()
| filter event.kind == "SDLC_EVENT"
| filter event.type == "change"
| summarize {
  started = takeMax(if(event.status == "opened", toTimestamp(start_time))),
  finished = takeMax(if(event.status == "merged", toTimestamp(end_time)))
}, by: {vcs.repository.change.id}
| fieldsAdd duration = finished - started
| summarize avg_time_to_merge = avg(duration)

---

fetch events, from:now()-7d, to:now()
| filter event.kind == "SDLC_EVENT"
| filter event.type == "validation"
| filter event.status == "finished"
| summarize {
  failed = countIf(validation.status == "fail"),
  all = countIf(validation.status != "error")
}
| fields failed_validation_rate = (failed * 100 / all)
```

```powershell
The environment variable DYNATRACE_TARGET_FOLDER has not been set. Use the'configuration'  folder as default.
Downloading "dynatrace_openpipeline_v2_events_sdlc_routing" Count:  1
Post-Processing Resources ...
- [POSTPROCESS] dynatrace_openpipeline_v2_events_sdlc_routing - openpipeline_v2_events_sdlc_routingPost-Processing Resources - Group child configs with parent configs ...
Finishing touches ...
Writing ___resources___.tf
Writing ___datasources___.tf
Writing main.tf
Writing ___variables___.tf
Writing main ___providers___.tf
Writing modules ___providers___.tf
Remove Non-Referenced Modules ...
Finish Export ...
Terraform executable path:  /usr/local/bin/terraform
Executing 'terraform init'
... finished after 3 seconds

---

manifestVersion: 1.0
projects:
  - name: pipeline_observability
environmentGroups:
  - name: group
    environments:
      - name: <YOUR-DT-ENV-ID>
        url:
          type: value
          value: https://<YOUR-DT-ENV-ID>.apps.dynatrace.com
        auth:
          platformToken:
            name: DYNATRACE_PLATFORM_TOKEN

---

https://<YOUR-DT-ENV-ID>.live.dynatrace.com/platform/ingest/custom/events.sdlc/gitlab
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
