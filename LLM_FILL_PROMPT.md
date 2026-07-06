# Prompt: Draft a NAF Design Solution Wizard JSON with an LLM

Give this prompt to an LLM (Claude, ChatGPT, etc.) along with your use case title. It returns a JSON file in the exact shape the wizard expects — save the output as a `.json` file and load it via **📂 Open → Load naf_report_*.json** on the Wizard page to pre-fill everything, then review/finish it by hand.

Replace `{{USE_CASE_TITLE}}` (and the optional one-paragraph description) before sending.

---

## The prompt (copy everything below)

````
You are helping me draft a solution design for the NAF (Network Automation
Forum) Design Solution Wizard. I'll give you a use case title (and optionally a short
description); your job is to produce a complete, valid JSON object in EXACTLY
the structure below, with every field populated with your best inference
about a realistic, plausible network automation solution for that use case.

USE CASE TITLE: {{USE_CASE_TITLE}}
ADDITIONAL CONTEXT (optional, delete if none): {{ONE PARAGRAPH DESCRIPTION}}

## Output rules

- Return ONLY the final JSON object — no markdown code fences, no commentary
  before or after.
- Keep the exact key names and nesting shown in the skeleton below. Don't add
  or remove keys.
- Every REQUIRED field (list below) must be non-empty in your output.
- For fields with a fixed option list, use values from that list verbatim
  wherever they fit; if nothing fits, write a short custom phrase instead —
  don't invent a variant of a listed option.
- For "selections" array fields (checkbox groups), pick every option from the
  matching list that plausibly applies — these are meant to be multi-select.
- Leave `timeline.items[].start`, `.end`, `total_business_days`, and
  `projected_completion` exactly as shown (blank/0/null) — the app computes
  these itself once the file is loaded and I touch the Timeline section.
- Keep free-text fields concise (2–5 sentences) and specific to the use case,
  not generic boilerplate.
- Leave `naf_report_md` as `null` — the app generates that itself.

## JSON skeleton to fill in

```json
{
  "initiative": {
    "author": "",
    "title": "",
    "description": "",
    "itil_category": "",
    "category": "",
    "problem_statement": "",
    "use_case": "",
    "expected_use": "",
    "workflow_description": "",
    "workflow_steps": [
      { "name": "", "description": "" }
    ],
    "error_conditions": "",
    "assumptions": "",
    "deployment_strategy": "",
    "deployment_strategy_description": "",
    "out_of_scope": "",
    "no_move_forward": "",
    "no_move_forward_reasons": []
  },
  "my_role": {
    "who": "",
    "skills": "",
    "developer": ""
  },
  "stakeholders": {
    "choices": {
      "Technical Stakeholders": [],
      "User and Customer Stakeholders": [],
      "Governance and Risk Stakeholders": [],
      "Business and Leadership Stakeholders": [],
      "External/Vendor/Partner Stakeholders": []
    },
    "other": ""
  },
  "presentation": {
    "selections": { "users": [], "interactions": [], "tools": [], "auth": [] }
  },
  "intent": {
    "selections": { "development": [], "provided": [] }
  },
  "observability": {
    "selections": {
      "methods": [],
      "go_no_go_text": "",
      "additional_logic_enabled": false,
      "additional_logic_text": "",
      "tools": []
    }
  },
  "orchestration": {
    "selections": { "choice": "", "details": "" }
  },
  "collector": {
    "selections": {
      "methods": [], "auth": [], "handling": [], "normalization": [],
      "devices": "", "metrics_per_sec": "", "cadence": "", "tools": []
    }
  },
  "executor": {
    "selections": { "methods": [] }
  },
  "dependencies": [
    { "name": "", "details": "" }
  ],
  "dependencies_narrative": "",
  "timeline": {
    "start_date": "",
    "total_business_days": 0,
    "projected_completion": null,
    "build_buy": "",
    "staff_count": 0,
    "external_staff_count": 0,
    "staffing_plan_md": "",
    "holiday_region": "None",
    "items": [
      { "name": "Planning", "duration_bd": 5, "start": "", "end": "", "notes": "" },
      { "name": "Design", "duration_bd": 10, "start": "", "end": "", "notes": "" },
      { "name": "Build", "duration_bd": 10, "start": "", "end": "", "notes": "" },
      { "name": "Test", "duration_bd": 5, "start": "", "end": "", "notes": "" },
      { "name": "Pilot", "duration_bd": 5, "start": "", "end": "", "notes": "" },
      { "name": "Production Rollout", "duration_bd": 10, "start": "", "end": "", "notes": "" }
    ]
  },
  "naf_report_md": null
}
```

## REQUIRED fields (must not be empty)

- `initiative.author`, `initiative.title`, `initiative.description`
- `initiative.itil_category`, `initiative.category`
- `initiative.problem_statement`, `initiative.use_case`, `initiative.workflow_description`
- `my_role.who`, `my_role.skills`, `my_role.developer`
- `timeline.build_buy`, `timeline.staffing_plan_md`
- `dependencies_narrative`

## Fixed option lists (use these values verbatim when they fit)

**initiative.itil_category** — exactly one of:
Service Configuration Management, Change Enablement, Incident Management,
Problem Management, Monitoring and Event Management, Capacity and Performance
Management, Information Security Management, Service Validation and Testing

**initiative.category** — a specific sub-category under whichever
`itil_category` you picked (e.g. under "Incident Management": Incident
Response, Monitoring and Troubleshooting, Alert Triage, Outage Detection,
Service Restoration, Escalation Support, Packet Capture and Log Collection,
Runbook Automation, Diagnostic Data Collection, Incident Reporting and
Documentation). If unsure of the full tree, pick the closest-sounding
category name yourself.

