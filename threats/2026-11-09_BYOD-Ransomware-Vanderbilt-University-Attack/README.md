# BYOD Ransomware and Extortion: Vanderbilt University Attack

## Summary

BYOD is a ransomware and extortion group that launched in 2026 and runs a Tor data leak site, where ransomware.live counted 17 listed victims on 10 November 2026. On 9 November 2026 it claimed an attack on Vanderbilt University, alleging encrypted databases and theft of student, employee and research data including over a million Social Security numbers. The ransom note README_BYOD_31.txt points to the leak site and a Session messenger ID for negotiation. Vanderbilt confirmed an active cybersecurity incident but has not confirmed the group's involvement or whether devices were encrypted.

**Published:** 2026-11-09  
**First added:** 2026-11-10  
**Last updated:** 2026-11-10  
**Category:** Ransomware  
**Indicators:** 4 (1 filename, 1 domain, 1 email, 1 session_id)  
**Block now:** 1

## MITRE ATT&CK

Mapped from the behaviour described in the sources.

- T1486 Data Encrypted for Impact
- T1657 Financial Theft

## Recommended actions

1. Hunt endpoints and file shares for README_BYOD_*.txt ransom notes.
2. Alert on mail to or from byod@onionmail.org and on any proxy or tor2web access to the leak site.
3. No network IOCs for the intrusion itself have been published yet; focus on general ransomware hardening and backup checks.

## Files

- `block_now.txt` - high-confidence indicators to block
- `iocs.csv` - every indicator with description, confidence, action, source and notes
- `defender_xdr_indicators.csv` - Microsoft Defender XDR bulk import (block and audit)
- `hunt.kql` - Defender XDR advanced hunting query

## Indicators

| Indicator | Type | Description | Action | Confidence | Source |
|---|---|---|---|---|---|
| `README_BYOD_31.txt` | filename | Ransom note file name seen at Vanderbilt University; hunt for README_BYOD_*.txt. | alert | high | [BleepingComputer - Vanderbilt University hit in BYOD ransomware attack](https://www.bleepingcomputer.com/news/security/vanderbilt-university-hit-in-byod-ransomware-attack-data-theft-claimed/) |
| `byodxn5s7sua6oyyjj74rycgn6afncfckprt5ezskt3cni6lg3wdrgad.onion` | domain | BYOD Tor data leak site; only shows up in tor2web or proxy logs. | block | high | [ransomware.live - BYOD group profile](https://www.ransomware.live/group/BYOD) |
| `byod@onionmail.org` | email | BYOD contact email address; hunt in mail flow and DLP. | alert | high | [ransomware.live - BYOD group profile](https://www.ransomware.live/group/BYOD) |
| `05b18abb1c28e6ae8b12e2910197dba5e756c11c3a4046be50e0d356a815bc5d37` | session_id | BYOD Session messenger ID used for negotiation; not a file hash, do not import as a file indicator. | alert | high | [ransomware.live - BYOD group profile](https://www.ransomware.live/group/BYOD) |

## Sources

- [BleepingComputer - Vanderbilt University hit in BYOD ransomware attack](https://www.bleepingcomputer.com/news/security/vanderbilt-university-hit-in-byod-ransomware-attack-data-theft-claimed/)
- [ransomware.live - BYOD group profile](https://www.ransomware.live/group/BYOD)
