# Recetas verificadas — payloads exactos que funcionan

Todo lo de acá se ejecutó y verificó en producción (XM, tenant `ayw14106`, ago-2026), no salió de la
documentación. Cuando la doc y esto difieran, gana esto.

> Regla de oro que se repitió toda la sesión: **nunca construir sin validar el dato primero.** Un
> matcher por contenido, un discriminante supuesto o un routing sin medir se lleva dato ajeno o no
> captura nada. Medí, después construí, después verificá con dato real.

---

## 1. El objeto pipeline ES un pipeline (no un contenedor)

Cada `builtin:openpipeline.logs.pipelines` (o `.bizevents.`, `.spans.`, `.metrics.`) es **un settings
object = un pipeline**. Varios pipelines = varios objetos. El `value` tiene `customId`, `displayName`
y las **etapas** como propiedades de primer nivel, cada una `{"processors":[...]}`:

```
processing · securityContext · costAllocation · productAllocation · storage ·
metricExtraction · dataExtraction · davis · smartscapeNodeExtraction · smartscapeEdgeExtraction
```

> `costAllocation` y `productAllocation` **existen como etapas** y la doc/plantillas viejas no las
> mencionan. `costAllocation` es lo que habilita el Cost Allocation nativo — ver §4.

Receta completa de un pipeline de app (logs de RIO → contexto + cost + bucket), **verificada**:

```json
POST /platform/classic/environment-api/v2/settings/objects
[{"schemaId":"builtin:openpipeline.logs.pipelines","scope":"environment","value":{
  "customId":"pipeline_logs_rio",
  "displayName":"RIO | CND | logs",
  "processing":{"processors":[]},
  "securityContext":{"processors":[
    {"id":"sc_rio","type":"securityContext","matcher":"true","enabled":true,
     "description":"Security context RIO",
     "securityContext":{"value":{"type":"multiValueConstant","multiValueConstant":["RIO"]}}}]},
  "costAllocation":{"processors":[
    {"id":"ca_rio","type":"costAllocation","matcher":"true","enabled":true,
     "description":"Cost allocation app RIO",
     "costAllocation":{"value":{"type":"constant","constant":"RIO"}}}]},
  "productAllocation":{"processors":[]},
  "storage":{"processors":[
    {"id":"bkt_rio","type":"bucketAssignment","matcher":"true","enabled":true,
     "description":"Bucket logs_cnd","bucketAssignment":{"bucketName":"logs_cnd"}}]},
  "metricExtraction":{"processors":[]},"dataExtraction":{"processors":[]},"davis":{"processors":[]},
  "smartscapeNodeExtraction":{"processors":[]},"smartscapeEdgeExtraction":{"processors":[]}
}}]
```

Devuelve `{"code":200,"objectId":"vu9U3hXa3q0..."}`. **Guardá ese objectId** — es lo que el routing
apunta.

**Gotchas de creación de pipeline:**

- **`metadataList` NO usarlo.** Da 400 (`entryKey Must not be null`, `value Unknown property`). Es
  opcional; quitalo.
- Dentro del pipeline los procesadores usan `matcher:"true"` — el routing ya filtró qué llega acá.
- El `id` de cada procesador es libre pero debe ser único dentro del pipeline.

---

## 2. Routing — matchers con funciones RESTRINGIDAS

El routing es un único objeto `builtin:openpipeline.<kind>.routing` con la propiedad `routingEntries`
(lista). **First-match gana; el orden del array ES la lógica.** PUT reemplaza el objeto completo →
respaldá antes.

```json
{"enabled":true,"pipelineType":"custom","pipelineId":"<objectId del pipeline>",
 "matcher":"k8s.namespace.name == \"ns-rio\"","description":"Route RIO -> logs_cnd"}
```

**Funciones permitidas en el matcher de routing — probado:**

| Funciona | No funciona (da 400 "function isn't enabled") |
|---|---|
| `campo == "valor"` | **`in(campo, {...})`** |
| `A or B or C` (listas → OR explícito) | **`contains(campo, "x")`** |
| `matchesPhrase(campo, "frase")` | |

