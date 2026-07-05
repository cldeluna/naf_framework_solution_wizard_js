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

// ── Two-level categories (2026-07-05) ───────────────────────────
// Level 1: ITIL 4/5 practice (required). Level 2: common category beneath it
// (required; Other + free text supported). CATEGORY_TREE is the curated
// mapping — DRAFT grouping, adjust as community feedback arrives.
export type CategoryMetadata = {
  framework?: "ITIL";
  frameworkVersion?: "ITIL 4" | "ITIL 5" | "ITIL 4 / ITIL 5 aligned";
  practiceType?: "Service Management" | "General Management" | "Technical Management";
};

export const CATEGORY_TREE: Record<string, string[]> = {
  "Service Configuration Management": [
    "Network Inventory and Discovery",
    "Device and Interface Inventory",
    "Topology and Dependency Mapping",
    "Configuration Backup and Versioning",
    "Configuration Drift Detection",
    "State Verification and Compliance",
    "Source of Truth Integration",
    "Intent-Based Automation",
    "Network State Summary",
    "Configuration Explanation",
    "Inventory and Configuration Reporting",
    "Configuration Summary and Documentation",
  ],

  "Change Enablement": [
    "Software Upgrades",
    "Device Onboarding",
    "Configuration Changes",
    "Configuration Generation",
    "Pre-Change Impact Analysis",
    "Change Risk Assessment",
    "Maintenance Window Planning",
    "Orchestration and Workflow Automation",
    "Change Validation and Rollback",
    "Self-Service Tools",
    "Cloud and Hybrid Network Integration",
    "Pre-Change Data Collection",
    "Post-Change Validation"
  ],

  "Incident Management": [
    "Incident Response",
    "Monitoring and Troubleshooting",
    "Alert Triage",
    "Outage Detection",
    "Service Restoration",
    "Escalation Support",
    "Packet Capture and Log Collection",
    "Runbook Automation",
    "Diagnostic Data Collection",
    "Incident Reporting and Documentation",
  ],

  "Problem Management": [
    "Root Cause Analysis",
    "Application Connectivity",
    "Peer Validation",
    "End User Testing",
    "Recurring Issue Detection",
    "Known Error Documentation",
    "Post-Incident Review",
    "Baseline Comparison",
  ],

  "Monitoring and Event Management": [
    "Observability",
    "Telemetry Collection",
    "Show Command Collection",
    "Event Correlation",
    "Alerting and Notification",
    "Synthetic Testing",
    "Network Health Dashboards",
    "Log and Metric Analysis",
    "Anomaly Detection",
  ],

  "Capacity and Performance Management": [
    "Bandwidth Utilization",
    "Interface Error Analysis",
    "Wireless Capacity Planning",
    "WAN Performance Analysis",
    "Latency and Packet Loss Analysis",
    "Throughput Testing",
    "Growth Forecasting",
    "Capacity Reporting",
  ],

  "Information Security Management": [
    "Security Policy Management",
    "Policy and Security Management",
    "Access Control Validation",
    "Segmentation Compliance",
    "Firewall Rule Review",
    "NAC and Device Profiling",
    "Vulnerability Exposure Review",
    "Certificate and Crypto Validation",
    "Secure Configuration Compliance",
  ],

  "Service Validation and Testing": [
  "Digital Twin Testing",
  "Lab Validation",
  "Pre-Change Testing",
  "Post-Change Testing",
  "Automated Test Suites",
  "Regression Testing",
  "Failure Scenario Testing",
  "Design Validation",
],
};

export const CATEGORY_METADATA: Record<keyof typeof CATEGORY_TREE, CategoryMetadata> = {
  "Service Configuration Management": {
    framework: "ITIL",
    frameworkVersion: "ITIL 4 / ITIL 5 aligned",
    practiceType: "Service Management",
  },
  "Change Enablement": {
    framework: "ITIL",
    frameworkVersion: "ITIL 4 / ITIL 5 aligned",
    practiceType: "Service Management",
  },
  "Incident Management": {
    framework: "ITIL",
    frameworkVersion: "ITIL 4 / ITIL 5 aligned",
    practiceType: "Service Management",
  },
  "Problem Management": {
    framework: "ITIL",
    frameworkVersion: "ITIL 4 / ITIL 5 aligned",
    practiceType: "Service Management",
  },
  "Monitoring and Event Management": {
    framework: "ITIL",
    frameworkVersion: "ITIL 4 / ITIL 5 aligned",
    practiceType: "Service Management",
  },
  "Capacity and Performance Management": {
    framework: "ITIL",
    frameworkVersion: "ITIL 4 / ITIL 5 aligned",
    practiceType: "Service Management",
  },
  "Information Security Management": {
    framework: "ITIL",
    frameworkVersion: "ITIL 4 / ITIL 5 aligned",
    practiceType: "Service Management",
  },
};

