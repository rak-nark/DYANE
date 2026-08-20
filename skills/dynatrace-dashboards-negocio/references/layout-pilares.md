# Layout de pilares: grid y patrón de columna

Basado en el patrón del demo oficial "easyTravel Business Process" de Dynatrace, adaptado y
verificado en dos dashboards de producción reales (Retiro Digital / validarRetiroBot,
ServVeridasRestWS de 4 pilares).

## Grid de 24 columnas

Los dashboards de Dynatrace usan un grid de 24 columnas de ancho. Para N pilares con espacio
visual real entre ellos (no pegados):

- **Ancho de columna por pilar: 5**
- **Paso entre el inicio de un pilar y el siguiente: 6** (deja 1 columna de gap real)

Con 4 pilares: `x = 0, 6, 12, 18` (cada uno con `w: 5`), dejando columna 24 libre como margen
derecho. Si usás `w: 6` con `step: 6` los pilares quedan pegados sin distinción visual — este
fue explícitamente un pedido de corrección del usuario en sesión ("genera un espacio en blanco
entre proceso, para que se vea una distinción").

## Patrón de tiles por columna (de arriba hacia abajo)

Alturas aproximadas en unidades de grid (`h`), ajustá según contenido real:

1. **Banner de título** (`h: 2`) — nombre del paso/endpoint, color de fondo = color de marca
   asignado a ese paso (ver `marca-cliente.md`). Tipo de tile: markdown o singleValue con
   `colorThresholdTarget: "background"`.
2. **Descripción + leyenda de códigos** (`h: 2-3`) — markdown corto explicando qué códigos de
   negocio son éxito/error para este paso específico (cada paso de un proceso puede tener su
   propia semántica de códigos).
3. **Badge de volumen total** (`h: 3`) — singleValue, `countIf` o `count()` total de eventos del
   paso en el timeframe. **Sin** `colorThresholdTarget: "background"` si el usuario pidió que el
   color vaya solo en el texto, no de fondo (gotcha real: "el total es al revés, no de fondo el
   color").
4. **Gauge de tasa de éxito** (`h: 3-4`) — `countIf(éxito) / count() * 100`, tipo gauge, rango
   0-100, umbrales de color coherentes con la semántica de negocio del paso.
5. **Badges de salud técnica** (`h: 2` cada uno, throughput + P90) — si el endpoint es una Key
   Request nativa, usá `timeseries` sobre `dt.service.request.*` filtrado por el ID de la Key
   Request; si no lo es, calculalo desde `fetch spans | filter url.path == "..."`. Recordá el
   gotcha de `round()` → usar `toLong()`.
6. **Honeycomb de distribución de códigos** (`h: 4-5`) — agrupado por el campo de código de
   negocio, con `unitsOverrides` decimals:0 (ver `dql-gotchas.md`). Preferido sobre area chart
   multi-serie cuando hay poca historia.
7. **Trend binario Éxito/No-Éxito** (`h: 3-4`) — area o line chart de 2 series simples en el
   tiempo, para no perder la dimensión temporal que el honeycomb no tiene. Si el paso tiene un
   problema de cobertura de datos conocido (ver `ingesta-prerequisitos.md`), nombrá las series
   honestamente: "Error Confirmado" / "Sin Dato" en vez de fingir "Éxito" / "Error" cuando en
   realidad no podés diferenciar.
8. **Tabla de detalle** (`h: 4-6`) — top motivos de error / últimos eventos con motivo, filtrada
   a solo los casos de error o revisión.

## Secciones transversales (no dentro de una columna)

- **Sección de funnel/journey**: si hay un campo de correlación entre pasos (ver
  `business-flow-nativo.md`), una fila de badges (uno por paso, mostrando su tasa de conversión
  al siguiente) + una tabla de journey completa usando `lookup` encadenados con `prefix:`
  distintos por paso (ver `dql-gotchas.md`).
- **Sección de trazas de negocio combinada**: una tabla final que junta los N endpoints en una
  sola vista de spans/traces con link de drill-down (columna markdown con link, ver
  `dtctl-workflow.md` para generar el link correcto vía `dtctl open intent` en vez de armarlo a
  mano).

## Configuración del dashboard en sí

- `settings.defaultTimeframe`: preferí `"today"` en vez de rangos relativos tipo `-24h` fijados
  en cada query individual — así el usuario controla el rango desde el selector del dashboard y
  todas las queries responden igual. Sacá cualquier `from:-24h` hardcodeado de las queries
  individuales cuando migres a este patrón (fue un pedido explícito de corrección en sesión).
- `settings.defaultRefreshInterval`: `"1m"` es razonable para un dashboard operativo que se deja
  abierto en una pantalla.
