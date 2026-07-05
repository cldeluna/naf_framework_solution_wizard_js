/**
 * Terms & Definitions — port of pages/90_Terms_and_Definitions.py.
 * Use-case categories, deployment strategies, and the tool catalog.
 */
import { CATEGORY_DEFINITIONS, DEPLOYMENT_DEFINITIONS, type ToolsFile } from "../data/terms";
import toolsJson from "../data/tools.json";

const toolsData = toolsJson as unknown as ToolsFile;

export default function TermsPage() {
  const toolCount = Object.values(toolsData.tools).reduce((n, v) => n + v.length, 0);
  return (
    <div className="page">
      <h2>Terms &amp; Definitions</h2>
      <p className="tagline">
        Reference definitions for use case categories, deployment strategies, and
        automation tools.
      </p>

      <details>
        <summary>Use Case Categories ({Object.keys(CATEGORY_DEFINITIONS).length})</summary>
        <dl>
          {Object.entries(CATEGORY_DEFINITIONS).map(([term, def]) => (
            <div key={term} className="term">
              <dt>{term}</dt>
              <dd>{def}</dd>
            </div>
          ))}
        </dl>
      </details>

      <details>
        <summary>Deployment Strategies ({Object.keys(DEPLOYMENT_DEFINITIONS).length})</summary>
        <dl>
          {Object.entries(DEPLOYMENT_DEFINITIONS).map(([term, def]) => (
            <div key={term} className="term">
              <dt>{term}</dt>
              <dd>{def}</dd>
            </div>
          ))}
        </dl>
      </details>

      <details>
        <summary>Automation Tools ({toolCount} in {Object.keys(toolsData.tools).length} categories)</summary>
        {Object.entries(toolsData.tools).map(([category, tools]) => (
          <div key={category}>
            <h3>{category}</h3>
            <dl>
              {tools.map((t) => (
                <div key={t.name} className="term">
                  <dt>
                    {t.url ? (
                      <a href={t.url} target="_blank" rel="noreferrer">{t.name}</a>
                    ) : t.name}
                    {t.framework_functions && t.framework_functions.length > 0 && (
                      <span className="fn-tags"> {t.framework_functions.join(" · ")}</span>
                    )}
                  </dt>
                  {t.notes && <dd>{t.notes}</dd>}
                </div>
              ))}
            </dl>
          </div>
        ))}
      </details>
    </div>
  );
}
