# Danfoss refrigeration controller attacks (Europe)

**Category:** ICS / OT  
**Last updated:** 2026-11-10  
**Indicators:** 2 (2 ipv4)  
**Block now:** 0

## Files

- `block_now.txt` - high-confidence indicators to block
- `iocs.csv` - every indicator with confidence, action, source and notes
- `defender_xdr_indicators.csv` - Microsoft Defender XDR bulk import (block and audit)
- `hunt.kql` - Defender XDR advanced hunting query

## Indicators

| Indicator | Type | Action | Confidence | Source |
|---|---|---|---|---|
| `178.83.226.215` | ipv4 | block | med | [sekoia.com](https://www.sekoia.com/blog/the-cold-chain-on-fire-unpatched-danfoss-controllers-exploited) |
| `37.16.75.128` | ipv4 | block | med | [sekoia.com](https://www.sekoia.com/blog/the-cold-chain-on-fire-unpatched-danfoss-controllers-exploited) |

## Sources

- [sekoia.com](https://www.sekoia.com/blog/the-cold-chain-on-fire-unpatched-danfoss-controllers-exploited)
