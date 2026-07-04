/** Section metadata — ported from puzzle_progress.py (colors/labels/layout). */

export type InnerKey =
  | "presentation" | "observability" | "orchestration"
  | "intent" | "collector" | "executor";

export type FrameKey =
  | "problem_statement" | "stakeholders" | "staffing_timeline" | "dependencies";

export type SectionKey = InnerKey | FrameKey;

export interface InnerSection {
  key: InnerKey; label: string; color: string; row: number; col: number;
  scatter: { x: number; y: number; rot: number };
  icon: string;
}

export interface FrameSection {
  key: FrameKey; label: string; color: string;
  position: "top" | "left" | "right" | "bottom";
  scatter: { x: number; y: number; rot: number };
  icon: string;
}

export const INNER_SECTIONS: InnerSection[] = [
  { key: "presentation",  label: "Presentation",  color: "#E8B817", row: 0, col: 0, scatter: { x: -20, y: -15, rot: -8 }, icon: "🖥️" },
  { key: "observability", label: "Observability", color: "#2ECC40", row: 0, col: 1, scatter: { x: 12,  y: -18, rot: 6 },  icon: "🔍" },
  { key: "orchestration", label: "Orchestration", color: "#00BCD4", row: 0, col: 2, scatter: { x: 22,  y: -12, rot: -7 }, icon: "🔀" },
  { key: "intent",        label: "Intent",        color: "#FF6B35", row: 1, col: 0, scatter: { x: -18, y: 18,  rot: 7 },  icon: "💎" },
  { key: "collector",     label: "Collector",     color: "#E91E63", row: 1, col: 1, scatter: { x: 10,  y: 20,  rot: -6 }, icon: "📥" },
  { key: "executor",      label: "Executor",      color: "#7B52E0", row: 1, col: 2, scatter: { x: 20,  y: 15,  rot: 8 },  icon: "⚡" },
];

export const FRAME_SECTIONS: FrameSection[] = [
  { key: "problem_statement", label: "Problem Statement & Use Case", color: "#A8B8C8", position: "top",    scatter: { x: 0,   y: -30, rot: 2 },  icon: "📋" },
  { key: "stakeholders",      label: "Stakeholders",                 color: "#708898", position: "left",   scatter: { x: -30, y: 0,   rot: -3 }, icon: "👥" },
  { key: "staffing_timeline", label: "Staffing & Timeline",          color: "#B0A090", position: "right",  scatter: { x: 30,  y: 0,   rot: 3 },  icon: "📅" },
  { key: "dependencies",      label: "Dependencies",                 color: "#607888", position: "bottom", scatter: { x: 0,   y: 30,  rot: -2 }, icon: "🔗" },
];

export const ALL_SECTIONS: { key: SectionKey; label: string; color: string; icon: string }[] = [
  ...FRAME_SECTIONS, ...INNER_SECTIONS,
];

export function sectionMeta(key: SectionKey) {
  return ALL_SECTIONS.find((s) => s.key === key)!;
}
