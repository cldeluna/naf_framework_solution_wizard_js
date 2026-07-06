/**
 * Terms & Definitions — use-case categories (two-level ITIL tree),
 * deployment strategies, and the tool catalog with a framework-function
 * filter.
 */
import { useState } from "react";
import { PRACTICE_DEFINITIONS, CATEGORY_DEFINITIONS, CATEGORY_EXAMPLES, DEPLOYMENT_DEFINITIONS, type ToolsFile } from "../data/terms";
import { CATEGORY_TREE, CATEGORY_METADATA, ITIL_COLORS } from "../data/options";
import { INNER_SECTIONS } from "../data/sections";
import toolsJson from "../data/tools.json";

const toolsData = toolsJson as unknown as ToolsFile;

/** NAF framework-function colors — same palette as the puzzle / home figure. */
const FN_COLORS: Record<string, string> = Object.fromEntries(
  INNER_SECTIONS.map((s) => [s.label, s.color]),
);
const fnColor = (fn: string) => FN_COLORS[fn] ?? "#9aa4b0";

export default function TermsPage() {
  const [fnFilter, setFnFilter] = useState("");

  const toolCount = Object.values(toolsData.tools).reduce((n, v) => n + v.length, 0);
  const leafCount = Object.values(CATEGORY_TREE).reduce((n, v) => n + v.length, 0);

  // tools filtered by NAF framework function
  const filteredTools = Object.entries(toolsData.tools)
    .map(([category, tools]) => [
      category,
      fnFilter ? tools.filter((t) => (t.framework_functions ?? []).includes(fnFilter)) : tools,
    ] as const)
    .filter(([, tools]) => tools.length > 0);
  const filteredCount = filteredTools.reduce((n, [, v]) => n + v.length, 0);

  return (
    <div className="page">
      <h2>Terms &amp; Definitions</h2>
      <p className="tagline">
        Reference definitions for use case categories, deployment strategies, and
        automation tools.
      </p>

      <details>
        <summary>Use Case Categories ({Object.keys(CATEGORY_TREE).length} ITIL practices, {leafCount} categories)</summary>
        <p className="field-hint">
          Categories are organized in two levels: an ITIL 4/5 practice, and the
          common network-automation categories beneath it (as used by the
          wizard's Problem Statement piece).
        </p>
        {Object.entries(CATEGORY_TREE).map(([practice, leaves]) => {
          const meta = CATEGORY_METADATA[practice];
          const accent = ITIL_COLORS[practice] ?? "#4a5560";
          return (
            <details key={practice} className="practice" style={{ borderLeftColor: accent }}>
              <summary>
                <span className="practice-name" style={{ color: accent }}>{practice}</span>
                <span className="fn-tags"> {leaves.length} categor{leaves.length === 1 ? "y" : "ies"}</span>
                {meta?.frameworkVersion && (
                  <span className="fn-tags"> · {meta.frameworkVersion}{meta.practiceType ? ` · ${meta.practiceType}` : ""}</span>
                )}
              </summary>
              {PRACTICE_DEFINITIONS[practice] && (
                <p className="term-practice-def">{PRACTICE_DEFINITIONS[practice]}</p>
              )}
              {leaves.length > 0 ? (
                <table className="terms-table">
                  <thead>
                    <tr><th>Category</th><th>Example</th></tr>
                  </thead>
                  <tbody>
                    {leaves.map((leaf) => (
                      <tr key={leaf}>
                        <td className="term-name">
                          {leaf}
                          {CATEGORY_DEFINITIONS[leaf] && (
                            <div className="term-def">{CATEGORY_DEFINITIONS[leaf]}</div>
                          )}
                        </td>
                        <td className="term-example">{CATEGORY_EXAMPLES[leaf] ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="field-hint">No curated categories yet — use Other in the wizard.</p>
              )}
            </details>
          );
        })}
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
        <div className="catalog-toolbar" style={{ marginTop: "0.5rem" }}>
          <select className="catalog-filter" value={fnFilter}
                  onChange={(e) => setFnFilter(e.target.value)}
                  title="Filter tools by NAF framework function"
                  style={fnFilter ? { borderColor: fnColor(fnFilter) } : undefined}>
            <option value="">All framework functions ({toolCount})</option>
            {toolsData.framework_function_category.map((fn) => {
              const n = Object.values(toolsData.tools).flat()
                .filter((t) => (t.framework_functions ?? []).includes(fn)).length;
              return <option key={fn} value={fn}>{fn} ({n})</option>;
            })}
          </select>
        </div>
        {fnFilter && (
          <p className="field-hint">
            Showing {filteredCount} tool{filteredCount === 1 ? "" : "s"} tagged with the{" "}
            <strong>{fnFilter}</strong> framework function.
          </p>
        )}
        {filteredTools.map(([category, tools]) => (
          <div key={category}>
            <h3>{category}</h3>
            <dl>
              {tools.map((t) => (
                <div key={t.name} className="term">
                  <dt>
                    {t.url ? (
                      <a href={t.url} target="_blank" rel="noreferrer">{t.name}</a>
                    ) : t.name}
                    {(t.framework_functions ?? []).map((fn) => (
                      <span key={fn} className="fn-chip"
                            style={{ borderColor: fnColor(fn), color: fnColor(fn) }}>
                        {fn}
                      </span>
                    ))}
                  </dt>
                  {t.notes && <dd>{t.notes}</dd>}
                </div>
              ))}
            </dl>
          </div>
        ))}
        {filteredTools.length === 0 && (
          <p className="callout">No tools tagged with that framework function.</p>
        )}
      </details>
    </div>
  );
}
