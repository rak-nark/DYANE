# Tiles del dashboard de gobernanza permanente

Cada tile vigila, todos los días, una de las firmas que la auditoría corrió una vez. DQL listo
para pegar. Sustituye rangos según el tenant.

> Todos los tiles llevan ventana acotada. El dashboard de gobernanza no debe ser él mismo un
> generador de consumo — usa refresh ≥5 min y timeframes cortos.

---

## Tile 1 · Escaneo diario del tenant (línea)

```
fetch dt.system.query_executions, from:now()-30d
| fieldsAdd day = formatTimestamp(timestamp, format:"yyyy-MM-dd")
| summarize scanned_gib = round(sum(scanned_bytes)/1073741824, decimals:2), by:{day}
| sort day asc
```
Visualización: line chart. Detecta el escalón del día que alguien publica un dashboard costoso.

---

## Tile 2 · Top 10 query_string últimos 7 días (tabla)

```
fetch dt.system.query_executions, from:now()-7d
| summarize scanned_gib = round(sum(scanned_bytes)/1073741824, decimals:2),
            executions = count(),
            avg_gib = round(avg(scanned_bytes)/1073741824, decimals:3),
            by:{query_string, query_pool}
| sort scanned_gib desc | limit 10
```
El tile más valioso. Caza el próximo patrón caro con días de vida, no con meses.

---

## Tile 3 · Consumo por bucket (barras)

```
fetch dt.system.query_executions, from:now()-7d
| summarize scanned_gib = round(sum(scanned_bytes)/1073741824, decimals:2), by:{bucket}
| sort scanned_gib desc | limit 15
```

---

## Tile 4 · Consumo por app de origen (barras / dona)

```
fetch dt.system.events, from:now()-7d
| filter event.kind == "BILLING_USAGE_EVENT" and event.type == "Events - Query"
| summarize GiB = sum(toLong(billed_bytes))/1073741824.0, by:{client.application_context}
| sort GiB desc | limit 10
```

---

## Tile 5 · Ingesta de métricas por clave (tabla)

```
timeseries dp = sum(dt.sfm.metrics.ingest.datapoints),
  by:{grail.metric.key}, from:now()-7d
| fieldsAdd total = arraySum(dp)
| fields grail.metric.key, total
| sort total desc | limit 20
```
Vigila especialmente prefijos `log.*` (extraction olvidada) y `cloud.*` (integración sin filtrar).

---

## Tile 6 · Security events por tipo (barras)

```
fetch security.events, from:now()-7d
| summarize cnt=count(), by:{event.type}
| sort cnt desc
```

## Tile 7 · Estándares de compliance activos (tabla)

```
fetch security.events, from:now()-7d
| filter event.type == "COMPLIANCE_FINDING"
| summarize cnt=count(), clusters=countDistinct(k8s.cluster.name),
            by:{compliance.standard.name}
| sort cnt desc
```
Si aparece un estándar o clúster nuevo respecto a la semana pasada, es cobertura nueva facturable
— revísala.

---

## Tile 8 · Inventario de buckets (tabla)

```
fetch dt.system.buckets | filter records != "0"
| fields name, dt.system.table, retention_days, records, estimated_uncompressed_bytes
| sort toLong(estimated_uncompressed_bytes) desc | limit 25
```

## Tile 9 · DDU por alertas (tabla)

```
fetch events, from:now()-30d
| filter event.kind == "DAVIS_EVENT"
    and in(event.type, {"AVAILABILITY_EVENT","ERROR_EVENT","CUSTOM_INFO","CUSTOM_ALERT"})
| fieldsAdd openMinutes = (toLong(event.end) - toLong(event.start)) / 60000000000
| summarize eventos = count(), dduEstimado = sum(openMinutes) * 0.001, by:{event.type}
| sort dduEstimado desc
```

---

## Despliegue

### Vía dtctl
```bash
dtctl apply -f dashboard-gobernanza.yaml
```
Construye el YAML con los tiles anteriores; cada tile es un objeto con `query`,
`visualization` y `defaultTimeframe` corto.

### Vía Document API
Crea un documento `type: dashboard` con el JSON de tiles. Recuerda que el JSON escapa `\n` en el
`query` de cada tile.

### App de gobernanza de dashboards (AppEngine)
Si el cliente tiene la app oficial de gobernanza de dashboards, esta ya cubre Tiles 2–4 (top
dashboards, owners, clones, DQL por dashboard) escaneando el contenido de cada documento.
Complementa con Tiles 5–9 (metrics, security, buckets, DDU) que la app no trae.

---

## Comparativa semana-sobre-semana

Para que el dashboard **detecte cambios** y no solo muestre estado, duplica los tiles clave con
`from:now()-14d` agrupando por semana y resalta las claves nuevas:

```
fetch dt.system.query_executions, from:now()-14d
| fieldsAdd week = if(timestamp > now()-7d, "actual", else:"previa")
| summarize scanned_gib = round(sum(scanned_bytes)/1073741824, decimals:2),
            by:{query_string, week}
| sort scanned_gib desc | limit 40
```
Un `query_string` que solo aparece en "actual" es un patrón nuevo — el candidato a alerta.
