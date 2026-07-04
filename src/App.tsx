import { useAuth } from "./hooks/useAuth";
import { useWizard } from "./state/store";
import { completionState } from "./lib/completion";
import PuzzleBoard from "./components/PuzzleBoard";
import SectionPanel from "./components/SectionPanel";
import { ALL_SECTIONS, type SectionKey } from "./data/sections";

function AuthBadge() {
  const auth = useAuth();
  if (!auth.configured) return <span className="badge">JSON-only mode</span>;
  if (!auth.ready) return <span className="badge">…</span>;
  return auth.user ? (
    <span className="badge">
      ✅ {auth.user.email} <button onClick={auth.signOut}>Log out</button>
    </span>
  ) : (
    <span className="badge">
      <button onClick={auth.signInWithGoogle}>🔐 Sign in with Google</button>
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

export default function App() {
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
    <main className="app">
      <header className="topbar">
        <h1>NAF Framework Solution Wizard</h1>
        <div className="topbar-right">
          <SaveIndicator />
          <AuthBadge />
        </div>
      </header>

      <p className="tagline">
        Click a puzzle piece to describe that part of your automation solution.
        The frame is your project context; the six inner pieces are the NAF
        framework components.
      </p>

      <PuzzleBoard completed={completed} onOpen={(k) => openSection(k)} />

      <div className="section-buttons">
        {ALL_SECTIONS.map((s) => (
          <button key={s.key} className="section-btn"
                  style={{ borderColor: s.color }}
                  onClick={() => openSection(s.key)}>
            {completed[s.key as SectionKey] ? "✅" : s.icon} {s.label}
          </button>
        ))}
      </div>

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
    </main>
  );
}
