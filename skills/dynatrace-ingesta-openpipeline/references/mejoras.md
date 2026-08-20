# Catálogo de mejoras

Cada mejora trae: el síntoma, cómo medirlo, la corrección y el riesgo de aplicarla. Priorizadas por
relación impacto/esfuerzo.

**Regla previa:** ningún cambio de ingesta es retroactivo. Solo afecta el dato que entre después.
Aplicá, esperá una ventana de datos, y recién ahí concluí.

---

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

## M2 — Eliminar la duplicación entre pipelines

**Impacto: alto · Esfuerzo: bajo · Riesgo: bajo**

### Síntoma

El mismo bloque de procesadores copiado en varios pipelines. En el caso de referencia, las 68 reglas
de contexto están en 4 pipelines de bizevents y 2 de spans.

### Corrección

Dos caminos, según lo que soporte el tenant:

1. **Pipeline groups** (`builtin:openpipeline.<kind>.pipeline-groups`) — agrupan pipelines que
   comparten configuración. Revisá si la kind lo soporta antes de diseñar alrededor.
2. **Consolidar el routing** — si cuatro pipelines difieren solo en `processing` y comparten
   contexto y storage, quizá deban ser **un** pipeline con matchers dentro de la etapa `processing`.

Aplicando M1 esto se disuelve solo: una regla de lookup replicada 6 veces sigue siendo mantenible;
68 no.

### Verificación

Compará las etapas entre pipelines antes y después. El conteo total de procesadores debe bajar sin
que cambie la distribución de `dt.security_context`.

---

## M3 — Cerrar el hueco de dato sin clasificar

**Impacto: alto (costo) · Esfuerzo: bajo · Riesgo: bajo**

### Síntoma

Volumen alto de registros con `dt.security_context` nulo ocupando buckets de retención larga.

### Cómo dimensionar el gasto

```
fetch bizevents, from: now()-24h
| filter isNull(dt.security_context)
| summarize n = count(), by:{event.provider, event.type}
| sort n desc | limit 20
```

Eso te dice **qué** es el dato huérfano. Casi siempre son tres cosas: tráfico interno que no debería
ser bizevent, health checks, o integraciones sin el identificador.

### Corrección

Según lo que salga:

| Hallazgo | Acción |
|---|---|
| Tráfico interno / health checks | `drop` en `processing`, o routing a pipeline de descarte |
| Integración sin identificador | Corregir en origen, o mapear por otro campo |
| Cliente nuevo no dado de alta | Alta en el lookup de M1 |

Cerrá siempre con el catch-all `sin-clasificar` de M1 para que el hueco quede medible.

### Ganancia

Descartar en ingesta lo que nadie consulta reduce retención pagada y presupuesto de consulta. En el
caso de referencia, 22.617 eventos cada 30 min × 180 días de retención.

---

## M4 — Convertir consultas crudas repetidas en métricas de ingesta

**Impacto: alto (costo) · Esfuerzo: medio · Riesgo: bajo**

### Síntoma

Tiles de dashboard con `fetch spans | summarize` o `fetch logs | summarize` que corren en cada
refresh, sobre buckets de retención larga.

### Cómo detectarlo

```
fetch dt.system.events, from: now()-7d
| filter event.kind == "QUERY_EXECUTION_EVENT"
| summarize n = count(), by:{event.type}
```

Y revisá los tiles: cualquiera cuyo resultado sea un número agregado es candidato.

### Corrección

Mové el cálculo a `metricExtraction` en el pipeline:

- `counterMetric` / `samplingAwareCounterMetric` para conteos
- `valueMetric` / `samplingAwareValueMetric` para duraciones y percentiles

En spans **usá siempre la variante `samplingAware`**: sin ella el sampling subestima los conteos y
los números no cuadran con la realidad.

El dashboard pasa a `timeseries`, que es órdenes de magnitud más barato que `fetch`.

### Patrón recomendado

Por cada dominio, tres métricas: **total** (denominador), **errores** (numerador) y **duración**.
Con esas tres se calcula tasa de fallo, throughput y latencia sin volver al dato crudo.

---

## M5 — Descartar ruido de alto volumen en ingesta

**Impacto: alto (costo) · Esfuerzo: bajo · Riesgo: bajo**

Candidatos habituales, en orden de volumen típico:

