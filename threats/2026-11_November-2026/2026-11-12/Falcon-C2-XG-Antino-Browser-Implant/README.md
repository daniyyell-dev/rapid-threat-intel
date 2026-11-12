# Falcon C2 (XG): Browser Framework and Antino Implant Targeting Government Webmail

[Back to index](../../../../README.md#latest-threats) · [November 2026](../../README.md) · [2026-11-12](../README.md)

| Published | First added | Last updated | Category | Indicators | Block now |
|---|---|---|---|---|---|
| 2026-11-11 | 2026-11-12 09:25 | 2026-11-12 | APT / browser implant | 27 | 0 |

## Summary

Unit 42 describes Falcon, also called XG or Xiang Ge, a browser-based command-and-control framework that runs malicious JavaScript on compromised webmail portals and government web applications. Between March and May 2026 it was used against ministries of foreign affairs, defence and interior, and law enforcement in one Middle Eastern country and four Southeast Asian countries. The framework steals passwords, emails, session cookies and communications, sideloads a malicious Chrome or Firefox extension, and in some cases delivers Antino, a Rust implant that uses Microsoft OneDrive as its C2 channel. The published domains, extension ID and file hashes come only from Unit 42, so they are medium confidence: they appear as Block in the Defender import file, not on the high-confidence block-now list. Do not block OneDrive or other Microsoft services; hunt for Antino's OneDrive paths and the GatherOSStateKit persistence folder instead.

> [!WARNING]
> Single-source indicators (Unit 42). The observed activity is from March to May 2026. Do not block OneDrive or other Microsoft services.

## Affected countries and sectors

- **Countries:** Not stated in the sources
- **Regions:** Middle East, Southeast Asia
- **Sectors:** Government, Law enforcement, Defence
- **Note:** Unit 42 observed compromises of government entities in one Middle Eastern country and four Southeast Asian countries between March and May 2026, including ministries of foreign affairs, defence and interior, and law enforcement. Countries were not named.
- **Source:** [Unit 42 – The XG Files: Falcon C2 Flying Under The (Browser) Radar](https://unit42.paloaltonetworks.com/falcon-c2-browser-compromise/)

## At a glance

| File | What it is |
|---|---|
| [`block_now.txt`](https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/threats/2026-11_November-2026/2026-11-12/Falcon-C2-XG-Antino-Browser-Implant/block_now.txt) (raw) | None yet: no indicator is high-confidence enough to block, so use the files below to hunt |
| [`iocs.csv`](iocs.csv) | All 27 indicators with description, confidence, action and source |
| [`defender_xdr_indicators.csv`](defender_xdr_indicators.csv) | 26 rows for Defender XDR bulk import |
| [`hunt.kql`](hunt.kql) | Defender XDR advanced hunting query |
| [`hunt.spl`](hunt.spl) | Splunk hunt over the CIM data models |
| [`hunt_raw.spl`](hunt_raw.spl) | Splunk hunt for data not mapped to CIM ([macros](../../../../all/splunk_macros.conf)) |
| [`hunt.yaral`](hunt.yaral) | Google SecOps YARA-L 2.0 detection rule |

Indicators by type: 21 SHA256, 5 domains, 1 other. See `iocs.csv` for full details and descriptions.

## MITRE ATT&CK

| ID | Technique |
|---|---|
| [T1189](https://attack.mitre.org/techniques/T1189/) | Drive-by Compromise |
| [T1176](https://attack.mitre.org/techniques/T1176/) | Browser Extensions |
| [T1555.003](https://attack.mitre.org/techniques/T1555/003/) | Credentials from Web Browsers |
| [T1539](https://attack.mitre.org/techniques/T1539/) | Steal Web Session Cookie |
| [T1102.002](https://attack.mitre.org/techniques/T1102/002/) | Web Service: Bidirectional Communication |
| [T1547.001](https://attack.mitre.org/techniques/T1547/001/) | Registry Run Keys / Startup Folder |

## Recommended actions

1. Import the Falcon domains and file hashes in Defender XDR at medium confidence, and hunt 30 days of DNS, proxy and endpoint logs for them.
2. Search browser extension inventories, file paths and registry keys for Chrome extension ID mbidcmlcbgbphpoacojjbmfpohcimjji.
3. Hunt for files under %LOCALAPPDATA%\Windows GatherOSStateKit, sdiagnhost.exe launching PowerShell, and OneDrive or Graph activity to antino/heartbeat/ or antino/antino_upload/ paths. Do not block OneDrive or Microsoft services.
4. On internal or government web applications, look for unexpected third-party JavaScript and for Hm_lvt_$ local-storage keys or an Hm_lvt__ cookie with a long-lived expiry.

## Behaviours to hunt

> Behaviours are leads, not confirmed indicators, and can match legitimate activity. Compare any hit against your own baseline and environment before acting.

1. **Alert** · Malicious Falcon Chrome extension ID\
   Look for: A Chrome or Firefox extension with ID mbidcmlcbgbphpoacojjbmfpohcimjji, or that extension's files on disk\
   Why it matters: Unit 42 published this Chrome extension ID as the malicious Falcon extension used to steal passwords, emails and session cookies.\
   Log source: Endpoint file, registry and browser-extension inventory events\
   Source: [Unit 42](https://unit42.paloaltonetworks.com/falcon-c2-browser-compromise/)

2. **Alert** · Antino GatherOSStateKit persistence folder\
   Look for: Files or processes under %LOCALAPPDATA%\Windows GatherOSStateKit, including a tmp########.exe drop and DllSafeCheck64.dll or slc.dll copied beside it\
   Why it matters: Unit 42 says Antino copies itself to this hard-coded folder and has used DllSafeCheck64.dll for sideloading in older versions.\
   Log source: EDR file and process events\
   Source: [Unit 42](https://unit42.paloaltonetworks.com/falcon-c2-browser-compromise/)

3. **Hunt** · sdiagnhost used to add an Antino Run key\
   Look for: sdiagnhost.exe launching PowerShell that adds a Run-key value, shortly after a GatherOSStateKit drop\
   Why it matters: Unit 42 observed Antino executing sdiagnhost.exe so that a PowerShell snippet in a diagnostic answer file adds Antino to the Run key.\
   Log source: EDR process events\
   Source: [Unit 42](https://unit42.paloaltonetworks.com/falcon-c2-browser-compromise/)

4. **Hunt** · Antino OneDrive heartbeat or upload paths\
   Look for: OAuth or OneDrive file activity to a tenant that is not yours, with repeated small JSON writes to paths such as antino/heartbeat/ or antino/antino_upload/\
   Why it matters: Antino beacons by uploading hostname and username to antino/heartbeat/.json and exchanges commands and stolen files under antino/antino_upload/. Hunt these paths; do not block OneDrive or other Microsoft services.\
   Log source: Cloud App events and OneDrive or Microsoft Graph audit logs\
   Source: [Unit 42](https://unit42.paloaltonetworks.com/falcon-c2-browser-compromise/)

5. **Hunt** · Falcon Hm_lvt session cookie or local storage\
   Look for: Hm_lvt_$ keys in browser local storage, or an Hm_lvt__ cookie set to 1 with a long-lived expiry (Unit 42 saw expiry in 2099), on internal or government web applications where Baidu Analytics has no legitimate reason to appear\
   Why it matters: Falcon stores its session ID as Hm_lvt_$ in local storage and as the Hm_lvt__ cookie, mimicking Baidu Analytics identifiers.\
   Log source: Web application logs, HTTP cookie headers, and browser forensic artefacts\
   Source: [Unit 42](https://unit42.paloaltonetworks.com/falcon-c2-browser-compromise/)

Behaviours that map cleanly to log fields are included in [`hunt.kql`](hunt.kql) and [`hunt.spl`](hunt.spl), and alert behaviours in [`hunt.yaral`](hunt.yaral). The rest are listed in the Behaviours section above with where to look. Use behaviours to hunt and alert, never to block.

## Hunt

Run one of these to find past activity. Each file is the same hunt written for a different platform; pick the one for your SIEM or XDR.

| File | Platform | How to run it |
|---|---|---|
| [`hunt.kql`](hunt.kql) | Microsoft Defender XDR | In the [Defender portal](https://security.microsoft.com), open **Hunting > Advanced hunting**, paste the query and select **Run query**. It covers the last 30 days. |
| [`hunt.spl`](hunt.spl) | Splunk | In **Search & Reporting**, set the time picker to the last 30 days or more, paste the search and run it. It reads the CIM data models. |
| [`hunt_raw.spl`](hunt_raw.spl) | Splunk without CIM | The same hunt over raw events. Define the `rti_*` macros from [`splunk_macros.conf`](../../../../all/splunk_macros.conf) first. |
| [`hunt.yaral`](hunt.yaral) | Google SecOps | In **Detection > Rules & Detections > Rules Editor**, paste the rule, run a Retrohunt over the last 30 days, then turn on live mode. |

Leads that are not network or hash indicators are in [`iocs.csv`](iocs.csv), and behaviours with no clean field mapping are in the Behaviours section above. Guides: [Defender XDR](../../../../docs/defender-xdr.md), [Splunk](../../../../docs/splunk.md), [Google SecOps](../../../../docs/google-secops.md).

## Sources

- [Unit 42 – The XG Files: Falcon C2 Flying Under The (Browser) Radar](https://unit42.paloaltonetworks.com/falcon-c2-browser-compromise/)

---

[Back to index](../../../../README.md#latest-threats)
