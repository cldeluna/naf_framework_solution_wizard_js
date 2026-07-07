import { FRAME_SECTIONS, INNER_SECTIONS, type SectionKey } from "./sections";

/** The canonical guided sequence — border pieces first, then inner NAF components. */
export const GUIDED_ORDER: SectionKey[] = [
  "problem_statement",
  "stakeholders",
  "staffing_timeline",
  "dependencies",
  "presentation",
  "intent",
  "collector",
  "executor",
  "observability",
  "orchestration",
];

const ALL_META = [...FRAME_SECTIONS, ...INNER_SECTIONS];

/** 1-based step number in guided order, or 0 if not found. */
export function guidedStep(key: SectionKey): number {
  return GUIDED_ORDER.indexOf(key) + 1;
}

/** The section that follows key in guided order, or null if it's the last. */
export function guidedNext(key: SectionKey): SectionKey | null {
  const i = GUIDED_ORDER.indexOf(key);
  return i >= 0 && i < GUIDED_ORDER.length - 1 ? GUIDED_ORDER[i + 1] : null;
}

export function sectionLabel(key: SectionKey): string {
  return ALL_META.find((s) => s.key === key)?.label ?? key;
}
