/**
 * Catalog data layer — TS port of db/mapping.py + db/repository.py +
 * db/roles.py. Talks to Supabase directly (RLS enforces access).
 *
 * Identity/dedup: initiative hash = problem + use case; solution hash = the
 * six NAF components (+ deployment) combined with the initiative hash.
 * Hashes replicate Python's json.dumps(sort_keys=True) byte format so dedup
 * stays compatible with records written by the Streamlit app.
 */
import { supabase } from "./supabase";
import type { WizardPayload } from "../types/wizardPayload";

// ── Python-compatible canonical JSON + sha256 ───────────────────
const INITIATIVE_HASH_FIELDS = ["title", "description", "category", "problem_statement", "use_case"] as const;
const SOLUTION_SECTIONS = ["presentation", "intent", "observability", "orchestration", "collector", "executor"] as const;

/** json.dumps(obj, sort_keys=True, ensure_ascii=False) equivalent. */
export function pyJson(v: unknown): string {
  if (v === null || v === undefined) return "null";
  if (typeof v === "boolean") return v ? "true" : "false";
  if (typeof v === "number") return Number.isInteger(v) ? String(v) : JSON.stringify(v);
  if (typeof v === "string") return JSON.stringify(v);
  if (Array.isArray(v)) return "[" + v.map(pyJson).join(", ") + "]";
  const keys = Object.keys(v as object).sort();
  return "{" + keys.map((k) => `${JSON.stringify(k)}: ${pyJson((v as Record<string, unknown>)[k])}`).join(", ") + "}";
}

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

const hash = (obj: unknown) => sha256(pyJson(obj));

// ── Row types (subset of columns we use) ────────────────────────
export interface InitiativeRow {
  id: string;
  owner_id: string | null;
  author: string | null;
  title: string;
  description: string | null;
  category: string | null;
  problem_statement: string | null;
  use_case: string | null;
  submitter_name: string | null;
  submitter_email: string | null;
  contact_ok: boolean;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

export interface SolutionRow {
  id: string;
  initiative_id: string;
  owner_id: string | null;
  name: string | null;
  status: string;
  deployment_strategy: string | null;
  version: number;
  submitter_name: string | null;
  submitter_email: string | null;
  contact_ok: boolean;
  created_at: string;
  payload?: Record<string, unknown>;
  [key: string]: unknown;
}

// ── mapping.py ports ────────────────────────────────────────────
function solutionPayload(p: WizardPayload): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const s of SOLUTION_SECTIONS) out[s] = p[s];
  out["naf_report_md"] = p.naf_report_md;
  return out;
}

export async function initiativeHash(p: WizardPayload): Promise<string> {
  const ini: Record<string, unknown> = {};
  for (const f of INITIATIVE_HASH_FIELDS) ini[f] = p.initiative[f];
  return hash(ini);
}

export async function solutionHash(p: WizardPayload, iniHash: string): Promise<string> {
  const design = solutionPayload(p);
  delete design["naf_report_md"]; // derived artifact — not part of identity
  return hash({
    initiative: iniHash,
    deployment_strategy: p.initiative.deployment_strategy,
    deployment_strategy_description: p.initiative.deployment_strategy_description,
    design,
  });
}

export interface SaveOptions {
  ownerId: string;
  submitterName?: string;
  submitterEmail?: string;
  contactOk?: boolean;
  solutionName?: string;
  /** "new" (default / fork) or "update" with updateInitiativeId. */
  intent?: "new" | "update";
  updateInitiativeId?: string;
}

