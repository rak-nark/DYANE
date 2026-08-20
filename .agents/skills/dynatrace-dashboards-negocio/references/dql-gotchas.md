# Gotchas de DQL verificados en vivo

Todos verificados contra tenants reales de producción (no son teoría de la documentación).
Revisá esta lista antes de escribir queries a mano — te ahorra vueltas de `verify_dql`.

## `round(..., decimals:N)` devuelve `null` con datasets grandes

Confirmado reproducible: la MISMA query, con la MISMA lógica, devuelve `null` cuando el dataset
subyacente supera ~1500 filas, y un número válido cuando es más chico. No es un bug del filtro —
es el `round()` mismo.

```dql
// Falla (null) con volumen alto:
| summarize p90 = round(percentile(duration, 90), decimals:2)

// Funciona siempre:
| summarize p90 = toLong(percentile(duration, 90))
```

Usá `toLong()` en vez de `round()` para cualquier KPI que corra sobre volúmenes de datos que
puedan crecer (throughput alto, ventanas largas). Si necesitás decimales de verdad (no un
entero), format-string el número en vez de confiar en `round()`.

## `fetch spans`: el campo `timestamp` se ve `null` aunque el sort funcione

```dql
fetch spans
| sort timestamp desc   // esto SÍ funciona internamente
| fields timestamp       // esto se muestra null en el output
```

Usá `start_time` para mostrar el timestamp de un span — `timestamp` existe y es ordenable pero
no se serializa bien en el resultado.

## Tablas con 0 filas → spinner infinito, no "sin datos"

Un tile de tabla con 0 filas coincidentes se queda cargando indefinidamente en la UI en vez de
mostrar un estado vacío legible. Patrón para forzar un estado vacío explícito:

```dql
fetch bizevents
| filter <tu condición>
| ... tu pipeline normal ...
| append [
    data record(_check=1)
    | lookup [
        fetch bizevents
        | filter <misma condición>
        | limit 1
        | fieldsAdd _found=1, _check=1
      ], sourceField:_check, lookupField:_check, fields:{_found}
    | filter isNull(_found)
    | fieldsAdd mensaje = "Sin datos en el período seleccionado", ...otrosCamposDummy
  ]
```

La subquery de chequeo debe compartir el MISMO scope de timeframe que la query principal — si
uno de los dos tiene un `from:` hardcodeado (ej. `from:now()-7d`) y el otro usa el timeframe del
dashboard, vas a tener falsos negativos/positivos de "sin datos" cuando el usuario cambie el
rango. Sacá cualquier `from:` hardcodeado de subqueries de chequeo.

## Extracción de JSON anidado / arrays-como-string: `arrayJoin`/parse+path NO funcionan

En los tenants probados, ni `arrayJoin()` ni el patrón `parse x, "JSON:y"` seguido de
`y.field`/`y["field"]` extraen campos anidados de forma confiable. Lo que sí funciona:
`indexOf()` + `substring(field, from:, to:)` (con parámetros **nombrados**, no posicionales) +
`replaceString()` encadenado.

Ejemplo real — limpiar un campo `mensaje` que llega como string de array JSON
(`["Error 1","Error 2"]`) a texto legible (`Error 1 | Error 2`), aplicado en el `processing`
stage del pipeline con un procesador `dql`:

```dql
fieldsAdd Mensaje = replaceString(replaceString(replaceString(mensaje, "\",\"", " | "), "[\"", ""), "\"]", "")
```

Para extraer un campo específico de un JSON más complejo sin `parse`, calculá los índices con
`indexOf()` de las comillas/llaves delimitadoras y cortá con `substring(field, from:i, to:j)`.

## `if()` anidado requiere `else:` explícito en cada rama

```dql
// Silenciosamente inválido/incorrecto:
if(cond1, val1, if(cond2, val2, val3))

// Correcto:
if(cond1, val1, else: if(cond2, val2, else: val3))
```

Verificalo siempre con `verify_dql` antes de aplicar — este es el tipo de error que no siempre
tira una excepción clara, a veces solo da un resultado incorrecto.

## `lookup` encadenados sin `prefix:` se pisan entre sí

Si necesitás más de un `lookup [...]` en la misma query (típico en una tabla de journey que
cruza 3 pasos de un proceso), cada uno necesita su propio `prefix:` o los campos del segundo
lookup sobrescriben los del primero:

```dql
| lookup [...paso2...], sourceField:folio, lookupField:folio, prefix:"p2."
| lookup [...paso3...], sourceField:folio, lookupField:folio, prefix:"p3."
```

## Honeycomb con valores numéricos de agrupación muestra decimales falsos

Un honeycomb agrupado por un campo numérico de negocio (ej. código de respuesta `0`, `7`, `32`)
puede mostrar "0,00" en vez de "0" en la UI. Se ve como un bug de rendering pero es simplemente
que el tile no sabe que ese campo es un entero de display. Fix:

```json
"visualizationSettings": {
  "unitsOverrides": [
    {"identifier": "codigo", "unitCategory": "count", "baseUnit": "count", "decimals": 0}
  ]
}
```

Esto es el MISMO mecanismo de `unitsOverrides` que en otros contextos parece "código muerto" si
el campo no se está mostrando como valor crudo — solo importa cuando el campo es efectivamente
un valor de agrupación/display, como en un honeycomb. No lo descartes de entrada solo porque en
otro tile no tenía efecto visible.

## Honeycomb vs. area chart para distribución de códigos con poca historia

Con pocas horas/días de datos, un area chart multi-serie (una serie por código de respuesta)
tiende a colapsar toda la actividad en 1-2 buckets de tiempo del eje X, renderizando como un
pico roto en vez de una curva legible. Un honeycomb agrupado por el mismo campo no depende del
eje de tiempo — muestra la distribución total del período sin ese problema. Preferí honeycomb
para "distribución de códigos" y reservá el area/trend chart para una vista binaria simple
(Éxito/No-Éxito) donde sí querés ver la evolución en el tiempo.

## Deduplicar spans por `trace.id` antes de comparar volumen contra bizevents

Si vas a comparar "cobertura" (cuántos bizevents capturé vs. cuántas requests reales hubo),
`fetch spans` sin `dedup trace.id` puede inflar el conteo real ~1.2-1.3x (múltiples spans por
trace). Sin el dedup, vas a subestimar la cobertura real y reportar un gap que no existe.
También verificá que ambas ventanas de tiempo comparadas sean equivalentes — comparar un span
de 7 días contra un pipeline de bizevents que recién lleva 30 horas activo da un falso "gap"
enorme que en realidad es solo la ventana de existencia de la regla.

## Disciplina de costo en Grail

- Preferí `==` sobre `contains()`/`matchesPhrase()` cuando el valor es exacto — mucho más
  barato de escanear.
- Fijá `scanLimitGBytes` explícito en queries exploratorias sobre datasets grandes/desconocidos.
- Revisá `scannedBytes` y cualquier warning `PARTIAL` en la respuesta antes de confiar en un
  resultado agregado.
- Nunca corras una query sin filtro de entidad/tiempo "a ver qué sale" — puede agotar el
  presupuesto de Grail del tenant en una sola consulta.
