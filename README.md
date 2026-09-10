# Entorno de trabajo Dynatrace

Este repositorio es un **entorno de trabajo** para operar Dynatrace desde la línea de comandos,
integrando las tres vías de acceso a la plataforma:

| Vía | Qué es | Herramienta en este entorno |
| --- | --- | --- |
| **MCP** | Servidor remoto de Model Context Protocol que expone herramientas de Dynatrace para agentes de IA | `opencode.json` + comando `dtx mcp` |
| **CLI** | `dtctl`, CLI oficial de Dynatrace con sintaxis tipo kubectl | proxy `dtx dtctl ...` |
| **API** | API de plataforma (Grail/DQL) y Environment API v2 | comandos `dtx dql`, `dtx entities`, `dtx problems`, `dtx metrics`, `dtx api` |

---

## Índice

1. [Arquitectura](#arquitectura)
2. [Estructura del repositorio](#estructura-del-repositorio)
3. [Referencia de comandos](#referencia-de-comandos)
4. [Funcionamiento: Base documental (`docs`)](#funcionamiento-base-documental-docs)
5. [Funcionamiento: Skills](#funcionamiento-skills)
6. [Seguridad](#seguridad)

---

## Arquitectura

El CLI propio **`dtx`** (TypeScript/Node) actúa como **capa de orquestación**: no reemplaza al CLI
oficial de Dynatrace, lo envuelve.

```
                    ┌─────────────────────────────┐
                    │         dtx (CLI)           │
                    │  src/index.ts → commands.ts │
                    └──────────┬──────────────────┘
       ┌───────────────┬───────┴──────┬────────────────┐
       ▼               ▼              ▼                ▼
  Operación      dtctl (oficial)  MCP remoto     Conocimiento local
  src/api.ts     src/dtctl.ts     opencode.json  docs/ + skills/
  DQL/API v2     spawn + env      agentes IA     base documental scrapeada
```

**División de responsabilidades:**

| Capa | Qué hace | Código |
|---|---|---|
| Orquestación | Parseo de argumentos, ruteo de comandos, ayuda | `src/index.ts`, `src/commands.ts` |
| Plataforma | DQL en Grail, entities, problems, metrics, API v2 genérica | `src/api.ts`, `src/http.ts` |
| Proxy dtctl | Ejecuta el binario oficial `%LOCALAPPDATA%\dtctl\dtctl.exe` inyectando credenciales del `.env` como variables de entorno (`DT_ENVIRONMENT_URL`, `DT_API_TOKEN`) | `src/dtctl.ts` |
| Autenticación | Platform token u OAuth client credentials con refresco automático | `src/oauth.ts`, `src/config.ts` |
| Conocimiento local | Scraper de docs oficiales, búsqueda indexada, pipeline y validador de skills | `src/docs/*.ts` |

La ventaja del wrapper sobre usar `dtctl` directo: credenciales centralizadas en `.env`,
un solo punto para todo el ciclo (documentación → skills → operación) y diagnóstico
integrado (`dtx doctor`, `dtx test`).

## Estructura del repositorio

```
├── dtx.cmd                 Wrapper Windows para invocar el CLI compilado (dist/index.js)
├── opencode.json           Configuración del MCP remoto para opencode (usa placeholders)
├── .env                    Credenciales locales (NUNCA se comitea)
├── src/                    Código fuente del CLI (TypeScript, ESM)
│   ├── index.ts            Punto de entrada y ruteo de comandos
│   ├── commands.ts         Implementación de los comandos cmd*
│   ├── api.ts / http.ts    Cliente de plataforma y HTTP genérico
│   ├── dtctl.ts            Proxy al binario oficial dtctl
│   ├── oauth.ts / config.ts Autenticación y configuración
│   ├── docs/               scraper · search · skillPipeline · validator · types
├── dist/                   Compilado por tsc (npm run build)
├── docs/                   Base documental local de Dynatrace Docs
│   ├── <dominio>__<slug>.md Artículos en Markdown enriquecido con metadatos YAML
│   ├── index.json          Índice maestro (URLs, hashes, fechas, conteo por dominio)
│   └── records/<id>.json   Registro estructurado individual por documento
├── skills-core/            Skills obligatorias de gobernanza
├── skills/  .agents/skills/ Skills de dominio técnico (SKILL.md + references/evidence.json)
└── scripts/                Scripts PowerShell de instalación y configuración
```

## Referencia de comandos

### Diagnóstico y conexión

```powershell
dtx config        # Configuración actual (sin secretos)
dtx doctor        # Entorno, token y conexión a la API
dtx test          # Verifica MCP, CLI (dtctl) y API (.env completo requerido)
dtx test --smoke  # Verificación básica sin credenciales
dtx token         # Estado del access token (OAuth o platform)
dtx mcp           # URL del MCP server y scopes necesarios
```

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
```

### Opciones globales

| Opción | Valores | Aplica a |
|---|---|---|
| `--output json\|table\|raw` | formato de salida (default: `DTX_OUTPUT` o json) | mayoría |
| `--domain <dominio>` | grail, k8s, openpipeline, appengine, etc. | docs |
| `--limit <n>` | límite de resultados/páginas | docs, search |
| `--force` | fuerza re-descarga | docs scrape, skill create |

---

## Funcionamiento: Base documental (`docs`)

Toda la documentación oficial de Dynatrace se descarga y se consulta localmente:

- **`docs/<dominio>__<slug>.md`:** artículos convertidos a Markdown enriquecido con metadatos YAML,
  encabezados, bloques de código DQL/API y enlaces oficiales.
- **`docs/index.json`:** índice maestro centralizado con catálogo completo de URLs, hashes de
  contenido (`sha256`), fechas de rastreo y conteo por dominios.
- **`docs/records/<id>.json`:** registro estructurado individual por documento descargado.

**Flujo:** `scrape` recorre el sitemap oficial, clasifica cada URL por dominio mediante patrones
regex, extrae contenido y metadatos, calcula hash para detectar cambios y escribe artículo +
registro + índice. La actualización es incremental: solo re-descarga documentos cuyo hash cambió.
`search` puntúa documentos por coincidencias en título, slug, encabezados, código y cuerpo completo.

Este es el pilar del principio **documentation-first**: antes de buscar en internet o inventar,
se consulta la base local; si falta evidencia, se hace scrape del dominio correspondiente.

## Funcionamiento: Skills

Las skills capturan conocimiento operativo reutilizable y verificable:

- **`skills-core/`** — gobernanza obligatoria: `documentation-first`, `environment-contract`,
  `skill-governance` y `project-bootstrap`.
- **`skills/`** y **`.agents/skills/`** — skills de dominio técnico (ingesta OpenPipeline, IAM/ABAC,
  dashboards de negocio, sintéticos, DPS, Strato UI, etc.).

Cada skill de dominio lleva **trazabilidad documental**: `SKILL.md` con frontmatter válido +
`references/evidence.json` que cita páginas oficiales de la base documental. `dtx skill validate`
audita esa trazabilidad y clasifica la skill como `VERIFIED` (con evidencia), `PARTIAL` (sin
evidence.json) o `LEGACY_WITHOUT_TRACEABILITY`. `dtx skill create` ejecuta un pipeline automático
que genera la skill ya respaldada contra `docs/`.

---

## Seguridad

Nunca comitees `.env` ni tokens. El `.gitignore` ya los excluye. El `opencode.json` usa
placeholders; tus credenciales reales se mantienen de forma segura en tu `.env` local.
