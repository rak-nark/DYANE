---
name: dynatrace-dashboards-negocio
description: Construye dashboards de NEGOCIO en Dynatrace estilo "pilares" (como el demo oficial easyTravel Business Process) para procesos compuestos por varios endpoints HTTP — con marca del cliente homologada, ingesta dedicada, Business Flow nativo, y todos los gotchas de DQL/dtctl ya resueltos en producción real. Usála SIEMPRE que pidan "un dashboard de negocio", "un dashboard tipo el demo de Dynatrace", "pilares", "columnas por proceso/paso", un flujo de autenticación/trámite/onboarding de varios pasos, homologar colores o marca de un cliente en un dashboard, o correlacionar pasos de un mismo proceso — incluso si no dicen "dashboard" explícitamente pero describen un proceso de negocio de varios pasos que quieren visualizar o medir.
---

# Dashboards de negocio estilo "pilares" en Dynatrace

Esta skill captura el método completo para construir un dashboard de negocio tipo el demo
oficial de Dynatrace (easyTravel Business Process): un proceso compuesto por varios pasos/
endpoints HTTP, cada uno como una columna con salud de negocio + salud técnica, marca del
cliente, y opcionalmente un Business Flow nativo correlacionando las sesiones.

Todo lo de acá salió de sesiones reales contra tenants de producción (AFORE México, Retiro
Digital y ServVeridasRestWS), verificado en vivo con `dtctl`/MCP nativo de Dynatrace — no es
documentación oficial reformulada. Cuando algo contradice la documentación de Dynatrace o a otra
skill de este set (`dynatrace-ingesta-openpipeline` recomienda API REST sobre `dtctl`; en la
práctica `dtctl` resultó mucho más capaz de lo que esa skill asume — usalo como herramienta
principal), confiá en lo verificado acá y avisá si encontrás una discrepancia nueva.

## Antes de empezar: ¿el usuario ya sabe qué quiere medir?

Si el usuario menciona "pilares" o pega una captura del demo easyTravel, ya tiene el modelo
mental correcto — confirmá con él/ella la lista de pasos/endpoints del proceso y seguí. Si
todavía no lo tiene claro, ayudalo a identificar: ¿cuáles son los pasos del proceso de negocio
(no técnicos) que un usuario real atraviesa? Un login no es un "pilar" en sí — es un paso; el
pilar es la columna del dashboard que lo representa.

## Flujo de trabajo

### Paso 0 — Auditar qué existe antes de asumir que hay que crear algo

Antes de escribir una sola regla, respondé: ¿ya hay una regla de captura de bizevents para estos
endpoints? ¿Ya existe un bucket/pipeline dedicado? ¿Ya hay un dashboard de referencia de este
cliente (para sacarle la paleta de colores)? ¿Ya existe un Business Flow configurado (aunque sea
para otro proceso — sirve de plantilla real de schema)?

```bash
dtctl get settings --schema builtin:bizevents.http.incoming -o json | grep -i "<nombre del proceso>"
dtctl get buckets -o json | grep -i "<cliente>"
dtctl get dashboards -o wide | grep -i "<cliente>"
dtctl get settings --schema "app:dynatrace.biz.flow:biz-flow-settings" -o json
```

Encontrar algo existente no es un obstáculo — es la mejor fuente de verdad sobre convenciones
reales del tenant (nombres de campos, colores, schema exacto). Ver
`references/ingesta-prerequisitos.md`.

### Paso 1 — Diagnosticar la cobertura de captura ANTES de escribir reglas

**No asumas la estructura de un campo de negocio sin verla en datos reales.** Si el cliente te
pasó un notebook exportado (JSON con queries + resultados cacheados), usalo primero — te ahorra
consultas contra Grail. Si no, buscá una regla de captura genérica existente (tipo "Test", que
suele traer `Response - Body`/`Request - Body` completos) y mirá samples reales del payload antes
de decidir qué campos extraer.

Medí el % de cobertura real (`countIf(isNotNull(`Response - Body`))` / total) **antes** de dar
por buena una regla dedicada. Encontramos un endpoint real donde la captura genérica solo traía
el body en 1.4% de las respuestas exitosas — y ni la extracción de campo específico ni la
captura de body completo lo resolvieron (probablemente un límite de tamaño de respuesta del lado
de la plataforma). A veces el límite es real: documentalo como limitación conocida en el propio
dashboard en vez de fingir que el dato existe. Ver `references/ingesta-prerequisitos.md` para el
procedimiento completo y `references/dql-gotchas.md` para las técnicas de extracción que sí
funcionan.

### Paso 2 — Completar la ingesta si hace falta

Bucket dedicado → pipeline con `bucketAssignment` → entrada de routing (**first-match-wins**, la
entrada nueva va antes de cualquier catch-all) → reglas `builtin:bizevents.http.incoming` (una
por endpoint, con `event.category` constante = dominio de negocio compartido y `event.type`
constante = endpoint específico, así un solo bucket/pipeline sirve para los N pasos del proceso).

