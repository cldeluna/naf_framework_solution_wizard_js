/**
 * Slide-over panel hosting the active section form. Closing it is always
 * safe — every keystroke is already in the store and autosaved.
 */
import { useWizard } from "../state/store";
import { sectionMeta, type SectionKey } from "../data/sections";
import { isSectionComplete } from "../lib/completion";
import { missingRequired } from "../lib/fieldRegistry";
import { FORMS } from "./forms";

export default function SectionPanel() {
  const active = useWizard((s) => s.activeSection) as SectionKey | null;
  const openSection = useWizard((s) => s.openSection);
  const payload = useWizard((s) => s.payload);

  if (!active) return null;
  const meta = sectionMeta(active);
  const Form = FORMS[active];
  const done = isSectionComplete(payload, active);

  return (
    <div className="panel-overlay" onClick={() => openSection(null)}>
      <aside className="panel" onClick={(e) => e.stopPropagation()}
             role="dialog" aria-label={meta.label}>
        <header className="panel-header" style={{ borderColor: meta.color }}>
          <span className="panel-title">
            {meta.icon} {meta.label} {done && "✓"}
          </span>
          <button className="panel-close" onClick={() => openSection(null)} aria-label="Close">
            ✕
          </button>
        </header>
        <div className="panel-body">
          {missingRequired(payload, active).length > 0 && (
            <p className="callout warn small">
              Required for catalog save:{" "}
              {missingRequired(payload, active).map((f) => f.label).join(", ")}
            </p>
          )}
          <Form />
        </div>
        <footer className="panel-footer">
          Changes save automatically — close anytime.
        </footer>
      </aside>
    </div>
  );
}
