# ARTEX Agents Steal AI Gateway Keys and Try Deepfake KYC Bypass at Crypto Exchanges

[Live entry](https://daniyyell.com/rapid-threat-intel/t/ARTEX-AI-Gateway-Credential-Theft-and-Crypto-KYC-Deepfake-Bypass/) · [Back to index](../../../../README.md) · [November 2026](../../README.md) · [2026-11-13](../README.md)

| Published | First added | Last updated | Category | Indicators | Block now |
|---|---|---|---|---|---|
| 2026-11-13 | 2026-11-13 22:30 | 2026-11-13 | Financially motivated intrusion / AI services and crypto exchanges | 11 | 4 |

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

Amazon Threat Intelligence reported on 13 November 2026 that its MadPot sensors, posing as LLM inference APIs, captured the working memory of ARTEX agents run by what it assesses, with moderate confidence, are separate Chinese-nexus groups between 3 October and 5 November. The main campaign hunted internet-exposed LLM gateways and AI app builders (One API, New API, Veloera, Sub2API, LiteLLM, Dify, FastGPT, Langflow, RAGFlow, Open WebUI, LobeChat, Ollama), pulled the provider API keys they hold and fed them back into the operators' own model pool, then used stolen cloud credentials to reach managed AI services, secrets stores and parameter stores. Exploits included unclaimed installs, anonymous management endpoints, default admin credentials such as the LiteLLM master key, Langflow CVE-2025-3248, RAGFlow CVE-2026-28797, the isCliRequest header bypass in One API family systems and SSRF to cloud metadata. A second campaign tried to pass KYC checks at two cryptocurrency exchanges with real-time deepfake video and forged ID photos; the vendor's server-side check rejected every recorded attempt. Four hosting addresses are on the block list; the Cloudflare, Oracle Cloud and carrier addresses are alert only.

> [!WARNING]
> Amazon says the operators sent all outbound traffic through proxies, so these addresses are short-lived egress points. Do not block Cloudflare (104.28.x), Oracle Cloud or the NTT and ARTERIA carrier addresses; alert on them only.

## Affected countries and sectors

- **Countries:** Not stated in the sources
- **Regions:** Worldwide
- **Sectors:** Technology, AI services, Cryptocurrency exchanges, Financial services
- **Note:** Amazon describes worldwide targeting of exposed AI gateways and app builders, worked through a fixed country sequence, and two unnamed cryptocurrency exchanges; operators excluded mainland China and government domains.
- **Source:** [Amazon Threat Intelligence – Threat actors running cybercrime campaigns with ARTEX AI agents](https://aws.amazon.com/blogs/security/amazon-threat-intelligence-observes-threat-actors-running-cybercrime-campaigns-with-artex-ai-agents/)

## At a glance

| File | What it is |
|---|---|
| [`block_now.txt`](https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/threats/2026-11_November-2026/2026-11-13/ARTEX-AI-Gateway-Credential-Theft-and-Crypto-KYC-Deepfake-Bypass/block_now.txt) (raw) | 4 high-confidence indicators to block now |
| [`iocs.csv`](iocs.csv) | All 11 indicators with description, confidence, action and source |
| [`defender_xdr_indicators.csv`](defender_xdr_indicators.csv) | 11 rows for Defender XDR bulk import |
| [`hunt.kql`](hunt.kql) | Defender XDR advanced hunting query |
| [`hunt.spl`](hunt.spl) | Splunk hunt over the CIM data models |
| [`hunt_raw.spl`](hunt_raw.spl) | Splunk hunt for data not mapped to CIM ([macros](../../../../all/splunk_macros.conf)) |
| [`hunt.yaral`](hunt.yaral) | Google SecOps YARA-L 2.0 detection rule |

Indicators by type: 11 IPv4. See `iocs.csv` for full details and descriptions.

## MITRE ATT&CK

| ID | Technique |
|---|---|
| [T1595](https://attack.mitre.org/techniques/T1595/) | Active Scanning |
| [T1190](https://attack.mitre.org/techniques/T1190/) | Exploit Public-Facing Application |
| [T1078.001](https://attack.mitre.org/techniques/T1078/001/) | Default Accounts |
| [T1552.001](https://attack.mitre.org/techniques/T1552/001/) | Credentials In Files |
| [T1552.005](https://attack.mitre.org/techniques/T1552/005/) | Cloud Instance Metadata API |
| [T1078.004](https://attack.mitre.org/techniques/T1078/004/) | Cloud Accounts |
| [T1496](https://attack.mitre.org/techniques/T1496/) | Resource Hijacking |
| [T1090](https://attack.mitre.org/techniques/T1090/) | Proxy |

## Recommended actions

1. Block the four hosting addresses and alert on the other seven in firewall, WAF, reverse-proxy and cloud sign-in logs for October and November 2026.
2. Take LLM gateways and AI app builders (One API, New API, LiteLLM, Dify, Langflow, RAGFlow, Open WebUI, Ollama) off the internet or put them behind authentication; change default admin and master keys and finish any unclaimed setup.
3. Patch Langflow for CVE-2025-3248 and RAGFlow for CVE-2026-28797, and hunt Langflow hosts for shells or downloaders started by the Langflow process.
4. Rotate every provider API key stored in an exposed gateway, and alert on unexpected AI model spend or calls from new addresses.
5. Crypto exchanges and KYC teams: review liveness and document checks for injected video and edited ID photos with forged camera metadata.

## Behaviours to hunt

> Behaviours are leads, not confirmed indicators, and can match legitimate activity. Compare any hit against your own baseline and environment before acting.

1. **Alert** · Langflow process starting a shell or downloader\
   Look for: A shell, downloader or netcat started by the Langflow server process\
   Why it matters: Amazon lists Langflow CVE-2025-3248 in the ARTEX playbook; the flaw runs attacker code inside the Langflow Python process, so a payload shows up as a child shell or downloader. Tuning: the parent command line must contain langflow and the child must be sh, bash, dash, curl, wget or nc. Expected false positives: custom Langflow components that shell out by design; baseline those per host before alerting.\
   Log source: Defender XDR DeviceProcessEvents on Linux servers (MDE for Linux); EDR process events in Splunk or Google SecOps\
   Source: [Amazon Threat Intelligence](https://aws.amazon.com/blogs/security/amazon-threat-intelligence-observes-threat-actors-running-cybercrime-campaigns-with-artex-ai-agents/)

2. **Hunt** · isCliRequest or default-key use on AI gateway admin APIs\
   Look for: Requests to One API, New API or LiteLLM admin endpoints from outside your network that carry an isCliRequest header or authenticate with the default master key\
   Why it matters: Amazon names the isCliRequest header bypass in One API family systems and the LiteLLM default master key as ARTEX entry points for pulling stored provider keys. Tuning: only external sources, and only management or channel/key endpoints. Expected false positives: your own admin CLI if it sets the header; these logs are not in Defender XDR tables, so no XDR query is given.\
   Log source: WAF, reverse-proxy and AI gateway access logs\
   Source: [Amazon Threat Intelligence](https://aws.amazon.com/blogs/security/amazon-threat-intelligence-observes-threat-actors-running-cybercrime-campaigns-with-artex-ai-agents/)

Behaviours that map cleanly to log fields are included in [`hunt.kql`](hunt.kql) and [`hunt.spl`](hunt.spl), and alert behaviours in [`hunt.yaral`](hunt.yaral). The rest are listed in the Behaviours section above with where to look. Use behaviours to hunt and alert, never to block.

## Sources

- [Amazon Threat Intelligence – Threat actors running cybercrime campaigns with ARTEX AI agents](https://aws.amazon.com/blogs/security/amazon-threat-intelligence-observes-threat-actors-running-cybercrime-campaigns-with-artex-ai-agents/)

---

[Back to index](../../../../README.md)
