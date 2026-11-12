# GSocket Linux Web-Server C2

[Back to index](../../../../README.md#latest-threats) · [November 2026](../../README.md) · [2026-11-12](../README.md)

| Published | First added | Last updated | Category | Indicators | Block now |
|---|---|---|---|---|---|
| 2026-11-11 | 2026-11-12 09:50 | 2026-11-12 | Post-exploitation / Linux C2 | 9 | 0 |

## Summary

Microsoft Threat Intelligence reports that threat actors have been deploying GSocket, a legitimate open-source relay tool, as stealthy command and control on compromised Linux web servers after internet-facing application breaches. The host and the operator each connect outbound to the public Global Socket Relay Network, so there is no attacker-owned IP address or domain to block. Operators stage gs-netcat under /dev/shm, persist as systemd-remount-d or /usr/bin/defunct, launch the payload with a kernel-thread-like argument-zero name such as [kaluad], and timestomp the files. The four SHA-256 hashes below were published by Microsoft and are medium confidence: they appear as BlockAndRemediate in the Defender import file, not on the high-confidence block-now list. Do not block gsocket.io, cdn.gsocket.io, gsgg.b-cdn.net or the public relay; hunt web-server processes that retrieve or install GSocket instead. Sansec has independently described the same class of GSocket web-server abuse.

> [!WARNING]
> GSocket is a legitimate project also used by administrators. Do not block gsocket.io, its CDN, or the public Global Socket Relay Network. Hashes and paths are medium confidence (Microsoft).

## Affected countries and sectors

- **Countries:** Not stated in the sources
- **Regions:** Global
- **Sectors:** Hosting, Internet-facing web applications
- **Note:** Microsoft observed GSocket deployments on compromised Linux web servers after internet-facing application breaches, concentrated in web applications and hosting environments. Specific victim organisations were not named.
- **Source:** [Microsoft Threat Intelligence – Global Socket: how threat actors are weaponizing GSocket for stealthy C2](https://www.microsoft.com/en-us/security/blog/2026/11/11/global-socket-how-threat-actors-weaponizing-gsocket-stealthy-c2/)

## At a glance

| File | What it is |
|---|---|
| [`block_now.txt`](https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/threats/2026-11_November-2026/2026-11-12/GSocket-Linux-Web-Server-C2/block_now.txt) (raw) | None yet: no indicator is high-confidence enough to block, so use the files below to hunt |
| [`iocs.csv`](iocs.csv) | All 9 indicators with description, confidence, action and source |
| [`defender_xdr_indicators.csv`](defender_xdr_indicators.csv) | 9 rows for Defender XDR bulk import |
| [`hunt.kql`](hunt.kql) | Defender XDR advanced hunting query |
| [`hunt.spl`](hunt.spl) | Splunk hunt over the CIM data models |
| [`hunt_raw.spl`](hunt_raw.spl) | Splunk hunt for data not mapped to CIM ([macros](../../../../all/splunk_macros.conf)) |
| [`hunt.yaral`](hunt.yaral) | Google SecOps YARA-L 2.0 detection rule |

Indicators by type: 5 file names, 4 SHA256. See `iocs.csv` for full details and descriptions.

## MITRE ATT&CK

| ID | Technique |
|---|---|
| [T1190](https://attack.mitre.org/techniques/T1190/) | Exploit Public-Facing Application |
| [T1105](https://attack.mitre.org/techniques/T1105/) | Ingress Tool Transfer |
| [T1059.004](https://attack.mitre.org/techniques/T1059/004/) | Unix Shell |
| [T1036.005](https://attack.mitre.org/techniques/T1036/005/) | Match Legitimate Name or Location |
| [T1543.002](https://attack.mitre.org/techniques/T1543/002/) | Systemd Service |
| [T1053.003](https://attack.mitre.org/techniques/T1053/003/) | Cron |
| [T1070.006](https://attack.mitre.org/techniques/T1070/006/) | Timestomp |
| [T1090.002](https://attack.mitre.org/techniques/T1090/002/) | External Proxy |
| [T1573](https://attack.mitre.org/techniques/T1573/) | Encrypted Channel |

## Recommended actions

1. Import the four GSocket SHA-256 hashes in Defender XDR at medium confidence, and hunt 30 days of endpoint logs for them and for the listed file paths.
2. Hunt internet-facing Linux web servers for web-server processes (nginx, httpd, php-fpm, java, node) running curl or bash against gsocket.io, files under /dev/shm/.gs-*, systemd-remount-d, /usr/bin/defunct and defunct.service. Do not block gsocket.io or the public relay.
3. Look for bash exec -a launching a payload as [kaluad] or another kernel-thread-like name, chmod 700 on /usr/bin/defunct, and touch used to timestomp those files.
4. If confirmed, remove the relay client and its persistence, rotate credentials reachable from the host, and verify that outbound sessions to the relay have stopped. Patching the original web-app flaw does not remove GSocket.

## Behaviours to hunt

> Behaviours are leads, not confirmed indicators, and can match legitimate activity. Compare any hit against your own baseline and environment before acting.

1. **Alert** · Web server retrieving GSocket from gsocket.io\
   Look for: A web-server process running curl or bash against gsocket.io, including /y or /install.sh\
   Why it matters: Microsoft saw compromised web applications retrieve and install GSocket from the legitimate project site. Do not block gsocket.io; hunt the process ancestry.\
   Log source: EDR process events on internet-facing Linux web servers\
   Source: [Microsoft](https://www.microsoft.com/en-us/security/blog/2026/11/11/global-socket-how-threat-actors-weaponizing-gsocket-stealthy-c2/)

2. **Alert** · GSocket staging under /dev/shm or .gsn_ora\
   Look for: Files under /dev/shm/.gs-* or named gs-netcat_mini-linux-x86_64, gs-netcat_mini-linux-aarch64 or .gsn_ora\
   Why it matters: Microsoft observed GSocket clients staged under /dev/shm/.gs-0/ and a .gsn_ora staging file under /tmp.\
   Log source: EDR file events on Linux servers\
   Source: [Microsoft](https://www.microsoft.com/en-us/security/blog/2026/11/11/global-socket-how-threat-actors-weaponizing-gsocket-stealthy-c2/)

3. **Alert** · GSocket persistence as systemd-remount-d or defunct\
   Look for: A systemd-remount-d binary, /usr/bin/defunct, or a defunct.service unit\
   Why it matters: Microsoft observed GSocket persisted as systemd-remount-d or /usr/bin/defunct, with a defunct.service unit and a multi-user.target.wants link.\
   Log source: EDR file, process and systemd events on Linux servers\
   Source: [Microsoft](https://www.microsoft.com/en-us/security/blog/2026/11/11/global-socket-how-threat-actors-weaponizing-gsocket-stealthy-c2/)

4. **Hunt** · exec -a [kaluad] or timestomp of defunct\
   Look for: bash using exec -a to present a payload as [kaluad], or chmod 700 and touch against /usr/bin/defunct or defunct.service\
   Why it matters: Microsoft saw bash exec -a launch /usr/bin/defunct with the argument-zero name [kaluad], then chmod 700 and touch used to hide the payload.\
   Log source: EDR process events on Linux servers\
   Source: [Microsoft](https://www.microsoft.com/en-us/security/blog/2026/11/11/global-socket-how-threat-actors-weaponizing-gsocket-stealthy-c2/)

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

- [Microsoft Threat Intelligence – Global Socket: how threat actors are weaponizing GSocket for stealthy C2](https://www.microsoft.com/en-us/security/blog/2026/11/11/global-socket-how-threat-actors-weaponizing-gsocket-stealthy-c2/)
- [Sansec – Found defunct.dat on your site? You have a problem](https://sansec.io/research/gsocket)

---

[Back to index](../../../../README.md#latest-threats)
