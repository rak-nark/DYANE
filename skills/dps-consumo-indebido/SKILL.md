---
name: dps-consumo-indebido
description: Detecta consumo indebido o anómalo de capabilities Dynatrace DPS y lo atribuye a un dueño concreto — dashboards con auto-refresh sobre buckets grandes, queries sin filtro, alertas ruidosas que queman DDU, metric-extraction olvidadas, escaneos de compliance fuera de alcance, hosts no-prod facturando. Úsala cuando pidan "validar consumos indebidos", "quién está gastando la licencia", "por qué subió el consumo", "detectar abuso", "consumo anómalo", "qué dashboard está costando" o cuando una auditoría revele un pico sin explicar. Para el costeo completo del tenant usa dps-ratecard-audit; para prevenir usa dps-guardrails.
---

# Detección y atribución de consumo indebido

El objetivo no es "ver cuánto se gastó" (eso es `dps-ratecard-audit`), sino **poner nombre**:
qué query, qué dashboard, qué usuario, qué regla de configuración está generando el gasto — y
cuánto cuesta dejarlo como está.

Un hallazgo sin dueño no genera acción. Un hallazgo sin cifra no gana prioridad. Los dos, siempre.

## Definición operativa

**Consumo indebido** = gasto que se puede eliminar sin perder capacidad de observación. Tres
familias:

1. **Desperdicio** — se paga por dato que nadie mira (alertas ruidosas, métricas derivadas de
   logs olvidadas, hosts apagados que siguen cubiertos, estándares de compliance irrelevantes).
2. **Ineficiencia** — se obtiene el mismo resultado por mucho menos (dashboard con refresh de
   1 min sobre 365 días de bucket, query sin filtro de bucket, timeframe por defecto excesivo).
3. **Fuera de alcance** — un capability facturando sobre entidades que no debía cubrir
   (no-prod, clúster equivocado, ambiente de laboratorio).

## Procedimiento

### 1. Barrer los patrones

Recorre `references/patrones.md`. Es un catálogo de 12 patrones, cada uno con su **firma DQL**,
su umbral y su severidad. Ejecuta los que apliquen al tenant — no todos, solo los de los
capabilities activos.

Orden recomendado por retorno: Query (P1–P4) → Alertas/DDU (P5–P6) → Metrics (P7–P8) →
Cobertura y alcance (P9–P12).

> ⚠️ Cada query del catálogo lleva filtro y ventana acotada. No las relajes: un `fetch logs` sin
> filtro escanea hasta el corte de 500 GB de Grail y **ese scan se factura**. Estarías generando
> el consumo indebido que vienes a cazar.

### 2. Atribuir — de la señal al dueño

Un `query_string` costoso no es un hallazgo hasta que sabes de qué dashboard viene y quién lo
mantiene. `references/atribucion.md` tiene las tres rutas:

- **Vía `client.source`** (la más rápida) — trae la URL completa del dashboard.
- **Vía `dtctl get dashboards`** + búsqueda por palabra clave del negocio.
- **Vía escaneo de tiles** cuando el `query_string` no aparece literal (el JSON escapa `\n`).

Para configuración (compliance, extraction rules, monitores) el dueño se resuelve por
`dt.system.events` con `event.kind == "AUDIT_EVENT"`: quién creó o modificó el objeto y cuándo.

### 3. Cuantificar

Por cada hallazgo, tres números:

| Número | Cómo se calcula |
|---|---|
| **Costo del periodo** | consumo observado × tarifa del rate card |
| **Proyección anual si no se corrige** | costo del periodo × (365 / días del periodo) |
| **Ahorro de la corrección** | proyección × factor de reducción estimado del fix |

El factor de reducción se justifica: "bajar el refresh de 1 min a 15 min reduce ejecuciones 15x →
93 % de ahorro en esa línea". No es un número al ojo.

### 4. Priorizar y reportar

Ordena por **ahorro anual ÷ esfuerzo**, no por severidad absoluta. Un hallazgo de $200k que
requiere renegociar contrato va después de uno de $80k que se arregla cambiando un campo.

Usa la tabla de `references/patrones.md` §Formato de hallazgo. Un hallazgo completo tiene:
patrón, evidencia (la query y su salida), dueño, impacto $, acción concreta, esfuerzo, riesgo de
aplicar la acción.

### 5. Cerrar el ciclo

Todo hallazgo confirmado debería salir de aquí con un control preventivo asociado. Pasa a
`dps-guardrails` para convertir cada uno en presupuesto, alerta o política de bucket. Auditar sin
instrumentar significa repetir la auditoría en seis meses con los mismos números.

## Falsos positivos frecuentes

Antes de reportar, descarta estos — todos han pasado:

- **Reevaluación masiva ≠ cobertura nueva.** Si los hallazgos de vulnerabilidad se multiplican
  pero `countDistinct(host)` sigue plano, es un rescan. No lo cargues al mes.
- **La query cara puede ser tuya.** Filtra tu propio `user.email` y el de los auditores antes de
  señalar a nadie. Un análisis de consumo mal escrito aparece en el top 3.
- **Un pico único no es un patrón.** Exige `executions` alto **y** recurrencia mensual antes de
  llamarlo abuso. Un análisis forense legítimo escanea mucho una vez.
- **Ausencia en el inventario ≠ ausencia de facturación.** `dtctl inventory` puede reportar "sin
  Kubernetes" mientras un compliance scan factura sobre un clúster real.
- **Campo `null` ≠ dato inexistente.** Si un `by:{}` colapsa en `null`, inspecciona el esquema
  completo del registro antes de concluir que la dimensión no existe.

## Referencias

- `references/patrones.md` — catálogo de 12 patrones con firma DQL, umbral, severidad y fix
- `references/atribucion.md` — de la query al dashboard, del objeto al dueño
- `references/formato-hallazgo.md` — plantilla de hallazgo y tabla ejecutiva

## Skills hermanas

- **`dps-ratecard-audit`** — costeo completo del tenant contra el rate card.
- **`dps-guardrails`** — controles preventivos para que no vuelva.
