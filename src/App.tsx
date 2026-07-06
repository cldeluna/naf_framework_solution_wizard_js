import { useAuth } from "./hooks/useAuth";
import { useRoute, navigate, type Route } from "./lib/router";
import HomePage from "./pages/HomePage";
import WizardPage from "./pages/WizardPage";
import SolutionsPage from "./pages/SolutionsPage";
import AdminPage from "./pages/AdminPage";
import TermsPage from "./pages/TermsPage";

const NAV: { to: Route; label: string }[] = [
  { to: "/", label: "🏠 Home" },
  { to: "/wizard", label: "🧩 Design Solution Wizard" },
  { to: "/solutions", label: "📚 Solutions" },
  { to: "/admin", label: "🛠 Admin" },
  { to: "/terms", label: "📖 Terms" },
];

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

  return (
    <main className="app">
      <header className="topbar">
        <nav className="nav">
          {NAV.map((n) => (
            <button key={n.to}
                    className={route === n.to ? "nav-link on" : "nav-link"}
                    onClick={() => navigate(n.to)}>
              {n.label}
            </button>
          ))}
        </nav>
        <AuthBadge />
      </header>
      <Page />
    </main>
  );
}
