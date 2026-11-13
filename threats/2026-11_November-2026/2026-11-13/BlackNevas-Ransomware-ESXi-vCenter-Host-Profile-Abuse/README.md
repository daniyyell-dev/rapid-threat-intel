# BlackNevas: Ransomware Wipes ESXi and vCenter Through Legitimate Management Features

[Live entry](https://daniyyell.com/rapid-threat-intel/t/BlackNevas-Ransomware-ESXi-vCenter-Host-Profile-Abuse/) · [Back to index](../../../../README.md) · [November 2026](../../README.md) · [2026-11-13](../README.md)

| Published | First added | Last updated | Category | Indicators | Block now |
|---|---|---|---|---|---|
| 2026-11-13 | 2026-11-13 20:22 | 2026-11-13 | Ransomware / hypervisor | 8 | 8 |

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

Kaspersky GERT describes a 10-day BlackNevas intrusion that destroyed four ESXi hosts, every VM on them, both vCenter Server Appliances and the backup estate without exploiting any VMware flaw. The operator reused stolen admin credentials to log in to vCenter, installed MeshAgent and a Ligolo-ng tunnel disguised as the systemd service vmware-vdma, then used a Host Profile change to switch on SSH (TSM-SSH) on the ESXi hosts and connected from the trusted vCenter address. Backup services were stopped and the backup servers encrypted first. The encryptor was uploaded by SFTP to /tmp, test-run with /selftest about three hours early, then run as esx64 /p /vmfs/ /depth 5 /wipe /allsys /detach, stopping all VMs within 23 seconds.

> [!WARNING]
> Kaspersky calls these indicators incident-specific: service names, file names, the domain and the VPS addresses can change. No hash exists for the ESXi encryptor or the Ligolo-ng binary.

## Affected countries and sectors

- **Countries:** Not stated in the sources
- **Sectors:** Not stated in the sources
- **Note:** Kaspersky does not name the victim, its country or sector. Any organisation running ESXi and vCenter is in scope.
- **Source:** [Kaspersky GERT (Securelist) – Ransomware at the hypervisor layer: how attackers use ESXi and vCenter features for malicious purposes](https://securelist.com/esxi-ransomware/121959/)

## At a glance

| File | What it is |
|---|---|
| [`block_now.txt`](https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/threats/2026-11_November-2026/2026-11-13/BlackNevas-Ransomware-ESXi-vCenter-Host-Profile-Abuse/block_now.txt) (raw) | 8 high-confidence indicators to block now |
| [`iocs.csv`](iocs.csv) | All 8 indicators with description, confidence, action and source |
| [`defender_xdr_indicators.csv`](defender_xdr_indicators.csv) | 8 rows for Defender XDR bulk import |
| [`hunt.kql`](hunt.kql) | Defender XDR advanced hunting query |
| [`hunt.spl`](hunt.spl) | Splunk hunt over the CIM data models |
| [`hunt_raw.spl`](hunt_raw.spl) | Splunk hunt for data not mapped to CIM ([macros](../../../../all/splunk_macros.conf)) |
| [`hunt.yaral`](hunt.yaral) | Google SecOps YARA-L 2.0 detection rule |

Indicators by type: 4 IPv4, 2 SHA256, 1 domain, 1 SHA1. See `iocs.csv` for full details and descriptions.

## MITRE ATT&CK

| ID | Technique |
|---|---|
| [T1078.002](https://attack.mitre.org/techniques/T1078/002/) | Domain Accounts |
| [T1021.004](https://attack.mitre.org/techniques/T1021/004/) | SSH |
| [T1219](https://attack.mitre.org/techniques/T1219/) | Remote Access Software |
| [T1543.002](https://attack.mitre.org/techniques/T1543/002/) | Systemd Service |
| [T1572](https://attack.mitre.org/techniques/T1572/) | Protocol Tunneling |
| [T1490](https://attack.mitre.org/techniques/T1490/) | Inhibit System Recovery |
| [T1486](https://attack.mitre.org/techniques/T1486/) | Data Encrypted for Impact |

## Recommended actions

1. Block the five network indicators and the three file hashes, and search 30 days of firewall, proxy and DNS logs for them, including traffic from vCenter and backup servers.
2. Alert on any executable run from /tmp on ESXi, on the vmware-vdma unit on a vCenter appliance, and on a vspbind Windows service.
3. Alert when a Host Profile change enables TSM-SSH and an SSH session to the same host follows within 15 minutes.
4. Treat vCenter as Tier 0: separate virtualisation and backup admin accounts from domain admins, forward ESXi and vCenter logs off-host, and keep execInstalledOnly on.

## Behaviours to hunt

> Behaviours are leads, not confirmed indicators, and can match legitimate activity. Compare any hit against your own baseline and environment before acting.

1. **Alert** · ESXi encryptor run from /tmp against /vmfs\
   Look for: An executable run from /tmp on an ESXi host with BlackNevas-style switches: /selftest, or /p /vmfs/ together with /wipe, /allsys or /detach\
   Why it matters: Kaspersky saw the encryptor uploaded to /tmp, made executable, test-run with ./tmp/esx64 /selftest about three hours before detonation, then run as ./tmp/esx64 /p /vmfs/ /depth 5 /wipe /allsys /detach. The forward-slash switches match SentinelOne's BlackNevas notes. Tuning: needs both the /tmp path and the switches. Expected false positives: none known; admins do not run binaries from /tmp against /vmfs. A /selftest hit is the pre-impact window to act.\
   Log source: ESXi shell.log forwarded by syslog\
   Source: [Kaspersky](https://securelist.com/esxi-ransomware/121959/)

2. **Alert** · Fake vmware-vdma tunnel service on vCenter\
   Look for: A systemd unit named vmware-vdma, or a service running /opt/vmware/bin/agent described as "DNS, time, VM settings sync", on a vCenter Server Appliance\
   Why it matters: The operator installed Ligolo-ng v0.8.2 as /etc/systemd/system/vmware-vdma.service with Restart=always, calling out to api.cloudvflare.com:443, about four hours after first SSH login, through MeshAgent. vmware-vdma is not a VMware service. Tuning: exact unit name and description. Expected false positives: none known; also compare all units under /etc/systemd/system against a clean VCSA build.\
   Log source: vCenter appliance syslog (systemd) and file checks of /etc/systemd/system\
   Source: [Kaspersky](https://securelist.com/esxi-ransomware/121959/)

3. **Alert** · vspbind remote-management service\
   Look for: A Windows service named vspbind (the operator's MeshAgent install)\
   Why it matters: Kaspersky lists vspbind as the Windows service for the remote-management agent in this intrusion. Tuning: exact service key name. Expected false positives: none known; check any hit for MeshAgent files and traffic to 45.149.154.135.\
   Log source: Defender XDR DeviceRegistryEvents; Windows 7045 or Sysmon 13 in Splunk or Google SecOps\
   Source: [Kaspersky](https://securelist.com/esxi-ransomware/121959/)

4. **Hunt** · Host Profile turns on SSH, then SSH from vCenter\
   Look for: A Host Profile change that sets TSM-SSH (or TSM) to running on an ESXi host outside a change window, followed within 15 minutes by an SSH login to that host from the vCenter or another management appliance\
   Why it matters: In this case the profile push came 10 minutes after the profile was read, SSH reached RUNNING 33 seconds later, and the next SSH session came from the vCenter IP. Each step is normal on its own; Kaspersky rates the sequence Critical. Tuning: join on the ESXi host, 15-minute window, exclude approved change windows. Expected false positives: planned maintenance that enables SSH through Host Profiles; check the change record.\
   Log source: vCenter Events and Tasks, ESXi vpxa.log, vobd.log, hostprofiletrace.log and auth.log\
   Source: [Kaspersky](https://securelist.com/esxi-ransomware/121959/)

Behaviours that map cleanly to log fields are included in [`hunt.kql`](hunt.kql) and [`hunt.spl`](hunt.spl), and alert behaviours in [`hunt.yaral`](hunt.yaral). The rest are listed in the Behaviours section above with where to look. Use behaviours to hunt and alert, never to block.

## Sources

- [Kaspersky GERT (Securelist) – Ransomware at the hypervisor layer: how attackers use ESXi and vCenter features for malicious purposes](https://securelist.com/esxi-ransomware/121959/)

---

[Back to index](../../../../README.md)
