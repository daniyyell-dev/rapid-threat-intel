# GhostFrame: ESXi Hypervisor Implant Linked to Settra Ransomware (TAG-218)

[Live entry](https://iocwatch.com/t/GhostFrame-ESXi-Hypervisor-Implant-Settra-Ransomware/) · [Back to index](../../../../README.md) · [November 2026](../../README.md) · [2026-11-11](../README.md)

| Published | First added | Last updated | Category | Indicators | Block now |
|---|---|---|---|---|---|
| 2026-11-10 | 2026-11-11 07:54 | 2026-11-11 | Ransomware / hypervisor | 4 | 4 |

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

Recorded Future's Insikt Group reports GhostFrame, a previously undocumented command-and-control and post-exploitation framework for compromised VMware ESXi hosts, used by TAG-218, a group whose activity overlaps with Settra ransomware. Between late August and October 2026 TAG-218 servers targeted VPN appliances in the US and Europe, mainly SonicWall, Palo Alto Networks and Fortinet, and four of the targeted organisations later appeared on the Settra leak site. GhostFrame needs existing root access on the hypervisor: its implant, vmhostd-core, runs from a datastore, persists through /etc/rc.local.d/local.sh, keeps disabling the ESXi firewall and unsigned-binary protection, and masquerades as vmhostd. Operators can list, power off and snapshot VMs, relay VNC sessions, tunnel the ESXi Host Client, pivot with the gfsox SOCKS5 proxy, and harvest Windows credentials from VM memory, disks and datastores with sdkmon and VMkatz. The implant tries six C2 ports at once (53, 2222, 3389, 4444, 8443 and 9443), which gives a distinctive network pattern.

## Affected countries and sectors

- **Countries:** United States (US)
- **Regions:** Europe
- **Sectors:** Not stated in the sources
- **Note:** VPN appliances of organisations in the US and Europe targeted between late August and October 2026; sectors not stated.
- **Source:** [Recorded Future Insikt Group – GhostFrame: A new ESXi Implant Linked to Settra Ransomware](https://www.recordedfuture.com/blog/ghostframe-esxi-implant-settra-ransomware)

## At a glance

| File | What it is |
|---|---|
| [`block_now.txt`](https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/threats/2026-11_November-2026/2026-11-11/GhostFrame-ESXi-Hypervisor-Implant-Settra-Ransomware/block_now.txt) (raw) | 4 high-confidence indicators to block now |
| [`iocs.csv`](iocs.csv) | All 4 indicators with description, confidence, action and source |
| [`defender_xdr_indicators.csv`](defender_xdr_indicators.csv) | 4 rows for Defender XDR bulk import |
| [`hunt.kql`](hunt.kql) | Defender XDR advanced hunting query |
| [`hunt.spl`](hunt.spl) | Splunk hunt over the CIM data models |
| [`hunt_raw.spl`](hunt_raw.spl) | Splunk hunt for data not mapped to CIM ([macros](../../../../all/splunk_macros.conf)) |
| [`hunt.yaral`](hunt.yaral) | Google SecOps YARA-L 2.0 detection rule |

Indicators by type: 3 IPv4, 1 SHA256. See `iocs.csv` for full details and descriptions.

## MITRE ATT&CK

| ID | Technique |
|---|---|
| [T1133](https://attack.mitre.org/techniques/T1133/) | External Remote Services |
| [T1190](https://attack.mitre.org/techniques/T1190/) | Exploit Public-Facing Application |
| [T1037](https://attack.mitre.org/techniques/T1037/) | Boot or Logon Initialization Scripts |
| [T1562.004](https://attack.mitre.org/techniques/T1562/004/) | Disable or Modify System Firewall |
| [T1036](https://attack.mitre.org/techniques/T1036/) | Masquerading |
| [T1090](https://attack.mitre.org/techniques/T1090/) | Proxy |
| [T1003](https://attack.mitre.org/techniques/T1003/) | OS Credential Dumping |
| [T1219](https://attack.mitre.org/techniques/T1219/) | Remote Access Software |
| [T1486](https://attack.mitre.org/techniques/T1486/) | Data Encrypted for Impact |

## Recommended actions

1. Block the two GhostFrame C2 addresses and the MeshCentral server, and search 30 days of firewall and proxy logs for connections from ESXi management addresses and VPN appliances to them.
2. Alert when one host opens near-simultaneous connections to the same external IP on ports 53, 2222, 3389, 4444, 8443 and 9443.
3. On every ESXi host, check /etc/rc.local.d/local.sh and /opt for vmhostd-core, confirm the firewall is enabled and execInstalledOnly is set, and look for unexpected snapshots or VNC enabled on VMs.
4. Patch and review SonicWall, Palo Alto Networks and Fortinet VPN appliances, keep ESXi management off the internet and rotate credentials for accounts on VMs hosted on an affected hypervisor.

## Behaviours to hunt

> Behaviours are leads, not confirmed indicators, and can match legitimate activity. Compare any hit against your own baseline and environment before acting.

1. **Alert** · One host trying six C2 ports at once\
   Look for: One host opening near-simultaneous TCP connections to the same external IP on ports 53, 2222, 3389, 4444, 8443 and 9443, retried every 5 to 12 seconds\
   Why it matters: GhostFrame tries all six ports at once and keeps the first that answers. The pattern survives C2 rotation.\
   Log source: Firewall, NetFlow or EDR network events from ESXi management addresses\
   Source: [Recorded Future](https://www.recordedfuture.com/blog/ghostframe-esxi-implant-settra-ransomware)

2. **Alert** · GhostFrame persistence on ESXi\
   Look for: Changes to /etc/rc.local.d/local.sh, a file at /opt/vmhostd-core, or a process named vmhostd (not vmware-hostd)\
   Why it matters: GhostFrame persists by copying itself to /opt/vmhostd-core and editing local.sh, then disguises its process name as vmhostd.\
   Log source: ESXi shell.log and syslog, host file checks\
   Source: [Recorded Future](https://www.recordedfuture.com/blog/ghostframe-esxi-implant-settra-ransomware)

3. **Alert** · ESXi firewall disabled again and again\
   Look for: The ESXi firewall being disabled (esxcli network firewall set --enabled false) or execInstalledOnly set to 0, again and again\
   Why it matters: The implant re-disables both controls about every five seconds. Re-enabling them is not enough; find the persistence.\
   Log source: ESXi shell.log, hostd.log and syslog\
   Source: [Recorded Future](https://www.recordedfuture.com/blog/ghostframe-esxi-implant-settra-ransomware)

4. **Hunt** · VNC, snapshot and tunnel activity on ESXi\
   Look for: VNC enabled on VMs, unexpected snapshots or power changes, and the ESXi Host Client reached through an unusual tunnel\
   Why it matters: GhostFrame operators snapshot VMs to harvest credentials with VMkatz and relay VNC sessions to the guests.\
   Log source: ESXi and vCenter events\
   Source: [Recorded Future](https://www.recordedfuture.com/blog/ghostframe-esxi-implant-settra-ransomware)

Behaviours that map cleanly to log fields are included in [`hunt.kql`](hunt.kql) and [`hunt.spl`](hunt.spl), and alert behaviours in [`hunt.yaral`](hunt.yaral). The rest are listed in the Behaviours section above with where to look. Use behaviours to hunt and alert, never to block.

## Sources

- [Recorded Future Insikt Group – GhostFrame: A new ESXi Implant Linked to Settra Ransomware](https://www.recordedfuture.com/blog/ghostframe-esxi-implant-settra-ransomware)

---

[Back to index](../../../../README.md)
