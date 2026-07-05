/** Solution Wizard page — puzzle board, section forms, import/export. */
import { useWizard } from "../state/store";
import { completionState } from "../lib/completion";
import { missingRequired } from "../lib/fieldRegistry";
import PuzzleBoard from "../components/PuzzleBoard";
import SectionPanel from "../components/SectionPanel";
import { ALL_SECTIONS, type SectionKey } from "../data/sections";

function FieldViewToggle() {
  const view = useWizard((s) => s.fieldView);
  const setFieldView = useWizard((s) => s.setFieldView);
  return (
    <span className="badge" title="'Required only' hides optional fields in every section.">
      <button className={view === "required" ? "seg on" : "seg"}
              onClick={() => setFieldView("required")}>Required only</button>
      <button className={view === "all" ? "seg on" : "seg"}
              onClick={() => setFieldView("all")}>All fields</button>
    </span>
  );
}

function SaveIndicator() {
  const savedAt = useWizard((s) => s.savedAt);
  const draftRestored = useWizard((s) => s.draftRestored);
  return (
    <span className="badge subtle">
      {savedAt
        ? `Draft autosaved ${new Date(savedAt).toLocaleTimeString()}`
        : draftRestored
          ? "Draft restored from this browser"
          : "Autosave on"}
    </span>
  );
}

export default function WizardPage() {
  const payload = useWizard((s) => s.payload);
  const openSection = useWizard((s) => s.openSection);
  const reset = useWizard((s) => s.reset);
  const completed = completionState(payload);

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    const title = (payload.initiative.title || "untitled").replace(/[^A-Za-z0-9_-]+/g, "_");
    const ts = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14);
    a.download = `naf_report_${title}_${ts}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const importJson = (file: File) => {
    file.text().then((text) => {
      try {
        useWizard.getState().loadPayload(JSON.parse(text));
        alert("Loaded — your wizard has been rehydrated from the file.");
      } catch (e) {
        alert(`Could not load file: ${e instanceof Error ? e.message : e}`);
      }
    });
  };

  return (
    <div className="page">
      <div className="wizard-toolbar">
        <FieldViewToggle />
        <SaveIndicator />
      </div>

      <p className="tagline">
        Click a puzzle piece to describe that part of your automation solution.
        The frame is your project context; the six inner pieces are the NAF
        framework components.
      </p>

      <PuzzleBoard completed={completed} onOpen={(k) => openSection(k)} />

      <div className="section-buttons">
        {ALL_SECTIONS.map((s) => {
          const key = s.key as SectionKey;
          const missing = missingRequired(payload, key).length;
          return (
            <button key={s.key} className="section-btn"
                    style={{ borderColor: s.color }}
                    title={missing ? `${missing} required field(s) missing` : undefined}
                    onClick={() => openSection(s.key)}>
              {missing > 0 ? "⚠️" : completed[key] ? "✅" : s.icon} {s.label}
            </button>
          );
        })}
      </div>

      {missingRequired(payload).length > 0 ? (
        <p className="callout warn">
          ⚠️ {missingRequired(payload).length} required field(s) still missing —
          needed before saving to the shared catalog. File download works anytime.
        </p>
      ) : (
        <p className="callout success">✅ All required fields complete — ready for the catalog.</p>
      )}

      <div className="actions">
        <button onClick={exportJson}>💾 Download JSON</button>
        <label className="file-btn">
          📂 Load naf_report_*.json
          <input type="file" accept=".json" hidden
                 onChange={(e) => e.target.files?.[0] && importJson(e.target.files[0])} />
        </label>
        <button className="danger" onClick={() => confirm("Clear all wizard data?") && reset()}>
          🗑 Reset
        </button>
      </div>

      <SectionPanel />
    </div>
  );
}
