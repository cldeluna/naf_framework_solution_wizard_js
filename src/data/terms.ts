/**
 * Terms & Definitions content — ported from use_case_categories.yml and
 * deployment_strategies.yml. Tool catalog comes from tools.json (converted
 * from tools.yml).
 */

export const CATEGORY_DEFINITIONS: Record<string, string> = {
  "Configuration Management ITIL4/5":
    "Automates tracking and maintenance of configuration items (CIs) like network devices, relationships, and changes via CMDB integrations and API-driven audits to support decision-making. Automating device configuration updates, backups, and version control to ensure consistency and reduce errors. (ITIL4/5)",
  "Troubleshooting - Problem Management ITIL4/5":
    "Automates investigation of recurring incidents using AI-driven root cause analysis, script-based workarounds, and proactive alerting to prevent future issues (ITIL4/5)",
  "Incident Management ITIL4/5":
    "Automates logging, prioritization, and resolution of service disruptions through ticketing workflows, AI triage, and tiered escalation bots in NOCs (ITIL4/5)",
  "Monitoring/Observability ITIL4/5":
    "Automates continuous infrastructure watching with event correlation engines, alert filtering, and scripted response actions for full visibility (ITIL4/5)",
  "Capacity Management ITIL4/5":
    "Automates demand forecasting, resource planning (e.g., bandwidth, compute), and SLA compliance via predictive analytics and auto-scaling models (ITIL4/5)",
  "Change Management ITIL4/5":
    "Automates evaluation, authorization, and implementation of changes (e.g., config updates) using CI/CD pipelines and risk assessment tools integrated with configuration records (ITIL4/5)",
  "Device Onboarding":
    "Streamlining the process of adding new devices to the network, including initial configuration, security setup, and compliance validation.",
  "Software Upgrades":
    "Automating the deployment of software and firmware updates across network devices for improved security and feature parity.",
  "State Verification and Compliance":
    "Continuously checking network device configurations and states against templates or policies to ensure compliance and detect discrepancies.",
  "Self-Service Tools":
    "Providing interfaces or portals for authorized users to request and provision network resources or changes without direct intervention from network teams.",
  "Network Inventory and Discovery":
    "Automating the identification and tracking of network devices, including hardware details, software versions, and support status.",
  "Monitoring and Troubleshooting":
    "Automating the collection of network performance data, generating alerts, and triggering diagnostic actions for issues.",
  "Policy and Security Management":
    "Automating the enforcement of network security policies, such as firewall rule changes, access control lists, and VLAN management.",
  "Orchestration and Workflow Automation":
    "Coordinating multi-step processes across different network domains or systems, such as provisioning services or managing SD-WAN branches.",
  "Cloud and Hybrid Network Integration":
    "Automating the deployment and management of network resources in cloud environments, including VPCs, load balancers, and hybrid connectivity.",
  "Intent-Based Automation":
    "Using high-level business or operational intents to drive automated network changes, with continuous validation and remediation.",
  "Application Connectivity":
    "Automating checks for connectivity between network infrastructure devices.",
  "Peer Validation": "Automating checks for ensuring proper peer relationships.",
  "End User Testing": "Automating tests for ensuring end user functionality.",
  "Text Summary":
    "Automating the generation of text summaries for network device configurations and states.",
  "Observability":
    "Automating the collection of network performance data, generating alerts, and triggering diagnostic actions for issues.",
  "Incident Response":
    "Automating the response to network incidents, including alerting, triaging, and remediating issues.",
  "Security Policy Management":
    "Automating the enforcement of network security policies, such as firewall rule changes, access control lists, and VLAN management.",
  "Other": "Other categories not listed above.",
};

export const DEPLOYMENT_DEFINITIONS: Record<string, string> = {
  Canary:
    "Deploys the new version to a small subset of users first, then gradually increases traffic if no problems are detected.",
  BlueGreen:
    "Maintains two identical environments; traffic is switched from the old (blue) to the new (green) version all at once.",
  Recreate:
    "Shuts down all old instances before starting new ones, resulting in downtime but ensuring a clean environment.",
  RollingUpdate:
    "Gradually replaces old instances with new ones, minimizing downtime and allowing rollback if issues occur.",
  "A/BTesting":
    "Runs two versions simultaneously, directing traffic based on rules to compare performance and user experience.",
  Shadow:
    "Routes a copy of production traffic to the new version for testing without affecting users.",
  Ramped:
    "Slowly increases the number of new instances over time, often used for gradual rollouts.",
  InfrastructureAsCode:
    "Uses code to provision and manage network infrastructure, ensuring consistency and reproducibility.",
  ImmutableInfrastructure:
    "Deploys new infrastructure for each change, never modifying existing resources in place.",
  FeatureToggle:
    "Enables or disables features at runtime without deploying new code, allowing controlled feature releases.",
  "Pilot Program":
    "Deploys the automation to a limited group or environment for testing and feedback before full rollout.",
};

export interface ToolEntry {
  name: string;
  url?: string;
  notes?: string;
  framework_functions?: string[];
  source?: string[];
}

export interface ToolsFile {
  framework_function_category: string[];
  tools: Record<string, ToolEntry[]>;
}
