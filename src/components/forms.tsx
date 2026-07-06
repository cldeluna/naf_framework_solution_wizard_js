/**
 * Section forms — one component per puzzle piece. Field inventories and
 * intro text ported from the Streamlit dialogs (SPEC §2.3). All inputs write
 * straight to the store (autosaved); selections land in the same
 * payload.selections shape the Python models define.
 */
import { useEffect } from "react";
import { useWizard } from "../state/store";
import * as OPT from "../data/options";
import { Field, DetailOnly, TextInput, TextArea, CheckboxGrid, RadioWithOther, Select } from "./fields";
import { scheduleItems, approxDuration, iso } from "../lib/schedule";
import type { SectionKey } from "../data/sections";
import type { JSX } from "react";

// ── Presentation ────────────────────────────────────────────────
function PresentationForm() {
  const sel = useWizard((s) => s.payload.presentation.selections);
  const setField = useWizard((s) => s.setField);
  return (
    <>
      <p className="intro">
        The Presentation layer is the primary human touchpoint — GUIs, ITSM/change
        systems, chat, portals, reports. It should provide robust, flexible
        authentication and may support both read and write operations.
      </p>
      <Field label="Intended users">
        <CheckboxGrid options={OPT.PRESENTATION_USERS} value={sel.users}
                      onChange={(v) => setField("presentation.selections.users", v)}
                      customLabel="Custom users" />
      </Field>
      <Field label="How will your users interact with your solution?">
        <CheckboxGrid options={OPT.PRESENTATION_INTERACTIONS} value={sel.interactions}
                      onChange={(v) => setField("presentation.selections.interactions", v)}
                      customLabel="Custom interaction" />
      </Field>
      <Field label="What tools will the Presentation layer use?">
        <CheckboxGrid options={OPT.PRESENTATION_TOOLS} value={sel.tools}
                      onChange={(v) => setField("presentation.selections.tools", v)}
                      customLabel="Custom tool(s)" />
      </Field>
      <Field label="How will your users authenticate?">
        <CheckboxGrid options={OPT.PRESENTATION_AUTH} value={sel.auth}
                      onChange={(v) => setField("presentation.selections.auth", v)}
                      customLabel="Other authentication details" />
      </Field>
    </>
  );
}

// ── Intent ──────────────────────────────────────────────────────
function IntentForm() {
  const sel = useWizard((s) => s.payload.intent.selections);
  const setField = useWizard((s) => s.setField);
  return (
    <>
      <p className="intro">
        Intent captures what the automation should achieve and how that desired
        state is expressed and consumed.
      </p>
      <Field label="How will Intent be developed?">
        <CheckboxGrid options={OPT.INTENT_DEVELOPMENT} value={sel.development}
                      onChange={(v) => setField("intent.selections.development", v)}
                      customLabel="Custom intent development approach" />
      </Field>
      <Field label="How will intent be consumed by automation?">
        <CheckboxGrid options={OPT.INTENT_PROVIDED} value={sel.provided}
                      onChange={(v) => setField("intent.selections.provided", v)}
                      customLabel="Custom provider format" />
      </Field>
    </>
  );
}

// ── Observability ───────────────────────────────────────────────
function ObservabilityForm() {
  const sel = useWizard((s) => s.payload.observability.selections);
  const setField = useWizard((s) => s.setField);
  return (
    <>
      <p className="intro">
        Observability determines network state and whether the automation can
        proceed (go/no-go), including any additional gating logic.
      </p>
      <Field label="How will you determine network state?">
        <CheckboxGrid options={OPT.OBSERVABILITY_METHODS} value={sel.methods}
                      onChange={(v) => setField("observability.selections.methods", v)} />
      </Field>
      <Field label="Describe the basic go/no-go logic">
        <TextArea value={sel.go_no_go_text} rows={4} maxLength={1000}
                  onChange={(v) => setField("observability.selections.go_no_go_text", v)} />
      </Field>
      <Field label="Additional logic applied to state before the automation can move forward?">
        <div className="radio-group">
          <label className="check">
            <input type="radio" name="obs-add" checked={!sel.additional_logic_enabled}
                   onChange={() => setField("observability.selections.additional_logic_enabled", false)} />
            <span>No</span>
          </label>
          <label className="check">
            <input type="radio" name="obs-add" checked={sel.additional_logic_enabled}
                   onChange={() => setField("observability.selections.additional_logic_enabled", true)} />
            <span>Yes</span>
          </label>
        </div>
        {sel.additional_logic_enabled && (
          <TextArea value={sel.additional_logic_text} rows={3} maxLength={1000}
                    placeholder="Describe additional logic"
                    onChange={(v) => setField("observability.selections.additional_logic_text", v)} />
        )}
      </Field>
      <Field label="What tools will support the observability layer?">
        <CheckboxGrid options={OPT.OBSERVABILITY_TOOLS} value={sel.tools}
                      onChange={(v) => setField("observability.selections.tools", v)}
                      customLabel="Other observability tool(s)" />
      </Field>
    </>
  );
}

