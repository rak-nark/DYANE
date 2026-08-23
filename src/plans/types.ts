export type PlanStatus = "draft" | "in-progress" | "blocked" | "done" | "cancelled";

export type PlanPriority = "critical" | "high" | "medium" | "low";

export type PlanOriginType = "skill-reference" | "finding" | "manual";

export const PLAN_STATUSES: PlanStatus[] = [
  "draft",
  "in-progress",
  "blocked",
  "done",
  "cancelled",
];

export const PLAN_PRIORITIES: PlanPriority[] = ["critical", "high", "medium", "low"];

export interface PlanOrigin {
  type: PlanOriginType;
  skill?: string;
  ref?: string;
}

export interface PlanEvidence {
  doc: string;
  url?: string;
  reason?: string;
}

export interface PlanFrontmatter {
  id: string;
  title: string;
  status: PlanStatus;
  priority: PlanPriority;
  origin: PlanOrigin;
  domain?: string;
  owner?: string;
  created: string;
  updated: string;
  evidence: PlanEvidence[];
}

export interface PlanDocument {
  file: string;
  frontmatter: PlanFrontmatter;
  body: string;
}

export interface PlansIndexEntry {
  id: string;
  title: string;
  status: PlanStatus;
  priority: PlanPriority;
  originType: PlanOriginType;
  skill?: string;
  file: string;
  created: string;
  updated: string;
}

export interface PlansIndex {
  version: string;
  lastUpdated: string;
  totalPlans: number;
  plans: PlansIndexEntry[];
}

export interface PlanValidationCheck {
  check: string;
  ok: boolean;
  detail: string;
}

export interface PlanValidationReport {
  planId: string;
  file: string;
  status: "VALID" | "INCOMPLETE" | "BROKEN";
  checks: PlanValidationCheck[];
}

export interface CreatePlanOptions {
  suggestion: string;
  skill?: string;
  ref?: string;
  domain?: string;
  priority?: PlanPriority;
  owner?: string;
}

export function inferOriginType(skill?: string, ref?: string): PlanOriginType {
  if (ref && ref.toLowerCase().includes("hallazgo")) return "finding";
  if (skill || ref) return "skill-reference";
  return "manual";
}
