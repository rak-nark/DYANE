---
name: dynatrace-ingesta-openpipeline
description: Inventaria, audita, mejora y replica la arquitectura de ingesta de un tenant Dynatrace — OpenPipeline (routing, pipelines, procesadores), buckets y retención, bizevents, extracción de métricas, Cost Allocation por app/gerencia (dt.cost.costcenter), reglas de descarte de logs, y asignación de dt.security_context para aislamiento multicliente. Úsala cuando pidan "cómo funciona la ingesta", "auditar OpenPipeline", "revisar buckets", "bucket por aplicación/gerencia", "cost allocation" o "atribuir consumo por app", "excluir/descartar logs de X", "de dónde salen los bizevents", "por qué esta métrica no existe", "aislar clientes por security context", "bajar consumo de Grail en ingesta", o cuando haya que montar el mismo esquema en un cliente nuevo. Para permisos y políticas IAM usa el runbook de lockdown; para medir gasto DPS usa dps-ratecard-audit.
---

# Ingesta y OpenPipeline en Dynatrace

La ingesta es donde se decide **qué dato existe, dónde vive, cuánto cuesta y quién puede verlo**.
Casi todos los problemas que aparecen después — una métrica que no existe, un cliente que ve datos
de otro, una factura de Grail que se dispara — se originan acá y no se arreglan aguas abajo.

Esta skill te da: el modelo mental, cómo inventariar un tenant real, los antipatrones que ya
encontramos en producción, y el procedimiento para replicar el esquema en un cliente nuevo.

## El modelo mental

Todo dato que entra a Grail atraviesa la misma cadena. Entenderla en orden es la mitad del trabajo:

```
   INGEST SOURCES        ¿por qué endpoint entra?
          ↓
      ROUTING            ¿a qué pipeline lo mando?  (primera coincidencia gana)
          ↓
   ┌───────────────────────────── PIPELINE ─────────────────────────────┐
   │  PROCESSING          normalizar, renombrar, calcular campos, drop  │
   │  SECURITY CONTEXT    estampar dt.security_context  ← el aislamiento│
   │  METRIC EXTRACTION   convertir registros en métricas (barato)      │
   │  DATA EXTRACTION     derivar bizevents / eventos SDLC              │
   │  DAVIS               generar eventos de problema                   │
   │  STORAGE             asignar bucket  ← define retención y costo    │
   └────────────────────────────────────────────────────────────────────┘
          ↓
   DATA FORWARDING       ¿lo mando también fuera de Dynatrace?
```

**Cuatro reglas que gobiernan todo:**

1. **El routing es first-match.** La primera entrada cuya condición se cumple gana; las demás ni se
   evalúan. El orden de la lista *es* la lógica. Un catch-all (`matcher: true`) al principio anula
   todo lo que sigue.
2. **El bucket define retención y costo.** Sin `bucketAssignment` el dato cae al bucket `default_*`
   de su tabla, con la retención por defecto. Asignar bucket es la palanca de costo más directa.