async function decompose(p: WizardPayload, o: SaveOptions) {
  const iniHash = await initiativeHash(p);
  const ini = p.initiative;
  const contact = {
    submitter_name: o.submitterName ?? null,
    submitter_email: o.submitterEmail ?? null,
    contact_ok: Boolean(o.contactOk),
  };
  const initiativeRow = {
    author: ini.author || null,
    title: ini.title,
    description: ini.description || null,
    itil_category: ini.itil_category || null,
    category: ini.category || null,
    problem_statement: ini.problem_statement || null,
    use_case: ini.use_case || null,
    expected_use: ini.expected_use || null,
    error_conditions: ini.error_conditions || null,
    assumptions: ini.assumptions || null,
    out_of_scope: ini.out_of_scope || null,
    no_move_forward: ini.no_move_forward || null,
    no_move_forward_reasons: ini.no_move_forward_reasons ?? [],
    workflow_description: ini.workflow_description || null,
    workflow_steps: ini.workflow_steps ?? [],
    my_role: p.my_role,
    stakeholders: p.stakeholders,
    dependencies: p.dependencies,
    dependencies_narrative: p.dependencies_narrative || null,
    timeline: p.timeline,
    content_hash: iniHash,
    owner_id: o.ownerId,
    ...contact,
  };
  const solutionRow = {
    name: o.solutionName ?? null,
    status: "draft",
    deployment_strategy: ini.deployment_strategy || null,
    deployment_strategy_description: ini.deployment_strategy_description || null,
    version: 1,
    payload: solutionPayload(p),
    content_hash: await solutionHash(p, iniHash),
    owner_id: o.ownerId,
    ...contact,
  };
  return { initiativeRow, solutionRow };
}

/** Reassemble the export-shaped payload from stored rows (for loading). */
export function toWizardPayload(initiative: Record<string, unknown>, solution: Record<string, unknown>): Record<string, unknown> {
  const design = (solution["payload"] ?? {}) as Record<string, unknown>;
  const g = (k: string) => initiative[k] ?? "";
  const payload: Record<string, unknown> = {
    initiative: {
      author: g("author"), title: g("title"), description: g("description"),
      itil_category: g("itil_category"),
      category: g("category"), problem_statement: g("problem_statement"),
      use_case: g("use_case"), expected_use: g("expected_use"),
      error_conditions: g("error_conditions"), assumptions: g("assumptions"),
      out_of_scope: g("out_of_scope"), no_move_forward: g("no_move_forward"),
      no_move_forward_reasons: initiative["no_move_forward_reasons"] ?? [],
      workflow_description: g("workflow_description"),
      workflow_steps: initiative["workflow_steps"] ?? [],
      deployment_strategy: solution["deployment_strategy"] ?? "",
      deployment_strategy_description: solution["deployment_strategy_description"] ?? "",
    },
    my_role: initiative["my_role"] ?? {},
    stakeholders: initiative["stakeholders"] ?? {},
    dependencies: initiative["dependencies"] ?? [],
    dependencies_narrative: g("dependencies_narrative"),
    timeline: initiative["timeline"] ?? {},
  };
  for (const s of SOLUTION_SECTIONS) payload[s] = design[s] ?? {};
  if (design["naf_report_md"] != null) payload["naf_report_md"] = design["naf_report_md"];
  return payload;
}

// ── repository.py ports ─────────────────────────────────────────
function db() {
  if (!supabase) throw new Error("Supabase is not configured (JSON-only mode).");
  return supabase;
}

export async function listCatalog(): Promise<{ initiatives: InitiativeRow[]; solutions: SolutionRow[] }> {
  const [ini, sol] = await Promise.all([
    db().from("initiatives")
      .select("id, owner_id, author, title, description, itil_category, category, problem_statement, use_case, submitter_name, submitter_email, contact_ok, created_at, updated_at")
      .order("created_at", { ascending: false }).limit(200),
    db().from("solutions")
      .select("id, initiative_id, owner_id, name, status, deployment_strategy, version, submitter_name, submitter_email, contact_ok, created_at")
      .order("created_at", { ascending: false }).limit(500),
  ]);
  if (ini.error) throw ini.error;
  if (sol.error) throw sol.error;
  return { initiatives: (ini.data ?? []) as InitiativeRow[], solutions: (sol.data ?? []) as SolutionRow[] };
}

