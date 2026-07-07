import { useAuth } from "./hooks/useAuth";
import { useWizard } from "./state/store";
import { useRoute, navigate, type Route } from "./lib/router";
import HomePage from "./pages/HomePage";
import WizardPage from "./pages/WizardPage";
import SolutionsPage from "./pages/SolutionsPage";
import AdminPage from "./pages/AdminPage";
import TermsPage from "./pages/TermsPage";

const NAV: { to: Route; icon: string; label: string }[] = [
  { to: "/",          icon: "🏠", label: "Home" },
  { to: "/wizard",    icon: "🧩", label: "Design Solution Wizard" },
  { to: "/solutions", icon: "📚", label: "Community Solutions" },
  { to: "/admin",     icon: "🛠",  label: "Admin" },
  { to: "/terms",     icon: "📖", label: "Terms" },
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
    <span className="badge" style={{ flexDirection: "column", alignItems: "flex-start", gap: "0.4rem" }}>
      <button onClick={auth.signInWithGoogle}>🔐 Sign in with Google</button>
      <span className="sidebar-ux-hint">
        Sign in with Google to save to / load (fork) from the shared catalog. You can still use the wizard
        and download JSON without signing in.
      </span>
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
                    title={n.label}
                    onClick={() => navigate(n.to)}>
              <span className="nav-icon">{n.icon}</span>
              <span className="nav-text">{n.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-ux">
          <div className="sidebar-section-label">Experience</div>
          <span className="badge">
            <button className={experienceMode === "freeform" ? "seg on" : "seg seg-dim"}
                    onClick={() => setExperienceMode("freeform")}>Free Form</button>
            <button className={experienceMode === "guided" ? "seg on" : "seg seg-dim"}
                    onClick={() => setExperienceMode("guided")}>Guided</button>
          </span>
          <p className="sidebar-ux-hint">
            {experienceMode === "freeform"
              ? "Start anywhere, in any order. Best when you already know the NAF framework or prefer to fill in sections as ideas come to you."
              : "A concierge experience with numbered steps and a Next → button at each step, walking you through the business and solution design in the recommended order."}
          </p>

          <div className="sidebar-section-label">Field View</div>
          <span className="badge">
            <button className={fieldView === "all" ? "seg on" : "seg seg-dim"}
                    onClick={() => setFieldView("all")}>🗂️ Detailed</button>
            <button className={fieldView === "required" ? "seg on" : "seg seg-dim"}
                    onClick={() => setFieldView("required")}>🔎 Compact</button>
          </span>
          <p className="sidebar-ux-hint">
            {fieldView === "all"
              ? "Shows every field for a thorough, complete design document that captures the full nuance of your solution — richer output, better conversations with stakeholders."
              : "Shows only required fields — faster to complete and good for a first pass. Switch to Detailed any time to add context and produce a more complete design."}
          </p>
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
