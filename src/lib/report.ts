/**
 * Solution Design Report renderer — TS port of templates/
 * Solution_Design_Report.j2 (selections branch; the legacy narrative branch
 * is not needed because this app always stores structured selections).
 *
 * Deliberate additions vs the original template (we are the primary app now):
 * Use Case, Workflow, and Dependencies-narrative sections.
 */
import type { WizardPayload } from "../types/wizardPayload";

const j = (a: string[]) => a.join(", ");
const has = (s: string | null | undefined) => !!s && s.trim() !== "";

function section(title: string, body: string): string {
  return `## ${title}\n${body.trim()}\n\n`;
}

export function renderReport(p: WizardPayload, opts?: { ganttImagePath?: string | null; generatedAt?: Date }): string {
  const ini = p.initiative;
  const ts = (opts?.generatedAt ?? new Date()).toISOString().replace("T", " ").slice(0, 19);
  let md = "";

  md += "![NAF Icon](images/naf_icon.png)\n\n";
  md += "***NAF Network Automation Framework Solution Design Document***\n\n";
  md += `Generated: ${ts}\n\n`;
  md += "## Overview of Automation Initiative\n";
  md += `# ${ini.title || ""}\n---\n`;
  md += `Author:\n${has(ini.author) ? ini.author : "Author information not provided."}\n\n`;

  md += section("Scope", ini.description || "");
  md += section("ITIL Category", has(ini.itil_category) ? ini.itil_category : "ITIL category input was not provided.");
  md += section("Category", has(ini.category) ? ini.category : "Category input was not provided.");
  md += section("Problem Statement", has(ini.problem_statement) ? ini.problem_statement : "Problem statement input was not provided.");
  if (has(ini.use_case)) md += section("Use Case", ini.use_case);
  if (has(ini.workflow_description) || ini.workflow_steps.length > 0) {
    let wf = ini.workflow_description || "";
    if (ini.workflow_steps.length > 0) {
      wf += "\n" + ini.workflow_steps
        .filter((s) => has(s.name) || has(s.description))
        .map((s, i) => `${i + 1}. **${s.name}**${has(s.description) ? ` — ${s.description}` : ""}`)
        .join("\n");
    }
    md += section("Workflow", wf);
  }
  md += section("Out of scope", ini.out_of_scope || "");
  if (has(ini.expected_use)) md += section("Expected use", ini.expected_use);
  md += section("Error Conditions", has(ini.error_conditions) ? ini.error_conditions : "Error conditions input was not provided.");
  md += section("Assumptions", has(ini.assumptions) ? ini.assumptions : "Assumptions input was not provided.");
  md += section("Deployment Strategy", has(ini.deployment_strategy) ? ini.deployment_strategy : "Deployment strategy input was not provided.");
  md += section("Deployment Strategy Description", has(ini.deployment_strategy_description) ? ini.deployment_strategy_description : "Deployment strategy description input was not provided.");

  const reasons = ini.no_move_forward_reasons ?? [];
  if (has(ini.no_move_forward) || reasons.length > 0) {
    let body = reasons.map((r) => `- ${r}`).join("\n");
    if (has(ini.no_move_forward)) body += `\n\n### Additional risks in not moving forward\n${ini.no_move_forward}`;
    md += section("If not pursued", body);
  }

  md += section("My Role", [
    `- Who: ${p.my_role.who || ""}`,
    `- Skills: ${p.my_role.skills || ""}`,
    `- Developer: ${p.my_role.developer || ""}`,
  ].join("\n"));

  {
    const choices = p.stakeholders.choices ?? {};
    const rows = Object.entries(choices)
      .filter(([, v]) => v && v.length > 0)
      .map(([cat, v]) => `- **${cat}**: ${j(v)}`);
    if (has(p.stakeholders.other)) rows.push(`- **Other**: ${p.stakeholders.other}`);
    md += section("Stakeholders", rows.length ? rows.join("\n") : "No stakeholder information provided");
  }

  md += "---\n# Framework Elements\n\n";

  {
    const s = p.presentation.selections;
    const any = s.users.length || s.interactions.length || s.tools.length || s.auth.length;
    md += section("Presentation", any
      ? [
          `- Selected user types: ${j(s.users)}`,
          `- Interaction modes: ${j(s.interactions)}`,
          `- Presentation tools: ${j(s.tools)}`,
          `- Authentication mechanisms: ${j(s.auth)}`,
        ].join("\n")
      : "No presentation information provided");
  }

  {
    const s = p.intent.selections;
    md += section("Intent", s.development.length || s.provided.length
      ? [
          `- Intent development format(s): ${j(s.development)}`,
          `- Intent delivery format(s): ${j(s.provided)}`,
        ].join("\n")
      : "No intent information provided");
  }

  {
    const s = p.observability.selections;
    const rows: string[] = [];
    if (s.methods.length) rows.push(`- Observability method(s): ${j(s.methods)}`);
    if (has(s.go_no_go_text)) rows.push(`- Go/No-Go text: ${s.go_no_go_text}`);
    if (s.additional_logic_enabled && has(s.additional_logic_text)) rows.push(`- Additional logic details: ${s.additional_logic_text}`);
    if (s.tools.length) rows.push(`- Observability tool(s): ${j(s.tools)}`);
    md += section("Observability", rows.length ? rows.join("\n") : "No observability information provided");
  }

  {
    const s = p.orchestration.selections;
    const choice = has(s.choice) ? s.choice : "No";
    if (has(p.orchestration.summary) || choice !== "No" || has(s.details)) {
      let body = has(p.orchestration.summary) ? `${p.orchestration.summary}\n` : "";
      body += `- Orchestration used: ${choice}`;
      if (has(s.details)) body += `\n- Orchestration details: ${s.details}`;
      md += section("Orchestration", body);
    } else {
      md += section("Orchestration", "No orchestration information provided");
    }
  }

  {
    const s = p.collector.selections;
    const rows: string[] = [];
    if (s.methods.length) rows.push(`- Collection method(s): ${j(s.methods)}`);
    if (s.auth.length) rows.push(`- Authentication mechanism(s): ${j(s.auth)}`);
    if (s.handling.length) rows.push(`- Traffic handling: ${j(s.handling)}`);
    if (s.normalization.length) rows.push(`- Normalization: ${j(s.normalization)}`);
    if (has(s.devices)) rows.push(`- Target devices: ${s.devices}`);
    if (has(s.metrics_per_sec)) rows.push(`- Metrics per second: ${s.metrics_per_sec}`);
    if (has(s.cadence)) rows.push(`- Collection cadence: ${s.cadence}`);
    if (s.tools.length) rows.push(`- Collection tool(s): ${j(s.tools)}`);
    md += section("Collector", rows.length ? rows.join("\n") : "No collector information provided");
  }

  {
    const s = p.executor.selections;
    md += section("Executor", s.methods.length
      ? `- Execution method(s): ${j(s.methods)}`
      : "No executor information provided");
  }

  md += "# Dependencies & External Interfaces\n---\n";
  if (has(p.dependencies_narrative)) md += `${p.dependencies_narrative}\n\n`;
  md += (p.dependencies.length
    ? p.dependencies.map((d) => `- ${d.name}${has(d.details) ? `: ${d.details}` : ""}`).join("\n")
    : "No dependencies defined") + "\n\n";

  md += "# Staffing, Timeline, & Milestones\n---\n";
  const tl = p.timeline;
  md += (tl.staff_count || tl.start_date || tl.total_business_days || tl.projected_completion
    ? `- Staff ${tl.staff_count} • Start ${tl.start_date} • Total ${tl.total_business_days} bd • Completion ${tl.projected_completion ?? ""}`
    : "No timeline information provided") + "\n";
  md += (tl.items.length
    ? tl.items.map((i) => `- ${i.name}: ${i.start} → ${i.end} (${i.duration_bd} bd)${has(i.notes) ? ` — ${i.notes}` : ""}`).join("\n")
    : "No detailed milestones defined") + "\n\n";

  md += "### Gantt Chart\n";
  md += (opts?.ganttImagePath ? `![Project Gantt Chart](${opts.ganttImagePath})` : "Gantt chart image not available") + "\n\n";

  md += section("Staffing Plan", has(tl.staffing_plan_md) ? tl.staffing_plan_md : "No detailed staffing plan provided");

  md += "---\n\nNAF NAF Solution Wizard provided by EIA https://eianow.com\n";
  return md;
}
