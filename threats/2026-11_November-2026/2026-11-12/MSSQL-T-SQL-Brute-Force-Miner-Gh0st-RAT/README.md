# MSSQL T-SQL Brute-Force Campaign Delivering an XMRig Miner and Gh0st RAT

[Back to index](../../../../README.md) · [November 2026](../../README.md) · [2026-11-12](../README.md)

| Published | First added | Last updated | Category | Indicators | Block now |
|---|---|---|---|---|---|
| 2026-11-12 | 2026-11-12 22:55 | 2026-11-12 | Crimeware / cryptomining | 23 | 19 |

## Summary

FortiGuard Labs reports an early-October 2026 campaign against internet-facing Microsoft SQL Server instances that brute-forces logins and then abuses T-SQL to deploy malware. A UPX-packed Go orchestrator, named dllhost.exe and embedding the Naabu scanner, fetches a target range from site.vietnam852.com:88/ip.php, probes TCP 1433, writes hits to %TEMP%\Result.txt and hands them to dwm.exe with user and password lists. After a successful login, 2018.sql enables xp_cmdshell and downloads a loader from the same site or from ftp.vietnam852.com, saving it under C:\Users\Public as Google.exe or payload.exe. Later stages drop an XMRig miner disguised as MicrosoftEdgeUpdate.exe and a Themida-packed Gh0st RAT as winlogon.exe, which talks to server.vietnam852.com:8000 and www.swordaa.com:8000. Persistence uses scheduled tasks that imitate Microsoft Edge Update. The attacker domains, payload URLs and published hashes are on the block list. Do not block public Kryptex mining pools; hunt the XMRig Reporter check-ins to site.vietnam852.com instead.

> [!WARNING]
> FortiGuard Labs did not name victims. sqlcmd.exe was among the files downloaded from the attacker server but that hash is omitted here because it may be a copy of the legitimate Microsoft tool. xmr-ru.kryptex.network is a public mining pool and is not listed as a block.

## Affected countries and sectors

