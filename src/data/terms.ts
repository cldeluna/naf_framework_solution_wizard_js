/**
 * Terms & Definitions content — ported from use_case_categories.yml and
 * deployment_strategies.yml. Tool catalog comes from tools.json (converted
 * from tools.yml).
 */

/**
 * Definitions for the ITIL practice parents of the two-level category tree
 * (CATEGORY_TREE in options.ts). Adapted from the original ITIL4/5 category
 * definitions; the last two practices are new (2026-07-05).
 */
export const PRACTICE_DEFINITIONS: Record<string, string> = {
  "Service Configuration Management":
    "Automates tracking and maintenance of configuration items (CIs) like network devices, relationships, and changes via CMDB integrations and API-driven audits to support decision-making. Covers device configuration updates, backups, and version control to ensure consistency and reduce errors.",
  "Change Enablement":
    "Automates evaluation, authorization, and implementation of changes (e.g., config updates) using CI/CD pipelines and risk assessment tools integrated with configuration records.",
  "Incident Management":
    "Automates logging, prioritization, and resolution of service disruptions through ticketing workflows, AI triage, and tiered escalation bots in NOCs.",
  "Problem Management":
    "Automates investigation of recurring incidents using AI-driven root cause analysis, script-based workarounds, and proactive alerting to prevent future issues.",
  "Monitoring and Event Management":
    "Automates continuous infrastructure watching with event correlation engines, alert filtering, and scripted response actions for full visibility.",
  "Capacity and Performance Management":
    "Automates demand forecasting, resource planning (e.g., bandwidth, compute), and SLA compliance via predictive analytics and auto-scaling models.",
  "Information Security Management":
    "Automates the enforcement and verification of network security controls — security policies, access control, segmentation, firewall rules, and secure-configuration compliance.",
  "Service Validation and Testing":
    "Automates validation that network services and changes behave as designed — lab and digital-twin testing, pre/post-change verification, regression suites, and failure-scenario exercises.",
};

/**
 * Concrete one-line examples per subcategory (2026-07-05, drafted for the
 * Terms page tables — curate freely). Keyed by leaf category name.
 */
