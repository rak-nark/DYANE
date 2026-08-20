# Business Flow nativo (`app:dynatrace.biz.flow`)

Cuando un proceso de negocio tiene un campo real que correlaciona sus pasos (una sesión, un
folio, un ID de trámite), la app nativa "Business Flow" de Dynatrace suele ser mejor que una
tabla de journey armada a mano en el dashboard — visualiza drop-off y tiempos entre pasos de
forma nativa, con drill-down propio.

## Paso 1 — Probar la correlación con datos históricos ANTES de tocar nada

No asumas que un campo correlaciona los pasos solo porque aparece en varios de ellos con el
mismo nombre. Verificalo cruzando datos reales:

```dql
fetch bizevents, bucket:"<bucket>"
| filter event.type == "<paso1>"
| filter isNotNull(<campoCandidato>)
| fields timestamp, event.type, <campoCandidato>
| limit 5
```

Repetí para cada paso y confirmá manualmente (o con un `lookup` cruzando por el campo) que el
MISMO valor aparece en pasos consecutivos con timestamps cercanos entre sí — eso es la prueba
real de que correlaciona una sesión de negocio, no solo una coincidencia de nombre de campo.

Solo después de esta prueba, agregá el campo como extractor de captura (`data[]` con `path:`)
a las reglas que aún no lo tuvieran.

## Paso 2 — Descubrir el schema real, no adivinarlo

Si el tenant ya tiene un Business Flow configurado para otro proceso (del mismo cliente o no),
usalo como plantilla real del schema en vez de construir el objeto a ciegas:

```bash
dtctl get settings --schema "app:dynatrace.biz.flow:biz-flow-settings" -o json
```

Estructura verificada en producción real:

```json
{
  "correlationID": "<nombre del campo bizevent, ej. folioCifrado>",
  "steps": [
    {
      "id": "step-<slug>-0001",
      "name": "<Nombre visible del paso>",
      "isRoot": true,
      "events": [
        { "provider": "<event.provider real, ej. ServiciosController>", "name": "<event.type real, ej. obtenIntentoAutenticacion>", "isDisabled": false, "isError": false }
      ]
    }
  ],
  "connections": [
    { "source": "step-<slug>-0001", "target": "step-<slug>-0002" }
  ]
}
```

- `correlationID` es literalmente el nombre del campo bizevent que probaste en el Paso 1.
- `steps[].events[].provider` mapea 1:1 con el `event.provider` que configuraste como constante
  en la regla de captura HTTP de ese endpoint (ver `ingesta-prerequisitos.md`) — verificalo
  empíricamente con una query antes de asumir el valor exacto:

```dql
fetch bizevents, bucket:"<bucket>"
| filter event.type == "<paso>"
| fields event.provider
| limit 1
```

- `isRoot: true` marca el primer paso del flujo (el que no tiene predecesor).
- `connections[]` define el orden secuencial paso a paso.

## Paso 3 — Aplicar

Como cualquier objeto de settings, `dtctl apply --dry-run` primero, backup del estado anterior
si estás editando un Business Flow ya existente (no creando uno nuevo).

## Cuándo NO vale la pena

Si el proceso tiene un solo paso, o si los pasos no comparten ningún campo de correlación real
(verificado, no asumido), no fuerces un Business Flow — quedate con el dashboard de pilares solo
y, si hace falta, una tabla de journey manual con `lookup` (ver `dql-gotchas.md` y
`layout-pilares.md`).
