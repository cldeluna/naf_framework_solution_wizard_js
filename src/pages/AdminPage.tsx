/**
 * Admin console (SPEC FR-11) — gated by the `admin` role in user_roles.
 * Role management by user UID; catalog deletion lives on the Solutions page
 * (admins see delete controls on every record there).
 */
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { isCurrentUserAdmin, listRoles, setRole } from "../lib/catalog";

type RoleRow = { user_id: string; role: string };
const ROLES = ["viewer", "editor", "admin"] as const;

export default function AdminPage() {
  const auth = useAuth();
  const [admin, setAdmin] = useState<boolean | null>(null);
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [newUid, setNewUid] = useState("");
  const [newRole, setNewRole] = useState<(typeof ROLES)[number]>("viewer");
  const [msg, setMsg] = useState("");

  const refresh = () => listRoles().then(setRoles).catch((e) => setMsg(String(e)));

  useEffect(() => {
    if (auth.user) {
      isCurrentUserAdmin(auth.user.id).then((ok) => {
        setAdmin(ok);
        if (ok) refresh();
      });
    }
  }, [auth.user?.id]);

  if (!auth.configured) return <div className="page"><h2>Admin</h2><p className="callout warn">JSON-only mode — no database.</p></div>;
  if (!auth.ready) return <div className="page"><h2>Admin</h2><p>…</p></div>;
  if (!auth.user) return <div className="page"><h2>Admin</h2><p className="callout warn">🔒 Sign in first.</p></div>;
  if (admin === null) return <div className="page"><h2>Admin</h2><p>Checking role…</p></div>;
  if (!admin) {
    return (
      <div className="page"><h2>Admin</h2>
        <p className="callout warn">
          ⛔ Your account does not have the admin role. An existing admin can
          grant it here, or via SQL:{" "}
          <code>insert into user_roles (user_id, role) values ('&lt;uid&gt;', 'admin');</code>
        </p>
      </div>
    );
  }

  const apply = async (uid: string, role: (typeof ROLES)[number]) => {
    setMsg("");
    try {
      await setRole(uid.trim(), role);
      setMsg(`✅ ${uid.slice(0, 8)}… → ${role}`);
      refresh();
    } catch (e) {
      setMsg(`❌ ${e instanceof Error ? e.message : e}`);
    }
  };

  return (
    <div className="page">
      <h2>Admin</h2>
      <p className="tagline">
        Role management. Catalog moderation (delete any solution/initiative,
        contact always visible) is on the <a href="#/solutions">Solutions page</a> —
        as admin you see those controls on every record.
      </p>

      <h3>User roles</h3>
      <table className="milestones">
        <thead><tr><th>User UID</th><th>Role</th><th /></tr></thead>
        <tbody>
          {roles.map((r) => (
            <tr key={r.user_id}>
              <td><code>{r.user_id}</code></td>
              <td>{r.role}</td>
              <td>
                <select value={r.role}
                        onChange={(e) => apply(r.user_id, e.target.value as (typeof ROLES)[number])}>
                  {ROLES.map((x) => <option key={x} value={x}>{x}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Grant a role</h3>
      <p className="field-hint">
        Find user UIDs in Supabase → Authentication → Users.
      </p>
      <div className="two-col">
        <input type="text" placeholder="user UID (uuid)" value={newUid}
               onChange={(e) => setNewUid(e.target.value)} />
        <div className="actions">
          <select value={newRole} onChange={(e) => setNewRole(e.target.value as (typeof ROLES)[number])}>
            {ROLES.map((x) => <option key={x} value={x}>{x}</option>)}
          </select>
          <button onClick={() => newUid.trim() && apply(newUid, newRole)}>Grant</button>
        </div>
      </div>
      {msg && <p className="badge subtle">{msg}</p>}
    </div>
  );
}
