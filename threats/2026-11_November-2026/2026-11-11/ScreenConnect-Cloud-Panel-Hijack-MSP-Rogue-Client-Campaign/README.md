# ScreenConnect Cloud Panel Hijack: Rogue Clients Pushed to MSP-Managed Endpoints

[Live entry](https://daniyyell.com/rapid-threat-intel/t/ScreenConnect-Cloud-Panel-Hijack-MSP-Rogue-Client-Campaign/) · [Back to index](../../../../README.md) · [November 2026](../../README.md) · [2026-11-11](../README.md)

| Published | First added | Last updated | Category | Indicators | Block now |
|---|---|---|---|---|---|
| 2026-11-11 | 2026-11-11 22:05 | 2026-11-12 15:11 | Supply chain / MSP remote access | 51 | 10 |

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

Huntress's SOC is responding to an active campaign that began around 17:47 UTC on 11 November 2026 against managed service providers using cloud-hosted ConnectWise ScreenConnect. At the time of its update Huntress was tracking six compromised MSPs and more than 286 endpoints, with the numbers rising; the actor numbers each victim MSP and the observed tags start partway through the sequence, so other MSPs were probably hit first. Huntress has seen no evidence of a new vulnerability and has not confirmed how the panels were accessed; the evidence points to stolen credentials or hijacked operator sessions. With panel access, the actor uses Run Command to push a second, rogue ScreenConnect client to every managed endpoint, giving an independent backdoor that no longer needs the MSP's panel. If a technician then opens an interactive ScreenConnect session to investigate, the malware rides that session back onto the technician's workstation, drops sqlite3.exe to scrape saved browser sessions and tokens, and pivots into any other ScreenConnect panels the technician can reach. Persistence is a TrapWatch scheduled task running as SYSTEM every 10 seconds, files under C:\ProgramData\RelayTrap\ and %TEMP%\sckit-*, and a RelayTrapLiteAlert Run-key value; endpoints reinfect within minutes if isolation is lifted before these are removed. ConnectWise confirmed the campaign in a Trust Center advisory at 22:45 UTC on 11 November, said the actor appears to deploy the extra remote-access software through third-party extensions, and disabled five of them (Labtech Plus, RMM Plus, RMM+, RMM Plus Password Link and RMM+ Password Link) in about 400 partner environments; on-premises partners must disable them themselves. Sophos X-Ops independently observed the same activity: in one case curl.exe downloaded ScreenConnect.ClientSetup.msi from 185.99.255.28 to C:\Windows\TEMP\sc.msi, msiexec.exe installed it silently, and PowerShell with execution-policy bypass fetched the second stage from the ns.mo7sen.dev stager. Sophos saw the commands come from three ScreenConnect instance IDs that are likely compromised MSP instances (d905b2b1b165d0a9, 4b8f4089ddaac6a9 and df1f7ef0cfacd0d8) and install the same two rogue client IDs Huntress reported. Huntress's customer advisory, updated at 00:29 UTC on 12 November, adds that the toolkit installs a modified client that impersonates the MSP's own client and waits for a technician to connect. Because Huntress, Sophos and now Blackpoint saw them independently, the attacker relay 185.99.255.28, the ns.mo7sen.dev stager and its EadF.php URLs are high confidence and on the block-now list, and the two rogue client IDs are high-confidence hunting leads; the secondary C2 server, the dynamic-DNS and payproofkit hostnames and cdn007-digitaldownloads.com are also listed by Blackpoint and are on the block list at high confidence. BleepingComputer found a July 2026 SSA-themed batch file on VirusTotal that installs ScreenConnect from cdn007-digitaldownloads.com, contacts amexsafekeyupdate.com and checks for rogue client ID ed630cc2c873b091; whether that earlier activity belongs to this campaign is not confirmed, so its domain, hash and file name are alert-only. Huntress's full SCKit write-up, published on its blog late on 11 November, puts the count at 288 endpoints in 48 organisations within 90 minutes, says the current ScreenConnect releases 26.6.6.9747 and 26.7.6.9783 are affected, and breaks down the 16-file toolkit: the dropper writes C:\Windows\Temp\sckit-run.bat, fetches a host-keyed kit whose decryption key comes back in the server's response headers, and a later stage pulls sqlite3.exe from EadF.php?p=5 to read browser cookie databases. Huntress found that the worm's attempt to take over technician consoles failed in every host log it recovered, but it still advises against triaging over ScreenConnect. It also published 16 toolkit hashes; because the scripts are rebuilt per host and RelayTrap.exe is compiled on each machine, these are alert-only hunting leads, and the p=5 URL and cdn007-digitaldownloads.com (now listed by Huntress as C2 and recovered again by Blackpoint) are on the block list. Blackpoint Cyber's Adversary Pursuit Group, writing on 11 November, recovered the same toolkit from the ns.mo7sen.dev staging endpoint and showed that RelayTrap.cs exploits CVE-2026-84869 (CVSS 9.9), a Guest-to-Host file transfer and execute flaw fixed in ScreenConnect 26.6.5.9742 and later. In a controlled test a current patched Host never requested or executed the payload, and Blackpoint's SOC has not seen successful Guest-to-Host propagation; the trap still tries the transfer about 2.5 seconds after a technician session starts, sending Run-Lateral-Full.bat toward the Host and then pulling a loader from EadF.php. Follow-on scripts (Panel-Lateral.ps1 and LabConfig.ps1) try to recover the technician's .ASPXAUTH cookie from browser data and memory and replay it against the panel; the patch does not stop that session hijack, and no successful technician pivot has been observed. Because Blackpoint independently recovered the same relay, staging host, Access installer sources, dynamic-DNS hostnames and rogue client IDs, those indicators stay on the block list at high confidence. The Hacker News reported the same CVE attribution on 12 November.

## Affected countries and sectors

- **Countries:** Not stated in the sources
- **Sectors:** Managed service providers (MSPs), MSP-managed customer organisations
- **Note:** Huntress tracks six compromised MSPs and more than 286 endpoints across 47 organisations using cloud-hosted ScreenConnect, with more victims likely; Sophos saw the same activity; no countries are named.
- **Source:** [Huntress SOC on r/msp – Active malware campaign abusing ScreenConnect](https://www.reddit.com/r/msp/comments/1xts3f2/active_malware_campaign_abusing_screenconnect/)

## At a glance

| File | What it is |
|---|---|
| [`block_now.txt`](https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/threats/2026-11_November-2026/2026-11-11/ScreenConnect-Cloud-Panel-Hijack-MSP-Rogue-Client-Campaign/block_now.txt) (raw) | 10 high-confidence indicators to block now |
| [`iocs.csv`](iocs.csv) | All 51 indicators with description, confidence, action and source |
| [`defender_xdr_indicators.csv`](defender_xdr_indicators.csv) | 32 rows for Defender XDR bulk import |
| [`hunt.kql`](hunt.kql) | Defender XDR advanced hunting query |
| [`hunt.spl`](hunt.spl) | Splunk hunt over the CIM data models |
| [`hunt_raw.spl`](hunt_raw.spl) | Splunk hunt for data not mapped to CIM ([macros](../../../../all/splunk_macros.conf)) |
| [`hunt.yaral`](hunt.yaral) | Google SecOps YARA-L 2.0 detection rule |

Indicators by type: 21 SHA256, 13 file names, 6 domains, 6 other, 3 URLs, 2 IPv4. See `iocs.csv` for full details and descriptions.

## MITRE ATT&CK

| ID | Technique |
|---|---|
| [T1078](https://attack.mitre.org/techniques/T1078/) | Valid Accounts |
| [T1539](https://attack.mitre.org/techniques/T1539/) | Steal Web Session Cookie |
| [T1199](https://attack.mitre.org/techniques/T1199/) | Trusted Relationship |
| [T1072](https://attack.mitre.org/techniques/T1072/) | Software Deployment Tools |
| [T1219](https://attack.mitre.org/techniques/T1219/) | Remote Access Software |
| [T1053.005](https://attack.mitre.org/techniques/T1053/005/) | Scheduled Task |
| [T1547.001](https://attack.mitre.org/techniques/T1547/001/) | Registry Run Keys / Startup Folder |
| [T1555.003](https://attack.mitre.org/techniques/T1555/003/) | Credentials from Web Browsers |
| [T1021](https://attack.mitre.org/techniques/T1021/) | Remote Services |
| [T1105](https://attack.mitre.org/techniques/T1105/) | Ingress Tool Transfer |

## Recommended actions

1. Check that the Labtech Plus, RMM Plus, RMM+, RMM Plus Password Link and RMM+ Password Link extensions are disabled (on-premises partners must do this themselves), keep their installation records and logs, and do not re-enable them until ConnectWise says it is safe.
2. Do not triage suspected hosts through ScreenConnect: use your EDR live-response shell, WinRM or another out-of-band tool, because an interactive session can carry the infection back to the technician's workstation.
3. Revoke all active ScreenConnect web sessions, rotate ScreenConnect credentials, verify MFA in your identity provider, and audit Run Command and Toolbox history for mass executions you did not start.
4. Block 185.99.255.28, ns.mo7sen.dev and the EadF.php stager URLs now (Huntress, Sophos and Blackpoint all saw them), also block 155.94.150.39, newnewnew.gotdns.org, soxnewwork.homedns.org, sc.payproofkit.com and cdn007-digitaldownloads.com, block only these exact dynamic-DNS hostnames, not gotdns.org or homedns.org, and alert on amexsafekeyupdate.com.
5. On endpoints, remove the rogue ScreenConnect client service (client IDs 2588ef5c15954b10 and ed630cc2c873b091), the TrapWatch scheduled task, C:\ProgramData\RelayTrap\, %TEMP%\sckit-* and the RelayTrapLiteAlert Run value before lifting isolation.
6. On technician workstations, look for sqlite3.exe or PowerShell reading browser cookie stores or .ASPXAUTH, for Panel-Lateral.ps1, LabConfig.ps1, Run-Lateral-Full.bat or %TEMP%\sckit-decoder.ps1, and for the toolkit hashes Huntress and Blackpoint published (a miss does not clear a host, because they change per host), then reset browser-stored sessions and tokens.
7. Patch technician-side Host and endpoint-side Guest clients to ScreenConnect 26.6.5.9742 or later (CVE-2026-84869). The patch blocks RelayTrap's Guest-to-Host execution but does not protect a hijacked technician session; if a technician connected to a suspected host, revoke ScreenConnect web sessions from a clean device and rotate credentials.

## Behaviours to hunt

> Behaviours are leads, not confirmed indicators, and can match legitimate activity. Compare any hit against your own baseline and environment before acting.

1. **Alert** · Second ScreenConnect client pushed by Run Command\
   Look for: ScreenConnect.ClientSetup.msi installed by an existing ScreenConnect client (Run Command pushing a second client), especially with c=Exploited in the installer query\
   Why it matters: With panel access the actor uses Run Command to push a second, rogue ScreenConnect client to every managed endpoint; Huntress lists the installer pattern /Bin/ScreenConnect.ClientSetup.msi?...&c=Exploited and the actor name Addmin. Legitimate MSP upgrades also run this installer, so judge the relay host and whether a change was scheduled.\
   Log source: Defender XDR DeviceProcessEvents; ScreenConnect audit log (Run Command and Toolbox history)\
   Source: [Reddit r/msp](https://www.reddit.com/r/msp/comments/1xts3f2/active_malware_campaign_abusing_screenconnect/)

2. **Alert** · Rogue ScreenConnect client IDs or attacker relay\
   Look for: ScreenConnect client service whose command line carries the rogue client IDs 2588ef5c15954b10 or ed630cc2c873b091, or a relay (h=) of 185.99.255.28 or the campaign C2 hostnames\
   Why it matters: Every ScreenConnect client names its relay in the h= value of the service command line. Huntress published two rogue client IDs and the attacker relay, so a client pointing there is the backdoor itself.\
   Log source: Defender XDR DeviceProcessEvents\
   Source: [Reddit r/msp](https://www.reddit.com/r/msp/comments/1xts3f2/active_malware_campaign_abusing_screenconnect/)

3. **Alert** · TrapWatch scheduled task persistence\
   Look for: TrapWatch scheduled task running as SYSTEM every 10 seconds\
   Why it matters: Huntress names the TrapWatch task as the persistence that reinfects endpoints within minutes of isolation being lifted.\
   Log source: Defender XDR DeviceEvents (ScheduledTaskCreated) and DeviceProcessEvents\
   Source: [Reddit r/msp](https://www.reddit.com/r/msp/comments/1xts3f2/active_malware_campaign_abusing_screenconnect/)

4. **Alert** · RelayTrap and sckit staging files\
   Look for: Files under C:\ProgramData\RelayTrap\ or %TEMP%\sckit-*\
   Why it matters: Huntress lists both locations as campaign artefacts that must be wiped before an endpoint is released.\
   Log source: Defender XDR DeviceFileEvents\
   Source: [Reddit r/msp](https://www.reddit.com/r/msp/comments/1xts3f2/active_malware_campaign_abusing_screenconnect/)

5. **Alert** · RelayTrapLiteAlert Run-key persistence\
   Look for: RelayTrapLiteAlert value in a registry Run key\
   Why it matters: Huntress names this Run-key value as part of the persistence to remove.\
   Log source: Defender XDR DeviceRegistryEvents\
   Source: [Reddit r/msp](https://www.reddit.com/r/msp/comments/1xts3f2/active_malware_campaign_abusing_screenconnect/)

6. **Hunt** · sqlite3 after ScreenConnect activity (reverse pivot)\
   Look for: sqlite3.exe run on a device within 60 minutes of a ScreenConnect process on the same device (technician reverse pivot)\
   Why it matters: When a technician opens an interactive ScreenConnect session to an infected endpoint, the malware rides the session back, drops sqlite3.exe to scrape saved browser sessions and tokens, then pivots into other panels. Huntress does not give a time window; 60 minutes is a starting point to tune. Developer and database tools can run sqlite3.exe, so exclude known users and paths.\
   Log source: Defender XDR DeviceProcessEvents (join on DeviceId within 60 minutes)\
   Source: [Reddit r/msp](https://www.reddit.com/r/msp/comments/1xts3f2/active_malware_campaign_abusing_screenconnect/)

7. **Hunt** · Unexpected mass Run Command or Toolbox use\
   Look for: Mass Run Command or Toolbox executions in the ScreenConnect audit log that no technician started\
   Why it matters: Huntress asks every ScreenConnect user to check Run Command history now, even with no alert, because the actor pushes the rogue client to all endpoints at once.\
   Log source: ScreenConnect audit and session logs\
   Source: [Reddit r/msp](https://www.reddit.com/r/msp/comments/1xts3f2/active_malware_campaign_abusing_screenconnect/)

8. **Alert** · Guest-to-Host file transfer and Run within seconds of connect\
   Look for: A ScreenConnect Host client receiving a file transfer and a Run from a Guest within seconds of a session starting, often Run-Lateral-Full.bat about 2.5 seconds after connect\
   Why it matters: Blackpoint found that RelayTrap replaces the legitimate Guest and, after a 2.5-second delay, tries a Guest-to-Host file transfer and execute (CVE-2026-84869) toward the connecting technician, typically sending Run-Lateral-Full.bat, which then pulls a loader from ns.mo7sen.dev/EadF.php. A patched Host (26.6.5.9742 or later) blocks the exploit; Blackpoint and Huntress have not observed a successful Guest-to-Host. The trap still attempts the transfer against a patched Host.\
   Log source: ScreenConnect audit log (event ID 201 in session context); Defender XDR DeviceFileEvents and DeviceProcessEvents on technician workstations\
   Source: [Blackpoint Cyber](https://blackpointcyber.com/blog/screenconnect-attack-sckit/)

9. **Alert** · Non-browser or PowerShell access to .ASPXAUTH or cookie stores\
   Look for: .ASPXAUTH cookie access by a non-browser process, or PowerShell reading browser cookie stores (Cookies, Login Data, Web Data) on a technician workstation\
   Why it matters: If RelayTrap lands on the technician's Host, Panel-Lateral.ps1 and LabConfig.ps1 search local browser data and process memory for ScreenConnect .ASPXAUTH cookies and replay them against the panel. Blackpoint has not confirmed a successful cookie recovery or panel fan-out.\
   Log source: Defender XDR DeviceProcessEvents and DeviceFileEvents on technician workstations\
   Source: [Blackpoint Cyber](https://blackpointcyber.com/blog/screenconnect-attack-sckit/)

10. **Hunt** · ScreenConnect panel session replayed from a new IP or user agent\
   Look for: A ScreenConnect panel session replayed from a new IP address or user agent\
   Why it matters: After stealing an .ASPXAUTH cookie, SCKit is written to reuse the technician's already authenticated management session to push commands to other endpoints. A session that continues from a new IP or user agent, without a corresponding interactive login, is the fan-out signal. No successful technician pivot has been observed.\
   Log source: ScreenConnect audit and session logs; identity-provider sign-in logs for the panel\
   Source: [Blackpoint Cyber](https://blackpointcyber.com/blog/screenconnect-attack-sckit/)

11. **Hunt** · Unpatched ScreenConnect clients (CVE-2026-84869)\
   Look for: ScreenConnect Host or Guest clients older than 26.6.5.9742 (CVE-2026-84869). The patch blocks RelayTrap's Guest-to-Host execution but does not protect a hijacked technician session\
   Why it matters: Blackpoint confirmed that RelayTrap targets CVE-2026-84869 (CVSS 9.9) and that a current patched Host does not request or execute the payload. Clients must be on 26.6.5.9742 or later, and Host clients may need a reinstall. Patching does not revoke a stolen .ASPXAUTH session.\
   Log source: ScreenConnect inventory, package and agent version reports\
   Source: [Blackpoint Cyber](https://blackpointcyber.com/blog/screenconnect-attack-sckit/)

Behaviours that map cleanly to log fields are included in [`hunt.kql`](hunt.kql) and [`hunt.spl`](hunt.spl), and alert behaviours in [`hunt.yaral`](hunt.yaral). The rest are listed in the Behaviours section above with where to look. Use behaviours to hunt and alert, never to block.

## Sources

- [Huntress SOC on r/msp – Active malware campaign abusing ScreenConnect](https://www.reddit.com/r/msp/comments/1xts3f2/active_malware_campaign_abusing_screenconnect/)
- [ConnectWise Trust Center – ScreenConnect security advisory (11 Nov 2026)](https://www.connectwise.com/company/trust/advisories)
- [Sophos X-Ops – Malicious ScreenConnect deployments observed](https://www.sophos.com/en-us/blog/malicious-screenconnect-deployments-observed)
- [Huntress Support – 2026 November ScreenConnect advisory](https://support.huntress.io/hc/en-us/articles/57422935234195-2026-November-ScreenConnect)
- [BleepingComputer – Active ScreenConnect attacks breach MSPs, impact dozens of organizations](https://www.bleepingcomputer.com/news/security/active-screenconnect-attacks-breach-msps-impact-dozens-of-organizations/)
- [Huntress – SCKit worm installs rogue ScreenConnect clients and session cookie relays](https://www.huntress.com/blog/sckit-worm-rogue-screenconnect)
- [Blackpoint Cyber – ScreenConnect Attack: SCKit Turns Remote Support Into an Attack Platform](https://blackpointcyber.com/blog/screenconnect-attack-sckit/)
- [The Hacker News – SCKit Malware Turns ScreenConnect Support Sessions Into Potential MSP Attack Paths](https://thehackernews.com/2026/11/sckit-malware-targets-screenconnect.html)

---

[Back to index](../../../../README.md)
