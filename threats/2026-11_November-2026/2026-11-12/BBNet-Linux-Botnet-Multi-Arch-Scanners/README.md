# BBNet: Multi-Architecture Linux Botnet with Divergent Scanners

[Live entry](https://daniyyell.com/rapid-threat-intel/t/BBNet-Linux-Botnet-Multi-Arch-Scanners/) · [Back to index](../../../../README.md) · [November 2026](../../README.md) · [2026-11-12](../README.md)

| Published | First added | Last updated | Category | Indicators | Block now |
|---|---|---|---|---|---|
| 2026-11-05 | 2026-11-12 15:11 | 2026-11-12 | Malware / botnet | 8 | 0 |

## Hunt

Run one of these to find past activity. Each file is the same hunt written for a different platform; pick the one for your SIEM or XDR.

| File | Platform | How to run it |
|---|---|---|
| [`hunt.kql`](hunt.kql) | Microsoft Defender XDR | In the [Defender portal](https://security.microsoft.com), open **Hunting > Advanced hunting**, paste the query and select **Run query**. It covers the last 30 days. |
| [`hunt.spl`](hunt.spl) | Splunk | In **Search & Reporting**, set the time picker to the last 30 days or more, paste the search and run it. It reads the CIM data models. |
| [`hunt_raw.spl`](hunt_raw.spl) | Splunk without CIM | The same hunt over raw events. Define the `rti_*` macros from [`splunk_macros.conf`](../../../../all/splunk_macros.conf) first. |
| [`hunt.yaral`](hunt.yaral) | Google SecOps | In **Detection > Rules & Detections > Rules Editor**, paste the rule, run a Retrohunt over the last 30 days, then turn on live mode. |

Leads that are not network or hash indicators are in [`iocs.csv`](iocs.csv), and behaviours with no clean field mapping are in the Behaviours section below. Guides: [Defender XDR](../../../../docs/defender-xdr.md), [Splunk](../../../../docs/splunk.md), [Google SecOps](../../../../docs/google-secops.md).

## Summary

PRODAFT's Threat Intelligence team, in a report dated 5 November 2026 and summarised publicly on 12 November by Security Online, analysed a 13.65 MB package recovered from an open directory and labelled the family BBNet. The archive holds a loader named infect.sh and 13 statically linked ELF binaries for ARM, AArch64, x86, MIPS and PowerPC (10 unique SHA-256 hashes; three filename pairs are byte-identical). After a double fork the implant copies itself to /etc, /var/lib or /tmp as .bbnet, writes @reboot entries in /etc/crontab and /etc/rc.local, and starts scanning before it ever registers with its controller, so blocking the C2 will not stop propagation. The x86-64 build brute-forces Telnet on TCP 23 and 2323; the other builds add 11 exploit handlers, including React Server Components CVE-2025-55182 and GNU Inetutils telnetd CVE-2026-24061, plus Hikvision, D-Link, Netgear, GPON, Huawei and Realtek flaws. Default C2 is plaintext TCP port 7778, with HTTP updates on port 7779; both can be changed at runtime. PRODAFT did not publish C2 addresses or file hashes in the public coverage, and the recovered package had no victim telemetry, so this entry is behaviours and file-name leads only. Patch the two CVEs, disable exposed Telnet, and hunt the .bbnet artefacts.

> [!WARNING]
> No C2 addresses or SHA-256 hashes were published in the public write-up of PRODAFT's report. File names such as infect.sh are generic; pair them with .bbnet artefacts. Ports 7778 and 7779 are defaults only and are not unique enough to block.

## Affected countries and sectors

- **Countries:** Not stated in the sources
- **Sectors:** Internet-facing Linux hosts, Routers and network cameras, React Server Components deployments
- **Note:** PRODAFT recovered the package from an open directory and published no victim telemetry; the scanners target Linux hosts, routers, cameras and React Server Components across ARM, AArch64, x86, MIPS and PowerPC.
- **Source:** [Security Online – Multi-Architecture BBNet Linux Botnet Pairs Divergent Scanners With React and Telnet Exploits](https://securityonline.info/bbnet-linux-botnet-scanners-ddos/)

## At a glance

| File | What it is |
|---|---|
| [`block_now.txt`](https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/threats/2026-11_November-2026/2026-11-12/BBNet-Linux-Botnet-Multi-Arch-Scanners/block_now.txt) (raw) | None yet: no indicator is high-confidence enough to block, so use the files below to hunt |
| [`iocs.csv`](iocs.csv) | All 8 indicators with description, confidence, action and source |
| [`hunt.kql`](hunt.kql) | Defender XDR advanced hunting query |
| [`hunt.spl`](hunt.spl) | Splunk hunt over the CIM data models |
| [`hunt_raw.spl`](hunt_raw.spl) | Splunk hunt for data not mapped to CIM ([macros](../../../../all/splunk_macros.conf)) |
| [`hunt.yaral`](hunt.yaral) | Google SecOps YARA-L 2.0 detection rule |

Indicators by type: 8 file names. See `iocs.csv` for full details and descriptions.

## MITRE ATT&CK

| ID | Technique |
|---|---|
| [T1110](https://attack.mitre.org/techniques/T1110/) | Brute Force |
| [T1190](https://attack.mitre.org/techniques/T1190/) | Exploit Public-Facing Application |
| [T1105](https://attack.mitre.org/techniques/T1105/) | Ingress Tool Transfer |
| [T1053.003](https://attack.mitre.org/techniques/T1053/003/) | Cron |
| [T1037](https://attack.mitre.org/techniques/T1037/) | Boot or Logon Initialization Scripts |
| [T1498](https://attack.mitre.org/techniques/T1498/) | Network Denial of Service |

## Recommended actions

1. Hunt Linux and embedded hosts for hidden .bbnet binaries under /tmp, /var/lib and /etc, and for .bbnet.new, .bbnet_scan_on and .bbnet_scan.stats.
2. Audit /etc/crontab and /etc/rc.local for unauthorised @reboot entries that launch .bbnet, and remove the binary and its persistence together; a C2 block alone will not stop the scanner child.
3. Patch React Server Components (CVE-2025-55182) and GNU Inetutils telnetd (CVE-2026-24061), and disable exposed Telnet on ports 23 and 2323.
4. Review firewall and NetFlow for bursts of Telnet authentication to 23/2323 and for processes named .bbnet connecting to TCP 7778 or HTTP 7779; do not block those ports globally.

## Behaviours to hunt

> Behaviours are leads, not confirmed indicators, and can match legitimate activity. Compare any hit against your own baseline and environment before acting.

1. **Hunt** · Telnet brute force on TCP 23 and 2323\
   Look for: Telnet brute force against TCP ports 23 and 2323, including a SHELL_TEST echo check after a guessed credential\
   Why it matters: The x86-64 BBNet build scans local /24 subnets on TCP 23 and 2323 with 20 credential pairs; the expanded scanner in the other builds uses 45 pairs. Blocking the C2 does not stop this pre-registration scanning.\
   Log source: Firewall, IDS, honeypot and Linux endpoint network logs; Defender XDR DeviceNetworkEvents\
   Source: [Security Online](https://securityonline.info/bbnet-linux-botnet-scanners-ddos/)

2. **Hunt** · CVE-2025-55182 or CVE-2026-24061 exploitation, or infect.sh fetch\
   Look for: Exploitation attempts against React Server Components CVE-2025-55182 or GNU Inetutils telnetd CVE-2026-24061, or a follow-on fetch of infect.sh\
   Why it matters: The expanded BBNet scanner includes 11 exploit handlers, among them CVE-2025-55182 (React Server Components multipart deserialisation) and CVE-2026-24061 (telnetd NEW-ENVIRON argument injection), plus Hikvision, D-Link, Netgear, GPON, Huawei and Realtek flaws. The HTTP helper marks a 'hit' as soon as the request is sent, so internal counts overstate successful exploitation. No unique exploit payload was published.\
   Log source: Web, WAF and Telnet service logs; Defender XDR DeviceNetworkEvents and DeviceProcessEvents on Linux hosts\
   Source: [Security Online](https://securityonline.info/bbnet-linux-botnet-scanners-ddos/)

3. **Alert** · crontab or rc.local persistence launching .bbnet\
   Look for: New @reboot or similar entries in /etc/crontab or /etc/rc.local that launch a hidden .bbnet binary, without preserving a runtime C2 argument\
   Why it matters: After a double fork, BBNet writes reboot entries into /etc/crontab and /etc/rc.local. Those entries omit runtime server arguments, so a restarted implant falls back to its compiled default C2.\
   Log source: Linux file integrity, auditd and Defender XDR DeviceFileEvents or DeviceProcessEvents\
   Source: [Security Online](https://securityonline.info/bbnet-linux-botnet-scanners-ddos/)

4. **Alert** · Hidden .bbnet ELF drops and scanner state files\
   Look for: Multi-architecture ELF drops in /tmp, /var/tmp, /dev/shm or /var/run, saved as .b and then copied to /etc, /var/lib or /tmp as .bbnet, plus .bbnet.new, .bbnet_scan_on or .bbnet_scan.stats\
   Why it matters: infect.sh pulls 13 architecture binaries (ARM, AArch64, x86, MIPS and PowerPC; 10 unique SHA-256 hashes, unpublished in the public write-up), saves each candidate as .b, and runs it without checking the host CPU. The running implant then copies itself to .bbnet.\
   Log source: Defender XDR DeviceFileEvents on Linux hosts; file integrity monitoring\
   Source: [Security Online](https://securityonline.info/bbnet-linux-botnet-scanners-ddos/)

5. **Hunt** · Default C2 on TCP 7778 or updates on 7779 from .bbnet\
   Look for: Outbound plaintext TCP to port 7778 with a registration string, or HTTP to port 7779 for 16-character build markers, especially from a process whose image is .bbnet\
   Why it matters: After starting its scanner, the parent process connects to a default C2 port 7778 and sends a registration string (a random 24-character hex ID, architecture, OS, hostname and version). An HTTP updater checks port 7779. Both ports can be changed at runtime, and no C2 address was published.\
   Log source: Firewall, NetFlow and Defender XDR DeviceNetworkEvents on Linux hosts\
   Source: [Security Online](https://securityonline.info/bbnet-linux-botnet-scanners-ddos/)

Behaviours that map cleanly to log fields are included in [`hunt.kql`](hunt.kql) and [`hunt.spl`](hunt.spl), and alert behaviours in [`hunt.yaral`](hunt.yaral). The rest are listed in the Behaviours section above with where to look. Use behaviours to hunt and alert, never to block.

## Sources

- [Security Online – Multi-Architecture BBNet Linux Botnet Pairs Divergent Scanners With React and Telnet Exploits](https://securityonline.info/bbnet-linux-botnet-scanners-ddos/)

---

[Back to index](../../../../README.md)
