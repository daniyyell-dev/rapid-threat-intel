# ARTEX Intrusions: South Korean Finance Operator and Storm-0940 ConnectWise Cloud Backup Access

[Live entry](https://iocwatch.com/t/ARTEX-South-Korean-Finance-and-Storm-0940-ConnectWise-Infrastructure/) · [Back to index](../../../../README.md) · [November 2026](../../README.md) · [2026-11-13](../README.md)

| Published | First added | Last updated | Category | Indicators | Block now |
|---|---|---|---|---|---|
| 2026-11-13 | 2026-11-13 21:40 | 2026-11-13 | Financially motivated and state-aligned intrusion / financial sector | 17 | 4 |

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

An FBI FLASH issued on 13 November 2026 warns that several actors are using ARTEX, an open-source LLM-driven penetration testing framework, against financial services, government, defence, energy, healthcare and other sectors, with some intrusions reaching privileged access in under three hours. It publishes infrastructure from two campaigns that were not yet in this feed. CrowdStrike reported on 7 October that a likely Chinese-speaking, financially motivated operator ran ARTEX from an actor-controlled server with an open directory (38.244.50.120) against South Korean financial organisations from late September to early October, stealing personal data; the FBI puts it at about 67,000 people. The operator reached DeepSeek through the LLM API reseller xcai.pro and worked through nine proxy addresses. Microsoft reported on 21 October that Storm-0940, a China-state-aligned actor, used ARTEX with stolen ConnectWise Cloud Backup application credentials to attempt more than 2,250 Microsoft 365 tenants, then ran Graph reconnaissance and changed application credentials and privileges. The actor server and the three Storm-0940 sign-in addresses are on the block list; the proxies, the VPN addresses and the reseller domain are alert only. The FBI FLASH also repeats the Storm-3358 ARTEX infrastructure already in this feed.

> [!WARNING]
> The FBI says these addresses are historically observed infrastructure that may be reassigned. The proxy addresses, the three Storm-0940 VPN addresses (15-16 October only) and xcai.pro are alert only and must not be blocked.

## Affected countries and sectors

- **Countries:** South Korea (KR)
- **Regions:** Asia
- **Sectors:** Financial services, Government, Technology, Defence, Energy, Healthcare, Manufacturing, Telecommunications, Legal
- **Note:** CrowdStrike and the FBI name South Korean financial organisations; the FBI and Microsoft list the other sectors targeted with ARTEX worldwide, including more than 2,250 Microsoft 365 tenants reached through ConnectWise Cloud Backup.
- **Source:** [FBI FLASH-20261113-001 – Threat Overview of ARTEX Autonomous Penetration Testing Framework](https://www.ic3.gov/CSA/2026/261113.pdf)

## At a glance

| File | What it is |
|---|---|
| [`block_now.txt`](https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/threats/2026-11_November-2026/2026-11-13/ARTEX-South-Korean-Finance-and-Storm-0940-ConnectWise-Infrastructure/block_now.txt) (raw) | 4 high-confidence indicators to block now |
| [`iocs.csv`](iocs.csv) | All 17 indicators with description, confidence, action and source |
| [`defender_xdr_indicators.csv`](defender_xdr_indicators.csv) | 17 rows for Defender XDR bulk import |
| [`hunt.kql`](hunt.kql) | Defender XDR advanced hunting query |
| [`hunt.spl`](hunt.spl) | Splunk hunt over the CIM data models |
| [`hunt_raw.spl`](hunt_raw.spl) | Splunk hunt for data not mapped to CIM ([macros](../../../../all/splunk_macros.conf)) |
| [`hunt.yaral`](hunt.yaral) | Google SecOps YARA-L 2.0 detection rule |

Indicators by type: 16 IPv4, 1 domain. See `iocs.csv` for full details and descriptions.

## MITRE ATT&CK

| ID | Technique |
|---|---|
| [T1595](https://attack.mitre.org/techniques/T1595/) | Active Scanning |
| [T1190](https://attack.mitre.org/techniques/T1190/) | Exploit Public-Facing Application |
| [T1078.004](https://attack.mitre.org/techniques/T1078/004/) | Cloud Accounts |
| [T1550.001](https://attack.mitre.org/techniques/T1550/001/) | Application Access Token |
| [T1098.001](https://attack.mitre.org/techniques/T1098/001/) | Additional Cloud Credentials |
| [T1087.004](https://attack.mitre.org/techniques/T1087/004/) | Cloud Account Discovery |
| [T1090](https://attack.mitre.org/techniques/T1090/) | Proxy |
| [T1041](https://attack.mitre.org/techniques/T1041/) | Exfiltration Over C2 Channel |

## Recommended actions

1. Block 38.244.50.120 and the three Storm-0940 addresses (144.172.64.60, .99, .128) at the perimeter and in Defender XDR, and search 30 days of firewall, proxy, web and Entra sign-in logs for every address in this entry.
2. Review service principal sign-ins, application credential additions and role assignments from 15 October 2026 onward, especially for ConnectWise Cloud Backup apps, and follow ConnectWise's containment guidance.
3. Alert on unexpected outbound connections to LLM API endpoints or resellers such as xcai.pro from servers that have no reason to use them.
4. Watch public web portals (loan, broker and employee mobile systems) for high-rate sequential enumeration of login and search endpoints, and for bulk outbound transfers of structured personal data.

## Sources

- [FBI FLASH-20261113-001 – Threat Overview of ARTEX Autonomous Penetration Testing Framework](https://www.ic3.gov/CSA/2026/261113.pdf)
- [CrowdStrike – Unknown Threat Actor Uses AI-Driven ARTEX to Target South Korean Finance](https://www.crowdstrike.com/en-us/blog/unknown-threat-actor-uses-artex-to-target-south-korean-finance/)
- [Microsoft Threat Intelligence – AI-driven, large-scale nation-state campaign using ARTEX enables supply chain compromise](https://www.microsoft.com/en-us/security/blog/2026/10/21/storm-0940-uses-artex-agentic-ai-connectwise-supply-chain-compromise/)

---

[Back to index](../../../../README.md)
