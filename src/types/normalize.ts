/**
 * Ingestion-tolerant pre-normalizer — the TS mirror of the lenient loading
 * behavior in the Python models (wizard_models.py):
 *
 * - `_drop_none_values`: explicit JSON nulls are treated as missing so
 *   defaults apply (legacy exports carry e.g. `deployment_strategy: null`).
 * - `Stakeholders._coerce_choices`: a category mapping to a bare string
 *   becomes a one-element array.
 * - `clean_text`: strip raw HTML tags (Markdown preserved) + control chars,
 *   trim, and clamp to the field limit rather than reject (loading never
 *   fails on oversized legacy text; save-strict enforcement is separate).
 *
 * Run this BEFORE WizardPayloadSchema.parse() when loading a file or DB row.
 * Saving (validate-for-save) stays strict per SPEC §2.5.
 */

import { ITIL_CATEGORIES, LEGACY_ITIL_ALIASES, itilParentOf } from "../data/options";

const HTML_TAG_RE = /<[^>]+>/g;
// control chars except \t \n \r
const CONTROL_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
export const HARD_TEXT_CAP = 100_000;

export function cleanText(value: string): string {
  return value
    .replace(HTML_TAG_RE, "")
    .replace(CONTROL_RE, "")
    .trim()
    .slice(0, HARD_TEXT_CAP);
}

function walk(value: unknown): unknown {
  if (typeof value === "string") return cleanText(value);
  if (Array.isArray(value)) return value.map(walk);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      if (v === null) continue; // null -> missing -> schema default
      out[k] = walk(v);
    }
    return out;
  }
  return value;
}

/** Clamp every string in `obj` to `max` chars (lenient-load length handling). */
function clampStrings(value: unknown, max: number): unknown {
  if (typeof value === "string") return value.slice(0, max);
  if (Array.isArray(value)) return value.map((v) => clampStrings(v, max));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, clampStrings(v, max)]),
    );
  }
  return value;
}

/**
 * Normalize a raw parsed-JSON payload for lenient loading.
 * NOTE on lengths: per-field max lengths in the generated schema are
 * save-time limits. For loading we clamp instead of reject — legacy data
 * always loads (matching Python's philosophy; Python enforces lengths via
 * the same models, so real app exports are already within limits — clamping
 * only affects hand-edited or stress-test files).
 */
export function normalizePayload(raw: unknown): unknown {
  const data = walk(raw) as Record<string, unknown> | undefined;
  if (!data || typeof data !== "object") return data;

  // stakeholders.choices: bare string -> [string]
  const stakeholders = data["stakeholders"] as Record<string, unknown> | undefined;
  const choices = stakeholders?.["choices"] as Record<string, unknown> | undefined;
  if (choices && typeof choices === "object") {
    for (const [cat, v] of Object.entries(choices)) {
      if (typeof v === "string") choices[cat] = v ? [v] : [];
      else if (!Array.isArray(v)) choices[cat] = [];
    }
  }

  // use_case fallback from legacy expected_use
  const ini = data["initiative"] as Record<string, unknown> | undefined;
  if (ini && !ini["use_case"] && typeof ini["expected_use"] === "string" && ini["expected_use"]) {
    ini["use_case"] = ini["expected_use"];
  }

  // itil_category derivation for pre-split data (2026-07-05 two-level
  // categories): derive the ITIL parent from the category tree; if the legacy
  // category IS an ITIL value (current or pre-rename alias), promote it and
  // clear the common one.
  if (ini && !ini["itil_category"] && typeof ini["category"] === "string" && ini["category"]) {
    const cat = ini["category"] as string;
    const asItil = ITIL_CATEGORIES.includes(cat) ? cat : LEGACY_ITIL_ALIASES[cat];
    if (asItil) {
      ini["itil_category"] = asItil;
      ini["category"] = "";
    } else {
      const parent = itilParentOf(cat);
      if (parent) ini["itil_category"] = parent;
      // unknown/Other free text: itil_category stays empty for the user to set
    }
  }

  return data;
}

/**
 * Loose length handling for legacy files: clamp all strings to the hard cap
 * first; Zod still enforces per-field limits, so callers that must never
 * fail on length can apply `clampForLoad` with a field-limit map later
 * (Phase 1) or catch and surface Zod issues to the user.
 */
export function clampAll(raw: unknown, max = HARD_TEXT_CAP): unknown {
  return clampStrings(raw, max);
}
