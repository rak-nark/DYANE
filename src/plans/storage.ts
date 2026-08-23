import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";
import {
  PLAN_PRIORITIES,
  PLAN_STATUSES,
  type PlanDocument,
  type PlanEvidence,
  type PlanFrontmatter,
  type PlanPriority,
  type PlanStatus,
  type PlansIndex,
  type PlansIndexEntry,
} from "./types.js";

const PROJECT_ROOT = resolve(process.cwd());
const PLANS_DIR = join(PROJECT_ROOT, "plans");
const INDEX_FILE = join(PLANS_DIR, "index.json");
const PLANS_INDEX_VERSION = "1.0.0";

export function plansDir(): string {
  return PLANS_DIR;
}

export function ensurePlansDir(): void {
  if (!existsSync(PLANS_DIR)) {
    mkdirSync(PLANS_DIR, { recursive: true });
  }
}

export function emptyPlansIndex(): PlansIndex {
  return {
    version: PLANS_INDEX_VERSION,
    lastUpdated: new Date().toISOString(),
    totalPlans: 0,
    plans: [],
  };
}

export function loadPlansIndex(): PlansIndex {
  if (!existsSync(INDEX_FILE)) return emptyPlansIndex();
  try {
    const raw = JSON.parse(readFileSync(INDEX_FILE, "utf8")) as PlansIndex;
    if (!Array.isArray(raw.plans)) raw.plans = [];
    raw.totalPlans = raw.plans.length;
    return raw;
  } catch {
    return emptyPlansIndex();
  }
}

