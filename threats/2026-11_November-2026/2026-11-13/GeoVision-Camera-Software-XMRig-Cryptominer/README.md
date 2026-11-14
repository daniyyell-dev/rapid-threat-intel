# GeoVision Camera Software Abused to Deploy XMRig Cryptominer

[Live entry](https://iocwatch.com/t/GeoVision-Camera-Software-XMRig-Cryptominer/) · [Back to index](../../../../README.md) · [November 2026](../../README.md) · [2026-11-13](../README.md)

| Published | First added | Last updated | Category | Indicators | Block now |
|---|---|---|---|---|---|
| 2026-11-13 | 2026-11-13 15:02 | 2026-11-13 | Exploitation / cryptomining | 12 | 8 |

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

Huntress, writing on 13 November 2026, says its SOC saw widespread malicious activity from internet-exposed GeoVision camera software between 8 and 10 November, across ten accounts and 13 organisations in various industries. Every case started with GeoStartupAgentService.exe, often running as SYSTEM, spawning a command shell that downloaded PowerShell scripts a, b and c from 45.32.117.34 (Vultr, Singapore). Those scripts checked for Defender, dropped a vulnerable signed driver (wsftprm.sys, written as kvckiller.sys) used to tamper with antivirus, and set IFEO Debugger values that redirect MsMpEng.exe, SecurityHealthService.exe and SecurityHealthSystray.exe to systray.exe. A further script fetched update.exe, a Golang loader that talks to 156.246.94.183 (AkileCloud, Tokyo; cctv-update.top, registered 7 November) using BitTorrent Mainline DHT and PKARR, creates scheduled tasks PackageUpdater (every 15 minutes) and PackageUpdater_Startup, and drops XMRig as ApplyUpdate.exe. The staging IP, loader IP, domain, PowerShell URLs and the published update.exe and PowerShell script hashes are on the block list, as hosts only. 2.59.133.151, which Huntress called the likely exploit source, is alert only because it sits on shared or reused dataforest hosting. The wsftprm.sys hash is alert only: it is a known signed Topaz Antifraud driver (CVE-2023-52271) still used by some banking software.

> [!WARNING]
> Do not block 2.59.133.151 (dataforest shared or reused hosting) or thisismy.cloud. Do not block the SHA256 of wsftprm.sys estate-wide without checking for legitimate Topaz Antifraud (Warsaw) software. Do not block BitTorrent DHT bootstrap nodes, PKARR relays, public DNS resolvers or shared mining pools. Block 45.32.117.34, 156.246.94.183 and cctv-update.top as listed hosts only, not the surrounding ranges or parent domains.

## Affected countries and sectors

- **Countries:** Not stated in the sources
- **Sectors:** Organizations with internet-exposed GeoVision camera software or management interfaces
- **Note:** Huntress saw the activity on ten accounts and 13 organisations across various industries between 8 and 10 November 2026. No countries were named. All cases started from publicly exposed GeoVision devices or management interfaces.
- **Source:** [Huntress – GeoVision Camera Software Exploited to Drop XMRig](https://www.huntress.com/blog/geovision-camera-software-xmrig-cryptominer)

## At a glance

| File | What it is |
|---|---|
| [`block_now.txt`](https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/threats/2026-11_November-2026/2026-11-13/GeoVision-Camera-Software-XMRig-Cryptominer/block_now.txt) (raw) | 8 high-confidence indicators to block now |
| [`iocs.csv`](iocs.csv) | All 12 indicators with description, confidence, action and source |
| [`defender_xdr_indicators.csv`](defender_xdr_indicators.csv) | 11 rows for Defender XDR bulk import |
| [`hunt.kql`](hunt.kql) | Defender XDR advanced hunting query |
| [`hunt.spl`](hunt.spl) | Splunk hunt over the CIM data models |
| [`hunt_raw.spl`](hunt_raw.spl) | Splunk hunt for data not mapped to CIM ([macros](../../../../all/splunk_macros.conf)) |
| [`hunt.yaral`](hunt.yaral) | Google SecOps YARA-L 2.0 detection rule |

Indicators by type: 3 IPv4, 3 URLs, 3 SHA256, 2 file names, 1 domain. See `iocs.csv` for full details and descriptions.

## MITRE ATT&CK

| ID | Technique |
|---|---|
| [T1190](https://attack.mitre.org/techniques/T1190/) | Exploit Public-Facing Application |
| [T1059.003](https://attack.mitre.org/techniques/T1059/003/) | Command and Scripting Interpreter: Windows Command Shell |
| [T1059.001](https://attack.mitre.org/techniques/T1059/001/) | Command and Scripting Interpreter: PowerShell |
| [T1053.005](https://attack.mitre.org/techniques/T1053/005/) | Scheduled Task/Job: Scheduled Task |
| [T1546.012](https://attack.mitre.org/techniques/T1546/012/) | Event Triggered Execution: Image File Execution Options Injection |
| [T1112](https://attack.mitre.org/techniques/T1112/) | Modify Registry |
| [T1562.001](https://attack.mitre.org/techniques/T1562/001/) | Impair Defenses: Disable or Modify Tools |
| [T1068](https://attack.mitre.org/techniques/T1068/) | Exploitation for Privilege Escalation |
| [T1105](https://attack.mitre.org/techniques/T1105/) | Ingress Tool Transfer |
| [T1568](https://attack.mitre.org/techniques/T1568/) | Dynamic Resolution |
| [T1496.001](https://attack.mitre.org/techniques/T1496/001/) | Resource Hijacking: Compute Hijacking |
| [T1608.001](https://attack.mitre.org/techniques/T1608/001/) | Stage Capabilities: Upload Malware |

## Recommended actions

1. Block 45.32.117.34, 156.246.94.183, cctv-update.top, the PowerShell staging URLs and the published update.exe and PowerShell script hashes, and search 90 days of proxy, DNS, firewall and EDR logs for them. Block those hosts only, not the surrounding ranges.
2. Take internet-facing GeoVision camera software and management interfaces off the public internet; put them behind a VPN or restrict them to trusted addresses.
3. Hunt GeoStartupAgentService.exe spawning cmd or PowerShell, IFEO Debugger values on MsMpEng.exe, SecurityHealthService.exe, SecurityHealthSystray.exe or MpCmdRun.exe, the scheduled tasks PackageUpdater and PackageUpdater_Startup, wsftprm.sys or kvckiller.sys loading from an unexpected path, and ApplyUpdate.exe with XMRig arguments.
4. On a confirmed host, isolate it, preserve evidence, remove the tasks and dropped files, clear the IFEO Debugger values, and investigate whether Defender was tampered with before returning the host to service.
5. Do not block 2.59.133.151, thisismy.cloud, public DNS resolvers, BitTorrent DHT bootstrap nodes, PKARR relays or shared mining pools, and do not block the wsftprm.sys hash estate-wide without checking for legitimate Topaz Antifraud software.

## Behaviours to hunt

> Behaviours are leads, not confirmed indicators, and can match legitimate activity. Compare any hit against your own baseline and environment before acting.

1. **Alert** · GeoStartupAgentService.exe spawning a shell or PowerShell\
   Look for: GeoStartupAgentService.exe spawning cmd.exe, PowerShell or pwsh.exe\
   Why it matters: Every intrusion Huntress saw started here: the exposed GeoVision service, often running as SYSTEM, spawned a command shell that launched PowerShell to download script a from 45.32.117.34. GeoStartupAgentService.exe has no ordinary reason to start cmd or PowerShell. Expected false positives are rare; a GeoVision support or update procedure that shells out would be the main one, and should still be reviewed.\
   Log source: Defender XDR DeviceProcessEvents; EDR process events\
   Source: [Huntress](https://www.huntress.com/blog/geovision-camera-software-xmrig-cryptominer)

2. **Alert** · wsftprm.sys or kvckiller.sys driver load or file\
   Look for: A driver load or file named wsftprm.sys or kvckiller.sys\
   Why it matters: Script b dropped kvckiller.sys, which VirusTotal identifies as the signed Topaz Antifraud driver wsftprm.sys, and used it as a BYOVD tool against Defender. The published hash is a known legitimate, if vulnerable, driver (CVE-2023-52271) still used by some banking antifraud deployments, so a load from a normal Topaz or Warsaw install path can be a false positive. Treat a load or write from a temp, user or unexpected path, or the filename kvckiller.sys, as a high-priority lead.\
   Log source: Defender XDR DeviceEvents (DriverLoad) and DeviceFileEvents; EDR driver and file events\
   Source: [Huntress](https://www.huntress.com/blog/geovision-camera-software-xmrig-cryptominer)

3. **Alert** · IFEO Debugger set on Microsoft Defender or Windows Security processes\
   Look for: IFEO Debugger values set on MsMpEng.exe, SecurityHealthService.exe, SecurityHealthSystray.exe or MpCmdRun.exe\
   Why it matters: The operators wrote Image File Execution Options Debugger values that redirected MsMpEng.exe, SecurityHealthService.exe and SecurityHealthSystray.exe to systray.exe, which can stop those Defender and Windows Security components starting. MpCmdRun.exe is included as the related Defender command-line process. A Debugger value under those keys, or an IFEO Debugger set to systray.exe, is not a normal administrative setting. Expected false positives are very rare; a legitimate debugger attached to those binaries should already be known to the estate.\
   Log source: Defender XDR DeviceRegistryEvents; Windows Registry auditing\
   Source: [Huntress](https://www.huntress.com/blog/geovision-camera-software-xmrig-cryptominer)

4. **Alert** · PackageUpdater task or update.exe from the systemprofile folder\
   Look for: Scheduled task PackageUpdater or PackageUpdater_Startup running update.exe, or update.exe launched from the systemprofile folder\
   Why it matters: On some hosts the loader created PackageUpdater, which runs C:\WINDOWS\system32\config\systemprofile\update.exe every 15 minutes, and PackageUpdater_Startup, which runs at system start as SYSTEM. The task names plus that systemprofile path are distinctive. update.exe in other folders is a common legitimate name and is not enough on its own.\
   Log source: Defender XDR DeviceEvents (ScheduledTaskCreated) and DeviceProcessEvents; Windows Security 4698; Task Scheduler operational log\
   Source: [Huntress](https://www.huntress.com/blog/geovision-camera-software-xmrig-cryptominer)

5. **Alert** · ApplyUpdate.exe launched with XMRig arguments\
   Look for: ApplyUpdate.exe launched with XMRig arguments\
   Why it matters: The loader dropped the XMRig miner as ApplyUpdate.exe. The filename alone can appear in legitimate updaters, so this hunt requires XMRig-style arguments such as --url, --user, --donate-level, --coin, --algo or a stratum+ address. Expected false positives are very rare.\
   Log source: Defender XDR DeviceProcessEvents; EDR process events\
   Source: [Huntress](https://www.huntress.com/blog/geovision-camera-software-xmrig-cryptominer)

Behaviours that map cleanly to log fields are included in [`hunt.kql`](hunt.kql) and [`hunt.spl`](hunt.spl), and alert behaviours in [`hunt.yaral`](hunt.yaral). The rest are listed in the Behaviours section above with where to look. Use behaviours to hunt and alert, never to block.

## Sources

- [Huntress – GeoVision Camera Software Exploited to Drop XMRig](https://www.huntress.com/blog/geovision-camera-software-xmrig-cryptominer)
- [URLhaus – 2.59.133.151 (prior unrelated malware-download listing)](https://urlhaus.abuse.ch/host/2.59.133.151/)
- [LOLDrivers – wsftprm.sys (Topaz Antifraud, CVE-2023-52271)](https://www.loldrivers.io/drivers/30e8d598-2c60-49e4-953b-a6f620da1371/)

---

[Back to index](../../../../README.md)
