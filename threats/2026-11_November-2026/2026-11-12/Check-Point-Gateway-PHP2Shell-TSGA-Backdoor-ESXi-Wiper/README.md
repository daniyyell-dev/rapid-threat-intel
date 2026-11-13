# PHP2Shell on Check Point Gateways: TSGA Backdoor, TSProxy and destroy_v6 ESXi Wiper

[Back to index](../../../../README.md) · [November 2026](../../README.md) · [2026-11-12](../README.md)

| Published | First added | Last updated | Category | Indicators | Block now |
|---|---|---|---|---|---|
| 2026-11-12 | 2026-11-12 15:52 | 2026-11-13 11:25 | Exploitation / edge device | 11 | 10 |

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

Check Point Research reports that from 30 October 2026, about a week after the fix shipped, an attacker scanned and exploited unpatched Check Point Security Gateways through their Mobile Access portals using PHP2Shell (CVE-2026-109618 and CVE-2026-109619). The first wave hit Israeli organisations and included destructive activity; a broader second wave on 2 November reached organisations in many countries and sectors with no sign of destruction. In the investigated intrusion the attacker escalated from the portal service account to root through the DynamicCLI interface (CVE-2026-123039), planted zz*.tpl PHP webshells in the portal templates directory, then launched the TSGA backdoor from /tmp/CPconfigdaemon, which relaunches as slot_CPconfigdaemon, listens on TCP 11072 and drops the TSProxy library as /lib/libcpfwcommon.so. They ran the gogo scanner, moved to a VMware ESXi host over SSH with the vpxuser account, and ran the destroy_v6 wiper, leaving DREAM_ANNEXATION.txt notes. TSGA and TSProxy are modified PhiliKit tools, which ESET tied to China-nexus UNC5221 and Ivanti attacks, but Check Point does not attribute the operation with high confidence. Both attacker IPs and all eight hashes are on the block list.

> [!WARNING]
> Attribution is unclear: Check Point lists a China-nexus actor, an access broker or a false flag as possible. The IP addresses sit on LightNode VPS space and may be reassigned later, so review hits in context. The gogo hash is a specific sample; gogo itself is a public scanner.

## Affected countries and sectors

