# Armorsteal: SEO-Poisoned Chocolatey and Massgrave Lures Deliver a Python Stealer, Backdoor and Miner

[Back to index](../../../../README.md#latest-threats) · [November 2026](../../README.md) · [2026-11-13](../README.md)

| Published | First added | Last updated | Category | Indicators | Block now |
|---|---|---|---|---|---|
| 2026-11-06 | 2026-11-13 00:20 | 2026-11-13 | Crimeware / information stealer | 37 | 26 |

## Summary

Zscaler ThreatLabz reported in October that poisoned search results sent people looking for Chocolatey or Microsoft Activation Scripts install commands to lookalike sites choclatey.org and massgravel.net. The PowerShell command each site showed installed the real tool and quietly dropped Armorsteal, a PyArmor-protected Python kit with its own Python 3.11 runtime, into C:\Windows\SystemHealth\Update\, persisting with the scheduled tasks SysCheck2 and SysCheckX. On 6 November Seqrite Labs analysed a newer build, compiled on 28 October, with an 11-domain C2 failover list, a new SysHeal task, and an XMRig miner manager that adds C:\Windows and xmrig.exe as Microsoft Defender exclusions and pauses the miner whenever Task Manager or similar tools open. The backdoor only runs Python tasks signed with the operator's RSA key; the spy module logs keys, swaps copied wallet addresses and takes keyword-triggered screenshots; the stealer takes Discord tokens, browser passwords and cookies (through Chrome remote debugging on port 9222), wallet data, seed phrases, password-manager vaults and SSH keys. The Hacker News highlighted the campaign again on 12 November. The lure and C2 domains, the Spamhaus-listed lure host and the published hashes are on the block list.

> [!WARNING]
> The C2 addresses sit in IQWeb / DDoS-Guard protected ranges that front many unrelated sites, so they are alert only; block the domains instead. 82.153.135.80 hosted the lures until about 1 October and may have been reassigned, so it is alert only. pur.st has a long certificate history and is alert only. PyArmor rebuilds change file hashes, so rely on the task, folder and exclusion hunts.

## Affected countries and sectors

- **Countries:** Not stated in the sources
- **Regions:** Global
- **Sectors:** IT administrators and developers, Cryptocurrency holders, Consumers
- **Note:** Victims are users who searched for Chocolatey or Microsoft Activation Scripts commands. Zscaler and Seqrite do not name victim organisations or countries.
- **Source:** [Seqrite Labs – Armorsteal Unpacked: Breaking Down a Python Malware Kit That Steals Data and Mines Crypto](https://www.seqrite.com/blog/armorsteal-unpacked-breaking-down-a-python-malware-kit-that-steals-data-and-mines-crypto/)

## At a glance

| File | What it is |
|---|---|
| [`block_now.txt`](https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/threats/2026-11_November-2026/2026-11-13/Armorsteal-SEO-Poisoning-Python-Stealer/block_now.txt) (raw) | 26 high-confidence indicators to block now |
| [`iocs.csv`](iocs.csv) | All 37 indicators with description, confidence, action and source |
| [`defender_xdr_indicators.csv`](defender_xdr_indicators.csv) | 33 rows for Defender XDR bulk import |
| [`hunt.kql`](hunt.kql) | Defender XDR advanced hunting query |
| [`hunt.spl`](hunt.spl) | Splunk hunt over the CIM data models |
| [`hunt_raw.spl`](hunt_raw.spl) | Splunk hunt for data not mapped to CIM ([macros](../../../../all/splunk_macros.conf)) |
| [`hunt.yaral`](hunt.yaral) | Google SecOps YARA-L 2.0 detection rule |

Indicators by type: 13 domains, 13 SHA256, 7 IPv4, 3 other, 1 file name. See `iocs.csv` for full details and descriptions.

## MITRE ATT&CK

| ID | Technique |
|---|---|
| [T1608.006](https://attack.mitre.org/techniques/T1608/006/) | SEO Poisoning |
| [T1204.004](https://attack.mitre.org/techniques/T1204/004/) | Malicious Copy and Paste |
| [T1059.001](https://attack.mitre.org/techniques/T1059/001/) | PowerShell |
| [T1059.006](https://attack.mitre.org/techniques/T1059/006/) | Python |
| [T1053.005](https://attack.mitre.org/techniques/T1053/005/) | Scheduled Task |
| [T1036.004](https://attack.mitre.org/techniques/T1036/004/) | Masquerade Task or Service |
| [T1562.001](https://attack.mitre.org/techniques/T1562/001/) | Disable or Modify Tools |
| [T1497.001](https://attack.mitre.org/techniques/T1497/001/) | System Checks |
| [T1555.003](https://attack.mitre.org/techniques/T1555/003/) | Credentials from Web Browsers |
| [T1539](https://attack.mitre.org/techniques/T1539/) | Steal Web Session Cookie |
| [T1056.001](https://attack.mitre.org/techniques/T1056/001/) | Keylogging |
| [T1115](https://attack.mitre.org/techniques/T1115/) | Clipboard Data |
| [T1496.001](https://attack.mitre.org/techniques/T1496/001/) | Compute Hijacking |

## Recommended actions

1. Block choclatey.org, massgravel.net and the C2 domains (workerstats.net, pymons.is, datamons.org, niceer.net, supertrap.net and the newer failover domains), 209.99.186.187 and the published hashes, and search 90 days of DNS, proxy and EDR logs for them.
2. Hunt for the scheduled tasks SysCheck2, SysCheckX and SysHeal, any file under C:\Windows\SystemHealth\Update\, and conhost.exe --headless starting python.exe.
3. Check Microsoft Defender for exclusions of C:\Windows or xmrig.exe and remove them, and alert on browsers launched by Python with --remote-debugging-port=9222.
4. On a confirmed host, rebuild it, rotate browser-stored passwords, Discord sessions, SSH keys and password-manager master passwords, and move wallet funds to new seed phrases from a clean device.
5. Remind IT staff to copy install commands only from the official chocolatey.org and massgrave.dev sites.

## Behaviours to hunt

> Behaviours are leads, not confirmed indicators, and can match legitimate activity. Compare any hit against your own baseline and environment before acting.

1. **Alert** · SysCheck tasks or files in the fake SystemHealth folder\
   Look for: Scheduled tasks named SysCheck2, SysCheckX or SysHeal, or files written under C:\Windows\SystemHealth\Update\\
   Why it matters: Both the Zscaler and Seqrite builds install a portable Python 3.11 runtime into this fake system folder and persist with these task names. Neither the folder nor the tasks exist on a clean Windows install.\
   Log source: EDR process, file and scheduled-task events (DeviceProcessEvents, DeviceFileEvents, DeviceEvents), Windows 4698\
   Source: [Zscaler ThreatLabz](https://www.zscaler.com/blogs/security-research/seo-poisoning-campaign-delivers-new-armorsteal-malware https://www.seqrite.com/blog/armorsteal-unpacked-breaking-down-a-python-malware-kit-that-steals-data-and-mines-crypto/)

2. **Alert** · Headless console starting Python from SystemHealth\
   Look for: conhost.exe --headless starting python.exe or pythonw.exe from C:\Windows\SystemHealth\Update\
   Why it matters: SysCheck2 launches SysMon.py through a headless console so no window appears; Zscaler lists this as a detection opportunity.\
   Log source: EDR process events, Windows 4688 with command line\
   Source: [Zscaler ThreatLabz](https://www.zscaler.com/blogs/security-research/seo-poisoning-campaign-delivers-new-armorsteal-malware https://www.seqrite.com/blog/armorsteal-unpacked-breaking-down-a-python-malware-kit-that-steals-data-and-mines-crypto/)

3. **Alert** · Defender exclusion for C:\Windows or xmrig.exe\
   Look for: A Microsoft Defender exclusion for the whole C:\Windows folder or for xmrig.exe\
   Why it matters: Seqrite found xm_handler.py re-adding C:\Windows as an excluded path and xmrig.exe as an excluded process every minute, which hides the whole kit and survives cleanup.\
   Log source: EDR process and registry events (DeviceProcessEvents, DeviceRegistryEvents), Defender 5007\
   Source: [Seqrite Labs](https://www.seqrite.com/blog/armorsteal-unpacked-breaking-down-a-python-malware-kit-that-steals-data-and-mines-crypto/ https://www.zscaler.com/blogs/security-research/seo-poisoning-campaign-delivers-new-armorsteal-malware)

4. **Alert** · Python launching a browser with remote debugging on 9222\
   Look for: Chrome, Edge or Brave started with --remote-debugging-port=9222 by python.exe or pythonw.exe\
   Why it matters: The got.py stealer pulls cookies through the Chrome DevTools Protocol on port 9222; a browser launched with that flag by Python is a strong lead.\
   Log source: EDR process events\
   Source: [Zscaler ThreatLabz](https://www.zscaler.com/blogs/security-research/seo-poisoning-campaign-delivers-new-armorsteal-malware https://www.seqrite.com/blog/armorsteal-unpacked-breaking-down-a-python-malware-kit-that-steals-data-and-mines-crypto/)

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

- [Seqrite Labs – Armorsteal Unpacked: Breaking Down a Python Malware Kit That Steals Data and Mines Crypto](https://www.seqrite.com/blog/armorsteal-unpacked-breaking-down-a-python-malware-kit-that-steals-data-and-mines-crypto/)
- [Zscaler ThreatLabz – SEO Poisoning Campaign Delivers New Armorsteal Malware](https://www.zscaler.com/blogs/security-research/seo-poisoning-campaign-delivers-new-armorsteal-malware)
- [The Hacker News – ThreatsDay: 59 Linux Kernel Bugs, Falcon Spyware, GSocket Backdoors + 17 More Stories](https://thehackernews.com/2026/11/threatsday-59-linux-kernel-bugs-falcon.html)
- [Spamhaus – DROP list](https://www.spamhaus.org/drop/)

---

[Back to index](../../../../README.md#latest-threats)