export async function loadWizardFromSolution(solutionId: string): Promise<{
  payload: Record<string, unknown>; initiativeId: string; ownerId: string | null;
}> {
  const sol = await db().from("solutions").select("*").eq("id", solutionId).limit(1).single();
  if (sol.error) throw sol.error;
  const ini = await db().from("initiatives").select("*").eq("id", sol.data.initiative_id).limit(1).single();
  if (ini.error) throw ini.error;
  return {
    payload: toWizardPayload(ini.data, sol.data),
    initiativeId: ini.data.id,
    ownerId: ini.data.owner_id,
  };
}

async function findByHash(table: "initiatives" | "solutions", contentHash: string, ownerId: string) {
  const res = await db().from(table).select("*")
    .eq("content_hash", contentHash).eq("owner_id", ownerId).limit(1).maybeSingle();
  if (res.error) throw res.error;
  return res.data;
}

export interface SaveResult {
  initiativeId: string;
  solutionId: string;
  createdInitiative: boolean;
  createdSolution: boolean;
  duplicate: boolean;
}

/** Port of repository.save_wizard: per-owner find-or-create + update intent. */
export async function saveWizard(p: WizardPayload, o: SaveOptions): Promise<SaveResult> {
  const { initiativeRow, solutionRow } = await decompose(p, o);

  let initiativeId: string;
  let createdInitiative = false;

  if (o.intent === "update" && o.updateInitiativeId) {
    const res = await db().from("initiatives").update(initiativeRow)
      .eq("id", o.updateInitiativeId).select("id").single();
    if (res.error) throw res.error;
    initiativeId = res.data.id;
  } else {
    const existing = await findByHash("initiatives", initiativeRow.content_hash, o.ownerId);
    if (existing) {
      initiativeId = existing.id;
    } else {
      const res = await db().from("initiatives").insert(initiativeRow).select("id").single();
      if (res.error) throw res.error;
      initiativeId = res.data.id;
      createdInitiative = true;
    }
  }

  let solutionId: string;
  let createdSolution = false;
  const existingSol = await findByHash("solutions", solutionRow.content_hash, o.ownerId);
  if (existingSol) {
    solutionId = existingSol.id;
  } else {
    const res = await db().from("solutions").insert({ ...solutionRow, initiative_id: initiativeId })
      .select("id").single();
    if (res.error) throw res.error;
    solutionId = res.data.id;
    createdSolution = true;
  }

  return {
    initiativeId, solutionId, createdInitiative, createdSolution,
    duplicate: !createdSolution && o.intent !== "update",
  };
}

export async function deleteSolution(solutionId: string): Promise<void> {
  const res = await db().from("solutions").delete().eq("id", solutionId);
  if (res.error) throw res.error;
}

/** FK is on-delete-restrict: child solutions must go first. */
export async function deleteInitiativeWithSolutions(initiativeId: string): Promise<void> {
  const sols = await db().from("solutions").delete().eq("initiative_id", initiativeId);
  if (sols.error) throw sols.error;
  const ini = await db().from("initiatives").delete().eq("id", initiativeId);
  if (ini.error) throw ini.error;
}

// ── roles.py ports ──────────────────────────────────────────────
export async function isCurrentUserAdmin(userId: string): Promise<boolean> {
  const res = await db().from("user_roles").select("role").eq("user_id", userId).limit(1).maybeSingle();
  if (res.error) return false;
  return res.data?.role === "admin";
}

export async function listRoles(): Promise<{ user_id: string; role: string }[]> {
  const res = await db().from("user_roles").select("user_id, role");
  if (res.error) throw res.error;
  return res.data ?? [];
}

export async function setRole(userId: string, role: "viewer" | "editor" | "admin"): Promise<void> {
  const res = await db().from("user_roles").upsert({ user_id: userId, role });
  if (res.error) throw res.error;
}

/** contact visibility rule (port of catalog_ui.visible_contact). */
export function visibleContact(row: { submitter_name: string | null; submitter_email: string | null; contact_ok: boolean }, isAdmin: boolean): { name: string; email: string } | null {
  if (!(isAdmin || row.contact_ok)) return null;
  const name = (row.submitter_name ?? "").trim();
  const email = (row.submitter_email ?? "").trim();
  if (!name && !email) return null;
  return { name, email };
}
