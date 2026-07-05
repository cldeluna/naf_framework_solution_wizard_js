/**
 * Solutions catalog (SPEC FR-9/FR-10): signed-in users browse every shared
 * initiative and its solutions, load any design into the wizard (forks under
 * their own id on save), and manage the records they own (owner CRUD —
 * enforced server-side by RLS, this UI just exposes it).
 */
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useWizard } from "../state/store";
import { navigate } from "../lib/router";
import {
  listCatalog, loadWizardFromSolution, deleteSolution,
  deleteInitiativeWithSolutions, isCurrentUserAdmin, visibleContact,
  type InitiativeRow, type SolutionRow,
} from "../lib/catalog";

export default function SolutionsPage() {
  const auth = useAuth();
  const loadPayload = useWizard((s) => s.loadPayload);
  const [initiatives, setInitiatives] = useState<InitiativeRow[]>([]);
  const [solutions, setSolutions] = useState<SolutionRow[]>([]);
  const [admin, setAdmin] = useState(false);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");

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
      <div className="wizard-toolbar">
        <button onClick={refresh}>↻ Refresh</button>
      </div>
      <h2>Solutions Catalog</h2>
      <p className="tagline">
        Browse shared problem statements/use cases and their solution designs.
        <strong> Load</strong> pulls a design into the wizard — saving it forks it
        under your account unless it's yours and you choose Update. You can
        delete records you own{admin ? " (and, as admin, anything)" : ""}.
      </p>

      {status === "loading" && <p>Loading catalog…</p>}
      {status === "error" && <p className="callout warn">❌ {error}</p>}
      {status === "ready" && initiatives.length === 0 && (
        <p className="callout">The catalog is empty — be the first: complete the wizard and “Save to catalog”.</p>
      )}

      {initiatives.map((ini) => {
        const sols = solutions.filter((s) => s.initiative_id === ini.id);
        const mine = ini.owner_id === auth.user!.id;
        const contact = visibleContact(ini, admin);
        return (
          <details key={ini.id} className="catalog-item">
            <summary>
              <strong>{ini.title}</strong>
              {ini.category && <span className="fn-tags"> {ini.category}</span>}
              {mine && <span className="mine-tag"> mine</span>}
              <span className="field-hint" style={{ float: "right" }}>
                {sols.length} solution{sols.length === 1 ? "" : "s"}
              </span>
            </summary>
            {ini.problem_statement && <p><strong>Problem:</strong> {ini.problem_statement}</p>}
            {ini.use_case && <p><strong>Use case:</strong> {ini.use_case}</p>}
            {contact && (
              <p className="field-hint">
                Submitted by {contact.name}{contact.email && ` (${contact.email})`}
              </p>
            )}
            <table className="milestones">
              <thead><tr><th>Solution</th><th>Deployment</th><th>Status</th><th>Created</th><th /></tr></thead>
              <tbody>
                {sols.map((s) => (
                  <tr key={s.id}>
                    <td>{s.name || <em>unnamed</em>}</td>
                    <td>{s.deployment_strategy || "—"}</td>
                    <td>{s.status}</td>
                    <td className="date-cell">{s.created_at.slice(0, 10)}</td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      <button onClick={() => load(s.id)}>📥 Load</button>{" "}
                      {(admin || s.owner_id === auth.user!.id) && (
                        <button className="row-del" onClick={() => removeSolution(s)}>🗑</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(admin || mine) && (
              <button className="danger" onClick={() => removeInitiative(ini, sols.length)}>
                🗑 Delete initiative + solutions
              </button>
            )}
          </details>
        );
      })}
    </div>
  );
}
