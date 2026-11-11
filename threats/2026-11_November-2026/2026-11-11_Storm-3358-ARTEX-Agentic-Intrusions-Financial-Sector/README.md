# Storm-3358 ARTEX Agentic Intrusions Against the Financial Sector

[Back to index](../../../README.md#latest-threats) · [November 2026](../README.md)

| Published | First added | Last updated | Category | Indicators | Block now |
|---|---|---|---|---|---|
| 2026-11-06 | 2026-11-11 03:52 | 2026-11-11 | Financially motivated intrusion / financial sector | 8 | 8 |

## Summary

Microsoft Threat Intelligence reports that Storm-3358, a financially motivated, Cambodia-based intrusion cluster, began targeting financial organisations in October 2026 with ARTEX, an open-source agentic penetration testing framework. Most targets are financial organisations in Southeast Asia, with a smaller number of large financial organisations globally. The ARTEX agents scan internet-facing systems at machine speed, exploit anonymous file upload and server-side request forgery (SSRF) flaws in web applications, then use curl and netcat to pull down the open-source WISP, vshell and AdaptixC2 remote access trojans for persistence and lateral movement. Microsoft listed the ARTEX servers and C2 nodes below as active on 6 November 2026; the actor rotates infrastructure, so behaviour-based hunting matters as much as blocking.

## At a glance

| File | What it is |
|---|---|
| [`block_now.txt`](https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/threats/2026-11_November-2026/2026-11-11_Storm-3358-ARTEX-Agentic-Intrusions-Financial-Sector/block_now.txt) (raw) | 8 high-confidence indicators to block now |
| [`iocs.csv`](iocs.csv) | All 8 indicators with description, confidence, action and source |
| [`defender_xdr_indicators.csv`](defender_xdr_indicators.csv) | 8 rows for Defender XDR bulk import |
| [`hunt.kql`](hunt.kql) | Defender XDR advanced hunting query |

Indicators by type: 8 IPv4. See `iocs.csv` for full details and descriptions.

## MITRE ATT&CK

| ID | Technique |
|---|---|
| [T1595](https://attack.mitre.org/techniques/T1595/) | Active Scanning |
| [T1190](https://attack.mitre.org/techniques/T1190/) | Exploit Public-Facing Application |
| [T1505.003](https://attack.mitre.org/techniques/T1505/003/) | Web Shell |
| [T1105](https://attack.mitre.org/techniques/T1105/) | Ingress Tool Transfer |
| [T1059.004](https://attack.mitre.org/techniques/T1059/004/) | Unix Shell |
| [T1053.003](https://attack.mitre.org/techniques/T1053/003/) | Cron |
| [T1110](https://attack.mitre.org/techniques/T1110/) | Brute Force |
| [T1219](https://attack.mitre.org/techniques/T1219/) | Remote Access Software |

## Recommended actions

1. Block the ARTEX server and C2 addresses at the perimeter and in Defender XDR, and search 30 days of firewall, proxy and web server logs for them.
2. Inventory internet-facing upload endpoints and server-side URL fetch features (document portals, onboarding and KYC forms, webhooks, PDF and image processors); require authentication on uploads and restrict outbound destinations.
3. Hunt for web server processes spawning a shell, curl, wget or nc, new binaries run from temp or world-writable paths, and new cron entries on web hosts.
4. Watch for bursts of rapid, retried requests with default tool user agents (Nmap, curl, python-requests, headless Chromium) against public web applications.

## Hunt

Run this before blocking to find past activity.

1. Open [`hunt.kql`](hunt.kql) and copy the query.
2. In the [Microsoft Defender portal](https://security.microsoft.com), go to **Hunting > Advanced hunting** and paste it into a new query tab.
3. Select **Run query**. Results cover the last 30 days, one row per table, entity and indicator.

Non-network leads such as file names or URL paths are listed as comments at the end of the query. More in the [Defender XDR guide](../../../docs/defender-xdr.md).

## Sources

- [Microsoft Threat Intelligence - ARTEX abuse expands as cybercriminals target financial sector](https://www.microsoft.com/en-us/security/blog/2026/11/06/artex-abuse-expands-as-cybercriminals-target-financial-sector/)

---

[Back to index](../../../README.md#latest-threats)
