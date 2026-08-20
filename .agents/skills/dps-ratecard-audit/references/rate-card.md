# Rate card DPS — tarifas, fórmulas y unidades

## Tarifas verificadas en campo

Estas seis salieron de un costeo real contrastado con el rate card del cliente (Corona, 2026-07).
Úsalas como base, pero **confírmalas contra el contrato** de cada cliente antes de reportar.

| Capability | Tarifa | Unidad de cobro |
|---|---|---|
| Logs/Traces/Events — Query | **$0.0035** | por GiB escaneado |
| Logs/Traces/Events — Ingest & Process | **$0.20** | por GiB ingerido |
| Logs/Traces/Events — Retain | **$0.0007** | por GiB-día |
| Logs/Traces/Events — Retain with Included Queries | **$0.02** | por GiB-día (sin cargo de Query) |
| Metrics — Ingest & Process | **$0.15** | por cada 100 000 datapoints |
| Security Posture Management | **$0.007** | por host-hora |

## Tarifas por confirmar

No están verificadas. Aparecen en `assets/rate-card.json` con valor `null`. **Llénalas desde el
contrato, no de memoria ni de la web** — el rate card varía por acuerdo comercial, región y
compromiso anual.

- Full-Stack Monitoring (host-hora, por unidad de 8 GiB de RAM)
- Infrastructure Monitoring (host-hora)
- Kubernetes Platform Monitoring (pod-hora)
- Real User Monitoring (por sesión) / RUM + Session Replay (por sesión)
- Synthetic — HTTP monitor / Browser monitor (por ejecución)
- Application Security — Runtime Vulnerability Analytics (host-hora)
- Application Security — Runtime Application Protection (host-hora)
- Application Protection / Threat observability
- AppEngine Functions (GiB-segundo o función-segundo)
- Automations / Workflow actions (por nodo ejecutado)
- Davis Data Units — modelo clásico, si el tenant aún los factura
- Business Events — ingest, retain, query
- Grail Records (si aplica el modelo por registro)

## Trampa de unidades — léela antes de multiplicar

El rate card factura en **GiB** (2³⁰ = 1 073 741 824 bytes). Las queries de consola suelen dividir
entre `1000000000` (GB decimal) porque se lee mejor en pantalla. **No son lo mismo.**

```
GiB = GB_decimal × 0.9313225746154785
GiB = bytes / 1073741824
```

Un costeo con GB decimal **sobreestima ~7.4 %**. Si vas a costear, cambia el divisor a
`1073741824` directamente en la query y ahórrate el paso de conversión manual:

```
| summarize scanned_gib = round(sum(scanned_bytes)/1073741824, decimals:2)
```

## Fórmulas

| Categoría | Fórmula | Fuente del dato | Calidad |
|---|---|---|---|
| Logs/Traces/Events — Query | `GiB_escaneados × 0.0035` | `sum(scanned_bytes)` en `dt.system.query_executions` ÷ 1 073 741 824 | **exacto** |
| Logs/Traces/Events — Ingest & Process | `GiB_almacenados × 0.20` | `estimated_uncompressed_bytes` en `dt.system.buckets` | estimado (snapshot) |
| Logs/Traces/Events — Retain | `GiB_promedio × días × 0.0007` | `GiB_promedio ≈ GiB_actual / 2` | estimado (crecimiento lineal) |
| Retain with Included Queries | `GiB_promedio × días × 0.02` | mismo dato, tarifa alternativa | estimado |
| Metrics — Ingest & Process | `(datapoints / 100000) × 0.15` | `sum(dt.sfm.metrics.ingest.datapoints)` | parcial (~24–30 d de retención) |
| Security Posture Management | `nodos_en_alcance × horas_desde_habilitación × 0.007` | alcance en `builtin:kubernetes.security-posture-management`; fecha = primer `COMPLIANCE_FINDING` | exacto en alcance, estimado en continuidad |

### Comparativa Query vs Retain-with-Included-Queries

Cuando Query domina la factura, calcula **las dos** y compara. La tarifa
"Retain with Included Queries" ($0.02/GiB-día, sin cargo de Query) puede salir más barata en
tenants con dashboards de auto-refresh sobre buckets grandes. Es una palanca contractual real y
suele ser la recomendación de mayor impacto del informe.

```
Escenario A = (GiB_escaneados × 0.0035) + (GiB_prom × días × 0.0007)
Escenario B =  GiB_prom × días × 0.02
```

## Calidad del dato — cómo etiquetar cada cifra

| Etiqueta | Significa |
|---|---|
| **exacto** | El dato facturado está registrado tal cual (Query). |
| **estimado** | Reconstruido con un supuesto explícito. Di cuál. |
| **parcial** | Ventana incompleta por retención de la fuente. Di cuántos días cubre. |
| **no disponible** | No hay fuente. Dilo; no interpoles. |

Un informe con una cifra sin etiqueta es un informe que alguien va a usar para negociar un
contrato. Etiqueta siempre.

## Métricas `dt.billing.*` — qué esperar

Existen **12** y son del modelo **clásico**: Full-Stack, Infrastructure, Logs ingest, Traces
ingest, RVA, RAP, etc. No hay ninguna de DPS (Log Query, Metrics Ingest, Security Posture).
Comprobado con:

```
fetch metric.series
| filter contains(lower(metric.key), "posture") or contains(lower(metric.key), "ingest_and_process")
   or contains(lower(metric.key), "log_management") or contains(lower(metric.key), "grail")
   or contains(lower(metric.key), "dpu") or contains(lower(metric.key), "dps")
| summarize count(), by:{metric.key}
```

→ 0 resultados. Si el tenant aún factura por modelo clásico, `fetch metric.series | filter
startsWith(metric.key, "dt.billing.")` sí sirve y es preferible a reconstruir.
