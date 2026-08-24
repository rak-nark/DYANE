import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { loadDocsIndex } from "../docs/scraper.js";
import {
  getPlan,
  listPlanFiles,
  loadPlansIndex,
  parseFrontmatter,
  upsertIndexEntry,
} from "./storage.js";
import {
  PLAN_STATUSES,
  type PlanDocument,
  type PlanValidationCheck,
  type PlanValidationReport,
} from "./types.js";

const PROJECT_ROOT = resolve(process.cwd());
const DOCS_DIR = join(PROJECT_ROOT, "docs");

const REQUIRED_SECTIONS = [
  "## Objetivo",
  "## Alcance / Fuera de alcance",
  "## Prerrequisitos",
  "## Fases",
  "## Riesgos y rollback",
  "## Evidencias",
];

export function validatePlan(planId: string): PlanValidationReport | null {
  const plan = getPlan(planId);
  if (!plan) return null;

  const checks: PlanValidationCheck[] = [];
  const body = plan.body;
  let incomplete = false;

  checks.push({
    check: "frontmatter",
    ok: true,
    detail: "frontmatter parseado correctamente",
  });

  const idMatch = plan.file.startsWith(`${plan.frontmatter.id}-`) || plan.file === `${plan.frontmatter.id}.md`;
  checks.push({
    check: "id-coincide-con-archivo",
    ok: idMatch,
    detail: idMatch ? `${plan.frontmatter.id} ↔ ${plan.file}` : `esperaba prefijo '${plan.frontmatter.id}' en '${plan.file}'`,
  });
  if (!idMatch) incomplete = true;

  const statusOk = PLAN_STATUSES.includes(plan.frontmatter.status);
  checks.push({
    check: "estado-valido",
    ok: statusOk,
    detail: `status='${plan.frontmatter.status}'`,
  });
  if (!statusOk) incomplete = true;

  const missingSections = REQUIRED_SECTIONS.filter((s) => !body.includes(s));
  checks.push({
    check: "secciones-obligatorias",
    ok: missingSections.length === 0,
    detail:
      missingSections.length === 0
        ? `${REQUIRED_SECTIONS.length}/${REQUIRED_SECTIONS.length} presentes`
        : `faltan: ${missingSections.join(", ")}`,
  });
  if (missingSections.length > 0) incomplete = true;

  const tasks = body.split(/\r?\n/).filter((l) => l.trim().startsWith("- [ ]"));
  const badTasks = tasks.filter((t) => !t.includes("comando:") || !t.includes("criterio:"));
  checks.push({
    check: "tareas-con-anatomia",
    ok: tasks.length > 0 && badTasks.length === 0,
    detail:
      tasks.length === 0
        ? "no hay tareas definidas"
        : badTasks.length === 0
          ? `${tasks.length} tareas con comando+criterio`
          : `${badTasks.length} de ${tasks.length} tareas sin 'comando:' o 'criterio:'`,
  });
  if (tasks.length === 0 || badTasks.length > 0) incomplete = true;

  const evidenceResult = validateEvidence(plan);
  checks.push(evidenceResult.check);
  if (!evidenceResult.check.ok) incomplete = true;

  const index = loadPlansIndex();
  const indexed = index.plans.some((p) => p.id === plan.frontmatter.id && p.file === plan.file);
  checks.push({
    check: "indice-sincronizado",
    ok: indexed,
    detail: indexed
      ? "entrada presente en plans/index.json"
      : "entrada ausente o desactualizada en plans/index.json (ejecuta: dtx plan reindex)",
  });
  if (!indexed) incomplete = true;

  const orphanFiles = detectOrphans();
  if (orphanFiles.length > 0) {
    checks.push({
      check: "archivos-huerfanos",
      ok: false,
      detail: `archivos .md sin entrada en el índice: ${orphanFiles.join(", ")}`,
    });
    incomplete = true;
  }

  return {
    planId: plan.frontmatter.id,
    file: plan.file,
    status: incomplete ? "INCOMPLETE" : "VALID",
    checks,
  };
}

function validateEvidence(plan: PlanDocument): { check: PlanValidationCheck } {
  const evidence = plan.frontmatter.evidence;
  if (evidence.length === 0) {
    return {
      check: {
        check: "evidencia-documental",
        ok: false,
        detail: "sin evidencia registrada en el frontmatter (documentation-first exige al menos una)",
      },
    };
  }
  const index = loadDocsIndex();
  const missing: string[] = [];
  for (const ev of evidence) {
    const byId = Object.values(index.documents ?? {}).some((d) => d.id === ev.doc);
    const normalized = ev.doc.endsWith(".md") ? ev.doc : `${ev.doc}.md`;
    const byFile = existsSync(join(DOCS_DIR, normalized));
    if (!byId && !byFile) missing.push(ev.doc);
  }
  return {
    check: {
      check: "evidencia-documental",
      ok: missing.length === 0,
      detail:
        missing.length === 0
          ? `${evidence.length} referencias verificadas contra la base documental`
          : `no encontradas en docs/: ${missing.join(", ")}`,
    },
  };
}

function detectOrphans(): string[] {
  const planFilePattern = /^PLAN-\d{4}-\d{4}-.+\.md$/;
  const files = listPlanFiles().filter((f) => planFilePattern.test(f));
  const index = loadPlansIndex();
  const indexedFiles = new Set(index.plans.map((p) => p.file));
  return files.filter((f) => !indexedFiles.has(f) && !index.plans.some((p) => f.startsWith(p.id)));
}

export function reindexPlans(): number {
  let count = 0;
  for (const file of listPlanFiles()) {
    try {
      const content = readFileSync(join(PROJECT_ROOT, "plans", file), "utf8");
      const fm = parseFrontmatter(content);
      if (!fm) continue;
      upsertIndexEntry(fm, file);
      count++;
    } catch {
      continue;
    }
  }
  return count;
}
