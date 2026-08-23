import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { searchDocs } from "../docs/search.js";
import type { CreatePlanOptions, PlanFrontmatter } from "./types.js";
import { inferOriginType } from "./types.js";

const PROJECT_ROOT = resolve(process.cwd());

export interface ScaffoldResult {
  frontmatter: PlanFrontmatter;
  body: string;
}

export function buildScaffold(
  options: CreatePlanOptions,
  id: string,
  created: string,
): ScaffoldResult {
  const title = shorten(options.suggestion);
  const frontmatter: PlanFrontmatter = {
    id,
    title,
    status: "draft",
    priority: options.priority ?? "medium",
    origin: {
      type: inferOriginType(options.skill, options.ref),
      skill: options.skill,
      ref: options.ref,
    },
    domain: options.domain,
    owner: options.owner,
    created,
    updated: created,
    evidence: [],
  };

  const parts: string[] = [];
  parts.push(`# Plan: ${title}\n`);
  parts.push(`> Sugerencia original: "${options.suggestion}"\n`);

  const refText = options.ref ? extractRefSection(options.skill, options.ref) : null;
  if (refText) {
    parts.push("## Sugerencia de origen\n");
    parts.push(refText.trim());
    parts.push("");
  }

  parts.push(BODY_TEMPLATE.replace(/\{\{TITLE\}\}/g, title));
  parts.push(buildEvidenceSuggestions(options));

  return { frontmatter, body: parts.join("\n") };
}

function shorten(text: string): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > 80 ? `${clean.slice(0, 77)}...` : clean;
}

function buildEvidenceSuggestions(options: CreatePlanOptions): string {
  let results: ReturnType<typeof searchDocs> = [];
  try {
    results = searchDocs(options.suggestion, { domain: options.domain, limit: 5, minScore: 6 });
  } catch {
    results = [];
  }

  const lines: string[] = ["## Evidencias\n"];
  lines.push(
    "> Referencias oficiales que respaldan este plan. Promueve los candidatos al frontmatter (`evidence[].doc`) una vez verificados.\n",
  );
  if (results.length === 0) {
    lines.push("(Sin candidatos automáticos. Ejecuta `dtx docs scrape --domain <dom>` e intenta de nuevo.)");
    lines.push("");
    return lines.join("\n");
  }
  lines.push("<!-- Candidatos automáticos de la base documental local -->");
  for (const r of results) {
    lines.push(`<!-- candidato: ${r.doc.id} | ${r.doc.title} | ${r.doc.url} -->`);
  }
  lines.push("");
  return lines.join("\n");
}

export function extractRefSection(skill: string | undefined, ref: string): string | null {
  const [rawPath, anchor] = ref.split("#");
  const candidates: string[] = [];
  if (rawPath.startsWith("skills/") || rawPath.startsWith(".agents")) {
    candidates.push(join(PROJECT_ROOT, rawPath));
  } else if (skill) {
    candidates.push(join(PROJECT_ROOT, "skills", skill, rawPath));
    candidates.push(join(PROJECT_ROOT, ".agents", "skills", skill, rawPath));
    candidates.push(join(PROJECT_ROOT, "skills-core", skill, rawPath));
  } else {
    candidates.push(join(PROJECT_ROOT, rawPath));
  }

  for (const candidate of candidates) {
    if (!existsSync(candidate)) continue;
    try {
      const content = readFileSync(candidate, "utf8");
      if (!anchor) return content.slice(0, 4000);
      return extractSection(content, anchor) ?? content.slice(0, 4000);
    } catch {
      continue;
    }
  }
  return null;
}

function extractSection(content: string, anchor: string): string | null {
  const lines = content.split(/\r?\n/);
  const startIdx = lines.findIndex((l) =>
    /^#{2,4}\s+/.test(l) && l.toLowerCase().includes(anchor.toLowerCase()),
  );
  if (startIdx === -1) return null;
  const startLevel = (lines[startIdx].match(/^#+/) ?? ["#"])[0].length;
  const endIdx = lines.findIndex((l, i) => {
    if (i <= startIdx) return false;
    const m = l.match(/^#+/);
    return m !== null && m[0].length <= startLevel && l.trim() !== "";
  });
  const sectionLines = endIdx === -1 ? lines.slice(startIdx) : lines.slice(startIdx, endIdx);
  return sectionLines.join("\n").trim();
}

const BODY_TEMPLATE = `
## Objetivo

(Completar: qué problema resuelve este plan y cómo se mide el éxito.)

## Alcance / Fuera de alcance

**Dentro:** (completar)
**Fuera de alcance:** (completar)

## Prerrequisitos

- (Permisos IAM, accesos, backups o línea base requeridos antes de empezar)
- Regla previa: ningún cambio es retroactivo. Aplicar, esperar una ventana de datos y recién ahí concluir.

## Fases

### Fase 0 — Línea base (solo lectura)

- [ ] Capturar métrica actual — comando: \`dtx dql "..."\` · criterio: consulta ejecuta sin errores · evidencia: resultado inicial guardado

### Fase 1 — Implementación

- [ ] Aplicar el cambio propuesto — comando: \`<API / dtx dtctl ...>\` · criterio: cambio aplicado en entorno no productivo · evidencia: diff/export de configuración

### Fase 2 — Validación

- [ ] Verificar el resultado contra la línea base — comando: \`dtx dql "..."\` · criterio: mejora medible respecto a Fase 0 · evidencia: comparación antes/después

### Fase 3 — Producción y cierre

- [ ] Aplicar en producción y observar ventana de datos — comando: \`dtx dql "..."\` · criterio: sin regresiones durante la ventana acordada · evidencia: cierre documentado con fecha

## Riesgos y rollback

| Riesgo | Impacto | Plan de rollback |
|---|---|---|
| (completar) | | |
`;
