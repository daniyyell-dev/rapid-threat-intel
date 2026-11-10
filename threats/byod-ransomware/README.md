# BYOD ransomware / extortion

**Category:** Ransomware  
**Last updated:** 2026-11-10  
**Indicators:** 4 (1 filename, 1 domain, 1 email, 1 session_id)  
**Block now:** 1

## Files

- `block_now.txt` - high-confidence indicators to block
- `iocs.csv` - every indicator with confidence, action, source and notes
- `defender_xdr_indicators.csv` - Microsoft Defender XDR bulk import (block and audit)
- `hunt.kql` - Defender XDR advanced hunting query

## Indicators

| Indicator | Type | Action | Confidence | Source |
|---|---|---|---|---|
| `README_BYOD_31.txt` | filename | alert | high | [bleepingcomputer.com](https://www.bleepingcomputer.com/news/security/vanderbilt-university-hit-in-byod-ransomware-attack-data-theft-claimed/) |
| `byodxn5s7sua6oyyjj74rycgn6afncfckprt5ezskt3cni6lg3wdrgad.onion` | domain | block | high | [ransomware.live](https://www.ransomware.live/group/BYOD) |
| `byod@onionmail.org` | email | alert | high | [ransomware.live](https://www.ransomware.live/group/BYOD) |
| `05b18abb1c28e6ae8b12e2910197dba5e756c11c3a4046be50e0d356a815bc5d37` | session_id | alert | high | [ransomware.live](https://www.ransomware.live/group/BYOD) |

## Sources

- [bleepingcomputer.com](https://www.bleepingcomputer.com/news/security/vanderbilt-university-hit-in-byod-ransomware-attack-data-theft-claimed/)
- [ransomware.live](https://www.ransomware.live/group/BYOD)
