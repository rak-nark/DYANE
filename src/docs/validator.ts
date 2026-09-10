import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { loadDocsIndex } from "./scraper.js";
import { canonicalUrlKey } from "./search.js";
import type { SkillEvidenceReport } from "./types.js";

const PROJECT_ROOT = resolve(process.cwd());
const SKILLS_DIR = join(PROJECT_ROOT, "skills");
const AGENTS_SKILLS_DIR = join(PROJECT_ROOT, ".agents", "skills");
const CORE_SKILLS_DIR = join(PROJECT_ROOT, "skills-core");

export interface SkillValidationSummary {
  skillName: string;
  family: "core" | "domain";
  hasSkillMd: boolean;
  hasEvidence: boolean;
  validFrontmatter: boolean;
  backedByDocsCount: number;
  confidenceScore?: number;
  sources: string[];
  status: "VERIFIED" | "PARTIAL" | "LEGACY_WITHOUT_TRACEABILITY";
  quality?: "HIGH" | "MEDIUM" | "LOW" | "N/A";
  contentBytes?: number;
  sectionCount?: number;
  qualityWarnings: string[];
  duplicateUrls?: number;
  nearDuplicateUrls?: number;
  groundedSources?: number;
}

/** Umbrales mínimos de calidad de contenido para una skill de dominio. */
const MIN_SOURCES_HIGH = 12;
const MIN_SOURCES_MEDIUM = 6;
const MIN_CONTENT_BYTES = 4000;
const MIN_SECTIONS = 4;

function assessQuality(input: {
  isDomainSkill: boolean;
  hasEvidence: boolean;
  sourcesCount: number;
  contentBytes: number;
  sectionCount: number;
}): { quality: SkillValidationSummary["quality"]; warnings: string[] } {
  const warnings: string[] = [];
  if (!input.isDomainSkill) return { quality: "N/A", warnings };

  if (input.sourcesCount < MIN_SOURCES_MEDIUM) {
    warnings.push(`solo ${input.sourcesCount} fuentes documentales (mínimo recomendado: ${MIN_SOURCES_MEDIUM})`);
  }
  if (input.contentBytes < MIN_CONTENT_BYTES) {
    warnings.push(`SKILL.md muy breve (${(input.contentBytes / 1024).toFixed(1)} KB, mínimo ${Math.round(MIN_CONTENT_BYTES / 1024)} KB)`);
  }
  if (input.sectionCount < MIN_SECTIONS) {
    warnings.push(`pocas secciones H2 (${input.sectionCount}, mínimo ${MIN_SECTIONS})`);
  }

  let quality: SkillValidationSummary["quality"] = "HIGH";
  if (input.sourcesCount < MIN_SOURCES_MEDIUM || input.contentBytes < MIN_CONTENT_BYTES) quality = "LOW";
  else if (input.sourcesCount < MIN_SOURCES_HIGH || input.sectionCount < MIN_SECTIONS) quality = "MEDIUM";

  return { quality, warnings };
}

function resolveSkillFamily(skillName: string, family?: "core" | "domain"): "core" | "domain" {
  if (family) return family;
  if (existsSync(join(CORE_SKILLS_DIR, skillName.trim(), "SKILL.md"))) return "core";
  return "domain";
}

