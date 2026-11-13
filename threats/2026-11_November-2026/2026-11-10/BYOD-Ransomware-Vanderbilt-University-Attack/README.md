# BYOD Ransomware and Extortion: Vanderbilt University Attack

[Back to index](../../../../README.md) · [November 2026](../../README.md) · [2026-11-10](../README.md)

| Published | First added | Last updated | Category | Indicators | Block now |
|---|---|---|---|---|---|
| 2026-11-09 | 2026-11-10 13:43 | 2026-11-10 | Ransomware | 5 | 1 |

## Summary

BYOD is a ransomware and extortion group that launched in 2026 and runs a Tor data leak site, where ransomware.live counted 17 listed victims on 10 November 2026. On 9 November 2026 it claimed an attack on Vanderbilt University, alleging encrypted databases and theft of student, employee and research data including over a million Social Security numbers. The ransom note README_BYOD_31.txt points to the leak site and a Session messenger ID for negotiation. Vanderbilt confirmed an active cybersecurity incident but has not confirmed the group's involvement. Staff told the Nashville Banner that a “system update” notice and a message about deleting old files appeared before the ransom warning, after which their files carried a .byod extension, and that Box sent notices of file deletions by administrators who had not touched the files.

## Affected countries and sectors

- **Countries:** United States (US), Japan (JP), United Kingdom (GB), Singapore (SG), Malaysia (MY)
- **Sectors:** Education, Technology, Manufacturing, Hospitality, Healthcare
- **Note:** Based on the victims listed on BYOD's leak site, as tracked by ransomware.live on 11 Nov 2026 (United States: 7 victims; Japan, the United Kingdom, Singapore and Malaysia: 1 each).
- **Source:** [ransomware.live – BYOD group profile](https://www.ransomware.live/group/BYOD)

## At a glance

| File | What it is |
|---|---|
| [`block_now.txt`](https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/threats/2026-11_November-2026/2026-11-10/BYOD-Ransomware-Vanderbilt-University-Attack/block_now.txt) (raw) | 1 high-confidence indicators to block now |
| [`iocs.csv`](iocs.csv) | All 5 indicators with description, confidence, action and source |
| [`defender_xdr_indicators.csv`](defender_xdr_indicators.csv) | 1 rows for Defender XDR bulk import |
| [`hunt.kql`](hunt.kql) | Defender XDR advanced hunting query |
| [`hunt.spl`](hunt.spl) | Splunk hunt over the CIM data models |
| [`hunt_raw.spl`](hunt_raw.spl) | Splunk hunt for data not mapped to CIM ([macros](../../../../all/splunk_macros.conf)) |
| [`hunt.yaral`](hunt.yaral) | Google SecOps YARA-L 2.0 detection rule |

Indicators by type: 1 file name, 1 domain, 1 email, 1 Session ID, 1 other. See `iocs.csv` for full details and descriptions.

## MITRE ATT&CK

| ID | Technique |
|---|---|
| [T1486](https://attack.mitre.org/techniques/T1486/) | Data Encrypted for Impact |
| [T1657](https://attack.mitre.org/techniques/T1657/) | Financial Theft |

## Recommended actions

1. Hunt endpoints and file shares for README_BYOD_*.txt ransom notes.
2. Alert on mail to or from byod@onionmail.org and on any proxy or tor2web access to the leak site.
3. Alert on bursts of file renames to the .byod extension on endpoints and file shares, and on mass deletions or changes in OneDrive, Box or Dropbox by one account.
4. The encryptor reached Vanderbilt machines looking like a system update, so review recent Group Policy, scheduled task and software deployment changes made from domain controllers or management servers.
5. No network IOCs for the intrusion itself have been published yet; focus on general ransomware hardening and backup checks.

## Behaviours to hunt

> Behaviours are leads, not confirmed indicators, and can match legitimate activity. Compare any hit against your own baseline and environment before acting.

1. **Alert** · README_BYOD ransom notes\
   Look for: Ransom notes named README_BYOD_<number>.txt created on many hosts or shares in a short time\
   Why it matters: BleepingComputer saw the note README_BYOD_31.txt on a victim screen; a burst of these files means encryption is under way.\
   Log source: EDR file events, file server auditing\
   Source: [BleepingComputer](https://www.bleepingcomputer.com/news/security/vanderbilt-university-hit-in-byod-ransomware-attack-data-theft-claimed/)

2. **Alert** · Mass renames to the .byod extension\
   Look for: Many files renamed to the .byod extension on one device or share within minutes\
   Why it matters: Vanderbilt staff saw every file on their computers become .byod files after the ransom warning appeared.\
   Log source: EDR file events, file server auditing\
   Source: [Nashville Banner](https://nashvillebanner.com/2026/11/09/vanderbilt-university-cyberattack-byod/)

3. **Hunt** · Fake system update shortly before encryption\
   Look for: A "system update" notice and a message about deleting old files shortly before encryption\
   Why it matters: Staff described a system update prompt, then a file deletion message, then the ransom warning; this points to delivery through an internal management channel (an inference, not confirmed by Vanderbilt).\
   Log source: Group Policy and scheduled task changes, software deployment logs, EDR process events\
   Source: [Nashville Banner](https://nashvillebanner.com/2026/11/09/vanderbilt-university-cyberattack-byod/)

4. **Alert** · Cloud file deletions by administrators who did not make them\
   Look for: Cloud storage notices of file deletions by administrators who did not touch the files\
   Why it matters: Vanderbilt faculty received Box notices that administrators had deleted files they had not accessed.\
   Log source: Box admin events, OneDrive and SharePoint audit (FileDeleted, FileRenamed)\
   Source: [Nashville Banner](https://nashvillebanner.com/2026/11/09/vanderbilt-university-cyberattack-byod/)

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

- [BleepingComputer – Vanderbilt University hit in BYOD ransomware attack](https://www.bleepingcomputer.com/news/security/vanderbilt-university-hit-in-byod-ransomware-attack-data-theft-claimed/)
- [ransomware.live – BYOD group profile](https://www.ransomware.live/group/BYOD)
- [Nashville Banner – Cybersecurity breach impacts Vanderbilt University](https://nashvillebanner.com/2026/11/09/vanderbilt-university-cyberattack-byod/)

---

[Back to index](../../../../README.md)
