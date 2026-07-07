/**
 * Slide-over panel hosting the active section form. Closing it is always
 * safe — every keystroke is already in the store and autosaved.
 */
import { useState, useEffect, useContext } from "react";
import { useWizard } from "../state/store";
import { sectionMeta, type SectionKey } from "../data/sections";
import { GUIDED_ORDER, guidedStep, guidedNext } from "../data/guidedOrder";
import { isSectionComplete } from "../lib/completion";
import { missingRequired } from "../lib/fieldRegistry";
import { ViewContext } from "../hooks/ViewContext";
import { FORMS } from "./forms";

function PanelViewToggle() {
  const { compact, toggle } = useContext(ViewContext)!;
  return (
    <span className="badge" title="Override field view for this section. Global default is set in the left sidebar.">
      <button className={compact ? "seg on" : "seg"}
              onClick={() => !compact && toggle()}>🔎 Compact</button>
      <button className={!compact ? "seg on" : "seg"}
              onClick={() => compact && toggle()}>🗂️ Detailed</button>
    </span>
  );
}

export default function SectionPanel() {
  const active = useWizard((s) => s.activeSection) as SectionKey | null;
  const openSection = useWizard((s) => s.openSection);
  const payload = useWizard((s) => s.payload);
  const experienceMode = useWizard((s) => s.experienceMode);
  const globalCompact = useWizard((s) => s.fieldView) === "required";
  const [compact, setCompact] = useState(globalCompact);

  // Reset per-panel override to the global default each time a section opens.
  useEffect(() => { setCompact(globalCompact); }, [active]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!active) return null;
  const meta = sectionMeta(active);
  const Form = FORMS[active];
  const done = isSectionComplete(payload, active);

  const guided = experienceMode === "guided";
  const stepNum = guided ? guidedStep(active) : 0;
  const nextKey = guided ? guidedNext(active) : null;
  const nextMeta = nextKey ? sectionMeta(nextKey) : null;
  const nextStep = nextKey ? guidedStep(nextKey) : 0;

  return (
    <ViewContext.Provider value={{ compact, toggle: () => setCompact((c) => !c) }}>
      <div className="panel-overlay" onClick={() => openSection(null)}>
        <aside className="panel" onClick={(e) => e.stopPropagation()}
               role="dialog" aria-label={meta.label}>
          <header className="panel-header" style={{ borderColor: meta.color }}>
            <span className="panel-title">
              {meta.icon} {meta.label} {done && "✓"}
              {stepNum > 0 && (
                <span className="step-indicator">Step {stepNum} of {GUIDED_ORDER.length}</span>
              )}
            </span>
            <button className="panel-close" onClick={() => openSection(null)} aria-label="Close">
              ✕
            </button>
          </header>
          <div className="panel-body">
            <div style={{ textAlign: "right", marginBottom: 6 }}><PanelViewToggle /></div>
            {missingRequired(payload, active).length > 0 && (
              <p className="callout warn small">
                Required for catalog save:{" "}
                {missingRequired(payload, active).map((f) => f.label).join(", ")}
              </p>
            )}
            <Form />
          </div>
          <footer className="panel-footer">
            <span>Changes save automatically — close anytime.</span>
            {nextMeta && (
              <button className="next-section-btn"
                      onClick={() => openSection(nextKey)}>
                Step {nextStep}: {nextMeta.icon} {nextMeta.label} →
              </button>
            )}
          </footer>
        </aside>
      </div>
    </ViewContext.Provider>
  );
}