export function validateSkill(skillName: string, family?: "core" | "domain"): SkillValidationSummary {
  const cleanName = skillName.trim();
  const resolvedFamily = resolveSkillFamily(cleanName, family);
  const skillDir = join(resolvedFamily === "core" ? CORE_SKILLS_DIR : SKILLS_DIR, cleanName);
  const skillMdPath = join(skillDir, "SKILL.md");
  const evidencePath = join(skillDir, "references", "evidence.json");

  const hasSkillMd = existsSync(skillMdPath);
  const hasEvidence = existsSync(evidencePath);

  let validFrontmatter = false;
  let backedByDocsCount = 0;
  let confidenceScore: number | undefined;
  let duplicateUrls = 0;
  let nearDuplicateUrls = 0;
  let groundedSources = 0;
  const sources: string[] = [];
  let contentBytes = 0;
  let sectionCount = 0;

  if (hasSkillMd) {
    const content = readFileSync(skillMdPath, "utf8");
    contentBytes = Buffer.byteLength(content, "utf8");
    sectionCount = (content.match(/^## /gm) ?? []).length;
    const normalizedContent = content.trimStart();
    validFrontmatter =
      normalizedContent.startsWith("---") &&
      normalizedContent.includes("name:") &&
      normalizedContent.includes("description:");
  }

  if (hasEvidence) {
    try {
      const report = JSON.parse(readFileSync(evidencePath, "utf8")) as SkillEvidenceReport;
      const allSources = report.sources ?? [];
      const uniqueUrls = Array.from(new Set(allSources.map((s) => s.url)));
      backedByDocsCount = uniqueUrls.length;
      duplicateUrls = allSources.length - uniqueUrls.length;
      nearDuplicateUrls = uniqueUrls.length - new Set(uniqueUrls.map((u) => canonicalUrlKey(u))).size;
      confidenceScore = report.sufficiency?.confidence;
      for (const u of uniqueUrls) {
        sources.push(u);
      }
    } catch {
      // JSON inválido
    }
  }

  if (backedByDocsCount > 0) {
    try {
      const kbIndex = loadDocsIndex();
      const kbUrls = new Set(Object.values(kbIndex.documents ?? {}).map((d) => d.url));
      groundedSources = sources.filter((u) => kbUrls.has(u)).length;
    } catch {
      groundedSources = 0;
    }
  }

  let status: SkillValidationSummary["status"] = "LEGACY_WITHOUT_TRACEABILITY";
  if (hasSkillMd && hasEvidence && backedByDocsCount > 0) {
    status = "VERIFIED";
  } else if (hasSkillMd && validFrontmatter) {
    status = "PARTIAL";
  }

  const { quality, warnings } = assessQuality({
    isDomainSkill: resolvedFamily === "domain",
    hasEvidence,
    sourcesCount: backedByDocsCount,
    contentBytes,
    sectionCount,
  });

  if (duplicateUrls > 0) {
    warnings.push(`detectadas ${duplicateUrls} URL(s) duplicadas en evidence.json (contabilizadas solo fuentes únicas)`);
  }
  if (nearDuplicateUrls > 0) {
    warnings.push(`detectadas ${nearDuplicateUrls} URL(s) casi-duplicadas (variantes versionadas /vN/ o rutas equivalentes)`);
  }
  if (backedByDocsCount > 0 && groundedSources < backedByDocsCount) {
    warnings.push(`${backedByDocsCount - groundedSources} fuente(s) no están indexadas en la KB local (docs/index.json)`);
  }

  return {
    skillName: cleanName,
    family: resolvedFamily,
    hasSkillMd,
    hasEvidence,
    validFrontmatter,
    backedByDocsCount,
    confidenceScore,
    sources,
    status,
    quality,
    contentBytes,
    sectionCount,
    qualityWarnings: warnings,
    duplicateUrls,
    nearDuplicateUrls,
    groundedSources,
  };
}

function listSkillsInDir(dir: string, family: "core" | "domain"): SkillValidationSummary[] {
  if (!existsSync(dir)) return [];
  const entries = readdirSync(dir, { withFileTypes: true });
  const summaries: SkillValidationSummary[] = [];

  for (const entry of entries) {
    if (entry.isDirectory() && entry.name !== "references") {
      summaries.push(validateSkill(entry.name, family));
    }
  }

  return summaries;
}

export function listAllSkills(): SkillValidationSummary[] {
  const summaries = [
    ...listSkillsInDir(CORE_SKILLS_DIR, "core"),
    ...listSkillsInDir(SKILLS_DIR, "domain"),
    ...listSkillsInDir(AGENTS_SKILLS_DIR, "domain"),
  ];
  const seen = new Set<string>();
  return summaries.filter((s) => {
    if (seen.has(s.skillName)) return false;
    seen.add(s.skillName);
    return true;
  });
}
