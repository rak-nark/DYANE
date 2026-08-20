# dtctl — setup, contexto y fallos conocidos

[`dtctl`](https://github.com/dynatrace-oss/dtctl) es el CLI para consultar Grail y administrar
configuración. Preferible al MCP para auditorías largas: soporta `-o toon`, redirección a archivo
y encadenar con `jq`/`grep`.

## Verificación antes de trabajar

```bash
dtctl config describe-context <nombre>   # ¿la URL está bien?
dtctl auth status --plain                # ¿el token OAuth está vigente?
dtctl inventory --plain                  # ¿qué hay en el ambiente?
```

## Bug conocido: URL corrupta por espacio en el argumento

Si `dtctl auth login --environment` recibe la URL con un espacio inicial o comillas mal
balanceadas en el shell, **el comando reporta éxito** pero guarda la URL corrupta:

```
https:// https://ofc38511.apps.dynatrace.com
```

Síntoma: **todas** las queries fallan con `invalid character " " in host name`.

Corrección sin re-autenticar (reutiliza el token ya emitido):

```bash
dtctl config set-context <nombre> \
  --environment "https://<tenant>.apps.dynatrace.com" \
  --token-ref <nombre>-oauth \
  --safety-level readwrite-all --plain

dtctl config describe-context <nombre> --plain
```

**Regla:** después de cualquier `auth login`, corre `describe-context` antes de asumir que
funcionó.

## Errores transitorios

`token refresh failed: dial tcp: lookup token.dynatrace.com` — red. Reintenta la query; no
invalida los resultados ya obtenidos.

## Formatos de salida

| Flag | Uso |
|---|---|
| `-o toon` | Tablas legibles en consola. Por defecto para exploración. |
| `-o json` | Cuando necesitas inspeccionar el **esquema completo** de un registro (campos que no proyectaste). Imprescindible cuando un `by:{}` colapsa en `null`. |
| `--plain` | Sin colores/ANSI. Úsalo siempre que vayas a redirigir a archivo o parsear. |

## Alternativa: MCP Dynatrace

Si el tenant ya está conectado como servidor MCP
(`mcp__dynatrace-MCP-<TENANT>__execute_dql`), sirve igual para las queries de lectura. Ventaja:
sin setup. Desventaja: sin `dtctl get settings` / `get dashboards`, que son necesarios para
confirmar alcance de capabilities y encontrar el dashboard dueño de una query.

Para una auditoría completa necesitas **las dos capacidades**: DQL (consumo) y lectura de
configuración (alcance). Si solo tienes MCP, el paso de confirmación de alcance queda pendiente y
hay que declararlo como limitación en el informe.

> ⚠️ Con MCP, `execute_dql` sin filtro de entidad o ventana acotada puede agotar el presupuesto
> de escaneo de Grail en una sola consulta. Filtra siempre.
