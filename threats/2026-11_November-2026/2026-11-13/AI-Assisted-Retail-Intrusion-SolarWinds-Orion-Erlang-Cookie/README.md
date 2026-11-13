# AI-Assisted Intrusion at a U.S. Retailer: SolarWinds Orion Erlang Cookie Abuse, Side-Loaded Loaders and Yuze Tunnels

[Back to index](../../../../README.md) · [November 2026](../../README.md) · [2026-11-13](../README.md)

| Published | First added | Last updated | Category | Indicators | Block now |
|---|---|---|---|---|---|
| 2026-11-12 | 2026-11-13 09:55 | 2026-11-13 | Intrusion / financially motivated | 62 | 35 |

## Summary

Symantec's Threat Hunter Team describes a September 2026 intrusion at a U.S. retailer that stalled while the attackers typed commands by hand, then sped up once they switched to long, labelled, error-free PowerShell scripts that read like a language model's output relayed by an operator. Commands ran as cmd.exe under sqlservr.exe (xp_cmdshell) on SQL servers and under w3wp.exe on a web server. The attackers staged an old Bitdefender bdreinit.exe with log.dll and log.txt, and a G DATA signed ask.exe with ask.dll, from 204.194.49.129:8080, used a BreakChain launcher to move payloads out from under w3wp.exe, dropped the AES-encrypted server.ps1 reverse shell to 166.0.25.106:443 and two ASP web shells, and built EfsPotato with certutil and csc.exe to dump the SAM, SYSTEM and SECURITY hives. About 10 minutes after first querying SolarWinds Orion they read the .erlang.cookie of Orion's bundled RabbitMQ and ran Orion's erl.exe with that cookie to execute commands on a second server, with each command encoded as decimal character codes. They then hunted NTDS.dit, Group Policy cpassword and LAPS passwords, sprayed passwords with i<number>_winspray.ps1 scripts and tunnelled with Chisel and Yuze. Symantec links the loaders and staging server to an August 2026 intrusion and a July 2026 intrusion at a securities firm, and 155.254.22.215, which the attackers tested egress to, matches the AI console Gambit Security tied to an operator stealing card data from online retailers. Attacker servers, payload URLs and malicious tool hashes are on the block list.

> [!WARNING]
> bdreinit.exe and ask.exe are legitimate signed binaries abused for side-loading and are alert only. The 8.219.82.21 (Alibaba Cloud) and 43.208.224.101 (AWS) Yuze hosts may be reassigned and are alert only. Files Symantec lists only as suspicious are alert only, and two listed hashes that match known-good files were left out. The initial access route is unknown and no data theft or encryption was observed.

## Affected countries and sectors

