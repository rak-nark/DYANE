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

## Dónde se almacena la Documentación Oficial Extraída

Toda la documentación oficial de Dynatrace descargada se guarda en la carpeta local [`docs/`](file:///c:/Users/USER/Documents/ENTORNO%20DE%20TRABAJO/docs):

- **[`docs/`](file:///c:/Users/USER/Documents/ENTORNO%20DE%20TRABAJO/docs):** Contiene los artículos descargados convertidos a Markdown enriquecido (`<dominio>__<slug>.md`) con metadatos YAML, encabezados, bloques de código DQL/API y enlaces oficiales.
- **[`docs/index.json`](file:///c:/Users/USER/Documents/ENTORNO%20DE%20TRABAJO/docs/index.json):** Índice maestro centralizado que registra el catálogo completo de URLs, hashes de contenido, fechas de rastreo y conteo por dominios.
- **[`docs/records/`](file:///c:/Users/USER/Documents/ENTORNO%20DE%20TRABAJO/docs/records):** Registros individuales en JSON estructurado por cada documento descargado (`<id>.json`).

---

## Comandos del CLI `dtx`

### 1. Ingestión, Consulta y Estadísticas de Documentación Oficial
```powershell
# Ver el total de registros en existencia, desglose y almacenamiento consumido
dtx docs stats                           # Total de documentos, almacenamiento y desglose por dominio
dtx docs details                         # Alias detallado con almacenamiento total y desglose
dtx docs count                           # Alias rápido de conteo
dtx docs list --limit 10                 # Lista los primeros 10 documentos descargados
dtx docs list --domain grail             # Lista documentos descargados del dominio Grail

# Descargar documentación oficial desde el sitemap oficial (4,400+ páginas)
dtx docs scrape                          # Descarga incremental completa sin límite
dtx docs scrape --domain grail --limit 10 # Descarga por dominio específico con límite
dtx docs scrape --force                  # Fuerza la re-descarga de documentos

# Buscar en la documentación local indexada
dtx docs search "grail dql"
dtx docs search "openpipeline processors" --domain openpipeline
```

### 2. Creación y Validación de Skills con Trazabilidad Documental
```powershell
# Listar inventario clasificado de skills (Core y Dominio)
dtx skill list

# Validar la trazabilidad y respaldo oficial de una skill (comprueba SKILL.md y references/evidence.json)
dtx skill validate dynatrace-pipeline-observability

# Crear una nueva skill validada automáticamente contra la base documental
dtx skill create "Monitoreo y autoescalado en Kubernetes" --domain kubernetes
```

### 3. Operación de Plataforma (DQL, API y MCP)
```powershell
# Ejecutar consultas DQL en Grail
dtx dql "fetch logs | limit 10" --output table
dtx dql "fetch events | summarize count(), by:{event.kind}"

# Entidades y problemas
dtx entities --type SERVICE --output json
dtx problems --status OPEN
dtx metrics

# Proxy oficial a dtctl
dtx dtctl get workflows
dtx dtctl query "fetch metrics { A = dem:builtin:service.request.total } | limit 5"

# GET genérico a Environment API v2
dtx api "/api/v2/entityTypes"

# Diagnóstico, estado y test de conectividad
dtx doctor
dtx config
dtx test
dtx mcp
```

## Estructura de Skills

- **`skills-core/`** — Skills base obligatorias de gobernanza: `documentation-first`, `environment-contract`, `skill-governance` y `project-bootstrap`.
- **`skills/`** y **`.agents/skills/`** — Skills de dominio técnico validadas contra Dynatrace Docs (`SKILL.md` + `references/evidence.json`).

## Nota sobre seguridad

Nunca comitees `.env` ni tokens. El `.gitignore` ya lo excluye. El `opencode.json` usa placeholders; tus credenciales reales se mantienen de forma segura en tu `.env` local.
