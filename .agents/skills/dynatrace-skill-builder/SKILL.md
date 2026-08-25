---
name: dynatrace-skill-builder
description: Orquestador ÚNICO para crear skills de Dynatrace respaldadas por documentación oficial, con flujo semiautomático y bajo consumo de tokens — el CLI destila la KB local (dtx skill draft) y la IA solo sintetiza el SKILL.md desde el research-brief. Úsala cuando el usuario pida "crear una skill", "nueva skill", "desarrollar skill automática", "plantilla de skill", "generar procedimiento para Dynatrace" o cuando se identifique un flujo repetitivo que requiera estandarización y trazabilidad técnica.
---

# Generador Semiautomático de Skills Validadas por Documentación

Esta meta-skill es el **único punto de entrada** para generar skills en `skills/<nombre>/` y `.agents/skills/`. Divide el trabajo para optimizar costo y calidad:

| Actor | Responsabilidad | Costo |
|---|---|---|
| **CLI (`dtx`)** | Lee 24+ docs completos de la KB local, filtra ruido, destila código/outlines/contexto en `references/research-brief.md` | 0 tokens IA |
| **IA** | Lee SOLO el brief (~12K tokens) y sintetiza el SKILL.md final | Bajo y acotado |
| **CLI (`validate`)** | Audita trazabilidad + calidad (fuentes, secciones, tamaño) | 0 tokens IA |

## Regla de oro

> **La IA NUNCA escribe una skill desde memoria ni leyendo docs crudos.**
> El entorno provee la información destilada; la IA la absorbe del brief y construye.

## Flujo obligatorio

### Paso 1 — Draft determinista (CLI)

```powershell
.\dtx.cmd skill draft "<capacidad detallada>" --domain <dominio> [--limit 24] [--name <nombre>]
```

- Ejecuta multi-query (hasta 12 sub-consultas), penaliza ruido (release notes, cross-topic).
- Escribe `skills/<nombre>/references/research-brief.md` (tope ~48 KB ≈ 12K tokens) + `evidence.json`.
- Si responde NO_EVIDENCE: ejecutar antes `.\dtx.cmd docs scrape --domain <dominio>`.

### Paso 2 — Síntesis por IA (el único paso con tokens)

1. Leer **únicamente** `references/research-brief.md` (NUNCA los docs crudos de `docs/`).
2. Sintetizar `SKILL.md` con:
   - Frontmatter: `name:` + `description:` rica con triggers ("Úsala cuando pidan...").
   - Secciones H2 por tema real detectado en el brief (no boilerplate genérico).
   - Solo afirmaciones/comandos trazables a las fuentes del brief; citar URL entre paréntesis.
   - Si el brief trae bloques de código, incluirlos verbatim como verificados.
   - Material extenso (mapas de imports, esquemas API, tablas grandes) → archivos separados en `references/*.md`, referenciados desde SKILL.md (carga progresiva).
3. Objetivo de tamaño: SKILL.md ≥ 6 KB denso; si el brief da para más, priorizar densidad sobre extensión.

### Paso 3 — Validación y cierre (CLI)

```powershell
.\dtx.cmd skill validate <nombre>
# Exigir: VERIFIED + calidad HIGH/MEDIUM sin avisos LOW
Copy-Item -Recurse -Force "skills\<nombre>" ".agents\skills\<nombre>"
```

Criterios de aprobación: ≥12 fuentes (HIGH) o ≥6 (MEDIUM), ≥4 secciones H2, ≥4 KB de contenido. Si sale LOW: repetir Paso 1 con `--limit` mayor o prompt más específico.

## Comandos relacionados

```powershell
# Pipeline automático legacy (plantilla genérica — usar solo para prototipos rápidos)
.\dtx.cmd skill create "<solicitud>" --domain <dominio> --limit 20

# Backfill de evidencia para skill existente
.\dtx.cmd skill backfill <nombre> --domain <dominio>

# Inventario con columna CALIDAD
.\dtx.cmd skill list
```

## Estructura Obligatoria de Archivos

```text
skills/<nombre-skill>/
├── SKILL.md                        # Requerido: síntesis de la IA desde el brief
├── references/
│   ├── research-brief.md           # Requerido: metadatos/destilación del CLI (paso 1)
│   ├── evidence.json               # Requerido: trazabilidad de fuentes oficiales
│   └── *.md                        # Opcional: material extenso (carga progresiva)
├── scripts/                        # Opcional: scripts reutilizables
└── examples/                       # Opcional: DQL, JSONs, dashboards
```

## Limitaciones conocidas

- La KB local pierde bloques `<pre>` del HTML original en dominios antiguos (ej.: kubernetes tiene 0 bloques estructurados). En esos casos el brief aporta outline + prosa contextual y la IA debe marcar los comandos como "por verificar contra la fuente".
- Dominios con código estructurado disponible hoy: grail (103), strato (199), synthetics (101), iam (41), openpipeline (8).
