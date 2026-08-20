---
name: dps-guardrails
description: Instala controles preventivos para que el consumo indebido de Dynatrace DPS no se repita — presupuestos de escaneo Grail, alertas de consumo anómalo, políticas de bucket y retención, límites de refresh en dashboards, y un dashboard/notebook de gobernanza permanente. Úsala cuando pidan "poner controles", "que no vuelva a pasar", "presupuesto de consumo", "alertas de gasto", "gobernanza de consumo", "guardrails de licencia" o después de una auditoría que dejó hallazgos. Para medir el gasto usa dps-ratecard-audit; para identificar quién lo causa usa dps-consumo-indebido.
---

# Guardrails de consumo DPS

Auditar sin instrumentar es repetir la auditoría en seis meses con los mismos números. Esta skill
convierte cada hallazgo de `dps-consumo-indebido` en un control que **avisa o frena antes** de que
el gasto se acumule.

Tres capas, de la más barata de implementar a la más estructural:

1. **Detección continua** — alertas y un dashboard de gobernanza que vigilan las mismas firmas que
   la auditoría, pero todos los días.
2. **Límites blandos** — presupuestos de escaneo, timeframes máximos, políticas de refresh.
3. **Límites duros** — políticas de bucket, retención por defecto, scopes de capability.

## Antes de empezar

Ten a mano la tabla de hallazgos de la auditoría. Cada guardrail debe rastrear a un hallazgo
concreto; un control que no previene nada observado es ruido. Si no hay auditoría previa, corre
primero `dps-consumo-indebido` para tener línea base.

## Capa 1 — Detección continua

### 1a. Dashboard de gobernanza permanente

Las queries de auditoría son directamente reutilizables como tiles. Monta un dashboard con, como
mínimo:

- `scanned_gib` total por día (línea) — detecta picos apenas ocurren.
- Top 10 `query_string` por `scanned_gib` en 7 días — caza el próximo dashboard costoso antes de
  que acumule meses.
- `dt.sfm.metrics.ingest.datapoints` por `grail.metric.key` — vigila ingesta de métricas.
- `security.events` por `event.type` y `compliance.standard.name` — alerta si aparece un estándar
  nuevo o un salto de volumen.
- Inventario de buckets por `estimated_uncompressed_bytes` y `retention_days`.

Los tiles y su DQL están en `references/gobernanza-tiles.md`. Se despliegan con
`dtctl apply -f dashboard.yaml` o vía Document API. Si el cliente ya tiene la **app de gobernanza
de dashboards** (AppEngine), esta cubre la parte de dashboards; complementa con los tiles de
metrics y security.

### 1b. Alertas de consumo anómalo

Umbrales que disparan un workflow (email/Slack) cuando una firma se cruza. Configuración en
`references/alertas.md`. Las cuatro imprescindibles:

- **Escaneo diario** por encima de N× la mediana de 30 días.
- **Nuevo `query_string`** con `avg_gib` alto apareciendo por primera vez.
- **Nuevo estándar de compliance** o clúster entrando en `security.events`.
- **Nueva `grail.metric.key` de tipo `log.*`** en el top de ingesta.

> El propio workflow de alerta consume. Acota su DQL a ventanas cortas y ejecútalo cada hora, no
> cada minuto. Un guardrail que se vuelve consumo indebido es un chiste caro.

## Capa 2 — Límites blandos

Detalle en `references/politicas.md`.

- **Presupuesto de escaneo Grail** — límite de bytes por query. Frena el `fetch` sin filtro antes
  de que llegue al corte de 500 GB. Es la protección nativa de Grail; súbela/bájala según el
  tenant.
- **Timeframe máximo por dashboard** — acota `defaultTimeframe`. El mayor multiplicador de costo
  en tiles con refresh.
- **Política de refresh** — refresh mínimo permitido (ej. ≥5 min) en dashboards compartidos.
  Convención + revisión, no siempre imponible técnicamente.
- **Convención de buckets** — todo dato nuevo entra con filtro de bucket obligatorio en las
  queries recurrentes.

## Capa 3 — Límites duros

- **Retención por defecto conservadora** en buckets nuevos; subir solo con justificación
  (regulatoria, forense). Ver `references/politicas.md` §Retención — y **pregunta por el requisito
  legal antes de tocar** facturación electrónica, salud o banca.
- **Scope explícito de capabilities premium** — Security Posture, RVA, RAP y Full-Stack se
  habilitan por scope nombrado, nunca "todo el ambiente". Confirma el objeto de settings después
  de cada cambio masivo.
- **Segmentación prod / no-prod** — `host.group` o `dt.security_context` que permita aplicar
  políticas de tarifa distintas y detectar premium sobre no-prod (P11 del catálogo).

## Cómo priorizar qué instalar

No instales las tres capas de golpe. Por cada hallazgo de la auditoría:

| Si el hallazgo es… | Instala primero |
|---|---|
| recurrente y de causa conocida | límite duro que lo elimina en la fuente |
| esporádico o de causa variable | alerta que lo detecta cuando reaparece |
| estructural (modelo de tarifa) | tile de gobernanza + revisión trimestral |

Regla: **un control por hallazgo**, con su condición de disparo derivada del umbral que ya usó la
auditoría. Así el guardrail y el diagnóstico hablan el mismo idioma.

## Verificación

Un guardrail sin prueba de que dispara es decorativo. Para cada uno documenta:

- **Cómo se prueba** que salta (query que fuerza la condición, o valor de prueba).
- **A quién avisa** y por qué canal.
- **Qué se hace** cuando salta (runbook de una línea).

Deja esto en un `Runbook_Guardrails_<Cliente>.md` junto al dashboard. El siguiente que reciba una
alerta a las 2 a.m. necesita saber qué hacer sin leer esta skill.

## Referencias

- `references/gobernanza-tiles.md` — tiles del dashboard permanente con su DQL
- `references/alertas.md` — umbrales, workflows de notificación y cómo evitar que la alerta gaste
- `references/politicas.md` — presupuestos, buckets, retención, scopes

## Skills hermanas

- **`dps-ratecard-audit`** — medir el gasto.
- **`dps-consumo-indebido`** — identificar y atribuir el abuso que estos controles previenen.