- **Countries:** Not stated in the sources
- **Regions:** Global
- **Sectors:** Any internet-facing Microsoft SQL Server
- **Note:** FortiGuard Labs describes a campaign against exposed SQL Server instances and does not name victim organisations or countries.
- **Source:** [FortiGuard Labs – T-SQL Being Abused to Deliver Malware on Compromised MS SQL Servers](https://www.fortinet.com/blog/threat-research/t-sql-being-abused-to-deliver-malware-on-compromised-ms-sql-servers)

## At a glance

| File | What it is |
|---|---|
| [`block_now.txt`](https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/threats/2026-11_November-2026/2026-11-12/MSSQL-T-SQL-Brute-Force-Miner-Gh0st-RAT/block_now.txt) (raw) | 19 high-confidence indicators to block now |
| [`iocs.csv`](iocs.csv) | All 23 indicators with description, confidence, action and source |
| [`defender_xdr_indicators.csv`](defender_xdr_indicators.csv) | 20 rows for Defender XDR bulk import |
| [`hunt.kql`](hunt.kql) | Defender XDR advanced hunting query |
| [`hunt.spl`](hunt.spl) | Splunk hunt over the CIM data models |
| [`hunt_raw.spl`](hunt_raw.spl) | Splunk hunt for data not mapped to CIM ([macros](../../../../all/splunk_macros.conf)) |
| [`hunt.yaral`](hunt.yaral) | Google SecOps YARA-L 2.0 detection rule |

Indicators by type: 12 SHA256, 5 domains, 2 URLs, 2 file names, 2 other. See `iocs.csv` for full details and descriptions.

## MITRE ATT&CK

| ID | Technique |
|---|---|
| [T1110](https://attack.mitre.org/techniques/T1110/) | Brute Force |
| [T1190](https://attack.mitre.org/techniques/T1190/) | Exploit Public-Facing Application |
| [T1059.001](https://attack.mitre.org/techniques/T1059/001/) | PowerShell |
| [T1059.003](https://attack.mitre.org/techniques/T1059/003/) | Windows Command Shell |
| [T1053.005](https://attack.mitre.org/techniques/T1053/005/) | Scheduled Task |
| [T1105](https://attack.mitre.org/techniques/T1105/) | Ingress Tool Transfer |
| [T1036.004](https://attack.mitre.org/techniques/T1036/004/) | Masquerade Task or Service |
| [T1496.001](https://attack.mitre.org/techniques/T1496/001/) | Compute Hijacking |
| [T1219](https://attack.mitre.org/techniques/T1219/) | Remote Access Software |

## Recommended actions

1. Block vietnam852.com, site.vietnam852.com, ftp.vietnam852.com, server.vietnam852.com and swordaa.com, and the published payload URLs and SHA-256 hashes, and search 90 days of proxy, firewall, DNS and EDR logs for them.
2. Hunt internet-facing SQL Server hosts for xp_cmdshell being enabled, sqlservr.exe writing executables under C:\Users\Public, and the scheduled-task names MicrosoftEdgeUpdateTaskMachineUA{CEC15D9B-F4BB-446A-B6E1-C61E74B016A2} and MicrosoftEdgeUpdateTaskMachineCore{4C33CE3F-7722-4257-AF83-351A4911C159}.
3. If confirmed, isolate the SQL Server, rotate its credentials and any accounts in the dumped lists, remove the fake Edge Update tasks and dropped binaries, and check for the Gh0st RAT and miner stages.
4. Do not block public Kryptex mining pools; use the attacker domains and the XMRig Reporter user-agent as the network hunt.

## Behaviours to hunt

> Behaviours are leads, not confirmed indicators, and can match legitimate activity. Compare any hit against your own baseline and environment before acting.

1. **Alert** · sqlservr.exe enabling xp_cmdshell\
   Look for: sqlservr.exe enabling xp_cmdshell, then downloading a file from site.vietnam852.com or ftp.vietnam852.com and writing Google.exe, payload.exe or Secs.exe under C:\Users\Public\
   Why it matters: After a successful brute force, the campaign's 2018.sql T-SQL enables xp_cmdshell and pulls a loader that drops a miner and a Gh0st RAT. FortiGuard Labs observed this chain against internet-facing SQL Server instances in early October 2026.\
   Log source: SQL Server logs, EDR process and file events, proxy and firewall logs\
   Source: [Fortinet](https://www.fortinet.com/blog/threat-research/t-sql-being-abused-to-deliver-malware-on-compromised-ms-sql-servers)

2. **Alert** · Scheduled tasks named...\
   Look for: Scheduled tasks named MicrosoftEdgeUpdateTaskMachineUA{CEC15D9B-F4BB-446A-B6E1-C61E74B016A2} (every 30 minutes) or MicrosoftEdgeUpdateTaskMachineCore{4C33CE3F-7722-4257-AF83-351A4911C159} (daily 01:00 running C:\Users\Public\Secs.exe)\
   Why it matters: The orchestrator and later stage persist under fake Microsoft Edge Update task names. These GUIDs are specific to this campaign.\
   Log source: Windows scheduled-task events (4698), EDR process events, schtasks queries\
   Source: [Fortinet](https://www.fortinet.com/blog/threat-research/t-sql-being-abused-to-deliver-malware-on-compromised-ms-sql-servers)

3. **Alert** · Outbound HTTP to site.vietnam852.com:88/ip.php or /tj/xmr.php\
   Look for: Outbound HTTP to site.vietnam852.com:88/ip.php or /tj/xmr.php, FTP to ftp.vietnam852.com, or TCP 8000 to server.vietnam852.com or www.swordaa.com, and a user-agent XMRig Reporter\
   Why it matters: ip.php supplies scan ranges, the FTP host stages payloads, /tj/xmr.php is the miner reporter, and port 8000 is the Gh0st C2. Do not block public Kryptex mining pools; hunt the reporter and the attacker domains instead.\
   Log source: Proxy, firewall and DNS logs\
   Source: [Fortinet](https://www.fortinet.com/blog/threat-research/t-sql-being-abused-to-deliver-malware-on-compromised-ms-sql-servers)

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

- [FortiGuard Labs – T-SQL Being Abused to Deliver Malware on Compromised MS SQL Servers](https://www.fortinet.com/blog/threat-research/t-sql-being-abused-to-deliver-malware-on-compromised-ms-sql-servers)

---

[Back to index](../../../../README.md)
