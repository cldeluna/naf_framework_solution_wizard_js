/**
 * Field-importance registry — port of field_registry.py. Single source of
 * truth for which fields are save-blocking (`required`), which appear in the
 * compact "Required only" view, and how they map into the payload.
 *
 * Tiers: required (compact view + blocks save) | recommended (compact view) |
 * optional (full view only). Mirrors the Python REGISTRY exactly.
 */
import type { WizardPayload } from "../types/wizardPayload";
import type { SectionKey } from "../data/sections";

export type Tier = "required" | "recommended" | "optional";

export interface FieldSpec {
  id: string;
  label: string;
  /** Dotted path from the payload root. */
  path: string;
  section: SectionKey;
  tier: Tier;
}

export const REGISTRY: FieldSpec[] = [
  // Problem Statement & Use Case
  { id: "author", label: "Author", path: "initiative.author", section: "problem_statement", tier: "required" },
  { id: "title", label: "Title", path: "initiative.title", section: "problem_statement", tier: "required" },
  { id: "description", label: "Description", path: "initiative.description", section: "problem_statement", tier: "required" },
  { id: "itil_category", label: "ITIL Category", path: "initiative.itil_category", section: "problem_statement", tier: "required" },
  { id: "category", label: "Category", path: "initiative.category", section: "problem_statement", tier: "required" },
  { id: "problem_statement", label: "Problem Statement", path: "initiative.problem_statement", section: "problem_statement", tier: "required" },
  { id: "use_case", label: "Use Case", path: "initiative.use_case", section: "problem_statement", tier: "required" },
  { id: "workflow_description", label: "Workflow description", path: "initiative.workflow_description", section: "problem_statement", tier: "required" },
  // Stakeholders (My Role lives on this piece)
  { id: "my_role_who", label: "My Role — who you are", path: "my_role.who", section: "stakeholders", tier: "required" },
  { id: "my_role_skills", label: "My Role — your skills", path: "my_role.skills", section: "stakeholders", tier: "required" },
  { id: "my_role_developer", label: "My Role — who will develop", path: "my_role.developer", section: "stakeholders", tier: "required" },
  // Staffing & Timeline
  { id: "build_buy", label: "Development approach", path: "timeline.build_buy", section: "staffing_timeline", tier: "required" },
  { id: "staffing_plan", label: "Staffing plan", path: "timeline.staffing_plan_md", section: "staffing_timeline", tier: "required" },
  // Dependencies
  { id: "dependencies_narrative", label: "Dependencies & external interfaces", path: "dependencies_narrative", section: "dependencies", tier: "required" },
];

function resolve(payload: WizardPayload, path: string): unknown {
  let cur: unknown = payload;
  for (const part of path.split(".")) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[part];
  }
  return cur;
}

function isEmpty(v: unknown): boolean {
  return String(v ?? "").trim() === "";
}

/** Save-blocking specs, optionally scoped to one section. */
export function requiredSpecs(section?: SectionKey): FieldSpec[] {
  return REGISTRY.filter((s) => s.tier === "required" && (!section || s.section === section));
}

/** Required fields currently missing/empty in the payload. */
export function missingRequired(payload: WizardPayload, section?: SectionKey): FieldSpec[] {
  return requiredSpecs(section).filter((s) => isEmpty(resolve(payload, s.path)));
}

/**
 * Save-strict gate (mirror of WizardPayload.validate_for_save): returns the
 * list of missing required fields; empty list = OK to persist to the catalog.
 * File export (JSON/ZIP) intentionally does NOT use this gate.
 */
export function validateForSave(payload: WizardPayload): FieldSpec[] {
  return missingRequired(payload);
}

/** True when a section has any compact-view (required/recommended) fields. */
export function sectionHasCompact(section: SectionKey): boolean {
  return REGISTRY.some((s) => s.section === section && s.tier !== "optional");
}
