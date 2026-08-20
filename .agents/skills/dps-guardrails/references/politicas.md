# Políticas — límites blandos y duros

Controles que reducen la superficie de consumo indebido en la fuente. Ordenados de menos a más
intrusivos. Cada uno rastrea a un patrón del catálogo de `dps-consumo-indebido`.

---

## Límites blandos

### Presupuesto de escaneo Grail (previene P2)

Grail corta a los 500 GB por query por defecto. Es la protección que evita que un `fetch` sin
filtro escanee sin fin — y el scan igual se factura hasta el corte, así que el límite protege la
factura, no solo el rendimiento.

- Mantén el límite por defecto salvo justificación. **Subirlo es autorizar consumo.**
- En MCP/dtctl la variable de presupuesto de escaneo controla cuánto puede una sesión antes de
  frenar. Bájala en tenants sensibles.
- Para análisis legítimos que necesitan más, usa muestreo (`enableSampling`) en vez de subir el
  techo global.

### Timeframe máximo en dashboards (previene P1)

El mayor multiplicador de costo en tiles con refresh. Un tile a 90 días escanea 90x uno a 1 día.

- Convención: `defaultTimeframe` de dashboards compartidos ≤ 7 días salvo excepción documentada.
- Los tiles que necesitan histórico largo van en un dashboard **bajo demanda** (sin auto-refresh),
  no en uno de monitoreo continuo.

### Política de refresh (previene P1)

- Refresh mínimo ≥5 min en dashboards compartidos; ≥15 min si el bucket subyacente es grande.
- No siempre es imponible por configuración — es convención + revisión en el dashboard de
  gobernanza (Tile 2 lo delata).

### Filtro de bucket obligatorio (previene P2)

Toda query recurrente (tile, alerta, workflow) filtra `dt.system.bucket == ...`. Las ad-hoc usan
segmentos. Un `fetch <tabla>` sin acotar bucket es un hallazgo por definición.

---

## Límites duros

### Retención por defecto (previene P12)

- Buckets nuevos nacen con retención conservadora (ej. 35–90 días). Subir a 365 requiere
  justificación escrita.
- **Antes de bajar la retención de un bucket existente, pregunta por el requisito legal.** En
  facturación electrónica, salud y banca la retención larga suele ser **obligatoria** — ahí la
  palanca correcta no es borrar dato, es migrar a `Retain with Included Queries` (tarifa plana,
  sin cargo de Query). Ver `dps-ratecard-audit` §Comparativa.
- Ajusta `retention_days` al percentil 95 del uso real observado, no al máximo teórico.

### Scope explícito de capabilities premium (previene P9, P10, P11)

Security Posture, RVA, RAP y Full-Stack se habilitan por **scope nombrado**, nunca "todo el
ambiente".

- Después de **cualquier cambio masivo** de configuración, reconfirma el scope con
  `dtctl get settings --schema builtin:...`. Un capability que se coló en un cambio global
  factura en silencio.
- Desmarca estándares de compliance que no correspondan al proveedor del clúster (CIS EKS sobre
  AKS = desperdicio puro).
- El scope facturable se valida contra la **config**, no contra los eventos. Regla heredada de la
  auditoría: los eventos dicen quién generó hallazgos; la config dice quién está cubierto.

### Segmentación prod / no-prod (previene P11)

- `host.group` o `dt.security_context` que distinga ambientes.
- Permite política de tarifa distinta (Infra en no-prod, Full-Stack solo en prod) y hace detectable
  el patrón "premium sobre laboratorio".
- Regla: no-prod nunca nace con capability premium; se sube caso por caso con dueño identificado.

---

## Matriz control → patrón

| Control | Previene | Capa | Intrusividad |
|---|---|---|---|
| Presupuesto de escaneo Grail | P2 | blando | baja |
| Timeframe máximo | P1 | blando | baja |
| Política de refresh | P1 | blando | media (convención) |
| Filtro de bucket obligatorio | P2, P3 | blando | media |
| Retención por defecto | P12 | duro | alta (¿regulatorio?) |
| Scope explícito de premium | P9, P10, P11 | duro | media |
| Segmentación prod/no-prod | P11 | duro | alta |

---

## Cadencia de revisión

Los guardrails se degradan si nadie los mira. Deja agendado:

- **Semanal:** ojo al dashboard de gobernanza (Tiles 2, 5, 7). 5 minutos.
- **Mensual:** revisar alertas disparadas y falsos positivos; ajustar umbrales.
- **Trimestral:** re-correr `dps-ratecard-audit` completo y comparar contra el trimestre anterior.
  Si el ahorro proyectado en la auditoría anterior no se materializó, el guardrail no está
  funcionando — investígalo.

Un guardrail sin cadencia de revisión es un guardrail que ya no existe; solo todavía no te
enteraste.
