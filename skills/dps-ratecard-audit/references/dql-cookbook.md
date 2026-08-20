# Cookbook DQL — auditoría de consumo DPS

Las queries están en formato `dtctl`. Para MCP/consola, quita el envoltorio `dtctl query '...'`.
Sustituye `FROM_DATE` por el inicio del año de licencia (ej. `"2026-01-01T00:00:00Z"`).

> Divisor: uso `1073741824` (GiB) porque es la unidad que factura el rate card.
> Si solo quieres leer en pantalla, `1000000000` es más legible pero **no sirve para costear**.

---

## 1. Query — `dt.system.query_executions`

### 1.0 Verificar que la fuente existe y cubre el periodo

```bash
dtctl query 'fetch dt.system.query_executions, from:now()-24h | limit 5' -o json --plain

dtctl query 'fetch dt.system.query_executions, from:FROM_DATE
  | summarize cnt=count()' -o toon --plain
```

Si `cnt` es alto (cientos de miles), la retención cubre el periodo y el costeo de Query será
**exacto**.

### 1.1 Tendencia mensual global

```bash
dtctl query 'fetch dt.system.query_executions, from:FROM_DATE
  | fieldsAdd month = formatTimestamp(timestamp, format:"yyyy-MM")
  | summarize scanned_gib = round(sum(scanned_bytes)/1073741824, decimals:2),
              executions = count(), by:{month}
  | sort month asc' -o toon --plain
```

### 1.2 Por tabla — dónde vive el gasto

```bash
dtctl query 'fetch dt.system.query_executions, from:FROM_DATE
  | summarize scanned_gib = round(sum(scanned_bytes)/1073741824, decimals:2),
              executions = count(), by:{table}
  | sort scanned_gib desc' -o toon --plain
```

Casi siempre `logs` domina. Si no, revisa `spans` (traces) y `events`.

### 1.3 Por bucket — aislar el concentrador

```bash
dtctl query 'fetch dt.system.query_executions, from:FROM_DATE
  | summarize scanned_gib = round(sum(scanned_bytes)/1073741824, decimals:2),
              executions = count(), by:{bucket}
  | sort scanned_gib desc | limit 20' -o toon --plain
```

Típicamente **un bucket concentra >95 %**. Ese es el objeto de la investigación.

### 1.4 Dentro del bucket: quién y desde dónde

```bash
dtctl query 'fetch dt.system.query_executions, from:FROM_DATE
  | filter bucket == "BUCKET"
  | summarize scanned_gib = round(sum(scanned_bytes)/1073741824, decimals:2),
              executions = count(), by:{user.email, query_pool}
  | sort scanned_gib desc | limit 20' -o toon --plain
```

`query_pool`: `DASHBOARDS` = tile con refresh · `DEFAULT` = consola/notebook · `WORKFLOWS` =
automatización · `APPS` = app de AppEngine.

### 1.5 La query decisiva — agrupar por el TEXTO de la consulta

```bash
dtctl query 'fetch dt.system.query_executions, from:FROM_DATE
  | filter bucket == "BUCKET"
  | summarize scanned_gib = round(sum(scanned_bytes)/1073741824, decimals:2),
              executions = count(),
              avg_gib = round(avg(scanned_bytes)/1073741824, decimals:3),
              by:{query_string}
  | sort scanned_gib desc | limit 10' -o toon --plain
```

Agrupar por `query_string` expone los patrones repetidos: un dashboard con auto-refresh ejecuta
literalmente el mismo texto miles de veces. **Firma del problema:** `avg_gib` alto (>50) ×
`executions` en miles × `query_pool == "DASHBOARDS"`.

### 1.6 Tendencia mensual dentro del bucket

```bash
dtctl query 'fetch dt.system.query_executions, from:FROM_DATE
  | filter bucket == "BUCKET"
  | fieldsAdd month = formatTimestamp(timestamp, format:"yyyy-MM")
  | summarize scanned_gib = round(sum(scanned_bytes)/1073741824, decimals:2),
              executions = count(), by:{month}
  | sort month asc' -o toon --plain
```

Sirve para fechar el inicio del problema y calcular el gasto evitable si se corrige hoy.

