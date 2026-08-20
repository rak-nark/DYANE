# API de ingesta — endpoints, scopes y plantillas

Todo lo de esta skill se ejecuta contra la API REST de la plataforma. `dtctl` es un envoltorio sobre
lo mismo y no cubre mejor los schemas `builtin:openpipeline.*`.

## Autenticación

Cliente OAuth `dt0s02` contra `https://sso.dynatrace.com/sso/oauth2/token`. El token dura 300 s, así
que pedilo por operación en vez de cachearlo.

```bash
dt_token() {   # $1 = scopes separados por espacio
  curl -s -X POST "https://sso.dynatrace.com/sso/oauth2/token" \
    -d "grant_type=client_credentials" \
    -d "client_id=$DT_CID" -d "client_secret=$DT_CSEC" \
    -d "scope=$1" | python -c "import sys,json;print(json.load(sys.stdin)['access_token'])"
}
```

Dos dominios distintos, no intercambiables:

| Dominio | Para qué |
|---|---|
| `https://<tenant>.apps.dynatrace.com` | Plataforma: settings, documentos, storage, Grail |
| `https://api.dynatrace.com` | Cuenta: IAM (políticas, grupos, boundaries, bindings) |
| `https://<tenant>.live.dynatrace.com` | Clásico: `/api/config/v1/*`, `/api/v2/*` con tokens `dt0c01` |

Si un endpoint responde *"The requested path is unavailable in this domain. Most likely the request
should go to https://<tenant>.live.dynatrace.com"*, estás en el dominio equivocado.

### Scopes por operación

| Operación | Scopes |
|---|---|
| Leer configuración de ingesta | `settings:objects:read settings:schemas:read openpipeline:configurations:read` |
| Escribir configuración de ingesta | `settings:objects:write` (+ los de lectura) |
| Buckets | `storage:bucket-definitions:read` / `:write` |
| Consultar Grail | `storage:<tabla>:read` — ver tabla de permisos abajo |
| Audit log | `storage:system:read` |
| IAM | `account-idm-read account-idm-write iam-policies-management` |

Scopes que **no** se le conceden a un cliente `dt0s02`: `auditLogs.read`,
`environment-api:audit-logs:read`. El audit log se lee por Grail, no por la API clásica.

## Descubrimiento de capacidades

Este endpoint sigue vivo y es el punto de partida: dice qué *kinds* existen y qué tipos de
procesador admite cada etapa.

```bash
GET /platform/openpipeline/v1/configurations
```

Devuelve, por cada kind, un `definition.pipelinesSpecification` como:

```json
{
  "processing": ["drop","fieldsRename","fieldsAdd","dql","fieldsRemove","technology"],
  "smartscapeNodeExtraction": ["smartscapeNode"],
  "smartscapeEdgeExtraction": ["smartscapeEdge"],
  "dataExtraction": ["sdlcEvent","bizevent"],
  "davis": ["davis"],
  "metricExtraction": ["counterMetric","valueMetric"]
}
```

Los tipos varían por kind: `spans` usa `samplingAwareCounterMetric` y `samplingAwareValueMetric`
(respetan el sampling y por eso no subestiman), mientras que `bizevents` usa `counterMetric` /
`valueMetric` a secas.

> **El endpoint por kind ya no existe.** `/platform/openpipeline/v1/configurations/{kind}` devuelve
> `404 "Migration in-progress/completed"`. La configuración migró a Settings 2.0.

## Leer la configuración real

```bash
GET /platform/classic/environment-api/v2/settings/objects
      ?schemaIds=builtin:openpipeline.<kind>.<aspecto>
      &fields=objectId,value,scope
      &pageSize=500
```

Aspectos: `routing`, `pipelines`, `ingest-sources`, `pipeline-groups`, `data-forwarding`.

Kinds: `logs`, `events`, `security.events`, `bizevents`, `spans`, `events.sdlc`, `metrics`,
`usersessions`, `davis.problems`, `davis.events`, `smartscape.events`, `system.events`, `user.events`.

### Estructura de `routing`

```json
{ "routingEntries": [
    { "enabled": true,
      "pipelineType": "custom",
      "pipelineId": "vu9U3hXa3q0AAAAB...",     // objectId del pipeline, base64
      "matcher": "environment == \"Production\"",
      "description": "Route to production" }
]}
```

**El orden del array es la precedencia.** First-match gana.

**El matcher tiene funciones RESTRINGIDAS** (verificado, da 400 "function isn't enabled"): sí `==`,
`OR`, `matchesPhrase(campo,"x")`; **NO `in()` ni `contains()`**. Listas → OR explícito. Ver
`recetas-verificadas.md` §2.

### Estructura de `pipelines`

```json
{ "customId": "...", "displayName": "nombre",
  "processing":        { "processors": [...] },
  "securityContext":   { "processors": [...] },
  "costAllocation":    { "processors": [...] },   // estampa dt.cost.costcenter
  "productAllocation": { "processors": [...] },
  "metricExtraction":  { "processors": [...] },
  "dataExtraction":    { "processors": [...] },
  "davis":             { "processors": [...] },
  "storage":           { "processors": [...] } }
```