Para "todos los de esta lista" → OR explícito. Para substring/frase → `matchesPhrase`, **no**
`contains`.

**Orden al insertar:** las entradas más específicas y los **drop** van primero; el ruido de sistema
al final antes del catch-all implícito. Al hacer PUT, reconstruí el array poniendo lo nuevo en la
posición correcta, no al final ciego.

---

## 3. Discriminante por señal — cuál usar (medido, no supuesto)

**El discriminante por contenido es basura.** `matchesPhrase(content,"sicep")` capturó Windows
Security Logs, logs del motor sintético, e incluso contenedores de OTRA app (SRC) que mencionaban la
palabra. Siempre por campo estructurado:

| Señal / origen | Discriminante confiable | Notas |
|---|---|---|
| **Logs AKS** | `k8s.namespace.name` | `ns-rio`, `ns-mdc`, `xm-suicc-back`, `simplex-operativo`, `ns-registromedidas`. El más limpio |
| **Ruido de sistema k8s** | `k8s.namespace.name` in {kube-system, dataprotection-microsoft, ingress-nginx, ingress-basic, gatekeeper-system, kube-node-lease, kube-public} | **~2/3 del volumen k8s.** Va a bucket de retención corta |
| **Métricas Azure** | `azure.resource.group` | `gr-rio-prd`, `gr_sicep_prd`, `gr_mdc_prd`. ~1:1 con app pero nombres inconsistentes (gr-, gr_, rg-) |
| **Logs de App Service (Azure)** | `azure.resource.id` | **Solo si el reenviador de logs Azure está desplegado.** Si no, no fluyen (solo métricas) |
| **Logs de host on-prem** | tag de host `app:<SIGLA>` (auto-tag) | Los logs de host no llevan el tag en el registro; hay que enriquecer o rutear por host |
| **Bizevents** | el campo que ya trae el payload (`sigla`, `event.provider`) | Ojo: mucho `event.provider=="All"` es telemetría interna del motor sintético |

**Realidad del cruce (lección cara):** de 144 apps del inventario XM, **solo ~20 tienen dato +
discriminante**. El resto son macros, RPAs, tareas, microservicios sin health API, o "No
implementado". **No construyas N×5 objetos para un inventario aspiracional** — construí para las que
producen dato. Validá el footprint por app antes: `fetch <tabla> | filter <discriminante> | summarize count()`.

---

## 4. Cost Allocation — el campo es `dt.cost.costcenter`

La etapa `costAllocation` con un procesador `type:"costAllocation"` estampa **`dt.cost.costcenter`**
en cada registro. Eso alimenta la feature nativa de Cost Allocation de Dynatrace y es consultable:

```
fetch logs, from:-1h | filter isNotNull(dt.cost.costcenter) | summarize n=count(), by:{dt.cost.costcenter}
```

Dos formas de asignar el valor (`GenericValueAssignment`):

```json
// constante (un pipeline por app):  dt.cost.costcenter = "RIO"
"costAllocation":{"value":{"type":"constant","constant":"RIO"}}

// por campo (UN pipeline para muchos):  dt.cost.costcenter = azure.resource.group
"costAllocation":{"value":{"type":"field","field":{"fieldName":"azure.resource.group"}}}
```

> **Decisión de diseño:** cost allocation **por app** (constante, un pipeline por app, nombre limpio
> `RIO`) vs **por resource-group** (por campo, un solo pipeline, sin lookup, nombre `gr-rio-prd`). Para
> métricas Azure el nivel RG ya sirve y es inmediato; el nivel app exacto necesita lookup RG→sigla.

Las **métricas** (`builtin:openpipeline.metrics.pipelines`) también admiten la etapa `costAllocation`
— mismo mecanismo que logs.

