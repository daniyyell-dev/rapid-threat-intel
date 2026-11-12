# Storm-3358 ARTEX Agentic Intrusions Against the Financial Sector

[Back to index](../../../../README.md#latest-threats) · [November 2026](../../README.md) · [2026-11-11](../README.md)

| Published | First added | Last updated | Category | Indicators | Block now |
|---|---|---|---|---|---|
| 2026-11-06 | 2026-11-11 03:52 | 2026-11-12 09:25 | Financially motivated intrusion / financial sector | 8 | 8 |

## Summary

Microsoft Threat Intelligence reports that Storm-3358, a financially motivated, Cambodia-based intrusion cluster, began targeting financial organisations in October 2026 with ARTEX, an open-source agentic penetration testing framework. Most targets are financial organisations in Southeast Asia, with a smaller number of large financial organisations globally. The ARTEX agents scan internet-facing systems at machine speed, exploit anonymous file upload and server-side request forgery (SSRF) flaws in web applications, then use curl and netcat to pull down the open-source WISP, vshell and AdaptixC2 remote access trojans for persistence and lateral movement. Microsoft listed the ARTEX servers and C2 nodes below as active on 6 November 2026; the actor rotates infrastructure, so behaviour-based hunting matters as much as blocking. On 11 November 2026 Unit 42 published a defender guide to ARTEX and similar agentic tools, describing the same class of machine-speed behaviour: short bursts of requests, a pause consistent with a model inference call, self-correction after failed requests, a GET after almost every successful write, and write-then-delete tests on storage buckets. Unit 42 did not publish new network indicators.

## Affected countries and sectors

- **Countries:** Not stated in the sources
- **Regions:** Southeast Asia, Global
- **Sectors:** Financial services
- **Note:** Primarily financial organisations in Southeast Asia, plus a smaller number of large financial organisations globally.
- **Source:** [Microsoft Threat Intelligence – ARTEX abuse expands as cybercriminals target financial sector](https://www.microsoft.com/en-us/security/blog/2026/11/06/artex-abuse-expands-as-cybercriminals-target-financial-sector/)

## At a glance

| File | What it is |
|---|---|
| [`block_now.txt`](https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/threats/2026-11_November-2026/2026-11-11/Storm-3358-ARTEX-Agentic-Intrusions-Financial-Sector/block_now.txt) (raw) | 8 high-confidence indicators to block now |
| [`iocs.csv`](iocs.csv) | All 8 indicators with description, confidence, action and source |
| [`defender_xdr_indicators.csv`](defender_xdr_indicators.csv) | 8 rows for Defender XDR bulk import |
| [`hunt.kql`](hunt.kql) | Defender XDR advanced hunting query |
| [`hunt.spl`](hunt.spl) | Splunk hunt over the CIM data models |
| [`hunt_raw.spl`](hunt_raw.spl) | Splunk hunt for data not mapped to CIM ([macros](../../../../all/splunk_macros.conf)) |
| [`hunt.yaral`](hunt.yaral) | Google SecOps YARA-L 2.0 detection rule |

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
5. Hunt for ARTEX-like operator behaviour described by Unit 42: short request bursts with a 25-31 second pause, a GET after each successful write, write-then-delete tests on storage buckets, and placeholder inputs immediately before real credentials. Do not treat research examples as indicators.

## Behaviours to hunt

> Behaviours are leads, not confirmed indicators, and can match legitimate activity. Compare any hit against your own baseline and environment before acting.

1. **Alert** · Web server starting a downloader or shell\
   Look for: A web server process starting curl, wget, nc, ncat, netcat or a shell\
   Why it matters: Microsoft saw ARTEX agents use curl and netcat to download the WISP, vshell and AdaptixC2 RATs after exploiting upload and SSRF flaws.\
   Log source: EDR process events on internet-facing web servers\
   Source: [Microsoft](https://www.microsoft.com/en-us/security/blog/2026/11/06/artex-abuse-expands-as-cybercriminals-target-financial-sector/)

2. **Hunt** · Rapid scanning with default scanner user agents\
   Look for: Bursts of many varied requests from one source in minutes, with default tool user agents (Nmap, curl, wget, Python HTTP clients, headless Chromium or Playwright)\
   Why it matters: Microsoft describes agentic scanning as a wide variety of requests in a short time, with retries at machine speed. The agent changes user agents quickly, so use this to alert, not to block.\
   Log source: Web server, WAF and reverse-proxy logs\
   Source: [Microsoft](https://www.microsoft.com/en-us/security/blog/2026/11/06/artex-abuse-expands-as-cybercriminals-target-financial-sector/)

3. **Hunt** · New cron jobs and temp-folder binaries on web hosts\
   Look for: New cron jobs, and new binaries run from temporary or world-writable folders, on web hosts\
   Why it matters: Microsoft lists suspicious cron job creation and processes launched from world-writable directories among the detections for this activity.\
   Log source: EDR process and file events\
   Source: [Microsoft](https://www.microsoft.com/en-us/security/blog/2026/11/06/artex-abuse-expands-as-cybercriminals-target-financial-sector/)

4. **Hunt** · Inference-paced request bursts then a pause\
   Look for: Short bursts of about one to 14 web or API requests a second apart, then a pause of 25 to 31 seconds, consistent with an agent waiting on a model inference call\
   Why it matters: Unit 42's ARTEX defender guide describes this think-then-act cadence as a hallmark of agentic tooling, alongside machine-speed pivots after a credential is found.\
   Log source: Web server, WAF and reverse-proxy logs\
   Source: [Unit 42](https://unit42.paloaltonetworks.com/artex-and-ai-powered-red-teaming-tools/)

5. **Hunt** · Write then GET or write-then-delete checks\
   Look for: A GET to the same path after a successful write, or a write-then-delete test against a storage bucket or object, from the same source in a short window\
   Why it matters: Unit 42 observed ARTEX agents checking their own work with a GET after almost every successful write, and running write-then-delete tests on storage buckets.\
   Log source: Web, API and cloud audit logs (including AWS S3)\
   Source: [Unit 42](https://unit42.paloaltonetworks.com/artex-and-ai-powered-red-teaming-tools/)

6. **Hunt** · Canary inputs immediately before real credentials\
   Look for: Placeholder or canary usernames and values sent immediately before real credentials in the same authentication or API session\
   Why it matters: Unit 42 saw ARTEX agents test canary inputs, such as bogus usernames, before real ones. Hunt for that pattern in your own logs; do not treat research examples as indicators.\
   Log source: Web application, identity and API logs\
   Source: [Unit 42](https://unit42.paloaltonetworks.com/artex-and-ai-powered-red-teaming-tools/)

Behaviours that map cleanly to log fields are included in [`hunt.kql`](hunt.kql) and [`hunt.spl`](hunt.spl), and alert behaviours in [`hunt.yaral`](hunt.yaral). The rest are listed in the Behaviours section above with where to look. Use behaviours to hunt and alert, never to block.

## Hunt

Run one of these before blocking to find past activity. Each file is the same hunt written for a different platform; pick the one for your SIEM or XDR.

| File | Platform | How to run it |
|---|---|---|
| [`hunt.kql`](hunt.kql) | Microsoft Defender XDR | In the [Defender portal](https://security.microsoft.com), open **Hunting > Advanced hunting**, paste the query and select **Run query**. It covers the last 30 days. |
| [`hunt.spl`](hunt.spl) | Splunk | In **Search & Reporting**, set the time picker to the last 30 days or more, paste the search and run it. It reads the CIM data models. |
| [`hunt_raw.spl`](hunt_raw.spl) | Splunk without CIM | The same hunt over raw events. Define the `rti_*` macros from [`splunk_macros.conf`](../../../../all/splunk_macros.conf) first. |
| [`hunt.yaral`](hunt.yaral) | Google SecOps | In **Detection > Rules & Detections > Rules Editor**, paste the rule, run a Retrohunt over the last 30 days, then turn on live mode. |

Leads that are not network or hash indicators are in [`iocs.csv`](iocs.csv), and behaviours with no clean field mapping are in the Behaviours section above. Guides: [Defender XDR](../../../../docs/defender-xdr.md), [Splunk](../../../../docs/splunk.md), [Google SecOps](../../../../docs/google-secops.md).

## Sources

- [Microsoft Threat Intelligence – ARTEX abuse expands as cybercriminals target financial sector](https://www.microsoft.com/en-us/security/blog/2026/11/06/artex-abuse-expands-as-cybercriminals-target-financial-sector/)
- [Unit 42 – ARTEX and AI-Powered Red Teaming Tools: What Defenders Need to Know](https://unit42.paloaltonetworks.com/artex-and-ai-powered-red-teaming-tools/)

---

[Back to index](../../../../README.md#latest-threats)
