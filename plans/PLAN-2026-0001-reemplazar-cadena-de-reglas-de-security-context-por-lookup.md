---
id: PLAN-2026-0001
title: Reemplazar cadena de reglas de security context por lookup
status: in-progress
priority: high
origin:
  type: skill-reference
  skill: dynatrace-ingesta-openpipeline
  ref: "references/mejoras.md#M1"
domain: openpipeline
created: "2026-08-23T15:22:38.610Z"
updated: "2026-08-23T15:24:49.833Z"
evidence:
  - doc: openpipeline__docs-deliver-pipeline-observability-sdlc-events.md
    reason: Procesadores securityContext y etapas de pipeline
---
# Plan: Reemplazar cadena de reglas de security context por lookup

> Sugerencia original: "Reemplazar cadena de reglas de security context por lookup"

## Sugerencia de origen

## M1 — Reemplazar la cadena de reglas de security context por lookup

**Impacto: alto · Esfuerzo: medio · Riesgo: medio**

### Síntoma

N procesadores `securityContext` encadenados, uno por cliente, con `matcher` de igualdad contra un
identificador. En el caso de referencia: 68 reglas replicadas en 6 pipelines = **440 reglas**.

### Cómo medirlo

```
fetch bizevents, from: now()-30m | summarize n = count(), by:{dt.security_context} | sort n desc
```

Si la fila `null` domina, el hueco es real. En el caso de referencia: 92 % sin contexto.

También contá las reglas: si `securityContext.processors` tiene más de ~10 entradas y todas son el
mismo patrón con distinto valor, es esto.

### Por qué duele

- Cliente nuevo = editar cada pipeline a mano. Olvidar uno = ese cliente pierde visibilidad en un
  flujo, en silencio.
- Todo identificador fuera de la lista queda sin contexto: dato pagado que **nadie** puede consumir,
  porque el boundary es deny-by-default.
- El orden importa y con 68 reglas nadie lo audita.

### Corrección

**Opción A — Lookup table (preferida).** Subí una tabla `agencyId → contexto` como lookup file y
resolvé el contexto con un procesador DQL en `processing`, antes de la etapa `securityContext`:

```
| lookup [ fetch dt.system.files, path: "/lookups/agencias.csv" ],
    sourceField: agencyId, lookupField: id, prefix: "sc."
| fieldsAdd dt.security_context = sc.contexto
```

Una regla en lugar de 68. Alta de cliente = una fila en el CSV, sin tocar pipelines.
Requiere `storage:files:read WHERE storage:file-path startsWith "/lookups/"`.

**Opción B — Derivar el contexto del propio dato.** Si el identificador ya es un slug estable
(dominio, tenant, nombre de agencia), estampalo directo sin tabla intermedia:

```
| fieldsAdd dt.security_context = normalizar(url.host)
```

Menos flexible, pero cero mantenimiento.

**En ambos casos, cerrá con un catch-all:**

```
matcher: isNull(dt.security_context)
securityContext: ["sin-clasificar"]
```

Así el dato huérfano queda **identificable y auditable** en vez de invisible. Después podés decidir
si lo descartás o lo clasificás.

### Riesgo

Un error en el mapeo puede darle a un cliente el contexto de otro — es decir, exposición cruzada.
**Validación obligatoria antes de dar por cerrado**, con cuenta real de cada cliente:

```
fetch bizevents, from: now()-30m | summarize count(), by:{dt.security_context}
```

Debe devolver solo el contexto propio. Aplicá primero en un pipeline no productivo.

---


## Objetivo

(Completar: qué problema resuelve este plan y cómo se mide el éxito.)

## Alcance / Fuera de alcance

**Dentro:** (completar)
**Fuera de alcance:** (completar)

## Prerrequisitos

- (Permisos IAM, accesos, backups o línea base requeridos antes de empezar)
- Regla previa: ningún cambio es retroactivo. Aplicar, esperar una ventana de datos y recién ahí concluir.

## Fases

### Fase 0 — Línea base (solo lectura)

- [ ] Capturar métrica actual — comando: `dtx dql "..."` · criterio: consulta ejecuta sin errores · evidencia: resultado inicial guardado

### Fase 1 — Implementación

- [ ] Aplicar el cambio propuesto — comando: `<API / dtx dtctl ...>` · criterio: cambio aplicado en entorno no productivo · evidencia: diff/export de configuración

### Fase 2 — Validación

- [ ] Verificar el resultado contra la línea base — comando: `dtx dql "..."` · criterio: mejora medible respecto a Fase 0 · evidencia: comparación antes/después

### Fase 3 — Producción y cierre

- [ ] Aplicar en producción y observar ventana de datos — comando: `dtx dql "..."` · criterio: sin regresiones durante la ventana acordada · evidencia: cierre documentado con fecha

## Riesgos y rollback

| Riesgo | Impacto | Plan de rollback |
|---|---|---|
| (completar) | | |

## Evidencias

> Referencias oficiales que respaldan este plan. Promueve los candidatos al frontmatter (`evidence[].doc`) una vez verificados.

<!-- Candidatos automáticos de la base documental local -->
<!-- candidato: f539b74bd86bc2a2 | OneAgent configuration via command-line interface — Dynatrace Docs | https://docs.dynatrace.com/docs/ingest-from/dynatrace-oneagent/oneagent-configuration-via-command-line-interface -->
<!-- candidato: 0bdf1ecd8dc5fc4b | Dynatrace Operator security — Dynatrace Docs | https://docs.dynatrace.com/docs/ingest-from/setup-on-k8s/reference/security -->
<!-- candidato: f2790436480b3475 | Supported GCP services (Preview) — Dynatrace Docs | https://docs.dynatrace.com/docs/ingest-from/google-cloud-platform/dac-gcp-supported-services -->
<!-- candidato: 8f293d89886e1a20 | Technology support — Dynatrace Docs | https://docs.dynatrace.com/docs/ingest-from/technology-support -->
<!-- candidato: 117ddf06ffca4c64 | ActiveGate security — Dynatrace Docs | https://docs.dynatrace.com/docs/ingest-from/dynatrace-activegate/activegate-security -->