| Qué | Cómo |
|---|---|
| Health checks (`/health`, `/healthz`, `/readyz`, `/livez`) | Routing a pipeline dedicado con retención corta, o descarte |
| Assets estáticos (`*.js`, `*.css`, imágenes) | `matchesValue(url.path, "*.js", caseSensitive: false)` → descarte |
| Precargas de framework (Next.js, etc.) | Por `dt.smartscape.service` |
| Métricas OTel de runtime (`dotnet.*`, `kestrel.*`, `aspnetcore.*`, `dns.lookup.*`) | Routing a pipeline de descarte, dejando pasar las de entornos de prueba |
| Logs de infraestructura sin valor diagnóstico | Bucket de retención corta (3–7 d) en vez de descarte |

**El descarte en ingesta es la palanca de costo más eficiente que existe.** Es más barato que
cualquier optimización aguas abajo.

Cuidado: descartar es irreversible para ese dato. Empezá mandando a un bucket de 3 días en vez de
descartar; si en dos semanas nadie lo reclamó, ahí sí descartá.

---

## M6 — Auditar retenciones por defecto

**Impacto: medio · Esfuerzo: bajo · Riesgo: bajo**

Los buckets `default_*` traen retenciones de fábrica que nadie eligió. En el caso de referencia,
`default_security_events` retiene **1102 días** sin que nadie lo hubiera decidido.

```bash
GET /platform/storage/management/v1/bucket-definitions
```

Cruzá `retentionDays` contra el volumen real y contra lo que el contrato con el cliente exige.
Cualquier bucket con retención > 90 días necesita justificación explícita.

---

## M7 — Limpiar routing muerto

**Impacto: bajo (mantenibilidad) · Esfuerzo: muy bajo · Riesgo: nulo**

Dos patrones:

- **Entradas después del catch-all.** Si hay una entrada con `matcher: true` a mitad de la lista,
  todo lo que siga es código muerto. En el caso de referencia había una entrada de prueba después
  del catch-all de spans.
- **Entradas con `enabled: false`.** Configuración abandonada que confunde a quien audite después.

Borrarlas no cambia comportamiento y baja mucho el costo de la próxima auditoría.

---

## M8 — Versionar la configuración fuera de Dynatrace

**Impacto: alto (operativo) · Esfuerzo: bajo · Riesgo: nulo**

Los objetos de settings **no tienen historial recuperable por API**. El audit log guarda los diffs
~372 días, pero no permite restaurar.

Y hay conocimiento que solo vive en los comentarios de los procesadores: qué proveedor siempre
responde 200 y obliga a mirar un código interno, qué 401 es esperado y no un fallo. **Si se pierde
esa configuración, se pierde el conocimiento del negocio.**

Exportá periódicamente y versioná:

```bash
for KIND in logs bizevents spans metrics events usersessions; do
  for ASPECT in routing pipelines ingest-sources pipeline-groups data-forwarding; do
    GET /platform/classic/environment-api/v2/settings/objects\
?schemaIds=builtin:openpipeline.$KIND.$ASPECT&fields=objectId,value&pageSize=500 \
      > openpipeline/$KIND.$ASPECT.json
  done
done
```

A git. Es media hora de trabajo y es la única red de seguridad real.

---

## M9 — Techo de consumo por consulta

**Impacto: medio · Esfuerzo: bajo · Riesgo: bajo**

El permiso `storage:query-consumption` acepta condición en política IAM, y permite acotar cuánto
puede escanear una consulta.

Sirve para dos cosas: contener consultas ad-hoc abusivas de usuarios con acceso a dashboards, y
poner un techo de costo por sesión.

Antes de fijar el número, medí lo que consumen los dashboards legítimos más pesados — un techo por
debajo de eso los rompe.

---

## Orden de aplicación sugerido

1. **M8** (versionar) — antes de tocar nada
2. **M7** (limpiar routing muerto) — riesgo nulo, aclara el terreno
3. **M6** (auditar retenciones) — solo lectura, da la línea base de costo
4. **M3** + **M5** (cerrar el hueco y descartar ruido) — la ganancia de costo grande
5. **M4** (métricas de ingesta) — la ganancia de costo sostenida
6. **M1** + **M2** (lookup y deduplicación) — la ganancia de mantenibilidad, mayor riesgo
7. **M9** (techo de consulta) — al final, con datos reales de consumo
