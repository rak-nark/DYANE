import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import type { SkillEvidenceReport } from "./types.js";

const PROJECT_ROOT = resolve(process.cwd());
const SKILLS_DIR = join(PROJECT_ROOT, "skills");
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
      backedByDocsCount = report.sources?.length ?? 0;
      confidenceScore = report.sufficiency?.confidence;
      for (const s of report.sources ?? []) {
        sources.push(s.url);
      }
    } catch {
      // JSON inválido
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
  return [...listSkillsInDir(CORE_SKILLS_DIR, "core"), ...listSkillsInDir(SKILLS_DIR, "domain")];
}
