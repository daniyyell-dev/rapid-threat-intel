# GhostFrame: ESXi Hypervisor Implant Linked to Settra Ransomware (TAG-218)

[Back to index](../../../../README.md#latest-threats) · [November 2026](../../README.md) · [2026-11-11](../README.md)

| Published | First added | Last updated | Category | Indicators | Block now |
|---|---|---|---|---|---|
| 2026-11-10 | 2026-11-11 07:54 | 2026-11-11 | Ransomware / hypervisor | 4 | 4 |

## Summary

Recorded Future's Insikt Group reports GhostFrame, a previously undocumented command-and-control and post-exploitation framework for compromised VMware ESXi hosts, used by TAG-218, a group whose activity overlaps with Settra ransomware. Between late August and October 2026 TAG-218 servers targeted VPN appliances in the US and Europe, mainly SonicWall, Palo Alto Networks and Fortinet, and four of the targeted organisations later appeared on the Settra leak site. GhostFrame needs existing root access on the hypervisor: its implant, vmhostd-core, runs from a datastore, persists through /etc/rc.local.d/local.sh, keeps disabling the ESXi firewall and unsigned-binary protection, and masquerades as vmhostd. Operators can list, power off and snapshot VMs, relay VNC sessions, tunnel the ESXi Host Client, pivot with the gfsox SOCKS5 proxy, and harvest Windows credentials from VM memory, disks and datastores with sdkmon and VMkatz. The implant tries six C2 ports at once (53, 2222, 3389, 4444, 8443 and 9443), which gives a distinctive network pattern.

## Affected countries and sectors

- **Countries:** United States (US)
- **Regions:** Europe
- **Sectors:** Not stated in the sources
- **Note:** VPN appliances of organisations in the US and Europe targeted between late August and October 2026; sectors not stated.
- **Source:** [Recorded Future Insikt Group - GhostFrame: A new ESXi Implant Linked to Settra Ransomware](https://www.recordedfuture.com/blog/ghostframe-esxi-implant-settra-ransomware)

## At a glance

| File | What it is |
|---|---|
| [`block_now.txt`](https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/threats/2026-11_November-2026/2026-11-11/GhostFrame-ESXi-Hypervisor-Implant-Settra-Ransomware/block_now.txt) (raw) | 4 high-confidence indicators to block now |
| [`iocs.csv`](iocs.csv) | All 4 indicators with description, confidence, action and source |
| [`defender_xdr_indicators.csv`](defender_xdr_indicators.csv) | 4 rows for Defender XDR bulk import |
| [`hunt.kql`](hunt.kql) | Defender XDR advanced hunting query |

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

## Hunt

Run this before blocking to find past activity.

1. Open [`hunt.kql`](hunt.kql) and copy the query.
2. In the [Microsoft Defender portal](https://security.microsoft.com), go to **Hunting > Advanced hunting** and paste it into a new query tab.
3. Select **Run query**. Results cover the last 30 days, one row per table, entity and indicator.

Non-network leads such as file names or URL paths are listed as comments at the end of the query. More in the [Defender XDR guide](../../../../docs/defender-xdr.md).

## Sources

- [Recorded Future Insikt Group - GhostFrame: A new ESXi Implant Linked to Settra Ransomware](https://www.recordedfuture.com/blog/ghostframe-esxi-implant-settra-ransomware)

---

[Back to index](../../../../README.md#latest-threats)
