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

  if (hasSkillMd) {
    const content = readFileSync(skillMdPath, "utf8");
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
