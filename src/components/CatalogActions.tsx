/**
 * Save-to-catalog controls on the wizard page. Save is gated on sign-in and
 * the save-strict validation (validateForSave). When the current content was
 * loaded from the user's own initiative, offers Update vs Save-as-new
 * (matching the original app's semantics; editing someone else's design
 * forks it under your id).
 */
import { useState } from "react";
import { useWizard } from "../state/store";
import { useAuth } from "../hooks/useAuth";
import { validateForSave } from "../lib/fieldRegistry";
import { saveWizard, type SaveResult } from "../lib/catalog";
import { renderReport } from "../lib/report";

export default function CatalogActions() {
  const auth = useAuth();
  const payload = useWizard((s) => s.payload);
  const loadedInitiative = useWizard((s) => s.loadedInitiative);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [contactOk, setContactOk] = useState(false);
  const [mode, setMode] = useState<"new" | "update">("new");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  if (!auth.configured) return null;
  const missing = validateForSave(payload);
  const canUpdate = !!(loadedInitiative && auth.user && loadedInitiative.ownerId === auth.user.id);

  const doSave = async () => {
    if (!auth.user) return;
    setBusy(true);
    setResult(null);
    try {
      // Include the rendered report in the stored design (like the original
      // app's exports). Excluded from content hashing, so dedup is unaffected.
      const withReport = { ...payload, naf_report_md: renderReport(payload) };
      const res: SaveResult = await saveWizard(withReport, {
        ownerId: auth.user.id,
        submitterName: (auth.user.user_metadata?.full_name as string) || auth.user.email || "",
        submitterEmail: auth.user.email ?? "",
        contactOk,
        solutionName: name || undefined,
        intent: canUpdate && mode === "update" ? "update" : "new",
        updateInitiativeId: canUpdate && mode === "update" ? loadedInitiative!.id : undefined,
      });
      setResult(
        res.duplicate
          ? "ℹ️ Identical content already in the catalog — nothing new was created."
          : `✅ Saved: initiative ${res.createdInitiative ? "created" : mode === "update" ? "updated" : "reused"}, solution ${res.createdSolution ? "created" : "reused"}.`,
      );
      setOpen(false);
    } catch (e) {
      setResult(`❌ Save failed: ${e instanceof Error ? e.message : e}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {!auth.user ? (
        <button disabled title="Sign in to save to the shared catalog">🗄 Save to catalog (sign in first)</button>
      ) : missing.length > 0 ? (
        <button disabled title={`Missing required: ${missing.map((m) => m.label).join(", ")}`}>
          🗄 Save to catalog ({missing.length} required missing)
        </button>
      ) : (
        <button onClick={() => setOpen(true)}>🗄 Save to catalog</button>
      )}

      {result && <span className="badge subtle">{result}</span>}

      {open && (
        <div className="panel-overlay" onClick={() => setOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Save to catalog">
            <h3>Save to the shared catalog</h3>
            <label className="field">
              <span className="field-label">Solution name (optional)</span>
              <input type="text" value={name} maxLength={120}
                     placeholder='e.g. "Ansible approach"'
                     onChange={(e) => setName(e.target.value)} />
            </label>
            <label className="check">
              <input type="checkbox" checked={contactOk}
                     onChange={(e) => setContactOk(e.target.checked)} />
              <span>Show my name/email to other signed-in users (contact opt-in)</span>
            </label>
            {canUpdate && (
              <div className="radio-group" style={{ marginTop: 8 }}>
                <label className="check">
                  <input type="radio" name="savemode" checked={mode === "update"}
                         onChange={() => setMode("update")} />
                  <span>Update the initiative I loaded</span>
                </label>
                <label className="check">
                  <input type="radio" name="savemode" checked={mode === "new"}
                         onChange={() => setMode("new")} />
                  <span>Save as new</span>
                </label>
              </div>
            )}
            <div className="actions" style={{ marginTop: 12 }}>
              <button onClick={doSave} disabled={busy}>{busy ? "Saving…" : "Save"}</button>
              <button onClick={() => setOpen(false)} disabled={busy}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
