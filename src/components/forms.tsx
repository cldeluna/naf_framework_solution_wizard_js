/**
 * Section forms — one component per puzzle piece. Field inventories and
 * intro text ported from the Streamlit dialogs (SPEC §2.3). All inputs write
 * straight to the store (autosaved); selections land in the same
 * payload.selections shape the Python models define.
 */
import { useWizard } from "../state/store";
import * as OPT from "../data/options";
import { Field, TextInput, TextArea, CheckboxGrid, RadioWithOther, Select } from "./fields";
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
      <Field label="Automation initiative title" required>
        <TextInput value={ini.title} maxLength={200}
                   onChange={(v) => setField("initiative.title", v)} />
      </Field>
      <Field label="Short description / scope" required>
        <TextArea value={ini.description} rows={3} maxLength={1000}
                  onChange={(v) => setField("initiative.description", v)} />
      </Field>
      <Field label="Category" required>
        <Select options={OPT.USE_CASE_CATEGORIES} value={ini.category} allowOther
                onChange={(v) => setField("initiative.category", v)} />
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
             hint="Describe the workflow narrative; structured step rows come in a later iteration.">
        <TextArea value={ini.workflow_description} rows={4} maxLength={4000}
                  onChange={(v) => setField("initiative.workflow_description", v)} />
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

      <h3>Stakeholders</h3>
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

// ── Placeholder for not-yet-built frame pieces ──────────────────
function ComingSoon({ what }: { what: string }) {
  return (
    <p className="intro">
      The {what} form arrives in the next iteration. Your other entries are
      autosaved and unaffected.
    </p>
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
  dependencies: () => <ComingSoon what="Dependencies & External Interfaces" />,
  staffing_timeline: () => <ComingSoon what="Staffing, Timeline & Milestones" />,
};
