# Ingesta: prerrequisitos antes de tocar el dashboard

## 0. Auditar qué existe

```bash
# Reglas de captura HTTP existentes para el dominio del proceso
dtctl get settings --schema builtin:bizevents.http.incoming -o json

# Buckets ya creados para este cliente
dtctl get buckets -o json | grep -i "<cliente>"

# Pipelines y routing
dtctl get settings --schema builtin:openpipeline.bizevents.pipelines -o json
dtctl get settings --schema builtin:openpipeline.bizevents.routing -o json

# Dashboards previos del cliente (fuente de colores/convenciones reales)
dtctl get dashboards -o wide | grep -i "<cliente>"
```

Si ya existe una regla de captura genérica (frecuentemente nombrada algo como "Test" o
similar, apuntando a `Response - Body`/`Request - Body` completos sin parsear), es oro: te deja
ver samples reales del payload de negocio sin escribir nada nuevo todavía.

## 1. Diagnosticar cobertura ANTES de escribir reglas dedicadas

No asumas la forma de un campo JSON de negocio — verificalo con datos reales:

```dql
fetch bizevents, from:now()-7d
| filter event.type == "<endpoint>"
| fields timestamp, `Response - Body`, `Request - Body`
| limit 20
```

Medí cobertura real antes de confiar en una regla:

```dql
fetch bizevents, from:now()-7d
| filter event.type == "<endpoint>"
| summarize total = count(), conBody = countIf(isNotNull(`Response - Body`))
| fieldsAdd pctCobertura = conBody * 100.0 / total
```

**Cuidado con ventanas de muestra angostas.** Un error real de esta sesión: concluir "no hay
histórico" a partir de una muestra de ~9 minutos que casualmente cayó en una ventana sin body —
al ampliar la ventana, 5987/6023 registros SÍ tenían historial. Siempre ampliá la ventana antes
de descartar un dato como inexistente. Lo mismo aplica a "el campo X no existe" — puede ser que
tu filtro esté mal, no que el campo no exista (ver `dql-gotchas.md`).

**A veces el límite es real y no se puede resolver desde Dynatrace.** En una sesión encontramos
un endpoint donde, tanto con extracción de campo específico como con captura de body completo
sin parsear (`path:"*"`), el body de la respuesta solo llegaba en ~1.4% de los casos exitosos
(vs. ~100% en los casos de error, que son bodies más chicos). Es consistente con un límite de
tamaño de payload en la capa de captura, fuera del alcance de configuración de OpenPipeline.
Cuando llegues a ese punto: no sigas iterando variantes de regla esperando que una funcione —
documentá la limitación en el propio dashboard (ej. un texto "cobertura limitada, ver nota") y
proponé al usuario las alternativas reales: escalar al equipo de desarrollo del servicio, o
capturar el dato desde logs en vez de desde el body de la respuesta HTTP.

## 2. Arquitectura de ingesta

Patrón recomendado cuando un proceso de negocio tiene N pasos/endpoints:

- **1 bucket dedicado** para todo el proceso (ej. `veridas_bizevents`), Grail storage,
  retención acorde a lo que el cliente necesite (30d es un default razonable para bizevents de
  negocio).
- **1 pipeline** (`builtin:openpipeline.bizevents.pipelines`) con stage `storage` apuntando
  `bucketAssignment` al bucket, y opcionalmente un stage `processing` con procesadores `dql`
  para limpieza (ver ejemplo de `replaceString()` para arrays-como-string en `dql-gotchas.md`).
- **1 entrada de routing** (`builtin:openpipeline.bizevents.routing`) — el array es
  **first-match-wins**, así que la entrada nueva del proceso debe ir ANTES de cualquier entrada
  catch-all genérica que la intercepte primero. Condición típica:
  `matchesValue(event.category, "<DominioDelProceso>")`.
- **N reglas de captura** (`builtin:bizevents.http.incoming`), una por endpoint del proceso:
  - `event.category` = constante compartida por todo el proceso (ej. `"ServVeridasRestWS"`) —
    esto es lo que la regla de routing matchea.
  - `event.type` = constante específica del endpoint (ej. `"obtenValidacion"`) — esto es lo que
    distingue un paso de otro dentro del mismo bucket/pipeline.
  - `event.provider` = constante = nombre real del servicio/controller (útil más adelante para
    el campo `provider` de un Business Flow — ver `business-flow-nativo.md`).
  - `data[]`: un extractor por campo de negocio, `sourceType: request.body` o `response.body`
    según corresponda, `path:` con la ruta JSON del campo dentro del body.

## Gotchas operativos

- **Bucket creation 403 pese a scope correcto.** Crear un bucket vía `dtctl apply` o API REST
  puede devolver `403 Required permissions not met` aunque el token OAuth tenga
  `storage:buckets:write`. Parece ser una restricción de política IAM más estricta que el scope
  declarado. Solución: pedirle al usuario que cree el bucket a mano desde Settings → Storage
  Management en la UI (toma 30 segundos), y seguís vos con pipeline/routing/reglas via dtctl.
- **Propagación de reglas HTTP: ~15-20 minutos**, más lenta que un cambio de pipeline puro (que
  suele propagar en minutos). No te quedes esperando bloqueado — ver `dtctl-workflow.md` para el
  patrón de polling en background.
- **Nombrar bien desde el día 1.** El usuario en esta sesión renombró las reglas con un prefijo
  consistente (`VERIDAS | ServVeridasRestWS/api/<endpoint>`) después de crearlas — mejor
  proponer la convención de nombre completa (prefijo de proyecto + servicio + endpoint) antes de
  crear las N reglas, para no tener que rehacer el trabajo.
