/**
 * Wizard store — single WizardPayload object + continuous localStorage
 * autosave (SPEC §3.4). Every input writes here immediately; there is no
 * submit-to-commit step, so nothing the user types can be silently lost.
 */
import { create } from "zustand";
import { WizardPayloadSchema, type WizardPayload } from "../types/wizardPayload";
import { normalizePayload } from "../types/normalize";

const DRAFT_KEY = "naf-wizard-draft-v1";

export function emptyPayload(): WizardPayload {
  return WizardPayloadSchema.parse({});
}

function loadDraft(): { payload: WizardPayload; restored: boolean } {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw) {
      const res = WizardPayloadSchema.safeParse(normalizePayload(JSON.parse(raw)));
      if (res.success) return { payload: res.data, restored: true };
    }
  } catch {
    /* corrupt draft -> start fresh */
  }
  return { payload: emptyPayload(), restored: false };
}

/** Immutably set a dotted path, e.g. set(payload, "initiative.title", v). */
function setPath<T>(obj: T, path: string, value: unknown): T {
  const keys = path.split(".");
  const root: Record<string, unknown> = { ...(obj as Record<string, unknown>) };
  let cur = root;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    const next = cur[k];
    cur[k] = Array.isArray(next) ? [...next] : { ...(next as Record<string, unknown>) };
    cur = cur[k] as Record<string, unknown>;
  }
  cur[keys[keys.length - 1]] = value;
  return root as T;
}

export type FieldView = "all" | "required";
const VIEW_KEY = "naf-wizard-field-view";

export interface WizardStore {
  payload: WizardPayload;
  /** True when this session started from a restored localStorage draft. */
  draftRestored: boolean;
  savedAt: number | null;
  activeSection: string | null;
  /** Global field view: "required" hides optional fields (compact). */
  fieldView: FieldView;
  setFieldView: (v: FieldView) => void;
  setField: (path: string, value: unknown) => void;
  openSection: (key: string | null) => void;
  /**
   * Set when the current wizard content was loaded from the catalog — enables
   * Update-vs-Save-as-new when it's the signed-in user's own initiative.
   */
  loadedInitiative: { id: string; ownerId: string | null } | null;
  /** Lenient-load a raw JSON object (file import / DB load). Throws on hard failure. */
  loadPayload: (raw: unknown, from?: { id: string; ownerId: string | null }) => void;
  reset: () => void;
}

const initial = loadDraft();

export const useWizard = create<WizardStore>((set) => ({
  payload: initial.payload,
  draftRestored: initial.restored,
  savedAt: null,
  activeSection: null,
  fieldView: (localStorage.getItem(VIEW_KEY) as FieldView) || "all",
  setFieldView: (v) => {
    localStorage.setItem(VIEW_KEY, v);
    set({ fieldView: v });
  },
  setField: (path, value) =>
    set((s) => ({ payload: setPath(s.payload, path, value) })),
  openSection: (key) => set({ activeSection: key }),
  loadedInitiative: null,
  loadPayload: (raw, from) => {
    const parsed = WizardPayloadSchema.parse(normalizePayload(raw));
    set({ payload: parsed, loadedInitiative: from ?? null });
  },
  reset: () => {
    localStorage.removeItem(DRAFT_KEY);
    set({ payload: emptyPayload(), draftRestored: false, savedAt: null, loadedInitiative: null });
  },
}));

// ── Autosave: debounced persist of every payload change ─────────
let timer: ReturnType<typeof setTimeout> | undefined;
let lastSaved: WizardPayload | null = null;

useWizard.subscribe((state) => {
  if (state.payload === lastSaved) return;
  clearTimeout(timer);
  timer = setTimeout(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(state.payload));
      lastSaved = state.payload;
      useWizard.setState({ savedAt: Date.now() });
    } catch {
      /* storage full/unavailable — draft persistence degrades silently */
    }
  }, 400);
});
