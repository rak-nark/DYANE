# Catálogo de patrones de consumo indebido

12 patrones con firma DQL, umbral de disparo, severidad y corrección. Ejecuta solo los de los
capabilities activos en el tenant.

Severidad: **A** = corregible en horas con ahorro alto · **B** = requiere coordinación con un
equipo · **C** = requiere decisión contractual o de arquitectura.

---

## Familia Query — `dt.system.query_executions`

### P1 · Dashboard con auto-refresh sobre bucket grande — Sev. A

El patrón más caro y el más frecuente. Un tile con refresh de 1 min y timeframe de 90 d sobre un
bucket de 1 TB escanea ~140 GiB por ejecución, 1 440 veces al día.

**Firma:**
```
fetch dt.system.query_executions, from:"FROM_DATE"
| filter query_pool == "DASHBOARDS"
| summarize scanned_gib = round(sum(scanned_bytes)/1073741824, decimals:2),
            executions = count(),
            avg_gib = round(avg(scanned_bytes)/1073741824, decimals:3),
            by:{query_string, bucket}
| filter avg_gib > 1 and executions > 500
| sort scanned_gib desc | limit 20
```

**Umbral:** `avg_gib > 1` **y** `executions > 500` en el periodo. Ajusta al tamaño del tenant.

**Fix:** bajar el refresh (1 min → 15 min = −93 %), acotar el `defaultTimeframe` del dashboard,
añadir filtro de bucket al tile, o mover el tile a un dashboard bajo demanda. Empieza por el
timeframe: suele ser el multiplicador dominante.

---

### P2 · Query sin filtro de bucket — Sev. A

Un `fetch logs` sin `filter dt.system.bucket == ...` escanea todos los buckets de la tabla.

**Firma:**
```
fetch dt.system.query_executions, from:"FROM_DATE"
| filter not(contains(query_string, "bucket")) and table == "logs"
| summarize scanned_gib = round(sum(scanned_bytes)/1073741824, decimals:2),
            executions = count(), by:{user.email, query_pool}
| sort scanned_gib desc | limit 20
```

**Fix:** filtro de bucket obligatorio en las queries recurrentes; segmentos para las ad-hoc.

---

### P3 · Concentración extrema en un bucket — Sev. B

**Firma:**
```
fetch dt.system.query_executions, from:"FROM_DATE"
| summarize scanned_gib = round(sum(scanned_bytes)/1073741824, decimals:2), by:{bucket}
| sort scanned_gib desc | limit 20
```

**Umbral:** un bucket >80 % del total escaneado del tenant.

**Fix:** evaluar `Retain with Included Queries` para ese bucket (tarifa plana, sin cargo de
Query). Cuando Query domina, cambia el modelo económico completo — puede ser el hallazgo de
mayor impacto del informe. **Sev. C** si requiere renegociar.

---

### P4 · Un usuario concentra el gasto — Sev. B

**Firma:**
```
fetch dt.system.events, from:now()-30d
| filter event.kind == "BILLING_USAGE_EVENT" and event.type == "Events - Query"
| summarize consultas = count(), GiB = sum(toLong(billed_bytes))/1073741824.0,
    by: {client.application_context, user.email}
| sort GiB desc | limit 20
```

**Umbral:** un `user.email` >50 % del total.

**Ojo:** en dashboards compartidos el `user.email` que aparece suele ser **el del visor**, no el
del autor. No es una acusación — es la pista para llegar al dashboard. Baja a `client.source`
antes de escribir un nombre en el informe.

---

## Familia Alertas / DDU

### P5 · Alertas custom desbordadas — Sev. A

`CUSTOM_ALERT` en millones es una regla mal calibrada quemando DDU sin que nadie los lea.

**Firma:**
```
fetch events, from: now()-90d
| filter event.kind == "DAVIS_EVENT"
    and in(event.type, {"AVAILABILITY_EVENT","ERROR_EVENT","CUSTOM_INFO","CUSTOM_ALERT"})
| fieldsAdd openMinutes = (toLong(event.end) - toLong(event.start)) / 60000000000
| summarize eventos = count(), minutosAbiertos = sum(openMinutes), by: {event.type}
| fieldsAdd dduEstimado = minutosAbiertos * 0.001
| sort dduEstimado desc
```

**Umbral:** `CUSTOM_ALERT` > 100 000 eventos en 90 d, o >10x cualquier otro tipo.

**Fix:** identificar la regla origen, subir el umbral, añadir supresión por mantenimiento o
desactivar. Cruza contra problemas realmente atendidos: si nadie abrió un ticket por esa alerta
en 90 días, no se debería estar generando.

---

### P6 · Eventos que nunca cierran — Sev. B

Eventos abiertos meses acumulan `openMinutes` indefinidamente.

**Firma:** misma query de P5, agregando `by:{event.type, event.name}` y filtrando
`minutosAbiertos / eventos > 10000` (>7 días de promedio abierto).

**Fix:** revisar la condición de cierre del evento o su `timeout`.

---

## Familia Metrics

### P7 · Metric-extraction sobre logs olvidada — Sev. A

Reglas que derivan métricas de logs (`log.*`) siguen ingiriendo datapoints después de que el
proyecto que las pidió terminó.