Dos advertencias que cuestan tiempo si no las sabés de antemano:
- Crear buckets vía API puede dar `403 Required permissions not met` **aunque el token OAuth
  tenga el scope correcto** (`storage:buckets:write`) — parece una restricción de política IAM
  más estricta que el scope. Si pasa, pedile al usuario que cree el bucket a mano en la UI
  (Settings → Storage Management) y seguís vos con pipeline/routing/reglas.
- Las reglas de captura HTTP (`bizevents.http.incoming`) tardan **~15-20 minutos** en propagar al
  OneAgent — más que un cambio de pipeline puro (esos suelen andar en minutos). No esperes
  bloqueado: lanzá el polling en background. Ver `references/dtctl-workflow.md`.

### Paso 3 — Sacar y homologar la marca del cliente

Extraé la paleta con una herramienta de color-fetch contra el sitio/app del cliente (ej.
https://www.colorfetch.com/). Si ya existe OTRO dashboard de este cliente, **extraé los
`colorRules` reales de su JSON en vez de confiar en memoria** — los colores "recordados" de una
sesión anterior pueden estar mal. Aplicá la paleta de forma consistente en TODOS los tiles vía
`colorRules` custom-color (no solo el banner de título) — ver `references/marca-cliente.md` para
el mapeo semántico de colores que funcionó bien (código de éxito → color primario, códigos de
error → colores de alerta, banner principal → color de acento).

Reutilizá el logo si ya está subido como documento de la plataforma
(`/platform/document/v1/documents/<id>/content`) en vez de resubirlo.

### Paso 4 — Diseñar el layout de pilares

Cada paso del proceso = una columna. Patrón por columna (de arriba a abajo):
1. Banner de título de la columna (color de marca)
2. Descripción corta + leyenda de códigos de negocio
3. Badge de volumen total + gauge de tasa de éxito/error
4. Badges de salud técnica (throughput + P90, desde métricas nativas `dt.service.request.*` si
   el endpoint es Key Request, o desde `fetch spans` filtrado por `url.path` si no lo es)
5. **Honeycomb de distribución de códigos** (no un area chart multi-serie por código — con poca
   historia se ve como un pico roto en vez de una curva, porque toda la actividad cae en 1-2
   buckets de tiempo; el honeycomb no depende del eje de tiempo y evita ese problema)
6. Trend binario Éxito/No-Éxito (o "Error Confirmado/Sin Dato" si el endpoint tiene el problema
   de cobertura del Paso 1) para no perder la dimensión de tiempo
7. Tabla de detalle con los top motivos de error

Layout de 24 columnas de grid con **espacio real entre pilares** (ancho de columna 5, paso entre
columnas 6 — no 6+6 pegado, que no deja gap visual). Ver `references/layout-pilares.md` para las
coordenadas x/y/w/h exactas de cada tile del patrón.

Toda query DQL de este layout tiene sus gotchas ya resueltos — ver
`references/dql-gotchas.md` antes de escribir nada a mano, ahorra varias vueltas de
verify_dql/execute_dql.

### Paso 5 (opcional) — Business Flow nativo

Si los pasos del proceso comparten un campo de correlación real (probalo con datos históricos:
buscá 2 eventos de pasos consecutivos con el mismo valor de ese campo y timestamps cercanos —
no asumas que un campo correlaciona sin esa prueba), considerá crear un Business Flow nativo
(`app:dynatrace.biz.flow`) en vez de (o además de) una tabla de journey manual en el dashboard.
Es la app oficial de Dynatrace para esto — visualiza drop-off y tiempos entre pasos mejor que
cualquier tile custom. Ver `references/business-flow-nativo.md` para el schema y cómo
descubrirlo si ya existe uno de otro proceso del mismo cliente.

### Paso 6 — Aplicar

Siempre `dtctl apply --dry-run` antes de aplicar de verdad, siempre backup del objeto original
antes de editarlo (`dtctl get ... -o yaml > backup.yaml`), y trabajá siempre sobre el estado LIVE
del recurso antes de editar — si el usuario ya tocó el dashboard a mano en la UI entre una
consulta tuya y la siguiente, tu copia local está desactualizada. Ver
`references/dtctl-workflow.md` para el flujo completo, incluyendo cómo generar links de
drill-down verificados con `dtctl open intent` en vez de inventar URLs.

## Referencias

| Archivo | Contenido |
|---|---|
| `references/ingesta-prerequisitos.md` | Bucket/pipeline/routing/reglas, diagnóstico de cobertura, antes de tocar el dashboard |
| `references/layout-pilares.md` | Coordenadas de grid exactas del patrón de columna, cuándo honeycomb vs. trend |
| `references/dql-gotchas.md` | Quirks de DQL verificados en vivo (round, timestamp de spans, dedup, parse JSON, if/else, lookup, honeycomb decimals, empty-state) |
| `references/marca-cliente.md` | Color-fetch, homologación contra dashboard existente, reutilizar logo |
| `references/business-flow-nativo.md` | Schema de `app:dynatrace.biz.flow`, cómo descubrir/replicar uno existente |
| `references/dtctl-workflow.md` | dry-run, backup, polling en background, `dtctl open intent`, MCP nativo vs. dtctl |
