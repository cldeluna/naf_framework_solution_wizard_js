/** Solution Wizard page — puzzle board, section forms, artifacts, import/export. */
import { useWizard } from "../state/store";
import { completionState } from "../lib/completion";
import { missingRequired } from "../lib/fieldRegistry";
import { renderReport } from "../lib/report";
import { renderMarkdown } from "../lib/markdown";
import { buildGanttSvg, ganttPngBlob } from "../lib/gantt";
import { buildZip, type ZipEntry } from "../lib/zip";
import PuzzleBoard from "../components/PuzzleBoard";
import SectionPanel from "../components/SectionPanel";
import CatalogActions from "../components/CatalogActions";
import { FRAME_SECTIONS, INNER_SECTIONS, type SectionKey } from "../data/sections";
import type { ReactNode } from "react";

/** Labeled button group — structure for the controls below the puzzle. */
function Group({ title, children, danger }: { title: string; children: ReactNode; danger?: boolean }) {
  return (
    <section className={danger ? "btn-group danger-group" : "btn-group"}>
      <h4 className="btn-group-title">{title}</h4>
      <div className="btn-group-body">{children}</div>
    </section>
  );
}

function FieldViewToggle() {
  const view = useWizard((s) => s.fieldView);
  const setFieldView = useWizard((s) => s.setFieldView);
  return (
    <span className="badge" title="Applies to every section form.">
      <button className={view === "required" ? "seg on" : "seg"}
              onClick={() => setFieldView("required")}>🔎 Compact — Show Required Only Fields</button>
      <button className={view === "all" ? "seg on" : "seg"}
              onClick={() => setFieldView("all")}>🗂️ Detailed — Show All Fields</button>
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

function download(blob: Blob, filename: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function baseName(title: string) {
  const t = (title || "untitled").replace(/[^A-Za-z0-9_-]+/g, "_");
  const ts = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14);
  return `naf_report_${t}_${ts}`;
}

export default function WizardPage() {
  const payload = useWizard((s) => s.payload);
  const openSection = useWizard((s) => s.openSection);
  const reset = useWizard((s) => s.reset);
  const completed = completionState(payload);
  const anyContent = Object.values(completed).some(Boolean);

  const ganttSvg = buildGanttSvg(payload.timeline.items, payload.initiative.title || "Project Timeline");
  const reportMd = renderReport(payload, { ganttImagePath: ganttSvg ? "images/Gantt.png" : null });

  const exportJson = () => {
    const full = { ...payload, naf_report_md: reportMd };
    download(new Blob([JSON.stringify(full, null, 2)], { type: "application/json" }),
             `${baseName(payload.initiative.title)}.json`);
  };

  /** ZIP bundle: JSON + Markdown report + Gantt.png + branding icon. */
  const exportZip = async () => {
    const base = baseName(payload.initiative.title);
    const full = { ...payload, naf_report_md: reportMd };
    const entries: ZipEntry[] = [
      { name: `${base}.json`, data: JSON.stringify(full, null, 2) },
      { name: `${base}.md`, data: reportMd },
    ];
    if (ganttSvg) {
      try {
        const png = await ganttPngBlob(ganttSvg);
        entries.push({ name: "images/Gantt.png", data: new Uint8Array(await png.arrayBuffer()) });
      } catch { /* rasterization unavailable — ZIP ships without the PNG */ }
    }
    try {
      const icon = await fetch("images/naf_icon.png");
      if (icon.ok) entries.push({ name: "images/naf_icon.png", data: new Uint8Array(await icon.arrayBuffer()) });
    } catch { /* branding icon optional */ }
    download(buildZip(entries), `${base}.zip`);
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

      {(() => {
        const sectionBtn = (s: { key: string; label: string; color: string; icon: string; tag?: string }) => {
          const key = s.key as SectionKey;
          const missing = missingRequired(payload, key).length;
          return (
            <button key={s.key} className="section-btn"
                    style={{ borderColor: s.color }}
                    title={missing ? "Has required fields still to complete" : undefined}
                    onClick={() => openSection(s.key)}>
              {completed[key] ? "✅" : s.icon}{" "}
              {s.tag && <span className="tag-chip" style={{ background: s.color }}>{s.tag}</span>}{" "}
              {s.label}
            </button>
          );
        };
        return (
          <div className="btn-groups">
            <Group title="🧩 Puzzle Border — Project Context">
              {FRAME_SECTIONS.map(sectionBtn)}
            </Group>
            <Group title="⚙️ Solution — NAF Framework Components">
              {INNER_SECTIONS.map(sectionBtn)}
            </Group>
          </div>
        );
      })()}

      {missingRequired(payload).length > 0 ? (
        <p className="callout warn">
          ⚠️ {missingRequired(payload).length} required field(s) still missing —
          needed before saving to the shared catalog. File download works anytime.
        </p>
      ) : (
        <p className="callout success">✅ All required fields complete — ready for the catalog.</p>
      )}

      {anyContent && (
        <details className="catalog-item">
          <summary>📄 Detailed solution description (preview)</summary>
          {ganttSvg && (
            <div className="gantt-wrap" dangerouslySetInnerHTML={{ __html: ganttSvg }} />
          )}
          {/* markdown-it renders with html:false — user content cannot inject markup */}
          <div className="report-preview report-html"
               dangerouslySetInnerHTML={{ __html: renderMarkdown(reportMd) }} />
        </details>
      )}

      <div className="btn-groups">
        <Group title="📂 Open">
          <label className="file-btn">
            Load naf_report_*.json
            <input type="file" accept=".json" hidden
                   onChange={(e) => e.target.files?.[0] && importJson(e.target.files[0])} />
          </label>
        </Group>
        <Group title="💾 Download">
          <button onClick={exportZip} disabled={!anyContent}
                  title={anyContent ? "JSON + Markdown report + Gantt" : "Fill in a section first"}>
            📦 Bundle (JSON + MD + Gantt)
          </button>
          <button onClick={exportJson}>JSON only</button>
        </Group>
        <Group title="🗄 Shared Catalog">
          <CatalogActions />
        </Group>
        <Group title="⚠️ Danger Zone" danger>
          <button className="danger" onClick={() => confirm("Clear all wizard data?") && reset()}>
            🗑 Reset wizard
          </button>
        </Group>
      </div>

      <SectionPanel />
    </div>
  );
}
