# BYOD Ransomware and Extortion: Vanderbilt University Attack

[Back to index](../../../../README.md#latest-threats) · [November 2026](../../README.md) · [2026-11-10](../README.md)

| Published | First added | Last updated | Category | Indicators | Block now |
|---|---|---|---|---|---|
| 2026-11-09 | 2026-11-10 13:43 | 2026-11-10 | Ransomware | 4 | 1 |

## Summary

BYOD is a ransomware and extortion group that launched in 2026 and runs a Tor data leak site, where ransomware.live counted 17 listed victims on 10 November 2026. On 9 November 2026 it claimed an attack on Vanderbilt University, alleging encrypted databases and theft of student, employee and research data including over a million Social Security numbers. The ransom note README_BYOD_31.txt points to the leak site and a Session messenger ID for negotiation. Vanderbilt confirmed an active cybersecurity incident but has not confirmed the group's involvement or whether devices were encrypted.

## Affected countries and sectors

- **Countries:** United States (US), Japan (JP), United Kingdom (GB), Singapore (SG), Malaysia (MY)
- **Sectors:** Education, Technology, Manufacturing, Hospitality, Healthcare
- **Note:** From the victims on BYOD's leak site as tracked by ransomware.live on 11 Nov 2026 (United States 7 victims; Japan, United Kingdom, Singapore and Malaysia 1 each).
- **Source:** [ransomware.live - BYOD group profile](https://www.ransomware.live/group/BYOD)

## At a glance

| File | What it is |
|---|---|
| [`block_now.txt`](https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/threats/2026-11_November-2026/2026-11-10/BYOD-Ransomware-Vanderbilt-University-Attack/block_now.txt) (raw) | 1 high-confidence indicators to block now |
| [`iocs.csv`](iocs.csv) | All 4 indicators with description, confidence, action and source |
| [`defender_xdr_indicators.csv`](defender_xdr_indicators.csv) | 1 rows for Defender XDR bulk import |
| [`hunt.kql`](hunt.kql) | Defender XDR advanced hunting query |

Indicators by type: 1 file name, 1 domain, 1 email, 1 Session ID. See `iocs.csv` for full details and descriptions.

## MITRE ATT&CK

| ID | Technique |
|---|---|
| [T1486](https://attack.mitre.org/techniques/T1486/) | Data Encrypted for Impact |
| [T1657](https://attack.mitre.org/techniques/T1657/) | Financial Theft |

## Recommended actions

1. Hunt endpoints and file shares for README_BYOD_*.txt ransom notes.
2. Alert on mail to or from byod@onionmail.org and on any proxy or tor2web access to the leak site.
3. No network IOCs for the intrusion itself have been published yet; focus on general ransomware hardening and backup checks.

## Hunt

Run this before blocking to find past activity.

1. Open [`hunt.kql`](hunt.kql) and copy the query.
2. In the [Microsoft Defender portal](https://security.microsoft.com), go to **Hunting > Advanced hunting** and paste it into a new query tab.
3. Select **Run query**. Results cover the last 30 days, one row per table, entity and indicator.

Non-network leads such as file names or URL paths are listed as comments at the end of the query. More in the [Defender XDR guide](../../../../docs/defender-xdr.md).

## Sources

- [BleepingComputer - Vanderbilt University hit in BYOD ransomware attack](https://www.bleepingcomputer.com/news/security/vanderbilt-university-hit-in-byod-ransomware-attack-data-theft-claimed/)
- [ransomware.live - BYOD group profile](https://www.ransomware.live/group/BYOD)

---

[Back to index](../../../../README.md#latest-threats)