3. **Sin `dt.security_context` no hay aislamiento.** Un boundary IAM sobre ese campo es
   *deny-by-default*: el registro sin contexto no se lo ve **nadie** (salvo quien no tenga boundary).
   Ver [aislamiento](#aislamiento-multicliente).
4. **Extraer métrica es órdenes de magnitud más barato que consultar el dato crudo.** Un
   `counterMetric` en ingesta cuesta una fracción de lo que cuesta un `fetch spans | summarize` en
   cada refresh de dashboard.

## Paso 1 — Inventariar el tenant

Nunca opines sobre una ingesta que no inventariaste. El estado real casi siempre difiere del
documentado.

> **La API de OpenPipeline migró a Settings 2.0.** El endpoint clásico
> `/platform/openpipeline/v1/configurations/{kind}` ahora devuelve
> `404 "Migration in-progress/completed, the requested resource is no longer available."`
> La configuración vive en schemas `builtin:openpipeline.<kind>.<aspecto>`.

Procedimiento completo, endpoints y scopes en **`references/api.md`**. El resumen:

```bash
# 1. Qué kinds existen y qué procesadores admite cada una (esto SÍ sigue vivo)
GET /platform/openpipeline/v1/configurations

# 2. La configuración real, por schema de settings
GET /platform/classic/environment-api/v2/settings/objects?schemaIds=builtin:openpipeline.<kind>.routing
GET /platform/classic/environment-api/v2/settings/objects?schemaIds=builtin:openpipeline.<kind>.pipelines

# 3. Buckets y retención
GET /platform/storage/management/v1/bucket-definitions
```

Las 13 *kinds* posibles: `logs`, `events`, `security.events`, `bizevents`, `spans`, `events.sdlc`,
`metrics`, `usersessions`, `davis.problems`, `davis.events`, `smartscape.events`, `system.events`,
`user.events`.

Cada una admite 5 aspectos: `routing`, `pipelines`, `ingest-sources`, `pipeline-groups`,
`data-forwarding`.

**Qué mirar en cada respuesta:**

| Buscá | Porque |
|---|---|
| Entradas de routing con `matcher: true` | Es un catch-all: todo lo que esté debajo es código muerto |
| Entradas con `enabled: false` | Configuración abandonada que confunde a quien audite después |
| Pipelines sin `storage` | Ese dato cae al bucket por defecto — retención y costo no controlados |
| `securityContext` con muchos procesadores | Señal de mantenimiento manual; ver antipatrón #1 |
| El mismo bloque repetido en varios pipelines | Ver antipatrón #2 |
| `metricExtraction` vacío en pipelines de spans | Oportunidad: los dashboards estarán consultando spans crudos |

## Paso 2 — Auditar contra los antipatrones

Estos salieron de auditorías reales, no de la documentación. **`references/mejoras.md`** trae el
detalle, la evidencia y el procedimiento de corrección de cada uno.

### Antipatrón 1 — La cadena de reglas de security context

El más caro de todos. Se manifiesta como decenas de procesadores `securityContext` encadenados, uno
por cliente, cada uno con un `matcher` de igualdad contra un identificador:

```
matcher: agencyId == "d8b15be6-..."   →  securityContext: ["puntoscolombia"]
matcher: agencyId == "fa5218ce-..."   →  securityContext: ["mi-viaje-honduras"]
...  (× N clientes)
```

**Por qué duele:** cliente nuevo = editar cada pipeline a mano. Y lo peor: **un identificador que no
esté en la lista no recibe contexto**, y un registro sin `dt.security_context` es invisible para
todos los clientes con boundary — pero sigue ocupando retención y presupuesto de Grail.

**Cómo detectarlo:** contá los procesadores de la etapa `securityContext` y medí el hueco:

```
fetch <tabla>, from: now()-30m | summarize n = count(), by:{dt.security_context} | sort n desc
```

Si la fila `null` domina, tenés el problema. Corrección en `references/mejoras.md`.

### Antipatrón 2 — Bloques duplicados entre pipelines

El mismo conjunto de reglas copiado en N pipelines. Un cambio = N ediciones, y basta olvidar una
para que un cliente pierda el contexto en un flujo. Se detecta comparando los hashes de las etapas.

### Antipatrón 3 — Dato caro que nadie acota

Spans y logs sin `bucketAssignment`, o con buckets de retención larga sin justificación. Cruzá
`bucket-definitions` (retención) contra el volumen real por bucket antes de opinar.

### Antipatrón 4 — Dashboards que consultan crudo lo que debería ser métrica

Si un tile hace `fetch spans | summarize count()` cada 5 minutos sobre 90 días de retención, eso es
una métrica que no se extrajo en ingesta. El patrón correcto es `counterMetric` /
`samplingAwareCounterMetric` en el pipeline, y el dashboard consulta `timeseries`.

### Antipatrón 5 — Routing sin catch-all explícito

Si ninguna entrada matchea, el dato sigue el camino por defecto en silencio. Siempre cerrá la lista
con una entrada `true` explícita, aunque sea para mandarlo a un pipeline de descarte con nombre.

## Aislamiento multicliente

Es el caso de uso que más se repite en tenants de partner. Dos piezas que deben coincidir:

1. **En ingesta:** estampar `dt.security_context` en cada registro (etapa `securityContext`).
2. **En IAM:** un *policy boundary* por grupo de cliente con
   `storage:dt.security_context IN ("<contexto>")`.

**Semántica del boundary — verificada en producción, no documentada por Dynatrace:**

| Caso del registro | ¿Lo ve el cliente? |
|---|---|
| Contexto igual al del boundary | Sí |
| Contexto distinto | No |
| **Campo `dt.security_context` nulo** | **No** |

Es *deny-by-default*. Eso es bueno para la seguridad — nada se filtra — pero significa que **el dato
sin contexto es dato pagado que nadie consume**. Ese es el costo real del antipatrón 1.

Dos advertencias de la documentación de boundaries que muerden:

- **Los boundaries no aplican a sentencias `DENY`.** Un `DENY` es absoluto para el grupo.
- **Nunca pongas dos boundaries en un mismo binding.** Operan de forma independiente y los permisos
  que ninguno cubra pueden quedar *sin restricción*. Múltiples condiciones van como líneas dentro
  del mismo boundary.

Verificación obligatoria, **ejecutada con una cuenta real del grupo del cliente**, nunca como admin:

```
fetch bizevents, from: now()-30m | summarize count(), by:{dt.security_context}
```

Debe devolver únicamente filas del cliente. Si aparece `null` o el contexto de otro, parás y
corregís antes de entregar.

## Paso 3 — Replicar a un cliente nuevo

Procedimiento completo en **`references/replicacion.md`**. El orden importa y no es negociable:

1. Definir el **identificador discriminante** (qué campo distingue a este cliente en el dato crudo).
2. Crear el **bucket** con la retención pactada, antes de enrutar nada.
3. Agregar la regla de **security context**.
4. Agregar la entrada de **routing**, respetando el orden — antes del catch-all.
5. Extraer las **métricas** que el dashboard vaya a necesitar.
6. Crear el **boundary IAM** y asociarlo al grupo.
7. **Verificar con usuario real** antes de dar por cerrado.

Saltarse el paso 7 es la causa más común de que un aislamiento "aplicado" no aislara nada.

## Ejecución: dtctl o API REST

**`dtctl` no aporta nada aquí y en la práctica estorba.** Es un envoltorio sobre la misma API REST;
no cubre los schemas `builtin:openpipeline.*` mejor que un `curl`, y agrega una dependencia de Go
que en las máquinas de trabajo no suele estar instalada.

**Usá REST directo.** El detalle está en `references/api.md`: autenticación OAuth `dt0s02`, scopes
por operación, y las plantillas de `GET`/`POST`/`PUT` para cada schema.

Reglas de ejecución que no se saltan:

- **Respaldá antes de tocar.** `GET` del objeto completo a un archivo, siempre. Los objetos de
  settings no tienen historial recuperable por API.
- **El audit log es tu red de seguridad y es gratis.** `fetch dt.system.events | filter event.kind == "AUDIT_EVENT"`
  trae `details.json_before`, `json_patch` y `json_after` de cada cambio, con retención de ~372 días
  y **0 GB de consumo de Grail**. Es el único historial real de la configuración.
- **Un cambio a la vez, verificando el dato.** Los cambios de ingesta no son retroactivos: solo
  afectan lo que entre a partir de ese momento. Esperá una ventana antes de concluir.
- **Nunca uses `DENY` condicional sobre `storage:*`** en las políticas asociadas. La documentación
  lo advierte: un DENY condicional sobre tablas de Grail se ejecuta **incondicionalmente** y mata el
  acceso completo.

## Gotchas verificados en campo (no en la doc)

Estos costaron 400s reales. Detalle y payloads exactos en `references/recetas-verificadas.md`.

- **Las etapas del pipeline incluyen `costAllocation` y `productAllocation`** además de
  processing/securityContext/metricExtraction/dataExtraction/davis/storage. `costAllocation` estampa
  **`dt.cost.costcenter`** — es el mecanismo de Cost Allocation por app/gerencia.
- **Los matchers de routing NO admiten `in()` ni `contains()`** (400 "function isn't enabled"). Usá
  `==`, `OR` explícito para listas, y `matchesPhrase(campo,"x")` para substring.
- **`metadataList` en el pipeline da 400** — es opcional, omitilo.
- **Excluir logs = procesador `drop`** en la etapa `processing`, ruteado primero. Rutear por campo
  estructurado (`log.source`), nunca por `content` (se lleva falsos positivos).
- **El discriminante por contenido es basura** — capturó dato de otra app. Por campo: logs AKS →
  `k8s.namespace.name`; métricas Azure → `azure.resource.group`; y ~2/3 del volumen k8s es ruido de
  sistema (kube-system, ingress, gatekeeper…) que va a un bucket de retención corta.
- **Solo ~1 de cada 7 apps de un inventario tiene dato + discriminante real.** El resto (macros, RPAs,
  tareas, "no implementado") no se construye. Validá el footprint por app antes de crear nada.
- **Buckets nacen `creating`**, tardan minutos en `active`. Y tras un cambio hay **buffer de agente**:
  ~2 min de dato viejo llegando tarde antes de que la regla se vea al 100%.
- **DQL por REST** (`/platform/storage/query/v1/query:execute` + poll) cuando el MCP no está.

## Por qué esta skill NO se separa por señal

La mecánica —routing, stages, procesadores, buckets, security context, cost allocation, drop— es
**idéntica** para logs, bizevents, spans y metrics (mismo schema `builtin:openpipeline.<kind>.*`). Una
skill por señal duplicaría el 90%. La separación correcta es por **concern**, en los archivos de
referencia de abajo, no en skills distintas.

## Referencias

| Archivo | Contenido |
|---|---|
| `references/recetas-verificadas.md` | **Payloads exactos que funcionan**: pipeline, routing, cost allocation, drop, discriminantes, buckets, verificación, DQL-REST. El primero que hay que leer para ejecutar |
| `references/api.md` | Endpoints, scopes, autenticación y plantillas de llamada |
| `references/arquitectura-referencia.md` | Caso real completo (UltraGroup) como patrón de comparación |
| `references/mejoras.md` | Catálogo de mejoras con evidencia y procedimiento |
| `references/replicacion.md` | Playbook paso a paso para un cliente nuevo |
