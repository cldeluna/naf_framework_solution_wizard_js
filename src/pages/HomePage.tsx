/**
 * Orientation / landing page — port of NAF_Framework_Solution_Wizard.py.
 * Framework intro, wizard overview, auth guidance, disclaimer, sponsors.
 */
import { useAuth } from "../hooks/useAuth";
import { navigate } from "../lib/router";

export default function HomePage() {
  const auth = useAuth();
  return (
    <div className="page">
      <h2>Network Automation Forum (NAF) Framework Design Solution Wizard</h2>

      {auth.configured && auth.ready && (
        auth.user ? (
          <p className="callout success">✅ Signed in as {auth.user.email} — you can save to and load from the shared catalog.</p>
        ) : (
          <div className="callout warn">
            <strong>🔐 Sign in for database access.</strong> Sign in with Google to
            save to / load from the shared catalog. You can still use the wizard and
            download JSON without signing in — and unlike the previous app, signing
            in later will <em>not</em> clear a half-filled wizard (drafts are saved
            in your browser).
            <div style={{ marginTop: 8 }}>
              <button onClick={auth.signInWithGoogle}>🔐 Sign in with Google</button>
            </div>
          </div>
        )
      )}

      {/* Full-width framework hero */}
      <figure className="hero-figure">
        <img src="images/naf_arch_framework_figure2.png" alt="NAF Framework architecture" />
        <figcaption className="field-hint">
          Source:{" "}
          <a href="https://github.com/Network-Automation-Forum/reference/blob/main/docs/Framework/Framework.md"
             target="_blank" rel="noreferrer">
            NAF reference framework
          </a>
        </figcaption>
      </figure>

      <div className="hero-pitch">
        <h3>Design Solution Wizard</h3>
        <p>
          Use the{" "}
          <a href="https://reference.networkautomation.forum/Framework/Framework/" target="_blank" rel="noreferrer">
            Network Automation Framework
          </a>{" "}
          to help you design your automation solution. The wizard guides structured thinking across every NAF
          block plus your project context (Problem Statement, Use Case, etc.) so nothing critical is missed. Your selections generate a
          shareable solution design document for your team, stakeholders, and
          management.
        </p>
        <p className="field-hint">
          Tip: If you can't answer a question technically, note that the function
          is needed and use the Custom option to describe what you can.
        </p>
        <button className="cta" onClick={() => navigate("/wizard")}>
          🚀 Start Designing Your Solution
        </button>
        <p style={{ margin: "0.5rem 0 0" }}>or <button className="cta-secondary" onClick={() => navigate("/solutions")}>📚 View Community Solutions</button></p>
      </div>

      <details>
        <summary>What does the wizard cover?</summary>
        <p>
          <strong>Project context:</strong> Initiative (problem, scope, deployment),
          Stakeholders, My Role, Dependencies, and Timeline.
        </p>
        <p>
          <strong>NAF Components:</strong> Presentation, Intent, Observability,
          Orchestration, Collector, and Executor.
        </p>
        <p>
          The wizard generates a complete solution design document (JSON + Markdown
          + timeline) you can share with team members, stakeholders, management,
          and other IT teams.
        </p>
      </details>

      <details>
        <summary>Saving and loading your work</summary>
        <p>
          Your work autosaves to this browser as you type. You can also download it
          as a JSON file and load it later (or on another machine) to continue
          editing — the JSON can be shared with others. Signed-in users can
          additionally save to the shared community catalog.
        </p>
      </details>

      <details>
        <summary>⚠️ Disclaimer</summary>
        <p>
          The calculations, outputs, and recommendations presented by this
          application are for informational purposes only. Results are entirely
          dependent on the inputs provided by the user and any assumptions entered.
          It is the user's responsibility to validate all inputs, review the
          outputs for accuracy and suitability, and apply appropriate professional
          judgment before making decisions based on these results. By using this
          application, you acknowledge that you are solely responsible for the data
          you enter and any conclusions you draw; the authors and contributors make
          no warranties and shall not be liable for losses arising from use of the
          results.
        </p>
      </details>

      <footer className="sponsors">
        <span className="sponsor-side">
          <a href="https://networkautomation.forum/" target="_blank" rel="noreferrer">
            <img src="images/naf_icon.png" alt="NAF" width={48} />
          </a>
          <span>
            <a href="https://networkautomation.forum/" target="_blank" rel="noreferrer">🏠 NAF Home</a>{" "}
            · <a href="https://www.linkedin.com/company/network-automation-forum/" target="_blank" rel="noreferrer">[in] NAF on LinkedIn</a>
          </span>
        </span>
        <span className="sponsor-side">
          <span>
            Sponsored by <a href="https://eianow.com" target="_blank" rel="noreferrer">EIA</a>{" "}
            · <a href="https://www.linkedin.com/company/eianow/" target="_blank" rel="noreferrer">[in] EIA on LinkedIn</a>
          </span>
          <a href="https://eianow.com" target="_blank" rel="noreferrer">
            <img src="images/EIA Logo FINAL small_Round.png" alt="EIA" width={48} />
          </a>
        </span>
      </footer>
    </div>
  );
}
