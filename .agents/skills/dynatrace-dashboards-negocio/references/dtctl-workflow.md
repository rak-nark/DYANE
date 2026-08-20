# Disciplina operativa: dtctl y MCP nativo

## dtctl SÍ está instalado y es capaz

No asumas lo contrario de lo que diga otra skill o memoria vieja — `dtctl` (CLI estilo kubectl
para Dynatrace) está disponible y probó ser la herramienta principal más eficiente para
get/apply/describe de objetos de settings, buckets, dashboards y pipelines en esta cuenta.
Autenticación es OAuth por navegador, por contexto (`dtctl auth login --context <nombre>`).

Para consultas DQL puntuales de validación (no de aplicar cambios), preferí el MCP nativo de
Dynatrace del tenant específico (`mcp__dynatrace-MCP-<CLIENTE>__execute_dql`,
`mcp__dynatrace-MCP-<CLIENTE>__verify_dql`) en vez de armar el roundtrip vía dtctl — es más
directo para "¿esta query corre y trae lo que espero?" antes de comprometerte a escribirla en un
tile o pipeline.

## Siempre `--dry-run` antes de aplicar de verdad

```bash
dtctl apply -f objeto.yaml --dry-run
# revisá el diff/output, recién ahí:
dtctl apply -f objeto.yaml
```

## Siempre backup del objeto live antes de editarlo

```bash
dtctl get dashboard <id> -o yaml > objeto_BACKUP_$(date +%Y%m%d_%H%M).yaml
```

Esto no es opcional para objetos que el usuario ya construyó o editó manualmente — es la única
red de seguridad si tu edición rompe algo.

## Trabajá siempre sobre el estado LIVE, no sobre tu última copia local

Antes de editar, volvé a leer el objeto del tenant. El usuario puede haber tocado el dashboard a
mano en la UI entre tu última lectura y ahora — pasó en sesión real: un pedido de "arreglá el
tamaño del tile" resultó ya resuelto porque el usuario lo había ajustado manualmente. Si asumís
tu copia local como verdad, terminás "corrigiendo" algo que ya no está roto o, peor, pisando un
cambio manual del usuario.

## Propagación de cambios: no todos los cambios son igual de rápidos

- Cambios de pipeline/routing/bucket: suelen propagar en minutos.
- Reglas de captura HTTP (`bizevents.http.incoming`): **~15-20 minutos** hasta que el OneAgent
  las recoja y empiecen a aparecer bizevents nuevos con los campos esperados.

No te quedes bloqueado esperando. Lanzá el polling en background con un loop `until...grep`, no
un `sleep` ciego a lo largo del tiempo estimado:

```bash
# Ejemplo de patrón (ajustar query/condición real):
until dtctl query dql "fetch bizevents, from:now()-5m | filter event.type == \"<endpoint>\" | filter isNotNull(<campoNuevo>) | limit 1" 2>&1 | grep -q '"total":1'; do
  sleep 30
done
echo "CAMPO_CONFIRMADO_EN_PRODUCCION"
```

Ejecutalo con `run_in_background: true` y seguí con otro trabajo mientras tanto — no bloquees la
sesión esperando 20 minutos.

## Links de drill-down: `dtctl open intent`, no URLs armadas a mano

Para generar un link de drill-down verificado (ej. de un tile de tabla a la vista de trace
individual, o a un dashboard filtrado), usá:

```bash
dtctl open intent --type <tipo> --params <params> --print-url
```

en vez de construir la URL del tenant a mano concatenando strings — los parámetros de deep-link
de Dynatrace no son triviales de adivinar y un link mal armado se ve roto para el usuario final
del dashboard (no solo para vos en desarrollo).