- **Countries:** Israel (IL)
- **Regions:** Middle East
- **Sectors:** Not stated in the sources
- **Note:** Check Point says the first wave on 30 October 2026 targeted Israeli organisations, some with destructive activity; a second wave on 2 November hit organisations in multiple countries with no clear sector preference.
- **Source:** [Check Point Research – PHP2Shell Exploitation on Check Point Gateway](https://research.checkpoint.com/2026/php2shell-exploitation-on-check-point-gateway/)

## At a glance

| File | What it is |
|---|---|
| [`block_now.txt`](https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/threats/2026-11_November-2026/2026-11-12/Check-Point-Gateway-PHP2Shell-TSGA-Backdoor-ESXi-Wiper/block_now.txt) (raw) | 10 high-confidence indicators to block now |
| [`iocs.csv`](iocs.csv) | All 11 indicators with description, confidence, action and source |
| [`defender_xdr_indicators.csv`](defender_xdr_indicators.csv) | 10 rows for Defender XDR bulk import |
| [`hunt.kql`](hunt.kql) | Defender XDR advanced hunting query |
| [`hunt.spl`](hunt.spl) | Splunk hunt over the CIM data models |
| [`hunt_raw.spl`](hunt_raw.spl) | Splunk hunt for data not mapped to CIM ([macros](../../../../all/splunk_macros.conf)) |
| [`hunt.yaral`](hunt.yaral) | Google SecOps YARA-L 2.0 detection rule |

Indicators by type: 8 SHA256, 2 IPv4, 1 other. See `iocs.csv` for full details and descriptions.

## MITRE ATT&CK

| ID | Technique |
|---|---|
| [T1190](https://attack.mitre.org/techniques/T1190/) | Exploit Public-Facing Application |
| [T1068](https://attack.mitre.org/techniques/T1068/) | Exploitation for Privilege Escalation |
| [T1505.003](https://attack.mitre.org/techniques/T1505/003/) | Web Shell |
| [T1037](https://attack.mitre.org/techniques/T1037/) | Boot or Logon Initialization Scripts |
| [T1055](https://attack.mitre.org/techniques/T1055/) | Process Injection |
| [T1090](https://attack.mitre.org/techniques/T1090/) | Proxy |
| [T1046](https://attack.mitre.org/techniques/T1046/) | Network Service Discovery |
| [T1021.004](https://attack.mitre.org/techniques/T1021/004/) | SSH |
| [T1078](https://attack.mitre.org/techniques/T1078/) | Valid Accounts |
| [T1070](https://attack.mitre.org/techniques/T1070/) | Indicator Removal |
| [T1485](https://attack.mitre.org/techniques/T1485/) | Data Destruction |

## Recommended actions

1. Patch Check Point Security Gateways for PHP2Shell (CVE-2026-109618, CVE-2026-109619) and CVE-2026-123039, and restrict who can reach Mobile Access portals.
2. Block 130.94.19.204 and 130.94.19.168 and search 90 days of firewall, VPN and gateway logs for them from 30 October 2026.
3. On gateways, look for zz*.tpl files or challenge_render.tpl in the portal templates directory, /tmp/.up.tpl, /tmp/CPconfigdaemon, slot_CPconfigdaemon, /tmp/.bd.log, /lib/libcpfwcommon.so, /tmp/.p_sock and a listener on TCP 11072; treat any hit as a full gateway compromise.
4. On every Gaia gateway, management and log server, grep /var/log/dynamicCli.log for Received = lines without the Clish wrapper (CPprofile.sh >> /dev/null; export SP_DISTRIBUTE=0; set -o noglob;) and, after the Jumbo Hotfix, for Rejected connection from unauthorized uid; either is a CVE-2026-123039 escalation attempt. If the hotfix cannot go on yet, stop dynamic_server as sk1000362 describes.
5. Check ESXi hosts for SSH logins as vpxuser from a gateway, /tmp/des and DREAM_ANNEXATION.txt files, and rotate the vpxuser and gateway credentials if a gateway was exposed.

## Behaviours to hunt

> Behaviours are leads, not confirmed indicators, and can match legitimate activity. Compare any hit against your own baseline and environment before acting.

1. **Hunt** · PHP2Shell session artefacts on the Mobile Access portal\
   Look for: PHP session files containing the upload_progress_pwn marker under /opt/CPcvpn-*/tmp/, together with bursts of segmentation faults in the Mobile Access portal Apache/PHP workers\
   Why it matters: Check Point Research saw these session artefacts and hundreds of worker crashes on 30 October 2026 as the first sign of PHP2Shell exploitation of the Mobile Access portal.\
   Log source: Check Point gateway file system and system logs (forwarded syslog), EDR file events where a sensor is installed\
   Source: [Check Point Research](https://research.checkpoint.com/2026/php2shell-exploitation-on-check-point-gateway/)

2. **Alert** · DynamicCLI root commands without the Clish wrapper (CVE-2026-123039)\
   Look for: dynamicCli.log entries showing CVE-2026-123039: Received = lines without the Clish wrapper, or Rejected connection from unauthorized uid\
   Why it matters: Check Point's sk1000362 says the root dynamic_server daemon logs every command it receives. Legitimate requests use the wrapper . /opt/CPshared/5.0/tmp/.CPprofile.sh >> /dev/null; export SP_DISTRIBUTE=0; set -o noglob; and anything else was run as root through the world-writable /tmp/dynamic_socket, the escalation used after PHP2Shell. After the November Jumbo Hotfix, blocked attempts log Rejected connection from unauthorized uid with a UID such as 99 (nobody). Tuning: both conditions come from the vendor's own indicator of compromise. Expected false positives: none known; confirm any hit with Check Point TAC.\
   Log source: Check Point Gaia /var/log/dynamicCli.log on gateways, management and log servers, forwarded by syslog to Splunk or Google SecOps (not in Defender XDR)\
   Source: [Check Point](https://support.checkpoint.com/results/sk/sk1000362)

3. **Alert** · zz*.tpl webshells in the portal templates\
   Look for: Files named zz*.tpl or challenge_render.tpl written into the Mobile Access login templates directory, or a file at /tmp/.up.tpl\
   Why it matters: The attacker wrote base64-decoded PHP webshells as zz<random>.tpl files (printf ... \| base64 -d), stored uploads at /tmp/.up.tpl and copied them into the portal as challenge_render.tpl. The expanded shell needs the key zz2026.\
   Log source: Check Point gateway file integrity checks, EDR file events\
   Source: [Check Point Research](https://research.checkpoint.com/2026/php2shell-exploitation-on-check-point-gateway/)

4. **Alert** · TSGA backdoor, TSProxy library or port 11072 listener\
   Look for: A process named CPconfigdaemon or slot_CPconfigdaemon started from /tmp or the boot persistence directory, output redirected to /tmp/.bd.log, the library /lib/libcpfwcommon.so, the socket /tmp/.p_sock, or a listener on TCP 11072\
   Why it matters: This is the TSGA backdoor: it was started with nohup /tmp/CPconfigdaemon >/tmp/.bd.log, relaunches as slot_CPconfigdaemon, injects the TSProxy library /lib/libcpfwcommon.so into appliance processes, and talks over TCP 11072 and /tmp/.p_sock.\
   Log source: Check Point gateway process list and file checks, EDR process, file and network events\
   Source: [Check Point Research](https://research.checkpoint.com/2026/php2shell-exploitation-on-check-point-gateway/)

5. **Alert** · vpxuser SSH to ESXi and the destroy_v6 wiper\
   Look for: SSH login to a VMware ESXi host as vpxuser from a firewall or VPN gateway address, followed by files at /tmp/des or DREAM_ANNEXATION.txt\
   Why it matters: From the compromised gateway the attacker ran the gogo scanner, logged in to ESXi over SSH with the vpxuser service account, staged the destroy_v6 wiper as /tmp/des and left DREAM_ANNEXATION.txt in each wiped directory.\
   Log source: ESXi auth and shell logs (syslog), EDR file events, firewall logs for gateway-to-ESXi SSH\
   Source: [Check Point Research](https://research.checkpoint.com/2026/php2shell-exploitation-on-check-point-gateway/)

Behaviours that map cleanly to log fields are included in [`hunt.kql`](hunt.kql) and [`hunt.spl`](hunt.spl), and alert behaviours in [`hunt.yaral`](hunt.yaral). The rest are listed in the Behaviours section above with where to look. Use behaviours to hunt and alert, never to block.

## Sources

- [Check Point Research – PHP2Shell Exploitation on Check Point Gateway](https://research.checkpoint.com/2026/php2shell-exploitation-on-check-point-gateway/)
- [ESET – APT Activity Report Q4 2025-Q1 2026 (PhiliKit in the UNC5221 SPAWN toolset)](https://www.welivesecurity.com/en/eset-research/eset-apt-activity-report-q4-2025-q1-2026/)
- [Spamhaus – ASN-DROP list (AS154177 LightNode listed)](https://www.spamhaus.org/drop/asndrop.json)
- [Check Point – sk1000362: CVE-2026-123039 local privilege escalation to root in the DynamicCLI process](https://support.checkpoint.com/results/sk/sk1000362)
- [Check Point – Security advisory: active exploitation of PHP2Shell and local privilege escalation](https://blog.checkpoint.com/security/security-advisory-active-exploitation-of-php2shell-and-local-privilege-escalation/)

---

[Back to index](../../../../README.md)