Alternativa/complemento global: `builtin:openpipeline.primary-grail-tag` (regla global, no por
pipeline) estampa `primary_tags.<nombre>` con `sourceFields` en prioridad. Útil cuando el
discriminante vive en campos distintos según la fuente.

---

## 5. Excluir logs (drop) — regla general de descarte

Para "no ingerir logs de X" (agentes de scanner/SIEM, ruido): pipeline con procesador **`drop`** en la
etapa `processing`, ruteado **primero**.

```json
// pipeline de descarte
"processing":{"processors":[
  {"id":"drop_scanners","type":"drop","matcher":"true","enabled":true,
   "description":"Descartar exabeam y nessus"}]}
// (resto de etapas vacías)

// routing, PRIMERA entrada:
{"enabled":true,"pipelineType":"custom","pipelineId":"<drop pipeline id>",
 "matcher":"matchesPhrase(log.source,\"exabeam\") or matchesPhrase(log.source,\"nessus\")",
 "description":"Descartar logs de exabeam y nessus"}
```

Verificado en XM: descartó ~2,5M logs/día de exabeam (`...ExabeamWindowsCollector...minifi-app.log`) y
nessus (`...Tenable\Nessus Agent...module_host.log`) → **0 GB ingest, 0 retain**. Rutear por
`log.source` (no por `content`) preservó los falsos positivos (TransparentInstaller, WaAppAgent, logs
Oracle que mencionaban la palabra en el contenido).

`drop` descarta del todo (ni ingest ni retain). `noStorage` procesa pero no almacena — distinto.

---

## 6. Buckets — creación y estado

```json
POST /platform/storage/management/v1/bucket-definitions
{"bucketName":"logs_cnd","table":"logs","displayName":"Logs - Gerencia CND","retentionDays":35}
```

- El bucket nace `status:"creating"` y **tarda ~minutos en pasar a `active`**. Podés crear el pipeline
  que lo referencia mientras tanto, pero el dato no cae limpio hasta que esté active.
- Nombre: minúsculas, `[a-z0-9_]`, empieza con letra, **no** prefijos reservados `default_`/`dt_`.
- Un bucket = una tabla. `logs_cnd` (table logs), `bizevents_mem` (table bizevents), etc.
- **Modelo XM validado:** bucket por **gerencia** (pocos, manejables) + routing/contexto/cost por
  **app** (granular). Más un `logs_sistema` de retención corta (5d) para el ruido de sistema.

---

## 7. Verificación — obligatoria, con dato real

Los cambios **no son retroactivos**: solo afectan lo que entre después. Y hay latencia:

- **Ventana de propagación:** esperá 4–6 min tras el cambio antes de verificar.
- **Buffer de agente:** tras un drop/routing, por ~2 min siguen llegando registros viejos que el
  agente tenía en buffer. No es que la regla falle — esperá y re-verificá con ventana ajustada
  (`from:-2m`). Debe ir a 0.

```
// el dato nuevo cae donde debe, con contexto y cost:
fetch logs, from:-3m | filter k8s.namespace.name=="ns-rio"
| summarize n=count(), by:{dt.system.bucket, dt.security_context, dt.cost.costcenter}

// no rompí nada — el resto sigue en su lugar:
fetch logs, from:-6m | summarize n=count(), by:{dt.system.bucket} | sort n desc
```

---

## 8. DQL por REST — cuando el MCP no está

Si el MCP de Dynatrace está caído, se consulta Grail directo por API con el cliente OAuth
(scopes `storage:<tabla>:read`):

```
POST /platform/storage/query/v1/query:execute
     {"query":"fetch logs, from:-1h | summarize count()","requestTimeoutMilliseconds":58000}
```

Si devuelve `state:"RUNNING"` con `requestToken`, hacer polling:

```
GET /platform/storage/query/v1/query:poll?request-token=<token>   // hasta state:"SUCCEEDED"
```

`result.records` trae las filas. **Ojo:** no mandes `defaultTimeframeStart/End` vacíos → 400
`INVALID_TIMEFRAME`; usá `from:` dentro del DQL.
