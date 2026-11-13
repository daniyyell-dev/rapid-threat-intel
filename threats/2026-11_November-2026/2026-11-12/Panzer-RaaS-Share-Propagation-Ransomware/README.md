# Panzer RaaS: Self-Propagating Ransomware Spread Through Network Shares

[Back to index](../../../../README.md) · [November 2026](../../README.md) · [2026-11-12](../README.md)

| Published | First added | Last updated | Category | Indicators | Block now |
|---|---|---|---|---|---|
| 2026-11-11 | 2026-11-12 12:25 | 2026-11-12 | Ransomware | 5 | 0 |

## Summary

Cynet's CyOps team analysed the Windows payload of Panzer, a ransomware-as-a-service operation first seen in August 2026 that has listed 46 victims in 20 countries, most of them in the European Union. One run of the Rust binary does the whole job: it runs net view to list hosts in the domain and then their shares, copies itself as panzer.exe into every reachable share, creates a scheduled task named PanzerUpdateTask on each remote host with schtasks /CREATE /S and fires it with schtasks /RUN. It then encrypts the local machine, appending .LOCKED, drops the Recovery.md ransom note, sets Panzer.jpg from the Temp folder as the wallpaper, and runs panzer.bat to delete itself. The note threatens GDPR complaints to regulators and blackmail of the victim's customers. No hashes or network indicators have been published, so this entry is hunt and alert only.

> [!WARNING]
> Cynet published behaviour and file names but no hashes or network indicators, and FortiGuard notes that no Panzer indicator has yet been confirmed by a second source. Everything here is alert or hunt only. The .LOCKED extension and the Recovery.md note name are used by other families, so pair them with the Panzer-specific names.

## Affected countries and sectors

- **Countries:** Italy (IT)
- **Regions:** Europe
- **Sectors:** Manufacturing, Telecommunications, Multiple sectors
- **Note:** Cynet counts 46 Panzer victims in 20 countries, most of them in the European Union; Cyware reported Italian manufacturing and telecommunications victims. Halcyon says the group avoids the United States so far.
- **Source:** [Cynet – Panzer ransomware spreads itself across network shares, then deletes the evidence](https://www.cynet.com/blog/panzer-ransomware-spreads-itself-across-network-shares-then-deletes-the-evidence/)

## At a glance

| File | What it is |
|---|---|
| [`block_now.txt`](https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/threats/2026-11_November-2026/2026-11-12/Panzer-RaaS-Share-Propagation-Ransomware/block_now.txt) (raw) | None yet: no indicator is high-confidence enough to block, so use the files below to hunt |
| [`iocs.csv`](iocs.csv) | All 5 indicators with description, confidence, action and source |
| [`hunt.kql`](hunt.kql) | Defender XDR advanced hunting query |
| [`hunt.spl`](hunt.spl) | Splunk hunt over the CIM data models |
| [`hunt_raw.spl`](hunt_raw.spl) | Splunk hunt for data not mapped to CIM ([macros](../../../../all/splunk_macros.conf)) |
| [`hunt.yaral`](hunt.yaral) | Google SecOps YARA-L 2.0 detection rule |

Indicators by type: 4 file names, 1 other. See `iocs.csv` for full details and descriptions.

## MITRE ATT&CK

| ID | Technique |
|---|---|
| [T1018](https://attack.mitre.org/techniques/T1018/) | Remote System Discovery |
| [T1135](https://attack.mitre.org/techniques/T1135/) | Network Share Discovery |
| [T1570](https://attack.mitre.org/techniques/T1570/) | Lateral Tool Transfer |
| [T1053.005](https://attack.mitre.org/techniques/T1053/005/) | Scheduled Task |
| [T1497.003](https://attack.mitre.org/techniques/T1497/003/) | Time Based Evasion |
| [T1622](https://attack.mitre.org/techniques/T1622/) | Debugger Evasion |
| [T1486](https://attack.mitre.org/techniques/T1486/) | Data Encrypted for Impact |
| [T1491.001](https://attack.mitre.org/techniques/T1491/001/) | Internal Defacement |
| [T1070.004](https://attack.mitre.org/techniques/T1070/004/) | File Deletion |

## Recommended actions

1. Alert on any scheduled task named PanzerUpdateTask and on panzer.exe or panzer.bat anywhere, including network shares.
2. Hunt for workstations running net view against many hosts in a short time, and for schtasks /CREATE or /RUN with /S from machines that do not normally administer other hosts.
3. Watch file servers for a new executable written to many shares by one account, followed by remote scheduled tasks that run it.
4. Remove write access to shares for standard users where it is not needed, and require phishing-resistant MFA on remote gateways (the only documented Panzer access path is a gateway without MFA).

## Behaviours to hunt

> Behaviours are leads, not confirmed indicators, and can match legitimate activity. Compare any hit against your own baseline and environment before acting.

1. **Alert** · PanzerUpdateTask, panzer.exe or panzer.bat\
   Look for: A scheduled task named PanzerUpdateTask, or panzer.exe, panzer.bat or Panzer.jpg on a host or share\
   Why it matters: Panzer copies itself as panzer.exe into every share, runs it remotely through the PanzerUpdateTask task, sets Panzer.jpg from Temp as the wallpaper after encryption, and deletes itself with panzer.bat.\
   Log source: EDR process, file and registry events; Task Scheduler 4698; file-server audit logs\
   Source: [Cynet](https://www.cynet.com/blog/panzer-ransomware-spreads-itself-across-network-shares-then-deletes-the-evidence/)

2. **Hunt** · Remote schtasks create or run\
   Look for: schtasks /CREATE or /RUN against a remote host (/S) from a workstation that does not normally administer other machines\
   Why it matters: Panzer needs no lateral-movement toolkit: it uses schtasks with /S to create and immediately run a task on each remote host. The same pattern is used by other ransomware, so it is a hunt lead rather than proof.\
   Log source: EDR process events; Task Scheduler 4698 on the target\
   Source: [Cynet](https://www.cynet.com/blog/panzer-ransomware-spreads-itself-across-network-shares-then-deletes-the-evidence/)

3. **Hunt** · net view bursts\
   Look for: Bursts of net view from one workstation against many hosts\
   Why it matters: Panzer lists domain hosts with net view and then runs net view against each one to find shares. Many net view commands from one user workstation in minutes is unusual.\
   Log source: EDR process events\
   Source: [Cynet](https://www.cynet.com/blog/panzer-ransomware-spreads-itself-across-network-shares-then-deletes-the-evidence/)

4. **Hunt** · Self-deleting cleanup batch file\
   Look for: A batch file that deletes an executable in a loop and then deletes itself\
   Why it matters: Panzer's last step runs panzer.bat, which deletes the ransomware binary, checks each second until it is gone, then removes itself to leave less for responders.\
   Log source: EDR process events\
   Source: [Cynet](https://www.cynet.com/blog/panzer-ransomware-spreads-itself-across-network-shares-then-deletes-the-evidence/)

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

- [Cynet – Panzer ransomware spreads itself across network shares, then deletes the evidence](https://www.cynet.com/blog/panzer-ransomware-spreads-itself-across-network-shares-then-deletes-the-evidence/)
- [Halcyon – Panzer threat group profile (background)](https://www.halcyon.ai/threat-group/panzer)
- [FortiGuard Labs – Panzer threat actor profile (background)](https://fortiguard.fortinet.com/threat-actor/6570/panzer)

---

[Back to index](../../../../README.md)
