# Danfoss Refrigeration Controller Attacks on European Supermarkets

[Back to index](../../../README.md#latest-threats) · [November 2026](../README.md)

| Published | First added | Last updated | Category | Indicators | Block now |
|---|---|---|---|---|---|
| 2026-11-10 | 2026-11-10 | 2026-11-10 | ICS / OT | 2 | 0 |

## Summary

Between 11 and 13 October 2026, attacks on unpatched, internet-exposed Danfoss refrigeration controllers hit hundreds of French supermarkets, including Intermarché and Coopérative U stores, causing food spoilage and business interruption; a second wave on the night of 1-2 November hit refrigeration systems in about a dozen European countries. Sekoia's Danfoss 800A honeypots recorded unauthenticated requests that enumerate units and an exploit that renames any user account, including the full-admin user ID 1, without authentication. On 9 November 2026 French authorities attributed the operation to the IRGC-linked Shahid Kaveh unit (CyberAv3ngers), but Sekoia did not formally tie the two honeypot IPs in this set to the IRGC.

## At a glance

| File | What it is |
|---|---|
| [`block_now.txt`](https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/threats/2026-11_November-2026/2026-11-10_Danfoss-Refrigeration-Controller-Attacks-Europe/block_now.txt) (raw) | 0 high-confidence indicators to block now |
| [`iocs.csv`](iocs.csv) | All 2 indicators with description, confidence, action and source |
| [`defender_xdr_indicators.csv`](defender_xdr_indicators.csv) | 2 rows for Defender XDR bulk import |
| [`hunt.kql`](hunt.kql) | Defender XDR advanced hunting query |

Indicators by type: 2 IPv4. See `iocs.csv` for full details and descriptions.

## MITRE ATT&CK

| ID | Technique |
|---|---|
| [T1190](https://attack.mitre.org/techniques/T1190/) | Exploit Public-Facing Application |
| [T1098](https://attack.mitre.org/techniques/T1098/) | Account Manipulation |
| [T0831](https://attack.mitre.org/techniques/T0831/) | Manipulation of Control |

## Recommended actions

1. Take Danfoss refrigeration controllers off the internet or put them behind a VPN, and apply vendor updates.
2. Check controller user accounts, especially user ID 1, for unexpected renames.
3. Block the two exploitation IPs at the perimeter.

## Hunt

Run this before blocking to find past activity.

1. Open [`hunt.kql`](hunt.kql) and copy the query.
2. In the [Microsoft Defender portal](https://security.microsoft.com), go to **Hunting > Advanced hunting** and paste it into a new query tab.
3. Select **Run query**. Results cover the last 30 days, one row per table, entity and indicator.

Non-network leads such as file names or URL paths are listed as comments at the end of the query. More in the [Defender XDR guide](../../../docs/defender-xdr.md).

## Sources

- [Sekoia TDR - The Cold Chain on Fire: unpatched Danfoss controllers exploited](https://www.sekoia.com/blog/the-cold-chain-on-fire-unpatched-danfoss-controllers-exploited)

---

[Back to index](../../../README.md#latest-threats)
