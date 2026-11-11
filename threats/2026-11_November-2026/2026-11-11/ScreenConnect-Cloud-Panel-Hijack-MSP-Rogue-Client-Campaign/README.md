# ScreenConnect Cloud Panel Hijack: Rogue Clients Pushed to MSP-Managed Endpoints

[Back to index](../../../../README.md#latest-threats) · [November 2026](../../README.md) · [2026-11-11](../README.md)

| Published | First added | Last updated | Category | Indicators | Block now |
|---|---|---|---|---|---|
| 2026-11-11 | 2026-11-11 22:05 | 2026-11-11 | Supply chain / MSP remote access | 11 | 0 |

## Summary

Huntress's SOC is responding to an active campaign that began around 17:47 UTC on 11 November 2026 against managed service providers using cloud-hosted ConnectWise ScreenConnect. At the time of its update Huntress was tracking six compromised MSPs and more than 286 endpoints, with the numbers rising; the actor numbers each victim MSP and the observed tags start partway through the sequence, so other MSPs were probably hit first. Huntress has seen no evidence of a new vulnerability and has not confirmed how the panels were accessed; the evidence points to stolen credentials or hijacked operator sessions. With panel access, the actor uses Run Command to push a second, rogue ScreenConnect client to every managed endpoint, giving an independent backdoor that no longer needs the MSP's panel. If a technician then opens an interactive ScreenConnect session to investigate, the malware rides that session back onto the technician's workstation, drops sqlite3.exe to scrape saved browser sessions and tokens, and pivots into any other ScreenConnect panels the technician can reach. Persistence is a TrapWatch scheduled task running as SYSTEM every 10 seconds, files under C:\ProgramData\RelayTrap\ and %TEMP%\sckit-*, and a RelayTrapLiteAlert Run-key value; endpoints reinfect within minutes if isolation is lifted before these are removed. ConnectWise confirmed the campaign in a Trust Center advisory at 22:45 UTC on 11 November, said the actor appears to deploy the extra remote-access software through third-party extensions, and disabled five of them (Labtech Plus, RMM Plus, RMM+, RMM Plus Password Link and RMM+ Password Link) in about 400 partner environments; on-premises partners must disable them themselves. ConnectWise did not publish indicators, so the indicators still come from a single vendor's incident response and are published at medium confidence: the attacker relay, C2 hostnames and stager URL are set to Block in the Defender import file but stay off the block-now list until a second source confirms them, and a possible C2 domain contributed by another responder is alert-only.

## Affected countries and sectors

- **Countries:** Not stated in the sources
- **Sectors:** Managed service providers (MSPs), MSP-managed customer organisations
- **Note:** Huntress tracks six compromised MSPs and more than 286 managed endpoints using cloud-hosted ScreenConnect, with more victims likely; no countries are named.
- **Source:** [Huntress SOC on r/msp – Active malware campaign abusing ScreenConnect](https://www.reddit.com/r/msp/comments/1xts3f2/active_malware_campaign_abusing_screenconnect/)

## At a glance

| File | What it is |
|---|---|
| [`block_now.txt`](https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/threats/2026-11_November-2026/2026-11-11/ScreenConnect-Cloud-Panel-Hijack-MSP-Rogue-Client-Campaign/block_now.txt) (raw) | None yet: no indicator is high-confidence enough to block, so use the files below to hunt |
| [`iocs.csv`](iocs.csv) | All 11 indicators with description, confidence, action and source |
| [`defender_xdr_indicators.csv`](defender_xdr_indicators.csv) | 7 rows for Defender XDR bulk import |
| [`hunt.kql`](hunt.kql) | Defender XDR advanced hunting query |
| [`hunt.spl`](hunt.spl) | Splunk hunt over the CIM data models |
| [`hunt_raw.spl`](hunt_raw.spl) | Splunk hunt for data not mapped to CIM ([macros](../../../../all/splunk_macros.conf)) |
| [`hunt.yaral`](hunt.yaral) | Google SecOps YARA-L 2.0 detection rule |

Indicators by type: 4 domains, 4 file names, 2 IPv4, 1 URL. See `iocs.csv` for full details and descriptions.

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
4. Block 185.99.255.28, 155.94.150.39, newnewnew.gotdns.org, soxnewwork.homedns.org, sc.payproofkit.com and the ns.mo7sen.dev stager URL in Defender XDR (they come from one vendor's incident response, so follow your own policy for single-source blocks), block only these exact dynamic-DNS hostnames, not gotdns.org or homedns.org, and alert on cdn007-digitaldownloads.com.
5. On endpoints, remove the rogue ScreenConnect client service (client IDs 2588ef5c15954b10 and ed630cc2c873b091), the TrapWatch scheduled task, C:\ProgramData\RelayTrap\, %TEMP%\sckit-* and the RelayTrapLiteAlert Run value before lifting isolation.
6. On technician workstations, look for sqlite3.exe reading browser profile data and for Panel-Lateral.ps1 or Run-Lateral-Full.bat, then reset browser-stored sessions and tokens.

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

- [Huntress SOC on r/msp – Active malware campaign abusing ScreenConnect](https://www.reddit.com/r/msp/comments/1xts3f2/active_malware_campaign_abusing_screenconnect/)
- [ConnectWise Trust Center – ScreenConnect security advisory (11 Nov 2026)](https://www.connectwise.com/company/trust/advisories)

---

[Back to index](../../../../README.md#latest-threats)
