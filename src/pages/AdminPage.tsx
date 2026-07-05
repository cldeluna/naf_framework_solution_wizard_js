/**
 * Admin console — Phase 2 (SPEC FR-11). Gated by the `admin` role in
 * user_roles. Browse with contact always visible, delete any solution or
 * initiative (cascade), manage user roles.
 */
import { useAuth } from "../hooks/useAuth";

export default function AdminPage() {
  const auth = useAuth();
  return (
    <div className="page">
      <h2>Admin</h2>
      {!auth.configured ? (
        <p className="callout warn">JSON-only mode — no database, nothing to administer.</p>
      ) : !auth.user ? (
        <p className="callout warn">🔒 Sign in first. Admin access requires the admin role.</p>
      ) : (
        <p className="callout">
          🚧 Coming with Phase 2: role check against <code>user_roles</code>,
          full catalog browse with submitter contact visible, delete
          solution/initiative (cascading), and role management
          (viewer / editor / admin) by user UID.
        </p>
      )}
    </div>
  );
}