- **Countries:** United States (US)
- **Regions:** North America, East Africa, South Asia
- **Sectors:** Retail, Securities and financial services, ICT providers to banks and telecoms, Energy
- **Note:** The main victim is an unnamed U.S. retailer; Symantec links its loaders and staging server to an August 2026 intrusion at another organization and a July 2026 intrusion at a securities firm, and describes other AI-assisted attacks on an East African ICT provider serving banks and telecoms and on south Asian organizations.
- **Source:** [Symantec Threat Hunter Team – How AI Revived a Stalled Attack on a U.S. Retailer](https://www.security.com/threat-intelligence/ai-assisted-attack-us-retailer)

## At a glance

| File | What it is |
|---|---|
| [`block_now.txt`](https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/threats/2026-11_November-2026/2026-11-13/AI-Assisted-Retail-Intrusion-SolarWinds-Orion-Erlang-Cookie/block_now.txt) (raw) | 35 high-confidence indicators to block now |
| [`iocs.csv`](iocs.csv) | All 62 indicators with description, confidence, action and source |
| [`defender_xdr_indicators.csv`](defender_xdr_indicators.csv) | 62 rows for Defender XDR bulk import |
| [`hunt.kql`](hunt.kql) | Defender XDR advanced hunting query |
| [`hunt.spl`](hunt.spl) | Splunk hunt over the CIM data models |
| [`hunt_raw.spl`](hunt_raw.spl) | Splunk hunt for data not mapped to CIM ([macros](../../../../all/splunk_macros.conf)) |
| [`hunt.yaral`](hunt.yaral) | Google SecOps YARA-L 2.0 detection rule |

Indicators by type: 40 SHA256, 11 IPv4, 11 URLs. See `iocs.csv` for full details and descriptions.

## MITRE ATT&CK

| ID | Technique |
|---|---|
| [T1505.003](https://attack.mitre.org/techniques/T1505/003/) | Web Shell |
| [T1059.001](https://attack.mitre.org/techniques/T1059/001/) | PowerShell |
| [T1059.003](https://attack.mitre.org/techniques/T1059/003/) | Windows Command Shell |
| [T1574.002](https://attack.mitre.org/techniques/T1574/002/) | DLL Side-Loading |
| [T1036.005](https://attack.mitre.org/techniques/T1036/005/) | Match Legitimate Name or Location |
| [T1068](https://attack.mitre.org/techniques/T1068/) | Exploitation for Privilege Escalation |
| [T1027.004](https://attack.mitre.org/techniques/T1027/004/) | Compile After Delivery |
| [T1140](https://attack.mitre.org/techniques/T1140/) | Deobfuscate/Decode Files or Information |
| [T1003.002](https://attack.mitre.org/techniques/T1003/002/) | Security Account Manager |
| [T1003.004](https://attack.mitre.org/techniques/T1003/004/) | LSA Secrets |
| [T1003.003](https://attack.mitre.org/techniques/T1003/003/) | NTDS |
| [T1552.001](https://attack.mitre.org/techniques/T1552/001/) | Credentials In Files |
| [T1552.006](https://attack.mitre.org/techniques/T1552/006/) | Group Policy Preferences |
| [T1021](https://attack.mitre.org/techniques/T1021/) | Remote Services |
| [T1110.003](https://attack.mitre.org/techniques/T1110/003/) | Password Spraying |
| [T1090.001](https://attack.mitre.org/techniques/T1090/001/) | Internal Proxy |
| [T1572](https://attack.mitre.org/techniques/T1572/) | Protocol Tunneling |

## Recommended actions

1. Block the staging and C2 servers (204.194.49.129, 166.0.25.106, 154.81.37.136, 108.165.20.205, 155.254.22.215, 103.142.103.225, 176.97.117.157 and the Yuze hosts 103.79.79.191 and 103.79.79.120), the payload URLs and the malicious hashes, and search 90 days of proxy, firewall and EDR logs for them; alert on 8.219.82.21 and 43.208.224.101.
2. Hunt for erl.exe from a SolarWinds Orion folder run with -setcookie and an rpc:call to os:cmd, and treat any hit as lateral movement.
3. Alert on cmd.exe or PowerShell started by sqlservr.exe or w3wp.exe, and on bdreinit.exe, ask.exe or a w3wp.exe copy running from ProgramData.
4. Hunt for certutil decoding into ProgramData followed by csc.exe, reg save of the SAM, SYSTEM or SECURITY hives, BreakChain launchers and scripts named i<number>_*.ps1.
5. If Orion runs in your estate, restrict access to the RabbitMQ .erlang.cookie file and the Erlang distribution ports, rotate the cookie after any compromise, and disable xp_cmdshell where it is not needed.
6. On a confirmed host, rotate SQL logins, domain and local administrator passwords, FTP, WinSCP, PuTTY and RDP saved credentials, and the Zabbix pre-shared key.

## Behaviours to hunt

> Behaviours are leads, not confirmed indicators, and can match legitimate activity. Compare any hit against your own baseline and environment before acting.

1. **Alert** · Orion erl.exe with a stolen Erlang cookie running os:cmd\
   Look for: erl.exe from a SolarWinds Orion folder run with -setcookie and an -eval rpc:call to os:cmd, the command written as decimal character codes\
   Why it matters: The attackers read the .erlang.cookie of the RabbitMQ broker that ships with Orion and used Orion's own erl.exe to run operating system commands on a second server about 10 minutes after first querying Orion. Encoding the command as character codes keeps it out of plain text. Legitimate RabbitMQ administration rarely passes os:cmd through rpc:call.\
   Log source: EDR process events (DeviceProcessEvents), Windows 4688 with command line\
   Source: [Symantec Threat Hunter Team](https://www.security.com/threat-intelligence/ai-assisted-attack-us-retailer)

2. **Alert** · SQL or IIS shell then a ProgramData side-loading host within 60m\
   Look for: cmd.exe or PowerShell started by sqlservr.exe or w3wp.exe, followed within 60 minutes on the same device by bdreinit.exe, ask.exe, a BreakChain launcher or a w3wp.exe copy running from ProgramData\
   Why it matters: Every stage of this intrusion ran through the SQL Server service (xp_cmdshell) or the IIS worker process, and the attackers then launched side-loading hosts and BreakChain from ProgramData, also copying ask.exe to ProgramData\w3wp.exe. The pairing is a stronger lead than either event alone. Database maintenance jobs that shell out can match the first half; exclude known SQL Agent and deployment accounts.\
   Log source: Defender XDR DeviceProcessEvents (join on DeviceId within 60 minutes)\
   Source: [Symantec Threat Hunter Team](https://www.security.com/threat-intelligence/ai-assisted-attack-us-retailer)

3. **Alert** · Shell spawned by sqlservr.exe or w3wp.exe\
   Look for: cmd.exe or PowerShell spawned by sqlservr.exe or w3wp.exe\
   Why it matters: Symantec saw the first activity as cmd.exe directly under sqlservr.exe on three SQL servers, pointing to xp_cmdshell, and later as cmd.exe under w3wp.exe on a compromised web application. Both are rare on a healthy server.\
   Log source: EDR process events (DeviceProcessEvents), Windows 4688 with command line\
   Source: [Symantec Threat Hunter Team](https://www.security.com/threat-intelligence/ai-assisted-attack-us-retailer)

4. **Alert** · bdreinit.exe or ask.exe side-loading from ProgramData\
   Look for: bdreinit.exe or ask.exe (run with -gdata) loading log.dll or ask.dll from ProgramData, or w3wp.exe running outside the IIS inetsrv folder\
   Why it matters: The attackers side-loaded log.dll through an old Bitdefender bdreinit.exe and ask.dll through a G DATA signed ask.exe, both from ProgramData, and copied ask.exe to a file named w3wp.exe to blend in. The bdreinit.exe and log.dll pairing is also used by other actors, so it is a lead rather than attribution.\
   Log source: EDR process and image-load events (DeviceProcessEvents, DeviceImageLoadEvents)\
   Source: [Symantec Threat Hunter Team](https://www.security.com/threat-intelligence/ai-assisted-attack-us-retailer)

5. **Alert** · BreakChain launcher relaunching payloads\
   Look for: A BreakChain launcher (breakchain*.exe) run with -m wmi or the shell mode to relaunch a payload\
   Why it matters: After repeated terminations the attackers used BreakChain so their payloads would no longer appear as children of w3wp.exe; a second build arrived about 75 minutes after the first was blocked.\
   Log source: EDR process events (DeviceProcessEvents)\
   Source: [Symantec Threat Hunter Team](https://www.security.com/threat-intelligence/ai-assisted-attack-us-retailer)

6. **Alert** · certutil and csc.exe in ProgramData, or hive dumps\
   Look for: certutil decoding a file into ProgramData followed by csc.exe compiling it, and SAM, SYSTEM or SECURITY hives saved to disk\
   Why it matters: On a SQL server the attackers appended about 20 base64 chunks to a file under ProgramData, decoded it with certutil and compiled EfsPotato with csc.exe, then saved the SAM, SYSTEM and SECURITY hives; the same hive dumps recurred on other servers. Developers and build agents use csc.exe, so scope the hunt to servers.\
   Log source: EDR process events (DeviceProcessEvents), Windows 4688 with command line\
   Source: [Symantec Threat Hunter Team](https://www.security.com/threat-intelligence/ai-assisted-attack-us-retailer)

7. **Hunt** · Long labelled PowerShell scripts from a server process\
   Look for: Long PowerShell scripts from a web or database service with labelled output banners such as ===FILES MENTIONING CONN STRINGS=== or ### whoami/priv ###\
   Why it matters: The AI-assisted phase sent about 50 scripts in two hours, median over 500 characters, each bundling several probes under quoted banners and capping output. Banner formatting alone also appears in admin scripts, so pair it with a sqlservr.exe or w3wp.exe parent.\
   Log source: EDR process events (DeviceProcessEvents), PowerShell 4104 script block logging\
   Source: [Symantec Threat Hunter Team](https://www.security.com/threat-intelligence/ai-assisted-attack-us-retailer)

8. **Hunt** · Numbered i<n>_*.ps1 spraying scripts\
   Look for: Password-spraying scripts named i<number>_<name>.ps1, such as i187_winspray.ps1\
   Why it matters: Several file names in this intrusion began with i and a number, which may be a per-target numbering scheme; the sprayer tested credential pairs downloaded from the later staging server.\
   Log source: EDR process and file events (DeviceProcessEvents, DeviceFileEvents)\
   Source: [Symantec Threat Hunter Team](https://www.security.com/threat-intelligence/ai-assisted-attack-us-retailer)

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

- [Symantec Threat Hunter Team – How AI Revived a Stalled Attack on a U.S. Retailer](https://www.security.com/threat-intelligence/ai-assisted-attack-us-retailer)
- [Broadcom Symantec Protection Bulletin – How AI Revived a Stalled Attack on a U.S. Retailer](https://www.broadcom.com/support/security-center/protection-bulletin/how-ai-revived-a-stalled-attack-on-a-u-s-retailer)
- [Gambit Security – AI Agents Are Hacking Online Retailers for $25 a Company (155.254.22.215)](https://gambit.security/blog-posts/autonomous-ai-agents-online-retailers-25-a-company)
- [ThreatFox – 176.97.117.157:443 VShell C2 (IOC 1957978)](https://threatfox.abuse.ch/ioc/1957978/)
- [MalwareBazaar – Chisel sample ch.exe](https://bazaar.abuse.ch/sample/5db5e7f655c4ee94411df8110d1b6d02bb15574ac199fa7a553ce6c3cb25bf03/)
- [Spamhaus – DROP and ASN-DROP lists](https://www.spamhaus.org/drop/)

---

[Back to index](../../../../README.md)