**initiative.deployment_strategy** — one of: Canary, BlueGreen, Recreate,
RollingUpdate, A/BTesting, Shadow, Ramped, InfrastructureAsCode,
ImmutableInfrastructure, FeatureToggle, Pilot Program

**initiative.no_move_forward_reasons** — pick from: "We are not improving the
way our customers interact with us for service provisioning", "We are not
improving the speed and quality of our service provisioning", "We are not
meeting feature or service demands from our customers", "We will continue to
pay for 3rd party support for this task", "This task will continue to be
executed individually in an inconsistent and ad-hoc manner with varying
degrees of success and documentation", "This task will continue to take far
longer than it should resulting in poor customer satisfaction", "We risk
continuing to add technical debt to the logical infrastructure"

**my_role.who** — one of: "I'm a network engineer.", "I'm a security
engineer.", "I'm a software developer.", "I manage technical projects or
teams." (or a short custom description)

**my_role.skills** — one of: "I have some scripting skills and basic software
development experience.", "I am an advanced software developer.", "I provide
techncial management on network and automation projects." (or custom)

**my_role.developer** — one of: "I'll do it myself.", "My in-house team and I
will build it.", "We will have outside experts build it, but I'll provide
technical oversight." (or custom)

**stakeholders.choices** — for each category key already in the skeleton,
choose from:
- Technical Stakeholders: Individual Network Engineer, Network Engineering
  team, Network Operations (NOC) team, Security engineering / operations,
  SRE / Platform engineering, Application / Dev teams (software engineering), None
- User and Customer Stakeholders: Internal users (ITSM / Service Desk),
  Internal users (application / dev teams consuming automation), External
  customers / tenants (if applicable), None
- Governance and Risk Stakeholders: Compliance / risk officer, Security
  officer / CISO staff, Enterprise risk management team, None
- Business and Leadership Stakeholders: Executive sponsor (CIO / CTO / VP of
  IT), Business owner / product owner, Project manager / program manager,
  Finance / procurement, Compliance / security / risk officer, None
- External/Vendor/Partner Stakeholders: Technology vendors (network,
  automation platform, cloud), Implementation / consulting partners,
  Regulatory bodies / auditors, None

**presentation.selections.users** — Network Engineers, IT, Operations, Help
Desk, Other IT Organizations, Any User, Authorized Users, Automation Pipeline

**presentation.selections.interactions** — CLI, Purpose-built Web GUI, Other
GUI, API, Commercial Product/GUI, Open Source Product/GUI

**presentation.selections.tools** — Python, Python Web Framework (Streamlit,
Flask, etc.), General Web Framework, Automation Framework, REST API, GraphQL
API, Custom API

**presentation.selections.auth** — "No Authentication (suitable only for
demos and very specific use cases)", "Repository authorization/sharing",
"Built-in (to the automation) Authentication via Username/Password or TOKEN",
"Custom Authentication to external system (AD, SSH Keys, OAUTH2)"

**intent.selections.development** — Templates, Policies, Service Profiles,
Model-driven (data models), Declarative (YAML/JSON), Forms/GUI

**intent.selections.provided** — Text file, Serialized format (JSON, YAML),
CSV, Excel, API

**observability.selections.methods** — Manual, Purpose-built Python Script,
API call

**observability.selections.tools** — Open Source Software,
Commercial/Enterprise Product, Network Vendor Product (Cisco Catalyst Center,
Arista CVP, etc.), Custom Python Scripts

**orchestration.selections.choice** — exactly one of: "No", "Yes – internal
via custom scripts and logic", "Yes – provide details" (fill `details` if you
pick either "Yes" option)

**collector.selections.methods** — SNMP, CLI/SSH, NETCONF, gNMI, REST API,
Webhooks, Syslog, Streaming Telemetry

**collector.selections.auth** — Username/Password, SSH Keys, OAuth2, API
Token, mTLS

**collector.selections.handling** — None, Rate limiting, Retries, Exponential
backoff, Buffering/Queue

**collector.selections.normalization** — None, Timestamping, Tagging/labels,
Topology enrichment, Schema mapping

**collector.selections.tools** — None, Open Source Software,
Commercial/Enterprise Product, In-house Software

**executor.selections.methods** — "Automating CLI interaction with Python
automation frameworks (Netmiko, Napalm, Nornir, PyATS)", "Using Open Source
Software (Ansible, Terraform, etc.)", "Using Custom Python scripts", "Using
Network Vendor Product (Cisco DNA Center, Arista CVP)", "Using a
Commercial/Enterprise Product"

**dependencies[].name** — pick from: Network Infrastructure, Network
Controllers, Revision Control system, ITSM/Change Management System,
Authentication System, IPAMS Systems, Inventory Systems, Design Data/Intent
Systems, Observability System, Vendor Tool/Management System (include
`details` describing the specific product/system for each one you add)

**timeline.build_buy** — one of: "Build In-House", "Build with Professional
Services or other external resources (Buy)", "Hybrid"

**timeline.holiday_region** — one of: None, United States, Canada, United
Kingdom, Germany, India, Australia
````

---

## How to use it

1. Copy the whole prompt block above (everything between the ` ``` ` fences).
2. Fill in your use case title (and, optionally, a short description).
3. Paste it to an LLM. It should reply with just the JSON.
4. Save the reply as a `.json` file (e.g. `my_solution.json`).
5. In the Wizard page, use **📂 Open → Load naf_report_*.json** to import it.
6. Open the **Staffing & Timeline** piece and adjust the start date (or edit any milestone row) once — this triggers the app's own business-day scheduling and fills in the Gantt dates.
7. Review every section for accuracy before saving to the catalog — treat the LLM's draft as a starting point, not a final answer.
