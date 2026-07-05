/**
 * Piece-completion predicates — ported from puzzle_progress.py
 * (check_section_completion / check_frame_completion), re-expressed over the
 * WizardPayload instead of Streamlit session keys. Completion is DERIVED from
 * data, never a stored flag.
 */
import type { WizardPayload } from "../types/wizardPayload";
import type { SectionKey } from "../data/sections";
import { DEFAULT_TITLE, DEFAULT_MILESTONE_NAMES } from "../data/options";
import { missingRequired } from "./fieldRegistry";

const nonEmpty = (s: unknown): boolean => typeof s === "string" && s.trim().length > 0;
const any = (a: unknown): boolean => Array.isArray(a) && a.length > 0;

function milestonesEdited(items: WizardPayload["timeline"]["items"]): boolean {
  if (!items || items.length === 0) return false;
  const names = new Set(items.map((m) => m.name));
  // exactly the defaults (or a subset) -> not edited
  return ![...names].every((n) => DEFAULT_MILESTONE_NAMES.has(n));
}

/**
 * A piece snaps home only when BOTH hold:
 * 1. its required fields (field registry) are all filled, and
 * 2. the section has meaningful content (original heuristics below).
 * (Deliberate improvement over the Streamlit app, which snapped on any
 * meaningful data even with required fields missing.)
 */
export function isSectionComplete(p: WizardPayload, key: SectionKey): boolean {
  if (missingRequired(p, key).length > 0) return false;
  return hasMeaningfulContent(p, key);
}

function hasMeaningfulContent(p: WizardPayload, key: SectionKey): boolean {
  switch (key) {
    // inner (framework) pieces
    case "presentation":
      return any(p.presentation.selections.users) || any(p.presentation.selections.tools);
    case "observability":
      return (
        any(p.observability.selections.methods) ||
        any(p.observability.selections.tools) ||
        nonEmpty(p.observability.selections.go_no_go_text)
      );
    case "orchestration":
      return nonEmpty(p.orchestration.selections.choice);
    case "intent":
      return any(p.intent.selections.development) || any(p.intent.selections.provided);
    case "collector":
      return any(p.collector.selections.methods) || any(p.collector.selections.auth);
    case "executor":
      return any(p.executor.selections.methods);
    // frame (context / planning) pieces
    case "problem_statement":
      return (
        (nonEmpty(p.initiative.title) && p.initiative.title !== DEFAULT_TITLE) ||
        nonEmpty(p.initiative.problem_statement)
      );
    case "stakeholders":
      return (
        Object.values(p.stakeholders.choices).some((v) => any(v)) ||
        nonEmpty(p.stakeholders.other) ||
        // My Role lives on this piece in the rebuilt UI
        nonEmpty(p.my_role.who)
      );
    case "dependencies":
      return p.dependencies.length > 0 || nonEmpty(p.dependencies_narrative);
    case "staffing_timeline":
      return (
        milestonesEdited(p.timeline.items) ||
        (p.timeline.staff_count ?? 0) > 0 ||
        (p.timeline.external_staff_count ?? 0) > 0 ||
        nonEmpty(p.timeline.staffing_plan_md)
      );
    default:
      return false;
  }
}

export function completionState(p: WizardPayload): Record<SectionKey, boolean> {
  const keys: SectionKey[] = [
    "presentation", "observability", "orchestration", "intent", "collector",
    "executor", "problem_statement", "stakeholders", "staffing_timeline", "dependencies",
  ];
  return Object.fromEntries(keys.map((k) => [k, isSectionComplete(p, k)])) as Record<
    SectionKey,
    boolean
  >;
}
