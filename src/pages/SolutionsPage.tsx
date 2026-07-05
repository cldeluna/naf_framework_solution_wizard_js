/**
 * Solutions catalog — Phase 2 (SPEC FR-9/FR-10). Signed-in users browse all
 * shared initiatives/solutions, load any design into the wizard (fork), and
 * manage (edit/delete) their own. This shell shows auth state; the catalog
 * queries land with the Phase 2 RLS work.
 */
import { useAuth } from "../hooks/useAuth";

export default function SolutionsPage() {
  const auth = useAuth();
  return (
    <div className="page">
      <h2>Solutions Catalog</h2>
      {!auth.configured ? (
        <p className="callout warn">
          JSON-only mode — no database configured, so there is no shared catalog.
          Use Download/Load JSON in the wizard to share designs.
        </p>
      ) : !auth.user ? (
        <p className="callout warn">
          🔒 Sign in (Home page) to browse the shared catalog of problem
          statements, use cases, and their solutions.
        </p>
      ) : (
        <p className="callout">
          🚧 Coming with Phase 2: browse every shared initiative and its
          solutions grouped by problem statement/use case, load any design into
          the wizard to adapt as your own, and edit or delete the ones you own.
          Submitter contact appears only where the submitter opted in.
        </p>
      )}
    </div>
  );
}
