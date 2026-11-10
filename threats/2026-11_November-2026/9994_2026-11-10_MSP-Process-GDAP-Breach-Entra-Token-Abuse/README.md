# MSP Process GDAP Breach: Entra Token Abuse in Partner Tenants

[Back to index](../../../README.md#latest-threats) · [November 2026](../README.md)

| Published | First added | Last updated | Category | Indicators | Block now |
|---|---|---|---|---|---|
| 2026-11-09 | 2026-11-10 13:43 | 2026-11-10 | Supply chain / identity | 57 | 1 |

## Summary

On 7 November 2026 MSP Process, a GDAP tooling vendor serving over 1,000 MSPs, told partners that an attacker had accessed one of its storage accounts (09:56-14:40 UTC) holding partners' Entra app client IDs and secrets, admin refresh tokens and GDAP relationship lists. The attacker used the stolen secrets to get Microsoft Graph tokens in partner and customer tenants with no user sign-in or MFA, and Huntress reported successful malicious token grants in 47 tenants. Password-spray and client-secret attempts from a residential proxy pool preceded the breach on 6-7 November. Any tenant connected to MSP Process should be treated as exposed.

## At a glance

| File | What it is |
|---|---|
| [`block_now.txt`](https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/threats/2026-11_November-2026/9994_2026-11-10_MSP-Process-GDAP-Breach-Entra-Token-Abuse/block_now.txt) (raw) | 1 high-confidence indicators to block now |
| [`iocs.csv`](iocs.csv) | All 57 indicators with description, confidence, action and source |
| [`defender_xdr_indicators.csv`](defender_xdr_indicators.csv) | 56 rows for Defender XDR bulk import |
| [`hunt.kql`](hunt.kql) | Defender XDR advanced hunting query |

Indicators by type: 57 IPv4. See `iocs.csv` for full details and descriptions.

## MITRE ATT&CK

| ID | Technique |
|---|---|
| [T1199](https://attack.mitre.org/techniques/T1199/) | Trusted Relationship |
| [T1078.004](https://attack.mitre.org/techniques/T1078/004/) | Valid Accounts: Cloud Accounts |
| [T1550.001](https://attack.mitre.org/techniques/T1550/001/) | Application Access Token |
| [T1110.003](https://attack.mitre.org/techniques/T1110/003/) | Password Spraying |

## Recommended actions

1. Rotate the client secret of every Entra app connected to MSP Process and revoke the admin refresh token used to connect it.
2. Review Entra service-principal and non-interactive sign-ins for MSP Process app IDs from any IP other than 64.236.54.139.
3. Audit app role assignments, new app secrets and GDAP security-group membership changes since 6 November 2026.
4. Block 172.169.63.30 with a Conditional Access named location; most other IPs are shared Azure or proxy space, so alert rather than block.

## Hunt

Run this before blocking to find past activity.

1. Open [`hunt.kql`](hunt.kql) and copy the query.
2. In the [Microsoft Defender portal](https://security.microsoft.com), go to **Hunting > Advanced hunting** and paste it into a new query tab.
3. Select **Run query**. Results cover the last 30 days, one row per table, entity and indicator.

Non-network leads such as file names or URL paths are listed as comments at the end of the query. More in the [Defender XDR guide](../../../docs/defender-xdr.md).

## Sources

- [Inforcer - When a GDAP vendor is breached, check your own tenant](https://www.inforcer.com/insights/when-a-gdap-vendor-is-breached-check-your-own-tenant)
- [The Stack - MSP software firm hacked, customer Entra environments getting pwned (Huntress IOCs)](https://www.thestack.technology/msp-software-firm-hacked-with-customer-entra-environments-now-getting-pwned/)

---

[Back to index](../../../README.md#latest-threats)