> `costAllocation`/`productAllocation` son etapas reales que las plantillas viejas no listaban.
> **No mandes `metadataList`** (da 400). Receta completa y verificada en `recetas-verificadas.md` §1.

Procesador de **bucket**:

```json
{ "id": "processor_Store_in_Production_bucket_5311",
  "type": "bucketAssignment",
  "matcher": "environment == \"Production\"",
  "description": "Store in Production bucket",
  "enabled": true,
  "bucketAssignment": { "bucketName": "smartlinks_production_bucket" } }
```

Procesador de **security context**:

```json
{ "id": "processor_SC_CLIENTE_1000",
  "type": "securityContext",
  "matcher": "agencyId == \"<identificador>\"",
  "description": "SC_nombre-cliente",
  "enabled": true,
  "securityContext": {
    "value": { "type": "multiValueConstant",
               "multiValueConstant": ["contexto-a", "contexto-b"] } } }
```

`multiValueConstant` acepta varios contextos por registro — así un dato puede pertenecer a un
cliente y a una agrupación (ej. `["bac","baccredomatic","guatemala"]`).

## Escribir configuración

```bash
# Crear
POST /platform/classic/environment-api/v2/settings/objects
     [{ "schemaId": "...", "scope": "environment", "value": { ... } }]

# Actualizar (reemplaza el objeto completo)
PUT  /platform/classic/environment-api/v2/settings/objects/{objectId}
     { "value": { ... } }
```

**Siempre respaldá el `value` completo antes de un PUT.** Es un reemplazo, no un merge: lo que no
mandes se pierde.

## Buckets

```bash
GET  /platform/storage/management/v1/bucket-definitions
POST /platform/storage/management/v1/bucket-definitions
     { "bucketName": "...", "table": "spans|logs|bizevents|events",
       "displayName": "...", "retentionDays": 90 }
```

Respuesta relevante por bucket: `bucketName`, `table`, `retentionDays`, `status`, `bucketClass`.

**Crear el bucket antes de enrutar hacia él.** Un `bucketAssignment` a un bucket inexistente hace
que el dato caiga al default sin avisar.

## Historial de cambios (gratis)

El único historial recuperable de la configuración. Retención del bucket `dt_system_events`: ~372
días. Las consultas a `dt.system.events` reportan **0 GB consumidos** — no cuentan al presupuesto.

```
fetch dt.system.events, from: now()-30d
| filter event.kind == "AUDIT_EVENT" and event.type != "GET"
| fields timestamp, event.type, event.provider, user.id, resource,
         details.dt.settings.schema_id, details.dt.settings.object_summary,
         details.json_patch
| sort timestamp desc
```

Campos útiles:

| Campo | Contenido |
|---|---|
| `event.type` | `GET`, `POST`, `PUT`, `PATCH`, `CREATE`, `UPDATE`, `LOGIN` |
| `event.provider` | `SETTINGS`, `API_GATEWAY`, `CLASSIC_API` |
| `details.dt.settings.schema_id` | Qué schema se tocó — filtrá por `builtin:openpipeline.` |
| `details.json_before` / `json_after` | Estado completo antes y después |
| `details.json_patch` | El diff en formato JSON Patch, con `oldValue` |
| `details.json_after.auditInfo.user` | El email real de quien hizo el cambio |

> **Los registros de auditoría llevan `dt.security_context = "AUDIT_EVENT"`**, no el contexto del
> cliente. Un boundary por contexto de cliente los excluye — que es lo correcto, porque el
> `json_before`/`json_after` puede contener secretos en claro (credenciales embebidas en la
> configuración de monitores, por ejemplo). **No le concedas `storage:system:read` a un cliente
> externo aunque el boundary lo cubra.**

## Consultar el dato con control de costo

```
fetch <tabla>, from: now()-30m, to: now() | summarize count(), by:{<campo>}
```

- **Siempre acotá el timeframe.** Sin `from:`/`to:` se barre la retención completa.
- `dt.system.events` no consume presupuesto; el resto sí.
- El permiso `storage:query-consumption` permite poner techo por consulta en una política IAM —
  útil como control de costo y contra consultas ad-hoc abusivas.

## Tabla de permisos de lectura de Grail

| Permiso | Tabla |
|---|---|
| `storage:bizevents:read` | `bizevents` |
| `storage:spans:read` | `spans` |
| `storage:logs:read` | `logs` |
| `storage:events:read` | `events` |
| `storage:metrics:read` | `metrics` |
| `storage:entities:read` | `dt.entity.*` |
| `storage:smartscape:read` | topología |
| `storage:user.sessions:read` / `user.events:read` | RUM |
| `storage:user.replays:read` | Session Replay — **PII fuerte** |
| `storage:system:read` | `dt.system.events` — **audit log** |
| `storage:security.events:read` | hallazgos de seguridad |
| `storage:application.snapshots:read` | volcados de memoria |
| `storage:buckets:read` | necesario para `fetch ..., bucket: {...}` |
| `storage:files:read` | lookup tables (`WHERE storage:file-path startsWith "/lookups/"`) |

Las últimas cuatro de la lista y `user.replays` **no deberían concederse a clientes externos**.
