# Lazarus Operation FlashHole: CrossWeb EX Abuse, GitHub-Issue C2 and Post-Quantum LPEClient

[Live entry](https://iocwatch.com/t/Lazarus-Operation-FlashHole-CrossWeb-EX/) · [Back to index](../../../../README.md) · [November 2026](../../README.md) · [2026-11-12](../README.md)

| Published | First added | Last updated | Category | Indicators | Block now |
|---|---|---|---|---|---|
| 2026-10-21 | 2026-11-12 12:25 | 2026-11-12 | Espionage / APT | 22 | 9 |

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

Kaspersky's GReAT documented Operation FlashHole, a Lazarus Group follow-up to Operation SyncHole that it presented at SAS on 11 November 2026. Targets in South Korea's software, construction and wired-communication equipment sectors received tailored phishing links to fake résumé and portfolio sites on GitHub Pages; the sites loaded scripts from javadevhouse.co.kr and pythonapischool.com, and the infection ran through INISAFE CrossWeb EX 3.4.1.2, a security plug-in that Korean banking and government sites require. Under INISAFECrossWebEXSvc.exe, the Windows binary fsquirt.exe was injected with the TechHub downloader, which uses a private GitHub repository as C2: it opens an issue titled 1 plus a host ID with the body hel, swaps keys through repository files and changes the body to hey when ready. TechHub loads the Cubridge orchestrator, TouchHub installs a service for the TouchShift loader (side-loaded as mscoree.dll), and a second TechHub brings in ClientHub, which uses SNOW-encrypted config and compromised Korean websites or Dropbox as C2, and LPEClient, which now uses ML-KEM-1024. The two script hosts' URLs, pythonapischool.com and six C2 paths on compromised sites are on the block list.

> [!WARNING]
> Kaspersky's report was published on 21 October 2026 and presented at SAS on 11 November; the January activity may be older than the indicators suggest. Six C2 URLs sit on compromised legitimate South Korean sites, so block the exact URLs, not the domains. javadevhouse.co.kr no longer resolves and its ownership is unconfirmed, so it is alert only. Hashes are MD5 only. Do not block GitHub, GitHub Pages, Dropbox or CrossWeb EX; hunt for unusual processes using them.

## Affected countries and sectors

- **Countries:** South Korea (KR)
- **Regions:** East Asia
- **Sectors:** Software, Construction, Telecommunications equipment
- **Note:** Kaspersky identified at least three South Korean firms in software, construction and wired communication equipment, and expects many more organisations were affected.
- **Source:** [Kaspersky Securelist – Dissecting Operation FlashHole, a complex attack by Lazarus](https://securelist.com/lazarus-operation-flashhole/121541/)

## At a glance

| File | What it is |
|---|---|
| [`block_now.txt`](https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/threats/2026-11_November-2026/2026-11-12/Lazarus-Operation-FlashHole-CrossWeb-EX/block_now.txt) (raw) | 9 high-confidence indicators to block now |
| [`iocs.csv`](iocs.csv) | All 22 indicators with description, confidence, action and source |
| [`defender_xdr_indicators.csv`](defender_xdr_indicators.csv) | 10 rows for Defender XDR bulk import |
| [`hunt.kql`](hunt.kql) | Defender XDR advanced hunting query |
| [`hunt.spl`](hunt.spl) | Splunk hunt over the CIM data models |
| [`hunt_raw.spl`](hunt_raw.spl) | Splunk hunt for data not mapped to CIM ([macros](../../../../all/splunk_macros.conf)) |
| [`hunt.yaral`](hunt.yaral) | Google SecOps YARA-L 2.0 detection rule |

Indicators by type: 12 other, 8 URLs, 2 domains. See `iocs.csv` for full details and descriptions.

## MITRE ATT&CK

| ID | Technique |
|---|---|
| [T1566.002](https://attack.mitre.org/techniques/T1566/002/) | Spearphishing Link |
| [T1189](https://attack.mitre.org/techniques/T1189/) | Drive-by Compromise |
| [T1203](https://attack.mitre.org/techniques/T1203/) | Exploitation for Client Execution |
| [T1055](https://attack.mitre.org/techniques/T1055/) | Process Injection |
| [T1574.002](https://attack.mitre.org/techniques/T1574/002/) | DLL Side-Loading |
| [T1543.003](https://attack.mitre.org/techniques/T1543/003/) | Windows Service |
| [T1102.002](https://attack.mitre.org/techniques/T1102/002/) | Bidirectional Communication |
| [T1071.001](https://attack.mitre.org/techniques/T1071/001/) | Web Protocols |
| [T1573](https://attack.mitre.org/techniques/T1573/) | Encrypted Channel |
| [T1027](https://attack.mitre.org/techniques/T1027/) | Obfuscated Files or Information |
| [T1068](https://attack.mitre.org/techniques/T1068/) | Exploitation for Privilege Escalation |

## Recommended actions

1. Block the eight URLs and pythonapischool.com, alert on javadevhouse.co.kr, and search 90 days of proxy and DNS logs for all of them.
2. Update INISAFE CrossWeb EX to the vendor's latest release or remove it where it is not required, and alert on INISAFECrossWebEXSvc.exe starting fsquirt.exe, a shell or any unsigned process.
3. Hunt for mscoree.dll and ActivationStore.dat in System32\RasConv, System32\DrvConh and the ProgramData folders listed, and for services whose binary sits in those folders.
4. Hunt for non-browser processes (fsquirt.exe, svchost.exe, rundll32.exe) calling api.github.com or the Dropbox API.
5. If anything matches, isolate the host and collect memory: the first stage runs only in memory.

## Behaviours to hunt

> Behaviours are leads, not confirmed indicators, and can match legitimate activity. Compare any hit against your own baseline and environment before acting.

1. **Alert** · CrossWeb EX service starting fsquirt or a shell\
   Look for: INISAFE CrossWeb EX service (INISAFECrossWebEXSvc.exe) starting fsquirt.exe, a shell or another unexpected child process\
   Why it matters: In FlashHole the chain began under INISAFECrossWebEXSvc.exe (CrossWeb EX V3 3.4.1.2) at high integrity, and the Bluetooth transfer tool fsquirt.exe was injected with the TechHub downloader. fsquirt.exe has no reason to run under that service.\
   Log source: EDR process events on Windows endpoints with CrossWeb EX installed\
   Source: [Kaspersky](https://securelist.com/lazarus-operation-flashhole/121541/)

2. **Alert** · FlashHole side-loading DLL or payload file in odd folders\
   Look for: mscoree.dll, ActivationStore.dat or msadc.inc in System32\RasConv, System32\DrvConh, Common Files\System\msadc or the ProgramData folders RasConv, Apple, ssh, qorestor and Dell\
   Why it matters: TouchShift is side-loaded as mscoree.dll from these folders, the service-based TechHub reads ActivationStore.dat, and ClientHub keeps its SNOW-encrypted C2 list in msadc.inc. The real mscoree.dll lives in System32 itself, not in these subfolders.\
   Log source: EDR file and image-load events\
   Source: [Kaspersky](https://securelist.com/lazarus-operation-flashhole/121541/)

3. **Alert** · Service pointing into System32 RasConv or DrvConh\
   Look for: A new service whose binary or ServiceDll sits in System32\RasConv or System32\DrvConh, named after a netsvcs service with two extra letters\
   Why it matters: TouchHub copies a legitimate netsvcs service name, adds two random letters and registers a service that loads the side-loaded TouchShift DLL, so the service looks almost genuine.\
   Log source: EDR registry events; Windows System 7045 (service installed)\
   Source: [Kaspersky](https://securelist.com/lazarus-operation-flashhole/121541/)

4. **Hunt** · Non-browser process calling GitHub or Dropbox APIs\
   Look for: Non-browser processes such as fsquirt.exe, rundll32.exe or a service host calling api.github.com or the Dropbox API\
   Why it matters: TechHub uses a private GitHub repository and its issues as C2 (an issue titled 1 plus the host ID, body hel then hey), and one ClientHub build uses the Dropbox API. GitHub and Dropbox are legitimate, so the lead is the calling process.\
   Log source: EDR network events; proxy logs\
   Source: [Kaspersky](https://securelist.com/lazarus-operation-flashhole/121541/)

Behaviours that map cleanly to log fields are included in [`hunt.kql`](hunt.kql) and [`hunt.spl`](hunt.spl), and alert behaviours in [`hunt.yaral`](hunt.yaral). The rest are listed in the Behaviours section above with where to look. Use behaviours to hunt and alert, never to block.

## Sources

- [Kaspersky Securelist – Dissecting Operation FlashHole, a complex attack by Lazarus](https://securelist.com/lazarus-operation-flashhole/121541/)
- [Safeguard – Lazarus FlashHole: ML-KEM-1024 malware delivery, IOCs and hunting](https://safeguard.sh/resources/blog/lazarus-flashhole-post-quantum-ml-kem-malware)

---

[Back to index](../../../../README.md)
