import { useAuth } from "./hooks/useAuth";
import { useWizard } from "./state/store";
import { useRoute, navigate, type Route } from "./lib/router";
import HomePage from "./pages/HomePage";
import WizardPage from "./pages/WizardPage";
import SolutionsPage from "./pages/SolutionsPage";
import AdminPage from "./pages/AdminPage";
import TermsPage from "./pages/TermsPage";

const NAV: { to: Route; label: string }[] = [
  { to: "/", label: "🏠 Home" },
  { to: "/wizard", label: "🧩 Design Solution Wizard" },
  { to: "/solutions", label: "📚 Community Solutions" },
  { to: "/admin", label: "🛠 Admin" },
  { to: "/terms", label: "📖 Terms" },
];

function AuthBadge() {
  const auth = useAuth();
  if (!auth.configured) return <span className="badge">JSON-only mode</span>;
  if (!auth.ready) return <span className="badge">…</span>;
  return auth.user ? (
    <span className="badge" style={{ flexDirection: "column", alignItems: "flex-start", gap: "0.25rem" }}>
      <span style={{ fontSize: "0.75rem" }}>✅ {auth.user.email}</span>
      <button onClick={auth.signOut}>Log out</button>
    </span>
  ) : (
    <span className="badge">
      <button onClick={auth.signInWithGoogle}>🔐 Sign in with Google</button>
    </span>
  );
}

const PAGES: Record<Route, () => React.JSX.Element> = {
  "/": HomePage,
  "/wizard": WizardPage,
  "/solutions": SolutionsPage,
  "/admin": AdminPage,
  "/terms": TermsPage,
};

export default function App() {
  const route = useRoute();
  const Page = PAGES[route];
  const fieldView = useWizard((s) => s.fieldView);
  const setFieldView = useWizard((s) => s.setFieldView);
  const experienceMode = useWizard((s) => s.experienceMode);
  const setExperienceMode = useWizard((s) => s.setExperienceMode);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">NAF Design Solution Wizard</div>

        <nav className="sidebar-nav">
          {NAV.map((n) => (
            <button key={n.to}
                    className={route === n.to ? "nav-link on" : "nav-link"}
                    onClick={() => navigate(n.to)}>
              {n.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-ux">
          <div className="sidebar-section-label">Experience</div>
          <span className="badge">
            <button className={experienceMode === "freeform" ? "seg on" : "seg"}
                    onClick={() => setExperienceMode("freeform")}>Free Form</button>
            <button className={experienceMode === "guided" ? "seg on" : "seg"}
                    onClick={() => setExperienceMode("guided")}>Guided</button>
          </span>
          {experienceMode === "guided" && (
            <p className="sidebar-ux-hint">
              Numbered steps + Next → button guide you section by section.
            </p>
          )}

          <div className="sidebar-section-label">Field View</div>
          <span className="badge">
            <button className={fieldView === "all" ? "seg on" : "seg"}
                    onClick={() => setFieldView("all")}>🗂️ Detailed</button>
            <button className={fieldView === "required" ? "seg on" : "seg"}
                    onClick={() => setFieldView("required")}>🔎 Compact</button>
          </span>
        </div>

        <div className="sidebar-auth">
          <AuthBadge />
        </div>
      </aside>

      <main className="content">
        <Page />
      </main>
    </div>
  );
}
