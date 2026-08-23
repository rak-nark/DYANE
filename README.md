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
6. [Funcionamiento: Planes de trabajo (`plan`)](#funcionamiento-planes-de-trabajo-plan)
7. [Seguridad](#seguridad)

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
  src/api.ts     src/dtctl.ts     opencode.json  docs/ + skills/ + plans/
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
| Planes de trabajo | Scaffold, almacenamiento y validación de planes | `src/plans/*.ts` |

La ventaja del wrapper sobre usar `dtctl` directo: credenciales centralizadas en `.env`,
un solo punto para todo el ciclo (documentación → skills → planes → operación) y diagnóstico
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
│   └── plans/              storage · scaffold · validator · types
├── dist/                   Compilado por tsc (npm run build)
├── docs/                   Base documental local de Dynatrace Docs
│   ├── <dominio>__<slug>.md Artículos en Markdown enriquecido con metadatos YAML
│   ├── index.json          Índice maestro (URLs, hashes, fechas, conteo por dominio)
│   └── records/<id>.json   Registro estructurado individual por documento
├── skills-core/            Skills obligatorias de gobernanza
├── skills/  .agents/skills/ Skills de dominio técnico (SKILL.md + references/evidence.json)
├── plans/                  Planes de trabajo + plans/index.json
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

### 3. Planes de Trabajo por Sugerencia de Implementación

```powershell
# Convertir una sugerencia (mejora, hallazgo o manual) en un plan de trabajo estructurado
dtx plan create "Reemplazar cadena de security context por lookup" `
  --skill dynatrace-ingesta-openpipeline --ref "references/mejoras.md#M1" `
  --domain openpipeline --priority high --owner "equipo-plataforma"

# Listar e inspeccionar
dtx plan list                              # Todos los planes registrados
dtx plan list --status in-progress         # Filtrar por estado
dtx plan show PLAN-2026-0001               # Contenido completo del plan
dtx plan show PLAN-2026-0001 --output json # Salida JSON

# Validar y gestionar ciclo de vida
dtx plan validate PLAN-2026-0001           # Estructura, tareas y evidencia documental
dtx plan status PLAN-2026-0001 done        # Cambiar estado
dtx plan reindex                           # Regenerar plans/index.json desde los .md
```

### 4. Operación de Plataforma (DQL, API y MCP)

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
| `--domain <dominio>` | grail, k8s, openpipeline, appengine, etc. | docs, plan |
| `--limit <n>` | límite de resultados/páginas | docs, search |
| `--force` | fuerza re-descarga | docs scrape, skill create |
| `--skill` / `--ref` / `--priority` / `--owner` | metadatos de origen del plan | plan create |

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

## Funcionamiento: Planes de trabajo (`plan`)

Convierte cualquier sugerencia de implementación (mejora de un reference de skill, hallazgo de
auditoría o idea manual) en un plan estructurado, versionado en el repo y con evidencia documental
obligatoria. El CLI es determinista (crea, valida, indexa); el detalle lo completa el agente o el
humano editando el archivo `.md`.

### Flujo

```
dtx plan create "..." --skill X --ref "ruta#ancla"
        │
        ├─ 1. Genera ID secuencial ────────── plans/index.json → PLAN-2026-0001
        ├─ 2. Clasifica el origen ─────────── manual / skill-reference / finding
        ├─ 3. Extrae la sección referenciada ─ si ref tiene #ancla, copia ese bloque
        ├─ 4. Busca evidencia candidata ────── búsqueda sobre docs/ local
        └─ 5. Escribe .md + actualiza índice
        │
(agente/humano completa fases, comandos reales y criterios)
        │
dtx plan validate PLAN-ID ──► VALID | INCOMPLETE
dtx plan status   PLAN-ID done
```

### Formato del plan

Cada plan es un Markdown con frontmatter YAML + secciones obligatorias:

```markdown
---
id: PLAN-2026-0001
title: Reemplazar cadena de reglas de security context por lookup
status: draft              # draft | in-progress | blocked | done | cancelled
priority: high             # critical | high | medium | low
origin:
  type: skill-reference    # skill-reference | finding | manual
  skill: dynatrace-ingesta-openpipeline
  ref: "references/mejoras.md#M1"
domain: openpipeline
created: "2026-08-23T15:22:38Z"
updated: "2026-08-23T15:24:49Z"
evidence:
  - doc: "openpipeline__docs-deliver-pipeline-observability-sdlc-events.md"
    reason: "Procesadores securityContext y etapas de pipeline"
---
# Plan: ...
## Sugerencia de origen     ← copia literal de la sección referenciada
## Objetivo
## Alcance / Fuera de alcance
## Prerrequisitos
## Fases                    ← Fase 0 Línea base → 1 Implementación → 2 Validación → 3 Producción
## Riesgos y rollback
## Evidencias               ← candidatos automáticos como comentarios HTML
```

### Anatomía de tarea

Cada tarea dentro de las fases debe traer tres partes obligatorias:

```markdown
- [ ] Capturar métrica actual — comando: `dtx dql "..."`
      · criterio: consulta ejecuta sin errores · evidencia: resultado inicial guardado
```

- **comando**: qué ejecutar (es *referencia*, el plan nunca ejecuta nada contra el tenant).
- **criterio**: cuándo se considera exitosa.
- **evidencia**: qué capturar como prueba.

### Validación

`dtx plan validate` ejecuta 7 checks y devuelve `VALID` o `INCOMPLETE` (exit code 1, utilizable
como gate):

| # | Check | Qué verifica |
|---|---|---|
| 1 | `frontmatter` | parseable según el contrato |
| 2 | `id-coincide-con-archivo` | filename empieza por el ID |
| 3 | `estado-valido` | status dentro del enum |
| 4 | `secciones-obligatorias` | 6 secciones presentes (Objetivo → Evidencias) |
| 5 | `tareas-con-anatomia` | toda tarea trae comando + criterio |
| 6 | `evidencia-documental` | cada `evidence[].doc` existe en `docs/` o en su índice |
| 7 | `indice-sincronizado` | entrada presente en `plans/index.json` + sin archivos huérfanos |

### Decisiones de diseño

- **Todo local**: no requiere credenciales ni red; testeable offline.
- **El plan no ejecuta**: los comandos son referencia para el operador.
- **Round-trip seguro**: `plan status` re-serializa el frontmatter; el parser acepta tanto la
  salida del CLI como YAML escrito a mano.
- **Fuente de verdad = archivos `.md`**: el índice es derivado; si alguien edita/borra a mano,
  `validate` detecta la desincronización y `reindex` la repara.

---

## Seguridad

Nunca comitees `.env` ni tokens. El `.gitignore` ya los excluye. El `opencode.json` usa
placeholders; tus credenciales reales se mantienen de forma segura en tu `.env` local.
