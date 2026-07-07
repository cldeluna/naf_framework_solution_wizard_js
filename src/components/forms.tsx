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
      <Field label="Intended users"
             tooltip="Q: Who will interact with this automation directly? Think about who logs in, runs the tool, receives its output, or triggers it — not everyone affected, just those who touch the interface.">
        <CheckboxGrid options={OPT.PRESENTATION_USERS} value={sel.users}
                      onChange={(v) => setField("presentation.selections.users", v)}
                      customLabel="Custom users" />
      </Field>
      <Field label="How will your users interact with your solution?"
             tooltip="Q: What is the primary interface — a command line, a web portal, an API call, or something else? Select all that apply if different users interact in different ways.">
        <CheckboxGrid options={OPT.PRESENTATION_INTERACTIONS} value={sel.interactions}
                      onChange={(v) => setField("presentation.selections.interactions", v)}
                      customLabel="Custom interaction" />
      </Field>
      <Field label="What tools will the Presentation layer use?"
             tooltip="Q: What software or frameworks will build or host the user-facing layer? This is distinct from collection or execution tools — focus on what the user sees and clicks.">
        <CheckboxGrid options={OPT.PRESENTATION_TOOLS} value={sel.tools}
                      onChange={(v) => setField("presentation.selections.tools", v)}
                      customLabel="Custom tool(s)" />
      </Field>
      <Field label="How will your users authenticate?"
             tooltip="Q: How do users prove their identity before the automation acts on their behalf? Consider both the risk level of the operation and what your organization already supports.">
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
      <Field label="How will Intent be developed?"
             tooltip="Q: How is the desired state or goal expressed — as templates, policies, data models, or hand-crafted config? Intent is the 'what' the automation is told to achieve before it acts. This is distinct from how it is delivered (next field).">
        <CheckboxGrid options={OPT.INTENT_DEVELOPMENT} value={sel.development}
                      onChange={(v) => setField("intent.selections.development", v)}
                      customLabel="Custom intent development approach" />
      </Field>
      <Field label="How will intent be consumed by automation?"
             tooltip="Q: In what format does the automation receive its instructions — a text file, serialized YAML/JSON, a spreadsheet, or an API call? This is how the desired state gets handed off from whoever creates it to the system that acts on it.">
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
      <Field label="How will you determine network state?"
             tooltip="Q: Before acting, how does the automation know what the network currently looks like? This data feeds the go/no-go decision. Select every method in use — most automations combine at least two.">
        <CheckboxGrid options={OPT.OBSERVABILITY_METHODS} value={sel.methods}
                      onChange={(v) => setField("observability.selections.methods", v)} />
      </Field>
      <Field label="Describe the basic go/no-go logic"
             tooltip="Q: What conditions must be true before the automation is allowed to proceed? Be specific — e.g. 'device must be reachable, running IOS-XE 17.x or later, and not already in maintenance mode'. This is the primary safety gate.">
        <TextArea value={sel.go_no_go_text} rows={4} maxLength={1000}
                  onChange={(v) => setField("observability.selections.go_no_go_text", v)} />
      </Field>
      <Field label="Additional logic applied to state before the automation can move forward?"
             tooltip="Q: Is there gating logic beyond basic reachability — compliance checks, threshold comparisons, approval gates, or correlation across multiple devices? If so, describe it in the text box that appears.">
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
      <Field label="What tools will support the observability layer?"
             tooltip="Q: What software will collect or evaluate the network state data — open-source scripts, a commercial NMS, a vendor platform, or custom code? If you use a specific tool not listed, add it via Custom.">
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
      <Field label="Will the solution utilize orchestration?"
             tooltip="Q: Does this automation need a coordinator to sequence steps across multiple systems or NAF components — or does a single script handle everything start to finish? Many simpler automations skip a dedicated orchestration layer entirely. If unsure, start with 'No' and revisit.">
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
        <Field label="Describe the orchestration approach"
               tooltip="Q: Which orchestration tool or pattern will you use, and how does it sequence the work? Describe what it coordinates — the order of NAF layer calls, error handling between steps, and any parallel vs. sequential branching.">
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
      <Field label="Collection methods (protocols/APIs)"
             tooltip="Q: How does the automation talk to network devices or systems to gather data? Select every protocol in use — most environments mix at least two (e.g. SNMP for legacy gear, gNMI for newer platforms).">
        <CheckboxGrid options={OPT.COLLECTOR_METHODS} value={sel.methods}
                      onChange={(v) => setField("collector.selections.methods", v)}
                      customLabel="Other protocol/API" />
      </Field>
      <Field label="Authentication"
             tooltip="Q: How does the collector authenticate to the devices or APIs it queries? This may differ per protocol — e.g. SNMPv3 credentials for polling, service-account tokens for REST APIs, SSH keys for CLI scraping.">
        <CheckboxGrid options={OPT.COLLECTOR_AUTH} value={sel.auth}
                      onChange={(v) => setField("collector.selections.auth", v)}
                      customLabel="Other authentication method(s)" />
      </Field>
      <Field label="Traffic handling"
             tooltip="Q: How does the collector cope with unreliable targets, high request rates, or backpressure — retries, rate-limiting, queue buffering, circuit breaking? Select the patterns your design will implement.">
        <CheckboxGrid options={OPT.COLLECTOR_HANDLING} value={sel.handling}
                      onChange={(v) => setField("collector.selections.handling", v)}
                      customLabel="Other traffic handling approach(es)" />
      </Field>
      <Field label="Normalization and schemas"
             tooltip="Q: What transformations happen to the raw collected data before it is used downstream — vendor-specific value mapping, timestamp normalization, topology enrichment, schema validation? Select all that apply.">
        <CheckboxGrid options={OPT.COLLECTOR_NORMALIZATION} value={sel.normalization}
                      onChange={(v) => setField("collector.selections.normalization", v)}
                      customLabel="Other normalization approach(es)" />
      </Field>
      <Field label="Scale — devices/scope"
             tooltip="Q: Roughly how many devices or endpoints will the collector target? An order-of-magnitude estimate (e.g. ~50 core routers vs. ~5,000 branch switches) surfaces design constraints early — polling 50 devices is architecturally different from polling 5,000.">
        <TextInput value={sel.devices} maxLength={100} placeholder="e.g. ~500 campus switches"
                   onChange={(v) => setField("collector.selections.devices", v)} />
      </Field>
      <Field label="Scale — metrics/data volume"
             tooltip="Q: What is the approximate data throughput — polling interval × device count, streaming events per second, log lines per minute? Even a rough number helps size the pipeline and identify whether the collector needs horizontal scaling.">
        <TextInput value={sel.metrics_per_sec} maxLength={100} placeholder="e.g. 2k metrics/sec"
                   onChange={(v) => setField("collector.selections.metrics_per_sec", v)} />
      </Field>
      <Field label="Collection cadence"
             tooltip="Q: How frequently does the collector run or poll — continuously (streaming), every 60 seconds, on-demand only? Cadence drives both the freshness of your observability data and the load placed on target devices.">
        <TextInput value={sel.cadence} maxLength={100} placeholder="e.g. every 5 minutes"
                   onChange={(v) => setField("collector.selections.cadence", v)} />
      </Field>
      <Field label="Collection tools"
             tooltip="Q: What software will implement the collector — an open-source library, a commercial product, a vendor SDK, or custom scripts? Select all that apply; add unlisted tools via Custom.">
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
      <Field label="How will your solution execute change?"
             tooltip="Q: What method or tool pushes configuration changes to the network? This is the 'hand on the keyboard' of the automation — choose the approach that matches your environment, existing toolchain, and risk tolerance. Select all that apply if you use different methods per device type.">
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
      <Field label="Author" required
             tooltip="Your name or your team's name. Identifies who created this design and appears on your entry in the community catalog.">
        <TextInput value={ini.author} maxLength={100}
                   onChange={(v) => setField("initiative.author", v)} />
      </Field>
      <Field label="Title" required
             tooltip="The name of this initiative. Displayed as the card heading in Community Design Solutions when this design is shared.">
        <TextInput value={ini.title} maxLength={200}
                   onChange={(v) => setField("initiative.title", v)} />
      </Field>
      <Field label="Abstract" required
             tooltip="Q: If someone had 30 seconds, what is this project? Write 2–3 sentences covering what gets automated, why it matters, and roughly how. This is the only text a visitor sees in the community catalog before clicking in — make it stand on its own. Unlike the Problem Statement (which describes the pain) or the Use Case (which describes the scenario), the Abstract is the elevator-pitch summary of both.">
        <TextArea value={ini.description} rows={3} maxLength={1000}
                  onChange={(v) => setField("initiative.description", v)} />
      </Field>
      <Field label="ITIL Category" required
             tooltip="The ITIL 4/5 practice this initiative falls under. Choose the practice that best describes the operational process being automated — this controls the color coding on the community catalog card.">
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
             hint={ini.itil_category ? undefined : "Select an ITIL Category first."}
             tooltip={ini.itil_category ? "The specific use-case category within the selected ITIL practice. Pick the closest match. Use Other if none fit." : undefined}>
        {ini.itil_category ? (
          <Select options={OPT.CATEGORY_TREE[ini.itil_category] ?? []} value={ini.category} allowOther
                  onChange={(v) => setField("initiative.category", v)} />
        ) : (
          <select disabled><option>— Select an ITIL Category first —</option></select>
        )}
      </Field>
      <Field label="Problem Statement" required
             tooltip="Q: What is broken, painful, or missing today and why does it matter? Describe the current situation without describing the solution. Focus on operational pain: what takes too long, fails too often, or relies on manual steps that introduce risk. This is distinct from the Use Case (what the automation does) — the Problem Statement is about why it needs to exist at all.">
        <TextArea value={ini.problem_statement} rows={4} maxLength={2000}
                  onChange={(v) => setField("initiative.problem_statement", v)} />
      </Field>
      <Field label="Use Case — how are you solving the problem?" required
             tooltip="Q: When this automation is working, who uses it and what does it do for them? Describe the scenario from the user or operator perspective — what triggers it, who benefits, and what outcome it delivers. This is distinct from the Problem Statement (the pain being solved) and the Workflow (the internal mechanics). Think of it as the happy-path story: 'A network engineer runs X, which automatically does Y, resulting in Z.'">
        <TextArea value={ini.use_case} rows={4} maxLength={2000}
                  onChange={(v) => setField("initiative.use_case", v)} />
      </Field>
      <Field label="Workflow Narrative" required
             tooltip="Q: Walk me through what happens inside the automation from trigger to completion. Think of this as the narrative before you break it down into workflow steps. Describe the internal mechanics: what systems are called, what data moves where, what decisions are made, and how it ends. This is more technical than the Use Case — it is the internal 'how', not the user-facing 'what'. For a structured numbered breakdown, switch to Detailed view and add Workflow Steps below.">
        <TextArea value={ini.workflow_description} rows={4} maxLength={4000}
                  onChange={(v) => setField("initiative.workflow_description", v)} />
      </Field>
      <Field label="Workflow steps (optional)"
             tooltip="Ordered steps rendered as a numbered list in the generated report. Each step has a short name and a description. Add as many rows as needed.">
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
      <Field label="Error conditions"
             tooltip="What can go wrong? Describe failure modes, edge cases, and states the automation must detect and handle gracefully — e.g. unreachable devices, API timeouts, unexpected configuration drift.">
        <TextArea value={ini.error_conditions} rows={3} maxLength={1000}
                  onChange={(v) => setField("initiative.error_conditions", v)} />
      </Field>
      <Field label="Assumptions"
             tooltip="What must be true for this automation to work? List dependencies on existing infrastructure, data quality, team processes, credentials, or external systems that are outside your control.">
        <TextArea value={ini.assumptions} rows={3} maxLength={1000}
                  onChange={(v) => setField("initiative.assumptions", v)} />
      </Field>
      <Field label="Deployment strategy"
             tooltip="How this solution will be rolled out to production. Choose the approach that best matches your risk tolerance and operational environment. See the Terms & Definitions page for descriptions of each strategy.">
        <Select options={OPT.DEPLOYMENT_STRATEGIES} value={ini.deployment_strategy} allowOther
                onChange={(v) => setField("initiative.deployment_strategy", v)} />
      </Field>
      <Field label="Deployment strategy description"
             tooltip="Describe your specific rollout plan — phases, pilot groups, rollback criteria, change-window constraints, or anything else that shapes how the chosen strategy will be executed.">
        <TextArea value={ini.deployment_strategy_description} rows={3} maxLength={1000}
                  onChange={(v) => setField("initiative.deployment_strategy_description", v)} />
      </Field>
      <Field label="Out of scope (optional)"
             tooltip="Explicitly state what this automation will NOT do. Clear scope boundaries prevent scope creep, set stakeholder expectations, and make the design document more useful for reviews and handoffs.">
        <TextArea value={ini.out_of_scope} rows={3} maxLength={1000}
                  onChange={(v) => setField("initiative.out_of_scope", v)} />
      </Field>
      <Field label="Risk of not doing the automation"
             tooltip="Select the standard business risks if this project does not move forward. These appear in the risk section of the generated report and help make the case for the initiative to stakeholders.">
        <CheckboxGrid options={OPT.STANDARD_RISK_REASONS} value={ini.no_move_forward_reasons}
                      onChange={(v) => setField("initiative.no_move_forward_reasons", v)} />
      </Field>
      <Field label="Additional risks in not moving forward"
             tooltip="Any project-specific risks not covered by the standard list above — business impact, compliance exposure, competitive disadvantage, or technical debt that grows if this is deferred.">
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
      <Field label="Who's filling out this wizard?" required
             tooltip="Q: What is your relationship to this project? Are you the network engineer who will build it, a manager sponsoring it, or a consultant scoping it? This sets context for readers of the generated design document.">
        <RadioWithOther name="who" options={OPT.MY_ROLE_WHO} value={my.who}
                        onChange={(v) => setField("my_role.who", v)} />
      </Field>
      <Field label="What best describes your technical skills?" required
             tooltip="Q: How would you rate your automation and programming experience? This helps assess whether the proposed design is a good fit for the team and whether outside help may be needed.">
        <RadioWithOther name="skills" options={OPT.MY_ROLE_SKILLS} value={my.skills}
                        onChange={(v) => setField("my_role.skills", v)} />
      </Field>
      <Field label="Who will actually develop the network automation?" required
             tooltip="Q: Will you build this yourself, with your internal team, or bring in external expertise? This drives staffing assumptions in the Timeline section and signals to reviewers what delivery model is planned.">
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
      <Field label="Other stakeholders"
             tooltip="Q: Are there individuals, teams, or groups affected by this automation who aren't covered by the categories above? Include anyone who needs to approve, will be impacted by, or should be kept informed of the work.">
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
             tooltip="Q: What external systems does this automation depend on, and how does it interact with them? Write a paragraph for each key dependency — what it provides, how the automation connects to it (API, webhook, file drop, etc.), and what breaks if it is unavailable. Markdown is supported so you can use headers or bullet points.">
        <TextArea value={narrative} rows={4} maxLength={4000}
                  onChange={(v) => setField("dependencies_narrative", v)} />
      </Field>
      <Field label="External systems this automation will interact with"
             tooltip="Q: Which standard systems will your automation touch or depend on? Check all that apply and fill in the details field to identify the specific product, instance, or version in your environment.">
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
      <Field label="Development approach" required
             tooltip="Q: Will you build this automation in-house, procure a commercial solution, or combine both? This is about where the software comes from, not who implements it — a vendor product installed by your own team is still 'Buy'.">
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
               tooltip="Count of direct employees (your team or another internal team) working on this project. Contractors billing through your org count here too if they are on your headcount.">
          <input type="number" min={0} step={1} value={tl.staff_count}
                 onChange={(e) => setField("timeline.staff_count", Math.max(0, Number(e.target.value) || 0))} />
        </Field>
        <Field label="Professional services staff"
               tooltip="Count of external/vendor professional services staff engaged on this project — consultants, SIs, or vendor PS teams billing separately from your org.">
          <input type="number" min={0} step={1} value={tl.external_staff_count}
                 onChange={(e) => setField("timeline.external_staff_count", Math.max(0, Number(e.target.value) || 0))} />
        </Field>
      </div>
      <Field label="Staffing plan (Markdown supported)" required
             tooltip="Q: Who is working on this project and in what capacity? Describe roles, responsibilities, and approximate time commitments. Markdown is supported — a simple bullet list or table works well. This appears in the generated design document under the staffing section.">
        <TextArea value={tl.staffing_plan_md} rows={4}
                  onChange={(v) => setField("timeline.staffing_plan_md", v)} />
      </Field>

      <DetailOnly><h3>Timeline & milestones</h3></DetailOnly>
      <div className="two-col">
        <Field label="Holiday calendar"
               tooltip="Select your region so public holidays are excluded from business-day calculations. This affects the computed start/end dates in the milestone table below.">
          <select value={tl.holiday_region || "None"}
                  onChange={(e) => setField("timeline.holiday_region", e.target.value)}>
            {OPT.HOLIDAY_REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </Field>
        <Field label="Project start date"
               tooltip="Q: When do you plan to begin active work? This date drives all computed milestone start/end dates in the table below. You can always update it — the milestone dates recalculate automatically.">
          <input type="date" value={startDate}
                 onChange={(e) => writeSchedule(e.target.value, items)} />
        </Field>
      </div>

      <Field label="Milestones"
             tooltip="Q: What are the major phases of this project and how long will each take? Enter names and durations in business days — start/end dates are computed automatically from the project start date. If two people work a phase in parallel, model it at roughly half the calendar days.">
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