export const CATEGORY_EXAMPLES: Record<string, string> = {
  // Service Configuration Management
  "Network Inventory and Discovery": "Nightly discovery run reconciling switches/routers into NetBox.",
  "Device and Interface Inventory": "Scheduled collection of model, serial, software, and interface details into a queryable inventory.",
  "Topology and Dependency Mapping": "CDP/LLDP crawl rendering an always-current topology diagram.",
  "Configuration Backup and Versioning": "Nightly config pulls committed to Git with change diffs.",
  "Configuration Drift Detection": "Comparing running configs to golden templates and flagging deviations.",
  "State Verification and Compliance": "Verifying NTP/SNMP/AAA stanzas match policy on every device.",
  "Source of Truth Integration": "Syncing NetBox/InfraHub intended state against observed reality.",
  "Intent-Based Automation": "Declaring desired VLANs and letting automation converge the devices.",
  "Network State Summary": "Generating a plain-language summary of BGP and interface health.",
  "Configuration Explanation": "AI-assisted explanation of a complex ACL for change reviewers.",
  "Inventory and Configuration Reporting": "Weekly report of software versions vs. approved baselines.",
  "Configuration Summary and Documentation": "Auto-generated per-site configuration documentation.",
  // Change Enablement
  "Software Upgrades": "Staged NOS upgrades with automated pre/post checks.",
  "Device Onboarding": "ZTP plus templated base config for new branch switches.",
  "Configuration Changes": "Pushing standardized VLAN or ACL changes across a fleet.",
  "Configuration Generation": "Rendering device configs from templates + source of truth.",
  "Pre-Change Impact Analysis": "Checking route and traffic impact before an ACL change.",
  "Change Risk Assessment": "Scoring changes by blast radius to set the approval level.",
  "Maintenance Window Planning": "Scheduling changes into approved windows with conflict checks.",
  "Orchestration and Workflow Automation": "Multi-step service provisioning across firewall, LB, and switch.",
  "Change Validation and Rollback": "Automated post-change tests with one-click rollback on failure.",
  "Self-Service Tools": "Portal for app teams to request firewall openings.",
  "Cloud and Hybrid Network Integration": "Provisioning VPCs/VNets and hybrid connectivity as code.",
  "Pre-Change Data Collection": "Snapshotting routes, ARP, and interfaces before a change.",
  "Post-Change Validation": "Re-running the snapshot and diffing to confirm intended state.",
  // Incident Management
  "Incident Response": "Auto-triage that enriches alerts with device context and opens tickets.",
  "Monitoring and Troubleshooting": "On-demand diagnostics bundle for a reported issue.",
  "Alert Triage": "Deduplicating and correlating alarms to a probable root device.",
  "Outage Detection": "Synthetic probes detecting a site outage before users call.",
  "Service Restoration": "Automated failover or interface-recovery runbooks.",
  "Escalation Support": "Attaching diagnostics to the ticket before paging tier 2.",
  "Packet Capture and Log Collection": "Triggered pcap + syslog bundle around an event window.",
  "Runbook Automation": "Codified first-response steps for common incident types.",
  "Diagnostic Data Collection": "Collecting show-tech output from affected devices automatically.",
  "Incident Reporting and Documentation": "Timeline and evidence automatically appended to the ticket.",
  // Problem Management
  "Root Cause Analysis": "Correlating change history with fault onset to isolate the cause.",
  "Application Connectivity": "Scheduled end-to-end path tests between application tiers.",
  "Peer Validation": "Verifying BGP/OSPF adjacencies match the design.",
  "End User Testing": "Simulating user login and application flows from branch sites.",
  "Recurring Issue Detection": "Spotting interfaces that flap repeatedly across weeks.",
  "Known Error Documentation": "Auto-cataloging confirmed workarounds for reuse.",
  "Post-Incident Review": "Generating review packets with metrics and timelines.",
  "Baseline Comparison": "Comparing current state against the last known-good baseline.",
  // Monitoring and Event Management
  "Observability": "Streaming telemetry into dashboards with per-service health scoring.",
  "Telemetry Collection": "gNMI subscriptions for interface counters and state.",
  "Show Command Collection": "Scheduled CLI polling where APIs don't exist.",
  "Event Correlation": "Collapsing 200 downstream alarms into one upstream cause.",
  "Alerting and Notification": "Routing enriched alerts to the right team channel.",
  "Synthetic Testing": "Continuous DNS/HTTP probes from user vantage points.",
  "Network Health Dashboards": "Per-site scorecards built from telemetry.",
  "Log and Metric Analysis": "Mining syslog for pre-failure signatures.",
  "Anomaly Detection": "Flagging traffic that deviates from learned baselines.",
  // Capacity and Performance Management
  "Bandwidth Utilization": "95th-percentile trending per uplink.",
  "Interface Error Analysis": "Surfacing links with rising CRC error counts.",
  "Wireless Capacity Planning": "AP client-density heatmaps to plan additions.",
  "WAN Performance Analysis": "Loss/latency SLAs tracked per circuit and carrier.",
  "Latency and Packet Loss Analysis": "Hop-by-hop path measurements to isolate degradation.",
  "Throughput Testing": "Scheduled iperf runs between sites during off-hours.",
  "Growth Forecasting": "Projecting when uplinks hit 80% based on trend.",
  "Capacity Reporting": "Monthly capacity posture report for leadership.",
  // Information Security Management
  "Security Policy Management": "Pushing standardized ACL updates fleet-wide.",
  "Policy and Security Management": "Automated firewall rule lifecycle with approvals.",
  "Access Control Validation": "Verifying only approved ACLs exist on edge devices.",
  "Segmentation Compliance": "Testing that VRFs/VLANs cannot reach restricted zones.",
  "Firewall Rule Review": "Flagging shadowed, unused, or overly-broad rules.",
  "NAC and Device Profiling": "Validating 802.1X posture and spotting unexpected endpoints.",
  "Vulnerability Exposure Review": "Matching OS versions against vendor PSIRT advisories.",
  "Certificate and Crypto Validation": "Expiring-certificate and weak-cipher scans.",
  "Secure Configuration Compliance": "CIS-style hardening checks on every device.",
  // Service Validation and Testing
  "Network Lab and Digital Twin/Cousin Testing": "Validating changes in a lab or model of the network (e.g., Batfish, netlab, CML) before touching production.",
  "Digital Twin Testing": "Validating changes against a Batfish/netlab model first.",
  "Lab Validation": "Replaying production configs in a CML/EVE-NG lab.",
  "Pre-Change Testing": "Dry-run plus syntax and policy checks before pushing.",
  "Post-Change Testing": "Automated verification suite right after deployment.",
  "Automated Test Suites": "pyATS/Robot suites run on schedule and on change.",
  "Regression Testing": "Re-running the full suite after tooling upgrades.",
  "Failure Scenario Testing": "Simulating link or device loss to confirm failover.",
  "Design Validation": "Asserting the built network matches design rules.",
};

/** Leaf-category definitions (legacy set; tree leaves without an entry here
 * are listed on the Terms page without a definition until curated). */
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
