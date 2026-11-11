# Trigram: DPRK Dropper Chain Targeting AI, Blockchain and Logistics (Kimsuky / UNK_DeadDrop)

[Back to index](../../../../README.md#latest-threats) · [November 2026](../../README.md) · [2026-11-11](../README.md)

| Published | First added | Last updated | Category | Indicators | Block now |
|---|---|---|---|---|---|
| 2026-11-11 | 2026-11-11 17:20 | 2026-11-11 | APT / infostealer | 275 | 11 |

## Summary

Stormshield's Cyber Threat Intelligence team, in a report published on 11 November 2026, describes Trigram, a campaign targeting the AI, blockchain and logistics sectors across Europe and the United States. Operators impersonate about 50 companies with fake job offers, invitations to a conference branded ICAGLLMBT, and parcel-tracking pages, then use a ClickFix step that looks like anti-spam verification and swaps a harmless command for a downloader. Separate droppers for Windows, macOS and Linux prepare a Node.js environment, fetch a JavaScript payload named install_guard.js, and on Windows strip the Mark-of-the-Web before launching a hidden VBScript worker, ~nvdg_worker.vbs, with wscript.exe //B. The payload does not hard-code its command-and-control server; it reads a GitLab project named *-indexings/tasks as a dead drop. The same operators, in SafeDep's 3 November 2026 report, force-pushed a forged commit to the popular antd-img-crop GitHub repository so that npm run build installed the OverLord stealer, and ran a fake Amber Group careers portal that led to the same loaders. Stormshield attributes Trigram with high confidence to North Korea as a continuation of the UNK_DeadDrop cluster and the Kimsuky group (APT-43), by overlapping infrastructure and tooling with Proofpoint (asteara.org and 170.205.29.83, tracked since April 2026), SafeDep (icagllmbt.space, the gaganata and chestsoi C2 hosts, and the GitLab dead drop) and Genians (the console super-admin address eros1030109@gmail.com and 170.205.29.83). Proofpoint had observed UNK_DeadDrop luring developers at close to 100 organisations in finance, cryptocurrency, education and technology with job-offer emails and trojanized repositories that delivered a modified OverLord framework. Indicators that appear in more than one of these reports are published at high confidence; everything else stays at medium confidence for alerting and hunting, and listed IP addresses are alerts rather than blocks because they sit on cheap or shared hosting. Do not block gitlab.com, github.com, gmail.com or genuine Google Update software.

## Affected countries and sectors

- **Countries:** United States (US)
- **Regions:** Europe, United States
- **Sectors:** Artificial intelligence, Blockchain and cryptocurrency, Logistics, Finance, Education, Technology
- **Note:** Stormshield says the Trigram campaign targets the AI, blockchain and logistics sectors across Europe and the United States, and does not publish a per-country victim list. Proofpoint's earlier UNK_DeadDrop reporting, which Stormshield treats as the same cluster, describes targeting at close to 100 organisations in finance, cryptocurrency, education, technology and several other sectors, without naming individual countries in the text. South Korea is not listed as a victim geography in these sources and was not added.
- **Source:** [Stormshield Customer Security Lab – Trigram Campaign](https://www.stormshield.com/news/cti-trigram-campaign/)

## At a glance

| File | What it is |
|---|---|
| [`block_now.txt`](https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/threats/2026-11_November-2026/2026-11-11/Trigram-DPRK-Dropper-Kimsuky-UNK-DeadDrop/block_now.txt) (raw) | 11 high-confidence indicators to block now |
| [`iocs.csv`](iocs.csv) | All 275 indicators with description, confidence, action and source |
| [`defender_xdr_indicators.csv`](defender_xdr_indicators.csv) | 256 rows for Defender XDR bulk import |
| [`hunt.kql`](hunt.kql) | Defender XDR advanced hunting query |
| [`hunt.spl`](hunt.spl) | Splunk hunt over the CIM data models |
| [`hunt_raw.spl`](hunt_raw.spl) | Splunk hunt for data not mapped to CIM ([macros](../../../../all/splunk_macros.conf)) |
| [`hunt.yaral`](hunt.yaral) | Google SecOps YARA-L 2.0 detection rule |

Indicators by type: 203 domains, 23 URLs, 17 SHA256, 14 IPv4, 9 file names, 5 other, 4 emails. See `iocs.csv` for full details and descriptions.

## MITRE ATT&CK

| ID | Technique |
|---|---|
| [T1566.002](https://attack.mitre.org/techniques/T1566/002/) | Phishing: Spearphishing Link |
| [T1204.004](https://attack.mitre.org/techniques/T1204/004/) | User Execution: Malicious Copy and Paste |
| [T1195.002](https://attack.mitre.org/techniques/T1195/002/) | Supply Chain Compromise: Compromise Software Supply Chain |
| [T1059.003](https://attack.mitre.org/techniques/T1059/003/) | Windows Command Shell |
| [T1059.001](https://attack.mitre.org/techniques/T1059/001/) | PowerShell |
| [T1059.005](https://attack.mitre.org/techniques/T1059/005/) | Visual Basic |
| [T1059.007](https://attack.mitre.org/techniques/T1059/007/) | JavaScript |
| [T1027](https://attack.mitre.org/techniques/T1027/) | Obfuscated Files or Information |
| [T1553.005](https://attack.mitre.org/techniques/T1553/005/) | Subvert Trust Controls: Mark-of-the-Web Bypass |
| [T1102.001](https://attack.mitre.org/techniques/T1102/001/) | Web Service: Dead Drop Resolver |
| [T1105](https://attack.mitre.org/techniques/T1105/) | Ingress Tool Transfer |
| [T1036](https://attack.mitre.org/techniques/T1036/) | Masquerading |
| [T1053.005](https://attack.mitre.org/techniques/T1053/005/) | Scheduled Task |
| [T1543.001](https://attack.mitre.org/techniques/T1543/001/) | Create or Modify System Process: Launch Agent |
| [T1543.002](https://attack.mitre.org/techniques/T1543/002/) | Create or Modify System Process: Systemd Service |
| [T1555.003](https://attack.mitre.org/techniques/T1555/003/) | Credentials from Password Stores: Credentials from Web Browsers |
| [T1555.001](https://attack.mitre.org/techniques/T1555/001/) | Credentials from Password Stores: Keychain |

## Recommended actions

1. Hunt DeviceProcessEvents for Mark-of-the-Web stripping (Unblock-File or :Zone.Identifier) followed within 10 minutes on the same host by wscript.exe //B, especially when the command line contains nvdg_worker, and exclude packaging or deployment-agent accounts that legitimately unblock content and run hidden VBScript.
2. Block the high-confidence C2 and dashboard domains (icagllmbt.space, the gaganata, fallgganata, chestsoi and asteara hosts) at DNS and in Defender XDR; alert on the remaining lure domains and on every listed IP, and do not block gitlab.com, github.com, gmail.com or genuine Google software.
3. Search proxy and endpoint logs for GitLab paths /drop-indexings/tasks and /up-indexings/tasks, and for downloads of install_guard.js, verify_w, verify_m or /guard-install-log and /guard-launcher-result.
4. Look for persistence named GoogleUpdateSupporterNode, com.google.UpdateSupporter or google-agent.service, for ~nvdg_worker.vbs in %TEMP%, and for portable Node.js running install_guard.js from a temp folder.
5. Treat unexpected job, conference or parcel-tracking pages that ask the user to paste a verification command as ClickFix, and rotate browser, wallet, SSH and cloud credentials on any host that ran the payload.

## Behaviours to hunt

> Behaviours are leads, not confirmed indicators, and can match legitimate activity. Compare any hit against your own baseline and environment before acting.

1. **Alert** · MOTW strip then hidden wscript within 10 minutes\
   Look for: MOTW stripped with Unblock-File or a :Zone.Identifier stream deletion, followed within 10 minutes on the same host by wscript.exe //B, especially when the command line contains nvdg_worker\
   Why it matters: The Windows Trigram dropper lands with Mark-of-the-Web, uses cmd or PowerShell to strip MOTW, then launches a hidden VBScript worker (~nvdg_worker.vbs) with wscript.exe //B. Pairing is a strong lead (about 75), rising when the command line contains nvdg_worker (about 95). Deployment tooling that unblocks content and then runs a hidden VBScript can fire this; tune by excluding packaging service accounts and deployment-agent lineage. MOTW removal through direct API calls is not covered.\
   Log source: Defender XDR DeviceProcessEvents (join on DeviceId within 10 minutes)\
   Source: [Stormshield](https://www.stormshield.com/news/cti-trigram-campaign/)

2. **Alert** · Hidden wscript launching ~nvdg_worker.vbs\
   Look for: wscript.exe //B launching ~nvdg_worker.vbs\
   Why it matters: Stormshield's YARA and SafeDep both name ~nvdg_worker.vbs as the hidden Windows worker. A hidden wscript launch of that file is a high-signal event on its own, including when the earlier MOTW-strip event was missed.\
   Log source: Defender XDR DeviceProcessEvents and DeviceFileEvents\
   Source: [Stormshield](https://www.stormshield.com/news/cti-trigram-campaign/)

3. **Alert** · GitLab dead-drop for the current C2\
   Look for: Requests for GitLab paths /drop-indexings/tasks or /up-indexings/tasks, especially raw config.json\
   Why it matters: The stage-3 payload does not hard-code its C2. It reads a config.json from a GitLab project named *-indexings/tasks, which Stormshield and SafeDep observed rotating from drop-indexings to up-indexings. Hunt the path; do not block gitlab.com.\
   Log source: Web proxy, firewall or endpoint network logs\
   Source: [SafeDep](https://safedep.io/blog/antd-img-crop-forged-commit-overlord-stealer)

4. **Hunt** · install_guard.js or verify_w / verify_m loaders\
   Look for: Downloads or execution of install_guard.js, verify_w or verify_m, including Node.js running install_guard.js from a temp folder\
   Why it matters: The cross-platform dropper downloads a stage-2 loader named verify_w (Windows) or verify_m (Linux/macOS), prepares a portable Node.js if needed, then fetches install_guard.js (minimum 50 KB) and runs it. Those names are distinctive of this chain.\
   Log source: Defender XDR DeviceProcessEvents, DeviceFileEvents and DeviceNetworkEvents\
   Source: [Stormshield](https://www.stormshield.com/news/cti-trigram-campaign/)

5. **Hunt** · Fake Google Update persistence\
   Look for: Persistence using fake Google Update names: scheduled task GoogleUpdateSupporterNode, LaunchDaemon com.google.UpdateSupporter, or systemd unit google-agent.service\
   Why it matters: SafeDep documents OverLord persisting as fake Google software after credential theft. A genuine Google Update install will not use these exact names. Windows hosts can be hunted in Defender; macOS and Linux often cannot, so check them directly.\
   Log source: Defender XDR DeviceProcessEvents and DeviceEvents, plus macOS and Linux host logs\
   Source: [SafeDep](https://safedep.io/blog/antd-img-crop-forged-commit-overlord-stealer)

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

- [Stormshield Customer Security Lab – Trigram Campaign](https://www.stormshield.com/news/cti-trigram-campaign/)
- [Proofpoint – Don't Fear the Repo: UNK_DeadDrop Phishing Campaign Targets Developers to Steal Cryptocurrency](https://www.proofpoint.com/us/blog/threat-insight/dont-fear-repo-unkdeaddrop-phishing-campaign-targets-developers-steal)
- [SafeDep – antd-img-crop GitHub Repository Hijacked to Deliver OverLord Stealer](https://safedep.io/blog/antd-img-crop-forged-commit-overlord-stealer)
- [Genians – Kimsuky Integrates AI into Attack Operations](https://www.genians.co.kr/en/blog/threat_intelligence/kimsuky_ai_llm)
- [octoprobe.ai](https://www.octoprobe.ai/blog/kimsuky-operation-gitpower-github-c2/)
- [OctoProbe – Kimsuky Operation GitPower GitHub C2](https://www.octoprobe.ai/blog/kimsuky-operation-gitpower-github-c2/)

---

[Back to index](../../../../README.md#latest-threats)