export function savePlansIndex(index: PlansIndex): void {
  ensurePlansDir();
  index.lastUpdated = new Date().toISOString();
  index.totalPlans = index.plans.length;
  writeFileSync(INDEX_FILE, `${JSON.stringify(index, null, 2)}\n`, "utf8");
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function nextPlanId(index: PlansIndex): string {
  const year = new Date().getFullYear();
  const prefix = `PLAN-${year}-`;
  let max = 0;
  for (const entry of index.plans) {
    if (entry.id.startsWith(prefix)) {
      const n = Number(entry.id.slice(prefix.length));
      if (Number.isFinite(n) && n > max) max = n;
    }
  }
  const seq = String(max + 1).padStart(4, "0");
  return `${prefix}${seq}`;
}

export function planFileName(id: string, title: string): string {
  return `${id}-${slugify(title)}.md`;
}

function yamlScalar(value: unknown): string {
  if (value === undefined || value === null || value === "") return '""';
  const text = String(value);
  if (/[:#\[\]{}&*!|>'"%@`,]/.test(text) || text.trim() !== text) {
    return `"${text.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
  }
  return text;
}

export function serializeFrontmatter(fm: PlanFrontmatter): string {
  const lines: string[] = [
    "---",
    `id: ${yamlScalar(fm.id)}`,
    `title: ${yamlScalar(fm.title)}`,
    `status: ${fm.status}`,
    `priority: ${fm.priority}`,
    "origin:",
    `  type: ${fm.origin.type}`,
  ];
  if (fm.origin.skill) lines.push(`  skill: ${yamlScalar(fm.origin.skill)}`);
  if (fm.origin.ref) lines.push(`  ref: ${yamlScalar(fm.origin.ref)}`);
  if (fm.domain) lines.push(`domain: ${yamlScalar(fm.domain)}`);
  if (fm.owner) lines.push(`owner: ${yamlScalar(fm.owner)}`);
  lines.push(`created: ${yamlScalar(fm.created)}`);
  lines.push(`updated: ${yamlScalar(fm.updated)}`);
  if (fm.evidence.length > 0) {
    lines.push("evidence:");
    for (const ev of fm.evidence) {
      lines.push(`  - doc: ${yamlScalar(ev.doc)}`);
      if (ev.url) lines.push(`    url: ${yamlScalar(ev.url)}`);
      if (ev.reason) lines.push(`    reason: ${yamlScalar(ev.reason)}`);
    }
  } else {
    lines.push("evidence: []");
  }
  lines.push("---");
  return lines.join("\n");
}

function unquote(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, "\\");
  }
  return trimmed;
}

export function parseFrontmatter(content: string): PlanFrontmatter | null {
  const normalized = content.trimStart();
  if (!normalized.startsWith("---")) return null;
  const end = normalized.indexOf("\n---", 3);
  if (end === -1) return null;
  const yamlBlock = normalized.slice(4, end);
  const fm: Partial<PlanFrontmatter> = {};
  const evidence: PlanEvidence[] = [];
  let currentEvidence: PlanEvidence | null = null;
  let section = "";

  for (const rawLine of yamlBlock.split(/\r?\n/)) {
    if (!rawLine.trim()) continue;
    const indent = rawLine.length - rawLine.trimStart().length;
    const line = rawLine.trim();
    if (indent === 0 && !line.startsWith("- ")) {
      const colonIdx = line.indexOf(":");
      if (colonIdx === -1) continue;
      const key = line.slice(0, colonIdx).trim();
      const value = unquote(line.slice(colonIdx + 1));

      switch (key) {
        case "id":
          fm.id = value;
          break;
        case "title":
          fm.title = value;
          break;
        case "status":
          fm.status = value as PlanStatus;
          break;
        case "priority":
          fm.priority = value as PlanPriority;
          break;
        case "domain":
          fm.domain = value;
          break;
        case "owner":
          fm.owner = value;
          break;
        case "created":
          fm.created = value;
          break;
        case "updated":
          fm.updated = value;
          break;
        case "evidence":
          section = value === "[]" ? "" : "evidence";
          break;
        case "origin":
          section = "origin";
          fm.origin = fm.origin ?? { type: "manual" };
          break;
        default:
          break;
      }
      continue;
    }

    if (line.startsWith("- ")) {
      currentEvidence = { doc: "" };
      evidence.push(currentEvidence);
      section = "evidence-item";
      applyEvidenceField(currentEvidence, line.slice(2));
      continue;
    }

    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const value = unquote(line.slice(colonIdx + 1));

    if (section === "origin" && fm.origin) {
      if (key === "type") fm.origin.type = value as PlanFrontmatter["origin"]["type"];
      else if (key === "skill") fm.origin.skill = value;
      else if (key === "ref") fm.origin.ref = value;
    } else if (section === "evidence-item" && currentEvidence) {
      applyEvidenceField(currentEvidence, `${key}: ${value}`);
    }
  }

  if (section === "evidence" && evidence.length > 0) {
    fm.evidence = evidence.filter((e) => e.doc !== "");
  } else if (!fm.evidence) {
    fm.evidence = evidence;
  }

  if (!fm.id || !fm.title) return null;
  return {
    id: fm.id,
    title: fm.title,
    status: PLAN_STATUSES.includes(fm.status as PlanStatus)
      ? (fm.status as PlanStatus)
      : "draft",
    priority: PLAN_PRIORITIES.includes(fm.priority as PlanPriority)
      ? (fm.priority as PlanPriority)
      : "medium",
    origin: fm.origin ?? { type: "manual" },
    domain: fm.domain || undefined,
    owner: fm.owner || undefined,
    created: fm.created ?? "",
    updated: fm.updated ?? "",
    evidence: fm.evidence ?? [],
  };
}

function applyEvidenceField(item: PlanEvidence, field: string): void {
  const colonIdx = field.indexOf(":");
  if (colonIdx === -1) return;
  const key = field.slice(0, colonIdx).trim();
  const value = unquote(field.slice(colonIdx + 1));
  if (key === "doc") item.doc = value;
  else if (key === "url") item.url = value;
  else if (key === "reason") item.reason = value;
}

export function getPlan(planId: string): PlanDocument | null {
  const index = loadPlansIndex();
  const entry = index.plans.find((p) => p.id.toLowerCase() === planId.toLowerCase());
  const file = entry?.file ?? findPlanFileByScan(planId);
  if (!file) return null;
  const filePath = join(PLANS_DIR, file);
  if (!existsSync(filePath)) return null;
  const content = readFileSync(filePath, "utf8");
  const frontmatter = parseFrontmatter(content);
  if (!frontmatter) return null;
  const body = content.replace(/^---[\s\S]*?\n---\r?\n?/, "");
  return { file, frontmatter, body };
}

function findPlanFileByScan(planId: string): string | undefined {
  if (!existsSync(PLANS_DIR)) return undefined;
  const files = readdirSync(PLANS_DIR).filter(
    (f) => f.endsWith(".md") && f.startsWith(planId),
  );
  return files[0];
}

export function listPlanFiles(): string[] {
  if (!existsSync(PLANS_DIR)) return [];
  return readdirSync(PLANS_DIR).filter((f) => f.endsWith(".md"));
}

export function writePlanFile(file: string, frontmatter: PlanFrontmatter, body: string): void {
  ensurePlansDir();
  writeFileSync(join(PLANS_DIR, file), `${serializeFrontmatter(frontmatter)}\n${body}`, "utf8");
}

export function upsertIndexEntry(frontmatter: PlanFrontmatter, file: string): PlansIndex {
  const index = loadPlansIndex();
  const entry: PlansIndexEntry = {
    id: frontmatter.id,
    title: frontmatter.title,
    status: frontmatter.status,
    priority: frontmatter.priority,
    originType: frontmatter.origin.type,
    skill: frontmatter.origin.skill,
    file,
    created: frontmatter.created,
    updated: frontmatter.updated,
  };
  const existingIdx = index.plans.findIndex((p) => p.id === frontmatter.id);
  if (existingIdx >= 0) {
    index.plans[existingIdx] = entry;
  } else {
    index.plans.push(entry);
    index.plans.sort((a, b) => a.id.localeCompare(b.id));
  }
  savePlansIndex(index);
  return index;
}
