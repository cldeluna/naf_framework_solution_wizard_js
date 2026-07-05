/**
 * Solutions catalog (SPEC FR-9/FR-10) — card grid, zero-click browsing:
 * every initiative is a summary card with its solutions and Load buttons
 * inline. Search + ITIL-practice filters on top. Owner CRUD and admin
 * controls surface directly on the cards (RLS enforces server-side).
 */
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useWizard } from "../state/store";
import { navigate } from "../lib/router";
import { ITIL_CATEGORIES } from "../data/options";
import {
  listCatalog, loadWizardFromSolution, deleteSolution,
  deleteInitiativeWithSolutions, isCurrentUserAdmin, visibleContact,
  type InitiativeRow, type SolutionRow,
} from "../lib/catalog";

/** Stable accent color per ITIL practice (echoes the puzzle palette). */
const ITIL_COLORS: Record<string, string> = {
  "Service Configuration Management": "#E8B817",
  "Change Enablement": "#FF6B35",
  "Incident Management": "#E91E63",
  "Problem Management": "#7B52E0",
  "Monitoring and Event Management": "#2ECC40",
  "Capacity and Performance Management": "#00BCD4",
  "Information Security Management": "#A8B8C8",
  "Service Validation and Testing": "#B0A090",
};
const accentFor = (itil: string | null | undefined) => ITIL_COLORS[itil ?? ""] ?? "#4a5560";

