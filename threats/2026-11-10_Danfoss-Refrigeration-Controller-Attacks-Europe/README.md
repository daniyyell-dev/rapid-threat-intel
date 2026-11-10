# Danfoss Refrigeration Controller Attacks on European Supermarkets

## Summary

Between 11 and 13 October 2026, attacks on unpatched, internet-exposed Danfoss refrigeration controllers hit hundreds of French supermarkets, including Intermarché and Coopérative U stores, causing food spoilage and business interruption; a second wave on the night of 1-2 November hit refrigeration systems in about a dozen European countries. Sekoia's Danfoss 800A honeypots recorded unauthenticated requests that enumerate units and an exploit that renames any user account, including the full-admin user ID 1, without authentication. On 9 November 2026 French authorities attributed the operation to the IRGC-linked Shahid Kaveh unit (CyberAv3ngers), but Sekoia did not formally tie the honeypot IPs below to the IRGC.

**Published:** 2026-11-10  
**First added:** 2026-11-10  
**Last updated:** 2026-11-10  
**Category:** ICS / OT  
**Indicators:** 2 (2 ipv4)  
**Block now:** 0

## MITRE ATT&CK

Mapped from the behaviour described in the sources.

- T1190 Exploit Public-Facing Application
- T1098 Account Manipulation
- ICS T0831 Manipulation of Control

## Recommended actions

1. Take Danfoss refrigeration controllers off the internet or put them behind a VPN, and apply vendor updates.
2. Check controller user accounts, especially user ID 1, for unexpected renames.
3. Block the two exploitation IPs at the perimeter.

## Files

- `block_now.txt` - high-confidence indicators to block
- `iocs.csv` - every indicator with description, confidence, action, source and notes
- `defender_xdr_indicators.csv` - Microsoft Defender XDR bulk import (block and audit)
- `hunt.kql` - Defender XDR advanced hunting query

## Indicators

| Indicator | Type | Description | Action | Confidence | Source |
|---|---|---|---|---|---|
| `178.83.226.215` | ipv4 | Source of an unauthenticated user-rename exploit against a Danfoss 800A honeypot on 1 Nov 2026, during the second wave of attacks; Sekoia did not formally tie this IP to the IRGC. | block | med | [Sekoia TDR - The Cold Chain on Fire: unpatched Danfoss controllers exploited](https://www.sekoia.com/blog/the-cold-chain-on-fire-unpatched-danfoss-controllers-exploited) |
| `37.16.75.128` | ipv4 | Source of an unauthenticated user-rename exploit against a Danfoss 800A honeypot on 1 Nov 2026, during the second wave of attacks; Sekoia did not formally tie this IP to the IRGC. | block | med | [Sekoia TDR - The Cold Chain on Fire: unpatched Danfoss controllers exploited](https://www.sekoia.com/blog/the-cold-chain-on-fire-unpatched-danfoss-controllers-exploited) |

## Sources

- [Sekoia TDR - The Cold Chain on Fire: unpatched Danfoss controllers exploited](https://www.sekoia.com/blog/the-cold-chain-on-fire-unpatched-danfoss-controllers-exploited)
