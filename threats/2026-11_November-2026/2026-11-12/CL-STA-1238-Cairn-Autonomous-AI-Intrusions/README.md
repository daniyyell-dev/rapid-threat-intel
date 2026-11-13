# CL-STA-1238: Autonomous AI Intrusions with the Cairn Framework Against Semiconductor, Defence and Civil Society

[Back to index](../../../../README.md) · [November 2026](../../README.md) · [2026-11-12](../README.md)

| Published | First added | Last updated | Category | Indicators | Block now |
|---|---|---|---|---|---|
| 2026-11-12 | 2026-11-12 18:20 | 2026-11-12 | Nation-state / AI-driven intrusion | 2 | 2 |

## Hunt

Run one of these before blocking to find past activity. Each file is the same hunt written for a different platform; pick the one for your SIEM or XDR.

| File | Platform | How to run it |
|---|---|---|
| [`hunt.kql`](hunt.kql) | Microsoft Defender XDR | In the [Defender portal](https://security.microsoft.com), open **Hunting > Advanced hunting**, paste the query and select **Run query**. It covers the last 30 days. |
| [`hunt.spl`](hunt.spl) | Splunk | In **Search & Reporting**, set the time picker to the last 30 days or more, paste the search and run it. It reads the CIM data models. |
| [`hunt_raw.spl`](hunt_raw.spl) | Splunk without CIM | The same hunt over raw events. Define the `rti_*` macros from [`splunk_macros.conf`](../../../../all/splunk_macros.conf) first. |
| [`hunt.yaral`](hunt.yaral) | Google SecOps | In **Detection > Rules & Detections > Rules Editor**, paste the rule, run a Retrohunt over the last 30 days, then turn on live mode. |

Leads that are not network or hash indicators are in [`iocs.csv`](iocs.csv), and behaviours with no clean field mapping are in the Behaviours section below. Guides: [Defender XDR](../../../../docs/defender-xdr.md), [Splunk](../../../../docs/splunk.md), [Google SecOps](../../../../docs/google-secops.md).

## Summary

Unit 42 reports that from August to September 2026 Chinese-speaking attackers, tracked as CL-STA-1238 and assessed with moderate confidence as China-nexus intelligence collection, ran a customised fork of the open-source Cairn penetration-testing framework with the Zhipu GLM and DeepSeek models to run 25 largely autonomous operations against at least 19 organisations. Targets were the semiconductor and advanced-manufacturing supply chain, defence and defence policy, and human-rights and civil-society groups. The operator gave each task a root domain and a one-line goal, sometimes with VPN gateway addresses, group names and shared passwords gathered beforehand, and the framework planned and ran reconnaissance, web and middleware exploitation, credential collection and persistence on its own for 20 minutes to more than 50 hours. Unit 42 confirmed access or data theft at 10 organisations through weak-password spraying, brute-forced production credentials, unauthenticated account-creation bypasses, insecure direct object references, mass-assignment privilege escalation, exposed cloud storage and old public CVEs, leading to new administrator accounts and a persistent API token in one production system, more than one million member records at another and an overwritten standards-ballot document. The Cairn hosting server and the staging and egress server are on the block list.

> [!WARNING]
> Single-source indicators (Unit 42); both are attacker-run VPS addresses and may be reassigned later, so review older hits in context. The intrusions used known weaknesses rather than malware, so the IPs are the only published network indicators.

## Affected countries and sectors

- **Countries:** United States (US), Canada (CA)
- **Regions:** North America
- **Sectors:** Semiconductors, Manufacturing, Defence, Government / policy, Civil society, Education
- **Note:** Unit 42 names a U.S. defence-policy programme, a U.S. teachers' union and a Canadian human-rights body among 19 targeted organisations, alongside semiconductor, manufacturing and standards organisations whose countries are not stated.
- **Source:** [Unit 42 – Attackers Use Autonomous AI to Target Semiconductor, Defense and Civil Society Sectors](https://unit42.paloaltonetworks.com/cairn-framework-ai-autonomous-attacks/)

## At a glance

| File | What it is |
|---|---|
| [`block_now.txt`](https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/threats/2026-11_November-2026/2026-11-12/CL-STA-1238-Cairn-Autonomous-AI-Intrusions/block_now.txt) (raw) | 2 high-confidence indicators to block now |
| [`iocs.csv`](iocs.csv) | All 2 indicators with description, confidence, action and source |
| [`defender_xdr_indicators.csv`](defender_xdr_indicators.csv) | 2 rows for Defender XDR bulk import |
| [`hunt.kql`](hunt.kql) | Defender XDR advanced hunting query |
| [`hunt.spl`](hunt.spl) | Splunk hunt over the CIM data models |
| [`hunt_raw.spl`](hunt_raw.spl) | Splunk hunt for data not mapped to CIM ([macros](../../../../all/splunk_macros.conf)) |
| [`hunt.yaral`](hunt.yaral) | Google SecOps YARA-L 2.0 detection rule |

Indicators by type: 2 IPv4. See `iocs.csv` for full details and descriptions.

## MITRE ATT&CK

| ID | Technique |
|---|---|
| [T1583.003](https://attack.mitre.org/techniques/T1583/003/) | Virtual Private Server |
| [T1595](https://attack.mitre.org/techniques/T1595/) | Active Scanning |
| [T1110.003](https://attack.mitre.org/techniques/T1110/003/) | Password Spraying |
| [T1110.001](https://attack.mitre.org/techniques/T1110/001/) | Password Guessing |
| [T1190](https://attack.mitre.org/techniques/T1190/) | Exploit Public-Facing Application |
| [T1078](https://attack.mitre.org/techniques/T1078/) | Valid Accounts |
| [T1136](https://attack.mitre.org/techniques/T1136/) | Create Account |
| [T1098](https://attack.mitre.org/techniques/T1098/) | Account Manipulation |
| [T1530](https://attack.mitre.org/techniques/T1530/) | Data from Cloud Storage |
| [T1565.001](https://attack.mitre.org/techniques/T1565/001/) | Stored Data Manipulation |

## Recommended actions

1. Block 154.44.31.4 and 82.29.129.54 and search 90 days of firewall, WAF, VPN and identity logs for them, especially from August 2026.
2. Review internet-facing applications for password spraying and brute force from a single source, and enforce MFA and lockout on partner-integration, CMS and VPN logins.
3. Look for new administrator accounts, new API tokens and self-registered accounts on internet-facing applications that nobody requested.
4. Close open self-registration and backend registration endpoints, fix insecure direct object references and mass-assignment flaws, and patch old public CVEs on exposed services.

## Sources

- [Unit 42 – Attackers Use Autonomous AI to Target Semiconductor, Defense and Civil Society Sectors](https://unit42.paloaltonetworks.com/cairn-framework-ai-autonomous-attacks/)
- [Help Net Security – Attackers breached 10 organizations with an open-source AI pentest framework](https://www.helpnetsecurity.com/2026/11/12/cairn-autonomous-ai-cyberattacks/)

---

[Back to index](../../../../README.md)
