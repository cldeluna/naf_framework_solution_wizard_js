/**
 * Curated option catalogs — extracted verbatim from the Streamlit section
 * dialogs (pages/20_NAF_Solution_Wizard.py) and the reference YAML/JSON files
 * in the original repo. Keep option strings EXACTLY as in the original so
 * exports remain comparable and legacy JSON round-trips.
 */

// ── Presentation ────────────────────────────────────────────────
export const PRESENTATION_USERS = [
  "Network Engineers", "IT", "Operations", "Help Desk",
  "Other IT Organizations", "Any User", "Authorized Users", "Automation Pipeline",
];
export const PRESENTATION_INTERACTIONS = [
  "CLI", "Purpose-built Web GUI", "Other GUI",
  "API", "Commercial Product/GUI", "Open Source Product/GUI",
];
export const PRESENTATION_TOOLS = [
  "Python", "Python Web Framework (Streamlit, Flask, etc.)",
  "General Web Framework", "Automation Framework",
  "REST API", "GraphQL API", "Custom API",
];
export const PRESENTATION_AUTH = [
  "No Authentication (suitable only for demos and very specific use cases)",
  "Repository authorization/sharing",
  "Built-in (to the automation) Authentication via Username/Password or TOKEN",
  "Custom Authentication to external system (AD, SSH Keys, OAUTH2)",
];

// ── Intent ──────────────────────────────────────────────────────
export const INTENT_DEVELOPMENT = [
  "Templates", "Policies", "Service Profiles",
  "Model-driven (data models)", "Declarative (YAML/JSON)", "Forms/GUI",
];
export const INTENT_PROVIDED = [
  "Text file", "Serialized format (JSON, YAML)", "CSV", "Excel", "API",
];

// ── Observability ───────────────────────────────────────────────
export const OBSERVABILITY_METHODS = ["Manual", "Purpose-built Python Script", "API call"];
export const OBSERVABILITY_TOOLS = [
  "Open Source Software",
  "Commercial/Enterprise Product",
  "Network Vendor Product (Cisco Catalyst Center, Arista CVP, etc.)",
  "Custom Python Scripts",
];

// ── Orchestration ───────────────────────────────────────────────
export const ORCHESTRATION_CHOICES = [
  "No",
  "Yes – internal via custom scripts and logic",
  "Yes – provide details",
];

// ── Collector ───────────────────────────────────────────────────
export const COLLECTOR_METHODS = [
  "SNMP", "CLI/SSH", "NETCONF", "gNMI",
  "REST API", "Webhooks", "Syslog", "Streaming Telemetry",
];
export const COLLECTOR_AUTH = ["Username/Password", "SSH Keys", "OAuth2", "API Token", "mTLS"];
export const COLLECTOR_HANDLING = ["None", "Rate limiting", "Retries", "Exponential backoff", "Buffering/Queue"];
export const COLLECTOR_NORMALIZATION = ["None", "Timestamping", "Tagging/labels", "Topology enrichment", "Schema mapping"];
export const COLLECTOR_TOOLS = ["None", "Open Source Software", "Commercial/Enterprise Product", "In-house Software"];

// ── Executor ────────────────────────────────────────────────────
export const EXECUTOR_METHODS = [
  "Automating CLI interaction with Python automation frameworks (Netmiko, Napalm, Nornir, PyATS)",
  "Using Open Source Software (Ansible, Terraform, etc.)",
  "Using Custom Python scripts",
  "Using Network Vendor Product (Cisco DNA Center, Arista CVP)",
  "Using a Commercial/Enterprise Product",
];

// ── My Role (Stakeholders piece) ────────────────────────────────
export const MY_ROLE_WHO = [
  "I'm a network engineer.",
  "I'm a security engineer.",
  "I'm a software developer.",
  "I manage technical projects or teams.",
];
export const MY_ROLE_SKILLS = [
  "I have some scripting skills and basic software development experience.",
  "I am an advanced software developer.",
  "I provide techncial management on network and automation projects.",
];
export const MY_ROLE_DEV = [
  "I'll do it myself.",
  "My in-house team and I will build it.",
  "We will have outside experts build it, but I'll provide technical oversight.",
];

// ── Stakeholder catalog (stakeholders.json) ─────────────────────
export const STAKEHOLDER_CATALOG: Record<string, string[]> = {
  "Technical Stakeholders": [
    "Individual Network Engineer", "Network Engineering team",
    "Network Operations (NOC) team", "Security engineering / operations",
    "SRE / Platform engineering", "Application / Dev teams (software engineering)", "None",
  ],
  "User and Customer Stakeholders": [
    "Internal users (ITSM / Service Desk)",
    "Internal users (application / dev teams consuming automation)",
    "External customers / tenants (if applicable)", "None",
  ],
  "Governance and Risk Stakeholders": [
    "Compliance / risk officer", "Security officer / CISO staff",
    "Enterprise risk management team", "None",
  ],
  "Business and Leadership Stakeholders": [
    "Executive sponsor (CIO / CTO / VP of IT)", "Business owner / product owner",
    "Project manager / program manager", "Finance / procurement",
    "Compliance / security / risk officer", "None",
  ],
  "External/Vendor/Partner Stakeholders": [
    "Technology vendors (network, automation platform, cloud)",
    "Implementation / consulting partners", "Regulatory bodies / auditors", "None",
  ],
};

// ── Use-case categories (use_case_categories.yml keys) ──────────
export const USE_CASE_CATEGORIES = [
  "Configuration Management ITIL4/5",
  "Troubleshooting - Problem Management ITIL4/5",
  "Incident Management ITIL4/5",
  "Monitoring/Observability ITIL4/5",
  "Capacity Management ITIL4/5",
  "Change Management ITIL4/5",
  "Device Onboarding",
  "Software Upgrades",
  "State Verification and Compliance",
  "Self-Service Tools",
  "Network Inventory and Discovery",
  "Monitoring and Troubleshooting",
  "Policy and Security Management",
  "Orchestration and Workflow Automation",
  "Cloud and Hybrid Network Integration",
  "Intent-Based Automation",
  "Application Connectivity",
  "Peer Validation",
  "End User Testing",
  "Text Summary",
  "Observability",
  "Incident Response",
  "Security Policy Management",
];

// ── Deployment strategies (deployment_strategies.yml keys) ──────
export const DEPLOYMENT_STRATEGIES = [
  "Canary", "BlueGreen", "Recreate", "RollingUpdate", "A/BTesting",
  "Shadow", "Ramped", "InfrastructureAsCode", "ImmutableInfrastructure",
  "FeatureToggle", "Pilot Program",
];

// ── Risk-of-not-moving-forward standard reasons ─────────────────
export const STANDARD_RISK_REASONS = [
  "We are not improving the way our customers interact with us for service provisioning",
  "We are not improving the speed and quality of our service provisioning",
  "We are not meeting feature or service demands from our customers",
  "We will continue to pay for 3rd party support for this task",
  "This task will continue to be executed individually in an inconsistent and ad-hoc manner with varying degrees of success and documentation",
  "This task will continue to take far longer than it should resulting in poor customer satisfaction",
  "We risk continuing to add technical debt to the logical infrastructure",
];

/** Default title placeholder — used by the completion predicate. */
export const DEFAULT_TITLE = "My new network automation project";

/** Default milestone template names (Staffing & Timeline completion check). */
export const DEFAULT_MILESTONE_NAMES = new Set([
  "Planning", "Design", "Development & Testing",
  "Build", "Test", "Pilot", "Production Rollout",
]);