export default function SolutionsPage() {
  const auth = useAuth();
  const loadPayload = useWizard((s) => s.loadPayload);
  const [initiatives, setInitiatives] = useState<InitiativeRow[]>([]);
  const [solutions, setSolutions] = useState<SolutionRow[]>([]);
  const [admin, setAdmin] = useState(false);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [itilFilter, setItilFilter] = useState<string | null>(null);

  const refresh = () => {
    setStatus("loading");
    listCatalog()
      .then(({ initiatives, solutions }) => {
        setInitiatives(initiatives);
        setSolutions(solutions);
        setStatus("ready");
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : String(e));
        setStatus("error");
      });
  };

  useEffect(() => {
    if (auth.user) {
      refresh();
      isCurrentUserAdmin(auth.user.id).then(setAdmin);
    }
  }, [auth.user?.id]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return initiatives.filter((ini) => {
      if (itilFilter && (ini["itil_category"] ?? "") !== itilFilter) return false;
      if (!q) return true;
      const hay = [
        ini.title, ini.category, ini["itil_category"], ini.problem_statement,
        ini.use_case, ini.author,
      ].map((v) => String(v ?? "").toLowerCase()).join(" ");
      return hay.includes(q);
    });
  }, [initiatives, query, itilFilter]);

  // which ITIL practices actually occur (for filter chips)
  const presentItil = useMemo(() => {
    const s = new Set(initiatives.map((i) => String(i["itil_category"] ?? "")).filter(Boolean));
    return ITIL_CATEGORIES.filter((c) => s.has(c));
  }, [initiatives]);

  if (!auth.configured) {
    return (
      <div className="page"><h2>Solutions Catalog</h2>
        <p className="callout warn">JSON-only mode — no database configured. Use Download/Load JSON in the wizard to share designs.</p>
      </div>
    );
  }
  if (!auth.ready) return <div className="page"><h2>Solutions Catalog</h2><p>…</p></div>;
  if (!auth.user) {
    return (
      <div className="page"><h2>Solutions Catalog</h2>
        <p className="callout warn">🔒 Sign in (Home page) to browse the shared catalog.</p>
      </div>
    );
  }

  const load = async (solutionId: string) => {
    try {
      const res = await loadWizardFromSolution(solutionId);
      loadPayload(res.payload, { id: res.initiativeId, ownerId: res.ownerId });
      navigate("/wizard");
    } catch (e) {
      alert(`Load failed: ${e instanceof Error ? e.message : e}`);
    }
  };

  const removeSolution = async (s: SolutionRow) => {
    if (!confirm(`Delete solution "${s.name || s.id.slice(0, 8)}"? This cannot be undone.`)) return;
    try { await deleteSolution(s.id); refresh(); }
    catch (e) { alert(`Delete failed: ${e instanceof Error ? e.message : e}`); }
  };

  const removeInitiative = async (ini: InitiativeRow, count: number) => {
    if (!confirm(`Delete initiative "${ini.title}" and its ${count} solution(s)? This cannot be undone.`)) return;
    try { await deleteInitiativeWithSolutions(ini.id); refresh(); }
    catch (e) { alert(`Delete failed: ${e instanceof Error ? e.message : e}`); }
  };

  return (
    <div className="page">
      <h2>Solutions Catalog</h2>
      <p className="tagline">
        Community problem statements and their solution designs. <strong>Load</strong> pulls
        a design straight into the wizard — saving forks it under your account
        unless it's yours and you choose Update.
      </p>

      <div className="catalog-toolbar">
        <input type="text" className="catalog-search" placeholder="🔎 Search title, problem, category, author…"
               value={query} onChange={(e) => setQuery(e.target.value)} />
        <button onClick={refresh} title="Refresh">↻</button>
      </div>
      {presentItil.length > 0 && (
        <div className="filter-chips">
          <button className={itilFilter === null ? "chip on" : "chip"}
                  onClick={() => setItilFilter(null)}>All</button>
          {presentItil.map((c) => (
            <button key={c} className={itilFilter === c ? "chip on" : "chip"}
                    style={{ borderColor: accentFor(c) }}
                    onClick={() => setItilFilter(itilFilter === c ? null : c)}>
              {c}
            </button>
          ))}
        </div>
      )}

      {status === "loading" && <p>Loading catalog…</p>}
      {status === "error" && <p className="callout warn">❌ {error}</p>}
      {status === "ready" && initiatives.length === 0 && (
        <p className="callout">The catalog is empty — be the first: complete the wizard and “Save to catalog”.</p>
      )}
      {status === "ready" && initiatives.length > 0 && visible.length === 0 && (
        <p className="callout">No matches — adjust the search or filters.</p>
      )}

      <div className="card-grid">
        {visible.map((ini) => {
          const sols = solutions.filter((s) => s.initiative_id === ini.id);
          const mine = ini.owner_id === auth.user!.id;
          const contact = visibleContact(ini, admin);
          const itil = String(ini["itil_category"] ?? "");
          const accent = accentFor(itil);
          return (
            <article key={ini.id} className="sol-card" style={{ borderTopColor: accent }}>
              <header>
                <h3>{ini.title}{mine && <span className="mine-tag">mine</span>}</h3>
                <div className="card-chips">
                  {itil && <span className="chip static" style={{ borderColor: accent, color: accent }}>{itil}</span>}
                  {ini.category && <span className="chip static">{ini.category}</span>}
                </div>
              </header>
              {ini.problem_statement && <p className="card-snippet">{ini.problem_statement}</p>}
              <p className="card-meta">
                {contact ? `${contact.name || contact.email}` : ini.author || "—"}
                {" · "}{ini.created_at.slice(0, 10)}
                {" · "}{sols.length} solution{sols.length === 1 ? "" : "s"}
              </p>
              <div className="card-solutions">
                {sols.map((s) => (
                  <div key={s.id} className="card-sol-row">
                    <span className="sol-name">
                      {s.name || <em>unnamed</em>}
                      {s.deployment_strategy && <span className="chip static small">{s.deployment_strategy}</span>}
                    </span>
                    <span className="sol-actions">
                      <button onClick={() => load(s.id)}>📥 Load</button>
                      {(admin || s.owner_id === auth.user!.id) && (
                        <button className="row-del" title="Delete solution" onClick={() => removeSolution(s)}>🗑</button>
                      )}
                    </span>
                  </div>
                ))}
              </div>
              {(admin || mine) && (
                <footer className="card-footer">
                  <button className="row-del" onClick={() => removeInitiative(ini, sols.length)}>
                    🗑 Delete initiative + solutions
                  </button>
                </footer>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