// ── Orchestration ───────────────────────────────────────────────
function OrchestrationForm() {
  const sel = useWizard((s) => s.payload.orchestration.selections);
  const setField = useWizard((s) => s.setField);
  const needsDetails = sel.choice.startsWith("Yes");
  return (
    <>
      <p className="intro">
        Orchestration coordinates multi-step workflows across the other
        framework components (or the solution may not need a distinct layer).
      </p>
      <Field label="Will the solution utilize orchestration?">
        <div className="radio-group">
          {OPT.ORCHESTRATION_CHOICES.map((opt) => (
            <label key={opt} className="check">
              <input type="radio" name="orch" checked={sel.choice === opt}
                     onChange={() => setField("orchestration.selections.choice", opt)} />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      </Field>
      {needsDetails && (
        <Field label="Describe the orchestration approach">
          <TextArea value={sel.details} rows={4} maxLength={1000}
                    onChange={(v) => setField("orchestration.selections.details", v)} />
        </Field>
      )}
    </>
  );
}

// ── Collector ───────────────────────────────────────────────────
function CollectorForm() {
  const sel = useWizard((s) => s.payload.collector.selections);
  const setField = useWizard((s) => s.setField);
  return (
    <>
      <p className="intro">
        The Collector gathers data from the network — protocols, authentication,
        traffic handling, normalization, and scale.
      </p>
      <Field label="Collection methods (protocols/APIs)">
        <CheckboxGrid options={OPT.COLLECTOR_METHODS} value={sel.methods}
                      onChange={(v) => setField("collector.selections.methods", v)}
                      customLabel="Other protocol/API" />
      </Field>
      <Field label="Authentication">
        <CheckboxGrid options={OPT.COLLECTOR_AUTH} value={sel.auth}
                      onChange={(v) => setField("collector.selections.auth", v)}
                      customLabel="Other authentication method(s)" />
      </Field>
      <Field label="Traffic handling">
        <CheckboxGrid options={OPT.COLLECTOR_HANDLING} value={sel.handling}
                      onChange={(v) => setField("collector.selections.handling", v)}
                      customLabel="Other traffic handling approach(es)" />
      </Field>
      <Field label="Normalization and schemas">
        <CheckboxGrid options={OPT.COLLECTOR_NORMALIZATION} value={sel.normalization}
                      onChange={(v) => setField("collector.selections.normalization", v)}
                      customLabel="Other normalization approach(es)" />
      </Field>
      <Field label="Scale — devices/scope">
        <TextInput value={sel.devices} maxLength={100} placeholder="e.g. ~500 campus switches"
                   onChange={(v) => setField("collector.selections.devices", v)} />
      </Field>
      <Field label="Scale — metrics/data volume">
        <TextInput value={sel.metrics_per_sec} maxLength={100} placeholder="e.g. 2k metrics/sec"
                   onChange={(v) => setField("collector.selections.metrics_per_sec", v)} />
      </Field>
      <Field label="Collection cadence">
        <TextInput value={sel.cadence} maxLength={100} placeholder="e.g. every 5 minutes"
                   onChange={(v) => setField("collector.selections.cadence", v)} />
      </Field>
      <Field label="Collection tools">
        <CheckboxGrid options={OPT.COLLECTOR_TOOLS} value={sel.tools}
                      onChange={(v) => setField("collector.selections.tools", v)}
                      customLabel="Other collection tool(s)" />
      </Field>
    </>
  );
}

// ── Executor ────────────────────────────────────────────────────
function ExecutorForm() {
  const sel = useWizard((s) => s.payload.executor.selections);
  const setField = useWizard((s) => s.setField);
  return (
    <>
      <p className="intro">
        The Executor makes the actual changes to the network. It should support
        dry-run, transactional execution, and idempotent operations.
      </p>
      <Field label="How will your solution execute change?">
        <CheckboxGrid options={OPT.EXECUTOR_METHODS} value={sel.methods}
                      onChange={(v) => setField("executor.selections.methods", v)}
                      customLabel="Custom execution approach" />
      </Field>
    </>
  );
}

// ── Problem Statement & Use Cases (frame piece) ─────────────────
function ProblemStatementForm() {
  const ini = useWizard((s) => s.payload.initiative);
  const setField = useWizard((s) => s.setField);
  return (
    <>
      <Field label="Author" required>
        <TextInput value={ini.author} maxLength={100}
                   onChange={(v) => setField("initiative.author", v)} />
      </Field>
      <Field label="Title" required
             hint="Displayed as the card heading in Community Design Solutions when this design is shared.">
        <TextInput value={ini.title} maxLength={200}
                   onChange={(v) => setField("initiative.title", v)} />
      </Field>
      <Field label="Abstract" required
             hint="A short summary of scope and intent — shown beneath the title in Community Design Solutions.">
        <TextArea value={ini.description} rows={3} maxLength={1000}
                  onChange={(v) => setField("initiative.description", v)} />
      </Field>
      <Field label="ITIL Category" required
             hint="The ITIL 4/5 practice this initiative falls under.">
        <Select options={OPT.ITIL_CATEGORIES} value={ini.itil_category}
                onChange={(v) => {
                  setField("initiative.itil_category", v);
                  // changing practice invalidates a previously picked common category
                  if (ini.category && !(OPT.CATEGORY_TREE[v] ?? []).includes(ini.category)) {
                    setField("initiative.category", "");
                  }
                }} />
      </Field>
      <Field label="Category" required
             hint={ini.itil_category ? "Common categories for the selected ITIL practice — or Other." : "Select an ITIL Category first."}>
        {ini.itil_category ? (
          <Select options={OPT.CATEGORY_TREE[ini.itil_category] ?? []} value={ini.category} allowOther
                  onChange={(v) => setField("initiative.category", v)} />
        ) : (
          <select disabled><option>— Select an ITIL Category first —</option></select>
        )}
      </Field>
      <Field label="Problem statement" required>
        <TextArea value={ini.problem_statement} rows={4} maxLength={2000}
                  onChange={(v) => setField("initiative.problem_statement", v)} />
      </Field>
      <Field label="Use case — how will the solution be used?" required>
        <TextArea value={ini.use_case} rows={4} maxLength={2000}
                  onChange={(v) => setField("initiative.use_case", v)} />
      </Field>
      <Field label="Workflow description" required
             hint="Describe the workflow here. For structured steps, switch to Detailed mode and add them below.">
        <TextArea value={ini.workflow_description} rows={4} maxLength={4000}
                  onChange={(v) => setField("initiative.workflow_description", v)} />
      </Field>
      <Field label="Workflow steps (optional)"
             hint="Ordered steps with a name and description — rendered as a numbered list in the report.">
        <table className="milestones">
          <thead><tr><th style={{ width: "30%" }}>Step</th><th>Description</th><th /></tr></thead>
          <tbody>
            {ini.workflow_steps.map((row, i) => (
              <tr key={i}>
                <td>
                  <TextInput value={row.name} maxLength={200}
                             onChange={(v) => setField("initiative.workflow_steps",
                               ini.workflow_steps.map((r, j) => (j === i ? { ...r, name: v } : r)))} />
                </td>
                <td>
                  <TextInput value={row.description} maxLength={2000}
                             onChange={(v) => setField("initiative.workflow_steps",
                               ini.workflow_steps.map((r, j) => (j === i ? { ...r, description: v } : r)))} />
                </td>
                <td>
                  <button type="button" className="row-del" aria-label="Remove step"
                          onClick={() => setField("initiative.workflow_steps",
                            ini.workflow_steps.filter((_, j) => j !== i))}>
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button type="button"
                onClick={() => setField("initiative.workflow_steps",
                  [...ini.workflow_steps, { name: "", description: "" }])}>
          + Add workflow step
        </button>
      </Field>
      <Field label="Error conditions">
        <TextArea value={ini.error_conditions} rows={3} maxLength={1000}
                  onChange={(v) => setField("initiative.error_conditions", v)} />
      </Field>
      <Field label="Assumptions">
        <TextArea value={ini.assumptions} rows={3} maxLength={1000}
                  onChange={(v) => setField("initiative.assumptions", v)} />
      </Field>
      <Field label="Deployment strategy">
        <Select options={OPT.DEPLOYMENT_STRATEGIES} value={ini.deployment_strategy} allowOther
                onChange={(v) => setField("initiative.deployment_strategy", v)} />
      </Field>
      <Field label="Deployment strategy description">
        <TextArea value={ini.deployment_strategy_description} rows={3} maxLength={1000}
                  onChange={(v) => setField("initiative.deployment_strategy_description", v)} />
      </Field>
      <Field label="Out of scope (optional)">
        <TextArea value={ini.out_of_scope} rows={3} maxLength={1000}
                  onChange={(v) => setField("initiative.out_of_scope", v)} />
      </Field>
      <Field label="Risk of not doing the automation">
        <CheckboxGrid options={OPT.STANDARD_RISK_REASONS} value={ini.no_move_forward_reasons}
                      onChange={(v) => setField("initiative.no_move_forward_reasons", v)} />
      </Field>
      <Field label="Additional risks in not moving forward">
        <TextArea value={ini.no_move_forward} rows={3} maxLength={2000}
                  onChange={(v) => setField("initiative.no_move_forward", v)} />
      </Field>
    </>
  );
}

// ── Stakeholders & My Role (frame piece) ────────────────────────
function StakeholdersForm() {
  const my = useWizard((s) => s.payload.my_role);
  const stakeholders = useWizard((s) => s.payload.stakeholders);
  const setField = useWizard((s) => s.setField);
  return (
    <>
      <h3>My Role</h3>
      <Field label="Who's filling out this wizard?" required>
        <RadioWithOther name="who" options={OPT.MY_ROLE_WHO} value={my.who}
                        onChange={(v) => setField("my_role.who", v)} />
      </Field>
      <Field label="What best describes your technical skills?" required>
        <RadioWithOther name="skills" options={OPT.MY_ROLE_SKILLS} value={my.skills}
                        onChange={(v) => setField("my_role.skills", v)} />
      </Field>
      <Field label="Who will actually develop the network automation?" required>
        <RadioWithOther name="dev" options={OPT.MY_ROLE_DEV} value={my.developer}
                        onChange={(v) => setField("my_role.developer", v)} />
      </Field>

      <DetailOnly><h3>Stakeholders</h3></DetailOnly>
      {Object.entries(OPT.STAKEHOLDER_CATALOG).map(([category, opts]) => (
        <Field key={category} label={category}>
          <CheckboxGrid options={opts}
                        value={stakeholders.choices[category] ?? []}
                        onChange={(v) => setField(`stakeholders.choices.${category}`, v)} />
        </Field>
      ))}
      <Field label="Other stakeholders">
        <TextArea value={stakeholders.other} rows={2} maxLength={500}
                  onChange={(v) => setField("stakeholders.other", v)} />
      </Field>
    </>
  );
}

// ── Dependencies & External Interfaces (frame piece) ────────────
function DependenciesForm() {
  const deps = useWizard((s) => s.payload.dependencies);
  const narrative = useWizard((s) => s.payload.dependencies_narrative);
  const setField = useWizard((s) => s.setField);

  const entry = (label: string) => deps.find((d) => d.name === label);
  const setDep = (label: string, on: boolean, defaultDetails = "") => {
    const rest = deps.filter((d) => d.name !== label);
    setField("dependencies", on ? [...rest, { name: label, details: defaultDetails }] : rest);
  };
  const setDetails = (label: string, details: string) => {
    setField("dependencies", deps.map((d) => (d.name === label ? { ...d, details } : d)));
  };

  return (
    <>
      <Field label="Dependencies & external interfaces narrative (Markdown supported)" required
             hint="Describe the external systems this automation depends on or interfaces with, and how.">
        <TextArea value={narrative} rows={4} maxLength={4000}
                  onChange={(v) => setField("dependencies_narrative", v)} />
      </Field>
      <Field label="External systems this automation will interact with">
        <div>
          {OPT.DEPENDENCY_DEFS.map((d) => {
            const cur = entry(d.label);
            return (
              <div key={d.label} style={{ marginBottom: 4 }}>
                <label className="check">
                  <input type="checkbox" checked={!!cur}
                         onChange={(e) => setDep(d.label, e.target.checked, d.defaultDetails ?? "")} />
                  <span>{d.label}</span>
                </label>
                {d.help && <span className="field-hint" style={{ marginLeft: "1.6rem" }}>{d.help}</span>}
                {cur && d.details && (
                  <div style={{ marginLeft: "1.6rem", marginTop: 4 }}>
                    <TextInput value={cur.details} maxLength={500}
                               placeholder={`Details for ${d.label}`}
                               onChange={(v) => setDetails(d.label, v)} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Field>
    </>
  );
}

// ── Staffing, Timeline & Milestones (frame piece) ───────────────
function TimelineForm() {
  const tl = useWizard((s) => s.payload.timeline);
  const setField = useWizard((s) => s.setField);

  const writeSchedule = (startDate: string, items: typeof tl.items) => {
    const res = scheduleItems(startDate, items);
    setField("timeline.start_date", startDate);
    setField("timeline.items", res.items);
    setField("timeline.total_business_days", res.totalBd);
    setField("timeline.projected_completion", res.projectedCompletion);
  };

  const startDate = tl.start_date || iso(new Date());
  const items = tl.items.length
    ? tl.items
    : OPT.DEFAULT_MILESTONES.map((m) => ({ name: m.name, duration_bd: m.duration_bd, start: "", end: "", notes: "" }));

  // seed the default template (with computed dates) on first open
  const needsSeed = tl.items.length === 0;
  useEffect(() => {
    if (needsSeed) writeSchedule(startDate, items);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsSeed]);

  const setRow = (i: number, patch: Partial<(typeof items)[number]>) => {
    writeSchedule(startDate, items.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  };

  return (
    <>
      <p className="intro">
        Capture a high-level plan with durations in business days. The start
        date drives scheduled dates (weekends skipped; holiday-calendar
        skipping by region is a planned refinement). If two people work a
        10-day step in parallel, model it as 5–6 days.
      </p>

      <h3>Staffing plan</h3>
      <Field label="Development approach" required>
        <div className="radio-group">
          {OPT.BUILD_BUY_OPTIONS.map((opt) => (
            <label key={opt} className="check">
              <input type="radio" name="bb" checked={tl.build_buy === opt}
                     onChange={() => setField("timeline.build_buy", opt)} />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      </Field>
      <div className="two-col">
        <Field label="Direct staff on project"
               hint="Direct employees from your team or another team in your organization.">
          <input type="number" min={0} step={1} value={tl.staff_count}
                 onChange={(e) => setField("timeline.staff_count", Math.max(0, Number(e.target.value) || 0))} />
        </Field>
        <Field label="Professional services staff" hint="External staff working on the project.">
          <input type="number" min={0} step={1} value={tl.external_staff_count}
                 onChange={(e) => setField("timeline.external_staff_count", Math.max(0, Number(e.target.value) || 0))} />
        </Field>
      </div>
      <Field label="Staffing plan (Markdown supported)" required>
        <TextArea value={tl.staffing_plan_md} rows={4}
                  onChange={(v) => setField("timeline.staffing_plan_md", v)} />
      </Field>

      <DetailOnly><h3>Timeline & milestones</h3></DetailOnly>
      <div className="two-col">
        <Field label="Holiday calendar" hint="Recorded for business-day math; region skipping lands with the holiday library.">
          <select value={tl.holiday_region || "None"}
                  onChange={(e) => setField("timeline.holiday_region", e.target.value)}>
            {OPT.HOLIDAY_REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </Field>
        <Field label="Project start date">
          <input type="date" value={startDate}
                 onChange={(e) => writeSchedule(e.target.value, items)} />
        </Field>
      </div>

      <Field label="Milestones" hint="Name, duration in business days, notes. Dates are computed.">
        <table className="milestones">
          <thead>
            <tr><th>Milestone</th><th>Days</th><th>Start</th><th>End</th><th>Notes</th><th /></tr>
          </thead>
          <tbody>
            {items.map((row, i) => (
              <tr key={i}>
                <td><TextInput value={row.name} maxLength={100} onChange={(v) => setRow(i, { name: v })} /></td>
                <td>
                  <input type="number" min={0} step={1} value={row.duration_bd}
                         onChange={(e) => setRow(i, { duration_bd: Math.max(0, Number(e.target.value) || 0) })} />
                </td>
                <td className="date-cell">{row.start}</td>
                <td className="date-cell">{row.end}</td>
                <td><TextInput value={row.notes} maxLength={500} onChange={(v) => setRow(i, { notes: v })} /></td>
                <td>
                  <button type="button" className="row-del" aria-label="Remove row"
                          onClick={() => writeSchedule(startDate, items.filter((_, j) => j !== i))}>
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button type="button"
                onClick={() => writeSchedule(startDate, [...items, { name: "", duration_bd: 0, start: "", end: "", notes: "" }])}>
          + Add milestone row
        </button>
      </Field>

      {tl.projected_completion && (
        <DetailOnly>
          <p className="callout success">
            📅 Expected delivery: <strong>{tl.projected_completion}</strong>
            {" "}({tl.total_business_days} business days, {approxDuration(tl.total_business_days)})
          </p>
        </DetailOnly>
      )}
    </>
  );
}

export const FORMS: Record<SectionKey, () => JSX.Element> = {
  presentation: PresentationForm,
  intent: IntentForm,
  observability: ObservabilityForm,
  orchestration: OrchestrationForm,
  collector: CollectorForm,
  executor: ExecutorForm,
  problem_statement: ProblemStatementForm,
  stakeholders: StakeholdersForm,
  dependencies: DependenciesForm,
  staffing_timeline: TimelineForm,
};
