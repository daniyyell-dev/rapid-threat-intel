# Citrus Ransomware: Certighost AD CS Exploitation, Xray VLESS Tunnels and Sn00py

[Back to index](../../../../README.md#latest-threats) · [November 2026](../../README.md) · [2026-11-12](../README.md)

| Published | First added | Last updated | Category | Indicators | Block now |
|---|---|---|---|---|---|
| 2026-11-11 | 2026-11-12 12:25 | 2026-11-12 | Ransomware | 14 | 2 |

## Summary

Kaspersky describes Citrus, a previously undocumented Russian-speaking ransomware group that has hit Russian organisations, mainly in finance, agriculture and retail. Citrus logs in with stolen contractor accounts over VPN or internet-facing RDP, then tries to escalate with CVE-2026-54121 (Certighost), an AD CS flaw patched in July 2026: each attempt creates a computer account named GHOST plus eight capital letters and requests a Machine-template certificate whose cdc attribute points the CA at the attacker's server 91.210.109.118, so a success gives a certificate for a domain controller. The group also used Impacket atexec, Metasploit and weak 1C:Enterprise servers, PowerShell written with large language models, and Xray reverse VLESS tunnels on port 443 disguised with REALITY as traffic to mirror.yandex.ru. It stole messenger data with 7-Zip, then pushed the Go-based Sn00py ransomware through a malicious GPO named Kaspersky GPO, created by KasperskyGPO_Deploy_64.exe, which runs it through the KasperskyAgentInstallTask or Sysvc scheduled task; files get the .citrus extension and a CITRUS_README.txt note. Both Citrus servers are on the block list.

> [!WARNING]
> Kaspersky published MD5 hashes only, so the four hashes are listed as alert items and are not in the SHA-256 block list. Victims so far are in Russia, but the Certighost technique works against any unpatched Enterprise CA. Xray and 7-Zip are legitimate tools and mirror.yandex.ru is a legitimate site: hunt for them in unusual places, never block them.

## Affected countries and sectors

- **Countries:** Russia (RU)
- **Regions:** Eastern Europe
- **Sectors:** Financial services, Agriculture, Retail
- **Note:** Kaspersky says Citrus has hit organisations in Russia, mainly in finance, agriculture and retail, entering through compromised contractor accounts. The Certighost technique works against any unpatched Enterprise CA.
- **Source:** [Kaspersky Securelist – Citrus ransomware: VLESS for traffic, Sn00py for encryption, and LLMs lending a hand](https://securelist.com/citrus-ransomware/121879/)

## At a glance

| File | What it is |
|---|---|
| [`block_now.txt`](https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/threats/2026-11_November-2026/2026-11-12/Citrus-Ransomware-Certighost-Sn00py/block_now.txt) (raw) | 2 high-confidence indicators to block now |
| [`iocs.csv`](iocs.csv) | All 14 indicators with description, confidence, action and source |
| [`defender_xdr_indicators.csv`](defender_xdr_indicators.csv) | 2 rows for Defender XDR bulk import |
| [`hunt.kql`](hunt.kql) | Defender XDR advanced hunting query |
| [`hunt.spl`](hunt.spl) | Splunk hunt over the CIM data models |
| [`hunt_raw.spl`](hunt_raw.spl) | Splunk hunt for data not mapped to CIM ([macros](../../../../all/splunk_macros.conf)) |
| [`hunt.yaral`](hunt.yaral) | Google SecOps YARA-L 2.0 detection rule |

Indicators by type: 8 other, 4 file names, 2 IPv4. See `iocs.csv` for full details and descriptions.

## MITRE ATT&CK

| ID | Technique |
|---|---|
| [T1199](https://attack.mitre.org/techniques/T1199/) | Trusted Relationship |
| [T1133](https://attack.mitre.org/techniques/T1133/) | External Remote Services |
| [T1078](https://attack.mitre.org/techniques/T1078/) | Valid Accounts |
| [T1068](https://attack.mitre.org/techniques/T1068/) | Exploitation for Privilege Escalation |
| [T1649](https://attack.mitre.org/techniques/T1649/) | Steal or Forge Authentication Certificates |
| [T1136.002](https://attack.mitre.org/techniques/T1136/002/) | Domain Account |
| [T1053.005](https://attack.mitre.org/techniques/T1053/005/) | Scheduled Task |
| [T1484.001](https://attack.mitre.org/techniques/T1484/001/) | Group Policy Modification |
| [T1105](https://attack.mitre.org/techniques/T1105/) | Ingress Tool Transfer |
| [T1572](https://attack.mitre.org/techniques/T1572/) | Protocol Tunneling |
| [T1036.005](https://attack.mitre.org/techniques/T1036/005/) | Match Legitimate Name or Location |
| [T1056.001](https://attack.mitre.org/techniques/T1056/001/) | Keylogging |
| [T1560.001](https://attack.mitre.org/techniques/T1560/001/) | Archive via Utility |
| [T1486](https://attack.mitre.org/techniques/T1486/) | Data Encrypted for Impact |

## Recommended actions

1. Patch every Enterprise CA for CVE-2026-54121 and turn on AD CS auditing (events 4886 and 4887); Defender for Identity raises a Potential Certighost alert for attempts.
2. Block 91.210.109.118 and 91.210.108.180 and search 90 days of firewall, VPN and proxy logs for them.
3. Alert on new computer accounts named GHOST plus eight capital letters (event 4741). If one exists, revoke every certificate issued to it, delete the account, and treat the domain as compromised if a certificate was issued.
4. Hunt for GPOs or scheduled tasks named after Kaspersky that are not from your Kaspersky deployment, for build_64.exe or KasperskyAgent.exe in SYSVOL, and for KasperskyAgentInstallTask, Sysvc and Java rpchost agent tasks.
5. Hunt for Xray or renamed binaries (mst.exe, sabycenter.exe, webex.exe, rpchost.exe) running from C:\ProgramData, certutil or BITS downloading executables, and files ending .citrus.
6. Review contractor accounts: require MFA on VPN and RDP, limit their logon hours and hosts, and reset any that show unusual activity.

## Behaviours to hunt

> Behaviours are leads, not confirmed indicators, and can match legitimate activity. Compare any hit against your own baseline and environment before acting.

1. **Alert** · Certighost GHOST computer account or cdc certificate request\
   Look for: Computer accounts named GHOST plus eight capital letters, or Machine-template certificate requests whose cdc attribute points at an outside address\
   Why it matters: The public Certighost (CVE-2026-54121) exploit creates a GHOST computer account for each attempt and asks the CA to verify the request against a server the attacker controls (cdc:91.210.109.118 in Citrus intrusions). An issued certificate lets the attacker log in as a domain controller.\
   Log source: Defender for Identity directory events; domain controller Security log 4741; AD CS CA log 4886/4887\
   Source: [Kaspersky](https://securelist.com/citrus-ransomware/121879/)

2. **Alert** · Fake Kaspersky GPO or task deploying ransomware\
   Look for: A Group Policy Object or scheduled task named after Kaspersky that deploys an executable from SYSVOL (KasperskyGPO_Deploy_64.exe, Deploy-KasperskyGPO.ps1, KasperskyAgentInstallTask, Sysvc)\
   Why it matters: Citrus pushes Sn00py through a malicious GPO called Kaspersky GPO: a self-extracting archive copies the ransomware to SYSVOL, imports and links the GPO, and the GPO creates a scheduled task on every machine.\
   Log source: EDR process and file events on domain controllers and endpoints; Windows Security 5136/5137 (GPO changes); Task Scheduler 4698\
   Source: [Kaspersky](https://securelist.com/citrus-ransomware/121879/)

3. **Alert** · Xray tunnel binary in ProgramData or Citrus server traffic\
   Look for: Xray or a renamed tunnel binary (mst.exe, sabycenter.exe, webex.exe, rpchost.exe) running from C:\ProgramData, or certutil and BITS downloading executables there\
   Why it matters: Citrus fetches Xray with certutil or BITS, renames it after familiar software, and runs reverse VLESS tunnels on port 443 that use REALITY to look like traffic to mirror.yandex.ru.\
   Log source: EDR process and network events on Windows\
   Source: [Kaspersky](https://securelist.com/citrus-ransomware/121879/)

4. **Alert** · Citrus .citrus files, ransom note or bcedit\
   Look for: Files renamed with the .citrus extension, CITRUS_README.txt notes, or a process calling bcedit\
   Why it matters: Sn00py encrypts user files with RSA-2048 and ChaCha20, appends .citrus, drops CITRUS_README.txt and tries to change boot settings by calling bcedit (a typo for bcdedit).\
   Log source: EDR file and process events\
   Source: [Kaspersky](https://securelist.com/citrus-ransomware/121879/)

5. **Hunt** · Impacket atexec scheduled-task command\
   Look for: Impacket atexec: cmd.exe started by the Task Scheduler service writing its output to a random .tmp file in C:\Windows\Temp\
   Why it matters: Citrus used Impacket atexec to run commands on other hosts through short-lived scheduled tasks. The tool's default command line redirects output to an eight-character .tmp file in Windows\Temp.\
   Log source: EDR process events; Task Scheduler 4698/4699\
   Source: [Kaspersky](https://securelist.com/citrus-ransomware/121879/)

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

- [Kaspersky Securelist – Citrus ransomware: VLESS for traffic, Sn00py for encryption, and LLMs lending a hand](https://securelist.com/citrus-ransomware/121879/)
- [Kaspersky – press release on the Citrus ransomware group (Russian)](https://www.kaspersky.ru/about/press-releases/novaya-gruppa-shifrovalshikov-citrus-atakovala-rossijskie-organizacii-cherez-podryadchikov)
- [GBHackers – New Citrus ransomware hides malicious traffic as HTTPS](https://gbhackers.com/citrus-ransomware-attack/)

---

[Back to index](../../../../README.md#latest-threats)