### 1.7 Encontrar el dashboard dueño de la query

```bash
dtctl get dashboards -o json --plain > dash_list.json
grep -o '{"id":"[^}]*PALABRA_CLAVE[^}]*}' dash_list.json

dtctl get dashboard <ID> -o json --plain > dash.json
grep -o '"defaultTimeframe":{[^}]*}[^}]*}' dash.json
```

El JSON escapa `\n`, así que un `grep` plano no encuentra el `query_string` completo. Para buscar
el texto exacto dentro de los tiles, decodifica el JSON o usa `--jq` en vez de `grep`.

---

## 2. Alternativa: `dt.system.events` con `BILLING_USAGE_EVENT`

Cuando `dt.system.query_executions` no está disponible o quieres cruzar por app de origen:

```
fetch dt.system.events, from:now()-7d
| filter event.kind == "BILLING_USAGE_EVENT" and event.type == "Events - Query"
| summarize consultas = count(), GiB = sum(toLong(billed_bytes))/1073741824.0,
    by: {client.application_context, user.email}
| sort GiB desc | limit 20
```

`client.application_context` distingue `dynatrace.dashboards` de `dynatrace.notebooks` o
`dynatrace.davis.problems`. Para bajar al dashboard concreto:

```
fetch dt.system.events, from:now()-7d
| filter event.kind == "BILLING_USAGE_EVENT" and event.type == "Events - Query"
    and user.email == "USUARIO"
| summarize consultas = count(), GiB = sum(toLong(billed_bytes))/1073741824.0,
    by: {client.source}
| sort GiB desc | limit 10
```

`client.source` trae la **URL completa del dashboard** — es el atajo más rápido al culpable.
Cambia `event.type` para auditar otras categorías: `"Logs - Query"`, `"Spans - Query"`,
`"Metrics - Ingest"`, etc. Lista lo disponible con:

```
fetch dt.system.events, from:now()-7d
| filter event.kind == "BILLING_USAGE_EVENT"
| summarize cnt=count(), by:{event.type} | sort cnt desc
```

---

## 3. Ingest & Retain — `dt.system.buckets`

```bash
# Inventario completo, ordenado por tamaño
dtctl query 'fetch dt.system.buckets | filter records != "0"
  | fields name, dt.system.table, retention_days, records, estimated_uncompressed_bytes
  | sort toLong(estimated_uncompressed_bytes) desc' -o toon --plain

# Detalle de un bucket
dtctl query 'fetch dt.system.buckets | filter name == "BUCKET"' -o json --plain
```

### ❌ Intento descartado — no lo repitas

```
fetch logs, from:FROM_DATE
| filter dt.system.bucket == "BUCKET"
| fieldsAdd month = ..., sz = stringLength(content)
| summarize gib = round(sum(sz)/1073741824, decimals:2), by:{month}
```

Falla por dos razones: (1) dispara el corte de seguridad de Grail a los 500 GB escaneados — y ese
scan **se factura**; (2) en logs estructurados `content` está casi vacío (el payload vive en
campos custom), así que `stringLength(content)` no es proxy válido de tamaño de ingesta.

---

## 4. Metrics Ingest

```bash
# Encontrar la métrica de self-monitoring
dtctl query 'fetch metric.series
  | filter contains(lower(metric.key), "ingest") or contains(lower(metric.key), "datapoint")
  | summarize count(), by:{metric.key}' -o toon --plain

# Tendencia (única ventana con datos — ~24-30 días de retención)
dtctl query 'timeseries dp = sum(dt.sfm.metrics.ingest.datapoints),
  from:now()-30d, interval:2d' -o toon --plain

# Top contribuyentes por métrica real ingerida
dtctl query 'timeseries dp = sum(dt.sfm.metrics.ingest.datapoints),
  by:{grail.metric.key, grail.bucket.name}, from:now()-14d
  | fieldsAdd total = arraySum(dp)
  | fields grail.metric.key, grail.bucket.name, total
  | sort total desc | limit 20' -o toon --plain
```

Sospechosos habituales: `dt.process.*` (esperado), `cloud.azure.*` / `cloud.aws.*` (integraciones
cloud sin filtrar) y **métricas derivadas de logs** (`log.*`) — estas últimas suelen ser
metric-extraction rules olvidadas y son consumo indebido clásico.

