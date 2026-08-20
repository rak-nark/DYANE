# Entorno de trabajo Dynatrace

Este repositorio es un **entorno de trabajo** para operar Dynatrace desde la línea de comandos,
integrando las tres vías de acceso a la plataforma:

| Vía | Qué es | Herramienta en este entorno |
| --- | --- | --- |
| **MCP** | Servidor remoto de Model Context Protocol que expone herramientas de Dynatrace para agentes de IA | `opencode.json` + comando `dtx mcp` |
| **CLI** | `dtctl`, CLI oficial de Dynatrace con sintaxis tipo kubectl | proxy `dtx dtctl ...` |
| **API** | API de plataforma (Grail/DQL) y Environment API v2 | comandos `dtx dql`, `dtx entities`, `dtx problems`, `dtx metrics`, `dtx api` |

## Contenido

- **`dtx`** — CLI propio (TypeScript/Node) que orquesta MCP, dtctl y la API.
- **`scripts/`** — scripts de instalación y configuración (PowerShell para Windows).
- **`opencode.json`** — configuración del MCP remoto de Dynatrace para opencode.
- **`docs/`** — guías de instalación, autenticación, MCP, dtctl y API.

## Documentación

0. [Contrato de variables de entorno](docs/00-environment-contract.md) — variables globales, tokens, scopes y ruta MCP
1. [Instalación](docs/01-instalacion.md) — requisitos y puesta en marcha
2. [Autenticación](docs/02-autenticacion.md) — tokens y scopes necesarios
3. [Integración MCP](docs/03-mcp.md) — servidor remoto y configuración en opencode
4. [CLI dtctl](docs/04-dtctl.md) — el CLI oficial y su proxy `dtx dtctl`
5. [API](docs/05-api.md) — DQL en Grail y Environment API v2
6. [Verificación](docs/06-verificacion.md) — cómo probar que MCP, CLI y API funcionan
7. [Distribución de skills](docs/07-skills-distribution.md) — core skills y domain skills
8. [Documentación local](docs/08-documentacion-local.md) — KB local para reducir búsquedas web y consumo de tokens

## Skills

- **`skills-core/`** — skills madre obligatorias para todo proyecto: instalación, environment, documentación local, Strato y gobierno de skills.
- **`skills/`** — skills de dominio Dynatrace: AppEngine, OpenPipeline, IAM, sintéticos, RUM, DPS, Kubernetes, dashboards y API.

## Arranque rápido

```powershell
# 1. Preparar (instala deps, crea .env, compila, instala dtctl)
.\scripts\setup.ps1 -InstallDtctl

# 2. Editar credenciales
notepad .env

# 3. Verificar
dtx doctor
dtx config
```

En Windows, si PowerShell bloquea scripts `.ps1`, usa comandos desde Command Prompt:

```cmd
cmd /c npm run build
cmd /c node dist/index.js test --smoke
```

## Ejemplos

```powershell
# DQL (logs de la última hora)
dtx dql "fetch logs | limit 10" --output table

# Entidades de tipo servicio
dtx entities --type SERVICE --output json

# Problemas abiertos
dtx problems --status OPEN

# Todo lo que hace dtctl
dtx dtctl get workflows
dtx dtctl query "fetch metrics { A = dem:builtin:service.request.total } | limit 5"

# GET genérico a la API v2
dtx api "/api/v2/entityTypes"
```

## Nota sobre seguridad

Nunca comitees `.env` ni tokens. El `.gitignore` ya lo excluye. El `opencode.json` usa
placeholders; reemplázalos localmente (o usa autenticación por OAuth para que opencode
gestione el refresco del token).