**Firma:**
```
timeseries dp = sum(dt.sfm.metrics.ingest.datapoints),
  by:{grail.metric.key, grail.bucket.name}, from:now()-14d
| fieldsAdd total = arraySum(dp)
| fields grail.metric.key, grail.bucket.name, total
| sort total desc | limit 30
```

**Umbral:** cualquier `grail.metric.key` que empiece por `log.` en el top 20.

**Fix:** verificar si algún dashboard/alerta la consume; si no, borrar la regla de extracción.
Nombres tipo `log.gabo`, `log.will` (nombre de una persona) son señal casi segura de prueba
olvidada.

---

### P8 · Integración cloud sin filtrar — Sev. B

`cloud.azure.*` / `cloud.aws.*` completo ingiere cientos de métricas por recurso, casi todas sin
consumidor.

**Firma:** misma query de P7, buscando prefijos `cloud.`.

**Fix:** en la configuración de la integración, restringir a los servicios y métricas realmente
usados. Suele ser el segundo mayor ahorro de Metrics después de P7.

---

## Familia Cobertura y alcance

### P9 · Capability facturando fuera de alcance — Sev. A

**Firma (eventos):**
```
fetch security.events, from:"FROM_DATE"
| filter event.type == "COMPLIANCE_FINDING"
| summarize nodes=countDistinct(k8s.node.name), clusters=countDistinct(k8s.cluster.name),
            first=min(timestamp), last=max(timestamp), by:{k8s.cluster.name}
```

**Confirmación obligatoria (configuración):**
```bash
dtctl get settings --schema builtin:kubernetes.security-posture-management -o json --plain
```

**Nunca reportes alcance solo desde eventos.** Un host cubierto que no generó hallazgos igual
factura, y uno que generó hallazgos puede estar fuera del scope facturable. La config es la
verdad. En un caso real la diferencia entre inferir (77 hosts) y confirmar (4 nodos) era 19x.

**Fix:** ajustar el scope al conjunto que corresponde.

---

### P10 · Estándar de compliance irrelevante — Sev. A

**Firma:**
```
fetch security.events, from:"FROM_DATE"
| filter event.type == "COMPLIANCE_FINDING"
| summarize cnt=count(), by:{compliance.standard.name}
```

**Umbral:** cualquier estándar cuyo proveedor no corresponda al del clúster — CIS **EKS** (AWS)
evaluándose sobre un clúster **AKS** (Azure), por ejemplo. Escanea, factura y no aplica.

**Fix:** desmarcar el estándar en la configuración del capability.

---

### P11 · Hosts no-productivos con capability premium — Sev. B

Full-Stack o AppSec sobre desarrollo, QA o laboratorio.

**Firma:**
```
fetch dt.entity.host
| fields entity.name, host.group, dt.security_context, monitoringMode
| filter matchesPhrase(entity.name, "dev") or matchesPhrase(entity.name, "qa")
      or matchesPhrase(entity.name, "test") or matchesPhrase(entity.name, "lab")
| limit 200
```

Cruza con el modo de monitoreo real: `dt.entity.host | fields entity.name, monitoringMode`.

**Fix:** bajar a Infrastructure Monitoring o deshabilitar. Requiere acuerdo con el equipo dueño
del ambiente — de ahí la Sev. B.

---

### P12 · Retención excesiva para el uso real — Sev. C

Un bucket con `retention_days: 365` cuyo consumo de queries se concentra en los últimos 7 días
paga Retain 52x por dato que nadie consulta.

**Firma (retención configurada):**
```
fetch dt.system.buckets | filter records != "0"
| fields name, dt.system.table, retention_days, records, estimated_uncompressed_bytes
| sort toLong(estimated_uncompressed_bytes) desc
```

**Firma (uso real por antigüedad):** revisa el `defaultTimeframe` de los dashboards que consultan
el bucket y el rango de las queries en `query_string`.

**Fix:** reducir `retention_days` al percentil 95 del uso real, o mover el histórico frío a
almacenamiento externo. Sev. C porque suele haber un requisito regulatorio detrás — **pregunta
antes de recomendar**; en facturación electrónica, salud o banca la retención puede ser
obligatoria.

---

## Formato de hallazgo

```markdown
### H<N> · <Título del patrón> — Sev. <A/B/C>

**Evidencia**
<query ejecutada + salida recortada a las filas relevantes>

**Qué está pasando**
<2-3 frases. Qué objeto, desde cuándo, con qué frecuencia.>

**Dueño:** <persona o equipo> · **Objeto:** <dashboard/regla/config, con ID>

**Impacto**
- Periodo auditado: $X
- Proyección anual sin corregir: $Y
- Ahorro de la corrección: $Z (<factor de reducción y su justificación>)

**Acción:** <cambio concreto, no "revisar">
**Esfuerzo:** <horas> · **Riesgo:** <qué se pierde o se rompe al aplicarlo>
```

## Tabla ejecutiva

| # | Hallazgo | Sev. | Dueño | Ahorro anual | Esfuerzo | Prioridad |
|---|---|---|---|---|---|---|

Prioridad = ahorro anual ÷ esfuerzo. Ordena por ahí, no por severidad absoluta.