`dt.extension.config.id` viene `null`: no sirve para agrupar. Si un `by:{}` colapsa todo en
`null`, inspecciona el esquema antes de descartar:

```
fetch metric.series | filter metric.key == "dt.sfm.metrics.ingest.datapoints" | limit 1
```

---

## 5. Security Posture Management y RVA

```bash
# Volumen mensual
dtctl query 'fetch security.events, from:FROM_DATE
  | fieldsAdd month = formatTimestamp(timestamp, format:"yyyy-MM")
  | summarize cnt=count(), by:{month} | sort month asc' -o toon --plain

# Separar capabilities que comparten tabla
dtctl query 'fetch security.events, from:FROM_DATE
  | summarize cnt=count(), by:{event.type} | sort cnt desc | limit 15' -o toon --plain
```

`VULNERABILITY_FINDING` → RVA. `COMPLIANCE_FINDING` → Security Posture Management.

```bash
# Alcance real de compliance: nodos, clusters, ciclos, estándares
dtctl query 'fetch security.events, from:FROM_DATE
  | filter event.type == "COMPLIANCE_FINDING"
  | summarize nodes=countDistinct(k8s.node.name), scans=countDistinct(scan.id),
              clusters=countDistinct(k8s.cluster.name),
              standards=countDistinct(compliance.standard.name),
              first=min(timestamp), last=max(timestamp),
              by:{k8s.cluster.name}' -o toon --plain

# Estándares aplicados — buscar los irrelevantes
dtctl query 'fetch security.events, from:FROM_DATE
  | filter event.type == "COMPLIANCE_FINDING"
  | summarize cnt=count(), by:{compliance.standard.name}' -o toon --plain
```

`dt.entity.host` devuelve 0 en hallazgos de K8s — el campo correcto es
`dt.entity.kubernetes_node` / `k8s.node.name`. Si un `countDistinct` da 0, inspecciona un registro
completo (`| limit 2` en `-o json`) para descubrir los campos reales antes de concluir nada.

Señal de desperdicio: estándares **CIS EKS (AWS)** evaluándose sobre un clúster **AKS (Azure)**.
Escaneo que factura y no aporta.

### Confirmar alcance por configuración (obligatorio)

```bash
dtctl get settings-schema --plain -o json \
  | grep -io '"schemaId":"[^"]*"' | grep -iE "posture|compliance|vulnerab"

dtctl get settings --schema builtin:kubernetes.security-posture-management -o json --plain
```

Devuelve el `scope` habilitado. **Este paso es el que evita sobreestimar la factura por un orden
de magnitud.** Los eventos dicen quién generó hallazgos; la config dice quién está cubierto.

### RVA — distinguir reevaluación de cobertura nueva

```bash
dtctl query 'fetch security.events, from:FROM_DATE
  | filter event.type == "VULNERABILITY_FINDING"
  | fieldsAdd month = formatTimestamp(timestamp, format:"yyyy-MM")
  | summarize hosts=countDistinct(dt.entity.host), cnt=count(), by:{month}
  | sort month asc' -o toon --plain
```

Si `hosts` se mantiene plano mientras `cnt` cae 10x, fue una reevaluación masiva. **No es
cobertura facturable nueva** — no lo cargues al mes.

---

## 6. Davis Data Units (modelo clásico)

```
fetch events, from: now()-90d
| filter event.kind == "DAVIS_EVENT"
    and in(event.type, {"AVAILABILITY_EVENT","ERROR_EVENT","CUSTOM_INFO","CUSTOM_ALERT"})
| fieldsAdd openMinutes = (toLong(event.end) - toLong(event.start)) / 60000000000
| summarize eventos = count(), minutosAbiertos = sum(openMinutes), by: {event.type}
| fieldsAdd dduEstimado = minutosAbiertos * 0.001
| sort dduEstimado desc
```

`CUSTOM_ALERT` desbordado (millones de eventos) es la firma de una regla de alerta mal calibrada
generando DDU sin valor. Cruza con la skill `dps-consumo-indebido` §Alertas ruidosas.
