# Alertas de consumo anómalo

Cada alerta es un **workflow** que corre una query en ventana corta, evalúa un umbral y notifica.
Se crean con `create_workflow_for_notification` (MCP) o `dtctl apply` sobre un objeto workflow.

> Regla de oro: **la alerta no puede costar más que lo que vigila.** Ventanas cortas, ejecución
> horaria o diaria (nunca por minuto), y filtro siempre. Ver §Presupuesto de la propia alerta.

---

## A1 · Escaneo diario por encima de la mediana

Dispara si el escaneo de hoy supera N× la mediana de los últimos 30 días.

```
fetch dt.system.query_executions, from:now()-30d
| fieldsAdd day = formatTimestamp(timestamp, format:"yyyy-MM-dd")
| summarize gib = sum(scanned_bytes)/1073741824, by:{day}
| summarize mediana = median(gib), hoy = max(if(day == formatTimestamp(now(), format:"yyyy-MM-dd"), gib, else:0))
| fieldsAdd ratio = hoy / mediana
| filter ratio > 3
```
**Umbral:** `ratio > 3`. Ejecuta 1×/día al final del día.
**Avisa:** equipo de observabilidad. **Acción:** correr Tile 2 y ubicar el `query_string` nuevo.

---

## A2 · Nuevo query_string costoso

Dispara si aparece un `query_string` con `avg_gib` alto que no existía la semana previa.

```
fetch dt.system.query_executions, from:now()-14d
| fieldsAdd week = if(timestamp > now()-7d, "actual", else:"previa")
| summarize executions = count(), avg_gib = avg(scanned_bytes)/1073741824,
            weeks = countDistinct(week), by:{query_string}
| filter weeks == 1 and avg_gib > 5 and executions > 100
| sort avg_gib desc | limit 10
```
**Umbral:** aparece solo en "actual", `avg_gib > 5`, `executions > 100`. Ejecuta 1×/día.
**Acción:** atribuir con `dps-consumo-indebido` §atribucion, ruta `client.source`.

---

## A3 · Nuevo estándar o clúster de compliance

Dispara si `security.events` trae un estándar o clúster no visto antes.

```
fetch security.events, from:now()-7d
| filter event.type == "COMPLIANCE_FINDING"
| summarize first = min(timestamp), by:{compliance.standard.name, k8s.cluster.name}
| filter first > now()-2d
```
**Umbral:** primera aparición en las últimas 48 h. Ejecuta 1×/día.
**Acción:** confirmar scope con `dtctl get settings --schema builtin:kubernetes.security-posture-management`.
Cobertura nueva = factura nueva por host-hora.

---

## A4 · Nueva métrica derivada de logs en ingesta

Dispara si una `grail.metric.key` de tipo `log.*` entra al top de ingesta.

```
timeseries dp = sum(dt.sfm.metrics.ingest.datapoints),
  by:{grail.metric.key}, from:now()-3d
| fieldsAdd total = arraySum(dp)
| filter startsWith(grail.metric.key, "log.")
| fields grail.metric.key, total
| sort total desc | limit 10
```
**Umbral:** cualquier `log.*` con volumen relevante. Ejecuta 1×/día.
**Acción:** verificar si algo la consume; si no, borrar la extraction rule.

---

## A5 · Alertas custom desbordadas (DDU)

```
fetch events, from:now()-1d
| filter event.kind == "DAVIS_EVENT" and event.type == "CUSTOM_ALERT"
| summarize cnt = count(), by:{event.name}
| filter cnt > 1000
| sort cnt desc
```
**Umbral:** >1000 disparos de la misma alerta en 24 h. Ejecuta 1×/día.
**Acción:** subir umbral de la regla, añadir supresión o desactivar.

---

## Estructura del workflow de notificación

1. **Trigger:** schedule (cron horario o diario, según la alerta).
2. **Task DQL:** la query de arriba, con `maxResultRecords` bajo.
3. **Condición:** el workflow sigue solo si la query devolvió filas.
4. **Notificación:** email / Slack con las filas y un link al dashboard de gobernanza.

Con MCP:
```
create_workflow_for_notification  → define el trigger, la DQL y el canal
make_workflow_public              → si debe verlo todo el equipo
```

Plantilla del mensaje:
```
⚠️ Guardrail <ID> disparado — <tenant>
Condición: <umbral>
Top ofensor: <primera fila>
Acción: <runbook de una línea>
Dashboard: <link gobernanza>
```

---

## Presupuesto de la propia alerta

Antes de activar un workflow, estima su costo: `avg_gib_de_la_query × ejecuciones_por_día × 30 ×
0.0035`. Si supera unos pocos dólares al mes, acorta la ventana o baja la frecuencia. Documenta el
costo estimado de cada alerta junto a su definición — un conjunto de guardrails también tiene una
factura.

## Runbook

Cada alerta necesita, en el `Runbook_Guardrails_<Cliente>.md`:

| Alerta | Umbral | Frecuencia | Avisa a | Acción al disparar | Costo est./mes |
|---|---|---|---|---|---|
| A1 | ratio > 3 | diaria | Observabilidad | Tile 2 → atribuir | $ |
