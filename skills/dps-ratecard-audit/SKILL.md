---
name: dps-ratecard-audit
description: Audita el consumo real de un tenant Dynatrace contra el rate card DPS y produce un informe de costo por capability (Query, Ingest, Retain, Metrics, Security Posture, host-hora). Úsala cuando pidan "cuánto estamos consumiendo de licencia", "por qué se disparó el DPS", "auditoría de consumo", "costeo del tenant", "análisis de rate card", "informe de licencia Dynatrace" o cuando haya que reconstruir el gasto de un periodo. NO usar para detectar quién causa el abuso (esa es dps-consumo-indebido) ni para poner controles preventivos (esa es dps-guardrails).
---

# Auditoría de consumo DPS contra rate card

DPS **no expone sus categorías de facturación vía DQL**. No existen métricas `dt.billing.*` para
Log Query, Metrics Ingest o Security Posture — solo las 12 del modelo clásico (Full-Stack, Infra,
RVA, RAP...). Verificado en campo; no pierdas tiempo buscándolas.

Por eso toda auditoría se reconstruye desde el **dato operativo que origina cada cargo**
(bytes escaneados, datapoints ingeridos, host-horas de cobertura) y luego se aplica el rate card
manualmente. Ese es el método de esta skill.

## Antes de empezar

1. Lee `references/rate-card.md` — tarifas, fórmulas y la trampa de unidades GiB vs GB.
2. Abre `assets/rate-card.json` y **confirma las tarifas contra el contrato del cliente**. Los
   valores marcados `"source": "verified"` están comprobados; los `null` hay que llenarlos antes
   de reportar un dólar. Nunca inventes una tarifa.
3. Define la ventana: normalmente el año de licencia (`from:"YYYY-01-01T00:00:00Z"`).

## Herramientas

Cualquiera de las dos, según lo disponible:

- **`dtctl`** (CLI, preferida para auditorías largas — permite `-o toon`, redirigir a archivo y
  encadenar con `grep`/`jq`). Ver `references/dtctl-setup.md` si falla la autenticación.
- **MCP Dynatrace** (`mcp__dynatrace-MCP-<TENANT>__execute_dql`) para tenants ya conectados.

> ⚠️ Toda query de esta skill lleva filtro de entidad o tabla acotada. Nunca lances un
> `fetch logs` sin filtro: Grail corta a los 500 GB escaneados y **ese scan te lo facturan** —
> serías tú mismo el consumo indebido que vienes a auditar.

## Procedimiento

### Paso 0 — Reconocimiento del ambiente

```bash
dtctl inventory --plain
```

Te dice qué capabilities están presentes, censo de entidades y buckets. Ojo: el inventario puede
mentir por omisión. En Corona reportó "sin Kubernetes" y sin embargo había *compliance scanning*
facturando sobre un clúster AKS. **Ausencia de observabilidad ≠ ausencia de facturación.**

### Paso 1 — Query (dato exacto, sin estimación)

Fuente: `dt.system.query_executions`. Cada ejecución DQL del tenant queda ahí con
`scanned_bytes`, `table`, `bucket`, `user.email`, `query_pool`, `query_string`.

Ejecuta, en este orden, las queries de `references/dql-cookbook.md` §1:
por mes → por tabla → por bucket → dentro del bucket dominante por `user.email` → por `query_string`.

El corte por `query_string` es el que revela el problema: un `avg_gb` alto con `executions` en
miles y `query_pool == "DASHBOARDS"` es un tile con auto-refresh, no un análisis ad-hoc.
Si aparece ese patrón, **para aquí y pasa a la skill `dps-consumo-indebido`** para identificar al
dueño; luego vuelve a cerrar el costeo.

### Paso 2 — Ingest & Retain (estimado, declararlo como tal)

Fuente: `dt.system.buckets` → `estimated_uncompressed_bytes`, `records`, `retention_days`.
Es un *snapshot* del volumen almacenado hoy, no una serie histórica.

**No intentes** reconstruir la ingesta mes a mes con `stringLength(content)`: en logs
estructurados el payload vive en campos custom y `content` está casi vacío, así que el proxy da
números incoherentes — y de paso dispara el corte de 500 GB. Está probado y descartado.

Para Retain usa `GiB_promedio ≈ GiB_actual / 2` (crecimiento lineal desde cero) y **marca la cifra
como estimación** en el informe.

### Paso 3 — Metrics Ingest & Process

Métrica de self-monitoring: `dt.sfm.metrics.ingest.datapoints`.

Retiene solo **~24–30 días**. No se puede reconstruir el histórico anual: documéntalo como
limitación en vez de extrapolar en silencio.

Para desagregar por fuente, la dimensión útil es `grail.metric.key` (no `dt.extension.config.id`,
que viene `null`). Si un `by:{...}` te devuelve todo en un grupo `null`, inspecciona el esquema
completo antes de descartar la métrica:

```
fetch metric.series | filter metric.key == "dt.sfm.metrics.ingest.datapoints" | limit 1
```

### Paso 4 — Capabilities por host-hora (Security Posture, RVA, Full-Stack, Infra)

Dos fuentes y **las dos son obligatorias**:

1. **Eventos** (`security.events`, etc.) → cuándo empezó, qué volumen, qué estándares.
2. **Configuración real** (`dtctl get settings --schema builtin:...`) → cuál es el alcance
   facturable exacto.

El alcance **no se infiere de los eventos**. Un host cubierto que no generó hallazgos en la
ventana consultada igual factura. En Corona los eventos sugerían ambigüedad y el objeto
`builtin:kubernetes.security-posture-management` confirmó 4 nodos — no los 77 hosts del ambiente.
La diferencia entre inferir y confirmar era ~19x en la factura.

Distingue capabilities que comparten tabla: `VULNERABILITY_FINDING` es RVA;
`COMPLIANCE_FINDING` es Security Posture Management. Un pico de hallazgos con conteo de hosts
plano es **reevaluación**, no cobertura nueva facturable.

### Paso 5 — Costeo y informe

Aplica las fórmulas de `references/rate-card.md` §Fórmulas. Convierte a **GiB** (÷ 1 073 741 824),
no a GB decimal.

Redacta con `references/plantilla-informe.md`. Regla no negociable del informe: cada cifra lleva
etiqueta **exacto** o **estimado**, y las estimaciones dicen de qué supuesto salen.

## Entregable

Dos documentos, siempre:

- `Informe_Consumo_DPS_<Cliente>_<YYYY-MM>.md` — ejecutivo: cifras, top ofensores, acciones.
- `Metodologia_y_Queries_<Cliente>_<YYYY-MM>.md` — técnico: cada comando, su propósito y qué se
  aprendió, para que el equipo reproduzca o extienda.

El documento técnico incluye los **intentos descartados** con el motivo. Ahorra que el siguiente
repita el callejón sin salida.

## Referencias

- `references/rate-card.md` — tarifas, fórmulas, unidades
- `references/dql-cookbook.md` — todas las queries por categoría, listas para pegar
- `references/plantilla-informe.md` — estructura de los dos entregables
- `references/dtctl-setup.md` — contexto, auth y el bug del espacio en la URL
- `assets/rate-card.json` — tarifas editables por cliente

## Skills hermanas

- **`dps-consumo-indebido`** — quién y qué está generando el gasto anómalo.
- **`dps-guardrails`** — cómo evitar que vuelva a pasar.
