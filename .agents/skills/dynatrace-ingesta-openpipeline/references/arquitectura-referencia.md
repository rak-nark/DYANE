# Arquitectura de referencia — caso real

Levantamiento de un tenant de partner con ~15 clientes finales sobre una misma plataforma SaaS
(agencia de viajes multimarca). Sirve como patrón de comparación: si el tenant que auditás se
parece, los mismos antipatrones aplican.

> Identificadores de cliente reemplazados por `<agencyId-N>`. La estructura es literal.

## Resumen

| Dimensión | Valor |
|---|---|
| Buckets | 68 (30 personalizados, 38 `default_*` / `dt_*`) |
| Kinds con pipeline propio | 3 de 13 (`bizevents`, `logs`, `spans`) |
| Pipelines | 17 |
| Entradas de routing | 45 |
| Reglas de `securityContext` | **440** (68 × 4 + 84 × 2) |
| Clientes finales | ~15, discriminados por `agencyId` y por `url.path` |

## Buckets

Tres criterios de partición conviviendo, lo cual ya es una señal:

**Por entorno** — el criterio dominante y el que mejor funciona:

| Bucket | Tabla | Retención |
|---|---|---|
| `smartlinks_production_bucket` | bizevents | 180 d |
| `smartlinks_demo_bucket` | bizevents | 15 d |
| `smartlinks_testing_bucket` | bizevents | 15 d |
| `smartlinks_production_spans` | spans | 90 d |
| `spans_development_env` / `spans_demo_env` / `spans_release_env` | spans | 15 / 15 / 10 d |
| `logs_production_bucket` | logs | 90 d |
| `logs_testing_bucket` / `logs_development_bucket` | logs | 7 d |

**Por cliente** — solo para algunos, de forma inconsistente:

`spans_puntoscolombia`, `spans_puntoscolombia_ext`, `spans_bac`, `spans_fidelity`, `spans_ppm`,
`events_rum_ppm` (90 d cada uno).

**Por dominio funcional:**

`spans_ms_hotels_production` (90 d), `logs_ms_hotels_production` (90 d), `spans_health_monitoring`
(10 d), `logs_infra_rabbitmq` (3 d), `logs_ag_search_air_prod` (3 d), `spans_frontend` (90 d),
`events_sdlc_*` (15 d × 5).

> **Observación clave.** Los dashboards del cliente consultan
> `fetch spans, bucket: {smartlinks_production_spans}` — un bucket **compartido**. Los buckets
> `spans_<cliente>` existen pero no son la vía de aislamiento. **El aislamiento real es
> `dt.security_context` dentro de buckets compartidos**, no la partición física. Restringir por
> `storage:bucket-name` en IAM aportaría poco y habría que mantenerlo bucket a bucket.

## Bizevents

**5 pipelines**, uno por dominio de negocio: `smartlinks_security_outgoing`,
`smartlinks_bookings_outgoing`, `smartlinks_payments_outgoing`, `smartlinks_search/ag_outgoing`,
más `Clusters NP` (no productivo).

**8 entradas de routing.** Discriminan por `dt.openpipeline.source == "/api/v2/bizevents/ingest"` +
el `referer` del módulo emisor (`UltraGroup.SmartLinks.<dominio>`). Dos entradas adicionales para
casos puntuales (`event.type == "management.users"`, y un drop de payloads gzip corruptos).

**Etapas por pipeline** (los cuatro de dominio son estructuralmente idénticos):

| Etapa | Cantidad | Qué hace |
|---|---|---|
| `processing` | 12–20 | Normaliza `response.statusCode` y `response.time` a numérico, clasifica Cliente/Proveedor/Interno, normaliza nombres de proveedor y endpoints con ID embebido, calcula `isFailure` |
| `securityContext` | **68** | Una regla por agencia: `agencyId == "<agencyId-N>"` → contexto |
| `metricExtraction` | 3–5 | `counterMetric` total, `counterMetric` errores, `valueMetric` duración |
| `storage` | 3 | `environment == "Production"/"Demo"/"Development"` → bucket correspondiente |

El patrón de métricas es correcto y vale copiarlo: **total + errores + duración**, con el total
como denominador explícito para poder calcular tasa de fallo sin volver al dato crudo.

Los comentarios de los procesadores documentan excepciones reales por proveedor — por ejemplo, un
proveedor que siempre responde HTTP 200 y obliga a mirar un `answerCode` interno, o un 401 que es
comportamiento esperado y no un fallo. **Ese conocimiento solo vive ahí.** Es frágil y es la razón
principal para versionar la configuración fuera de Dynatrace.

