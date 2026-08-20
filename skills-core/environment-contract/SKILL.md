---
name: environment-contract
description: Skill madre para manejar variables globales, tokens, entorno Dynatrace, ruta MCP, scopes y reglas de seguridad en cualquier proyecto de la suite.
---

# Environment Contract

Usa esta skill cuando un proyecto requiera conexión a Dynatrace, DQL, MCP, API, `dtctl` o Dynatrace Apps.

## Fuente de verdad

Consultar:

```text
docs/00-environment-contract.md
.env.example
```

## Variables obligatorias

- `DT_ENVIRONMENT_ID`
- `DT_ENVIRONMENT_URL`
- `DT_PLATFORM_TOKEN` o `DT_OAUTH_CLIENT_ID` + `DT_OAUTH_CLIENT_SECRET`
- `DT_ACCOUNT_URN` cuando se use OAuth client credentials
- `DTCTL_BIN`
- `DTX_OUTPUT`

## Ruta MCP

```text
https://<environment-id>.apps.dynatrace.com/platform-reserved/mcp-gateway/v0.1/servers/dynatrace-mcp/mcp
```

## Seguridad

- Nunca exponer `.env`.
- Nunca registrar tokens en logs, markdown, commits ni respuestas.
- Empezar con scopes de lectura.
- Documentar cualquier scope adicional antes de usarlo.