export const ITIL_CATEGORIES = Object.keys(CATEGORY_TREE);

/**
 * Legacy ITIL parent names (pre-2026-07-05 exports) -> current practice names.
 * When a legacy export stored one of these in `category`, it is promoted to
 * itil_category (and the common category left for the user to pick).
 */
export const LEGACY_ITIL_ALIASES: Record<string, string> = {
  "Configuration Management ITIL4/5": "Service Configuration Management",
  "Change Management ITIL4/5": "Change Enablement",
  "Incident Management ITIL4/5": "Incident Management",
  "Troubleshooting - Problem Management ITIL4/5": "Problem Management",
  "Monitoring/Observability ITIL4/5": "Monitoring and Event Management",
  "Capacity Management ITIL4/5": "Capacity and Performance Management",
  "Information Security Management ITIL4/5": "Information Security Management",
};

/** Legacy leaf categories that no longer exist in the tree -> their parent. */
export const LEGACY_LEAF_PARENT: Record<string, string> = {
  "Text Summary": "Service Configuration Management",
  "Configuration Management": "Service Configuration Management",
};

/** Reverse lookup: common category -> its ITIL parent (legacy derivation). */
export function itilParentOf(category: string): string {
  for (const [itil, cats] of Object.entries(CATEGORY_TREE)) {
    if (cats.includes(category)) return itil;
  }
  if (LEGACY_LEAF_PARENT[category]) return LEGACY_LEAF_PARENT[category];
  // legacy exports sometimes stored the ITIL value itself in `category`
  if (ITIL_CATEGORIES.includes(category)) return category;
  if (LEGACY_ITIL_ALIASES[category]) return LEGACY_ITIL_ALIASES[category];
  return "";
}

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

// ── Dependencies & external interfaces checklist ────────────────
export interface DepDef { label: string; details: boolean; help?: string; defaultDetails?: string }
export const DEPENDENCY_DEFS: DepDef[] = [
  { label: "Network Infrastructure", details: false,
    help: "The automation will act on some or all of the organization's network infrastructure (switches, appliances, routers, etc.)." },
  { label: "Network Controllers", details: true },
  { label: "Revision Control system", details: true, defaultDetails: "GitHub",
    help: "e.g. GitHub, GitLab, Bitbucket" },
  { label: "ITSM/Change Management System", details: true },
  { label: "Authentication System", details: true },
  { label: "IPAMS Systems", details: true },
  { label: "Inventory Systems", details: true,
    help: "Source of truth/CMDB/inventory (e.g., NetBox, InfraHub, ServiceNow CMDB). What data do you read/write?" },
  { label: "Design Data/Intent Systems", details: true,
    help: "Systems holding golden intent or design models (InfraHub, Custom DB)." },
  { label: "Observability System", details: true,
    help: "Telemetry/monitoring/logs/traces (e.g., SuzieQ, Prometheus)." },
  { label: "Vendor Tool/Management System", details: true,
    help: "(e.g., Cisco DNAC, Wireless Controllers, Miraki, Arista CVP, Aruba Central, Juniper Apstra)." },
];

// ── Staffing & timeline ─────────────────────────────────────────
export const BUILD_BUY_OPTIONS = [
  "Build In-House",
  "Build with Professional Services or other external resources (Buy)",
  "Hybrid",
];
export const HOLIDAY_REGIONS = [
  "None", "United States", "Canada", "United Kingdom", "Germany", "India", "Australia",
];
export const DEFAULT_MILESTONES = [
  { name: "Planning", duration_bd: 5 },
  { name: "Design", duration_bd: 10 },
  { name: "Build", duration_bd: 10 },
  { name: "Test", duration_bd: 5 },
  { name: "Pilot", duration_bd: 5 },
  { name: "Production Rollout", duration_bd: 10 },
];

/** Default title placeholder — used by the completion predicate. */
export const DEFAULT_TITLE = "My new network automation project";

/** Default milestone template names (Staffing & Timeline completion check). */
export const DEFAULT_MILESTONE_NAMES = new Set([
  "Planning", "Design", "Development & Testing",
  "Build", "Test", "Pilot", "Production Rollout",
]);