## Spans

**9 pipelines.** Cinco de observabilidad por dominio (`payments`, `management`, `bookings`,
`search`, `security`), más `spans_health_monitoring`, `spans_optl_environments`, `smartlinks-spans`
y `spans_to_omit`.

**16 entradas de routing**, en este orden — el orden *es* la lógica:

1. Health checks (`/api/health`, `/healthz`, `/readyz`…) → pipeline propio, retención 10 d
2. Cargas de JavaScript (`*.js`) → descarte
3. Spans de front redundantes (precarga de imágenes/CSS) → descarte
4. Microservicios de hoteles por namespace
5. No productivo por `dt.kubernetes.cluster.id`
6. Transaction logging de RabbitMQ → descarte
7. Frontend por `service.name`
8–12. Los cinco dominios, por `dt.smartscape.service == toSmartscapeId("SERVICE-...")`
13–14. OTel por entorno
15. `smartlinks-spans-route` (catch-all `true`)
16. Una entrada de prueba **después del catch-all → código muerto**

**Las tres primeras entradas son la mejor decisión de todo el diseño**: descartan en ingesta el
ruido de mayor volumen (health checks, assets estáticos, precargas) antes de que llegue a Grail.

`metricExtraction` en los pipelines de dominio: 5 a 15 procesadores
`samplingAwareCounterMetric` por endpoint (errores 5xx, 4xx) más un `samplingAwareValueMetric` de
duración del span raíz. Usar la variante *samplingAware* es correcto: sin ella el sampling
subestimaría los conteos.

Dos pipelines (`spans_optl_environments`, `smartlinks-spans`) llevan **84 reglas de
`securityContext`**: las mismas 68 por `agencyId` más 16 por dominio web
(`matchesPhrase(url.path, "<dominio>.com")`), incluida una que separa el portal de empresas del de
personas del mismo cliente.

## Logs

**3 pipelines**: `production_logs`, `logs_k8s_ns_test`, `Convertir logs en bizevents` (deshabilitado).

**12 entradas de routing** por `ActionName` del módulo, por `k8s.namespace.name` / `k8s.cluster.uid`,
y por `service.name`. Cierra con `environment == "Production"` → bucket de producción.

Solo **1 regla de `securityContext`**. Contra 68 en bizevents. Los logs de este tenant están
efectivamente sin discriminar por cliente.

## Metrics

**0 pipelines de procesamiento, 9 entradas de routing — todas hacia pipelines de descarte.**

```
not matchesPhrase(k8s.namespace.name, "-test") and matchesPhrase(metric.key, "http.server.")
not matchesPhrase(k8s.namespace.name, "-test") and matchesPhrase(metric.key, "http.client.")
... dotnet.*, kestrel.*, aspnetcore.*, dns.lookup.*, smartlinks.request.duration, process.cpu.time
+ un catch-all de respaldo para las 8 anteriores
```

Es un **filtro de métricas OTel de alto volumen y bajo valor en producción**, dejando pasar las de
`-test`. Es una decisión de costo deliberada y bien ejecutada. Vale replicarla: las métricas
automáticas de runtime .NET/ASP.NET son de las que más volumen generan y menos se consultan.

## Kinds sin configurar

`events`, `security.events`, `events.sdlc`, `usersessions`, `davis.problems`, `davis.events`,
`smartscape.events`, `system.events`, `user.events` — sin pipelines propios. Todo cae al
comportamiento por defecto, con los buckets `default_*` y su retención de fábrica.

`default_events` retiene 35 d, `default_bizevents` 90 d, `default_security_events` 1102 d.
**Conviene revisar si esas retenciones por defecto son las deseadas**, sobre todo la de 1102 días.

## Distribución real del contexto de seguridad

Muestra de 30 minutos sobre `bizevents`:

| `dt.security_context` | Eventos |
|---|---|
| **`null`** | **22.617** |
| `<cliente-A>` | 396 |
| `<cliente-B>` + sub-marca | 340 |
| `<cliente-C>` + país | 337 |
| ... otros 15 contextos | 3 – 188 c/u |

**El 92 % de los bizevents no tiene contexto de seguridad.** Ese dato es invisible para todo cliente
con boundary, pero ocupa los 180 días de retención del bucket de producción y se paga igual.

La causa es directa: las 68 reglas cubren 68 `agencyId` conocidos; todo lo demás — tráfico interno,
health checks que llegan a bizevents, agencias nuevas, integraciones sin `agencyId` — pasa sin
estampar.
