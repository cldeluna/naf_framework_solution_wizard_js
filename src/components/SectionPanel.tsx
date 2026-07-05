/**
 * Slide-over panel hosting the active section form. Closing it is always
 * safe — every keystroke is already in the store and autosaved.
 */
import { useWizard } from "../state/store";
import { sectionMeta, type SectionKey } from "../data/sections";
import { isSectionComplete } from "../lib/completion";
import { missingRequired } from "../lib/fieldRegistry";
import { useCompact } from "../hooks/useCompact";
import { FORMS } from "./forms";

/** Right-aligned badge mirroring the global field-view (port of render_view_badge). */
function ViewBadge() {
  const compact = useCompact();
  return (
    <span className={compact ? "view-badge compact" : "view-badge detail"}>
      {compact ? "🔎 Compact View — required fields only" : "🗂️ Detail View — all fields"}
    </span>
  );
}

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
          <div style={{ textAlign: "right", marginBottom: 6 }}><ViewBadge /></div>
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
