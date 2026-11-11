# MSP Process GDAP Breach: Entra Token Abuse in Partner Tenants

[Back to index](../../../../README.md#latest-threats) · [November 2026](../../README.md) · [2026-11-10](../README.md)

| Published | First added | Last updated | Category | Indicators | Block now |
|---|---|---|---|---|---|
| 2026-11-09 | 2026-11-10 13:43 | 2026-11-10 | Supply chain / identity | 57 | 1 |

## Summary

On 7 November 2026 MSP Process, a GDAP tooling vendor serving over 1,000 MSPs, told partners that an attacker had accessed one of its storage accounts (09:56–14:40 UTC) holding partners' Entra app client IDs and secrets, admin refresh tokens and GDAP relationship lists. The attacker used the stolen secrets to get Microsoft Graph tokens in partner and customer tenants with no user sign-in or MFA, and Huntress reported successful malicious token grants in 47 tenants. Password-spray and client-secret attempts from a residential proxy pool preceded the breach on 6–7 November. Any tenant connected to MSP Process should be treated as exposed.

## Affected countries and sectors

- **Countries:** Not stated in the sources
- **Sectors:** Managed service providers, MSP customers
- **Note:** MSP Process serves over 1,000 MSPs; Huntress reported malicious token grants in 47 partner and customer tenants. No countries named.
- **Source:** [The Stack – MSP software firm hacked, customer Entra environments getting pwned (Huntress IOCs)](https://www.thestack.technology/msp-software-firm-hacked-with-customer-entra-environments-now-getting-pwned/)

## At a glance

| File | What it is |
|---|---|
| [`block_now.txt`](https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/threats/2026-11_November-2026/2026-11-10/MSP-Process-GDAP-Breach-Entra-Token-Abuse/block_now.txt) (raw) | 1 high-confidence indicators to block now |
| [`iocs.csv`](iocs.csv) | All 57 indicators with description, confidence, action and source |
| [`defender_xdr_indicators.csv`](defender_xdr_indicators.csv) | 56 rows for Defender XDR bulk import |
| [`hunt.kql`](hunt.kql) | Defender XDR advanced hunting query |
| [`hunt.spl`](hunt.spl) | Splunk hunt over the CIM data models |
| [`hunt_raw.spl`](hunt_raw.spl) | Splunk hunt for data not mapped to CIM ([macros](../../../../all/splunk_macros.conf)) |
| [`hunt.yaral`](hunt.yaral) | Google SecOps YARA-L 2.0 detection rule |

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

## Behaviours to hunt

> Behaviours are leads, not confirmed indicators, and can match legitimate activity. Compare any hit against your own baseline and environment before acting.

1. **Alert** · App sign-ins from outside the MSP Process address\
   Look for: Service principal sign-ins for the app connected to MSP Process from any address other than 64.236.54.139, from 09:56 UTC on 7 November 2026\
   Why it matters: MSP Process says to treat any other address as suspicious. The stolen secrets were used to get Microsoft Graph tokens without a user sign-in.\
   Log source: Entra service principal sign-in logs, in the MSP's own tenant where the app is registered\
   Source: [Inforcer](https://www.inforcer.com/insights/when-a-gdap-vendor-is-breached-check-your-own-tenant)

2. **Hunt** · One address trying several partner app secrets\
   Look for: One address using several partner app secrets within seconds, first failing (invalid client secret, missing service principal) and succeeding about an hour later\
   Why it matters: Inforcer saw this scripted pattern from 172.169.63.30 between 10:28 and 11:31 UTC on 7 November. The address is shared Azure space, so the pattern matters more than the IP.\
   Log source: Entra service principal sign-in logs\
   Source: [Inforcer](https://www.inforcer.com/insights/when-a-gdap-vendor-is-breached-check-your-own-tenant)

3. **Alert** · Admin refresh token used from another address\
   Look for: Non-interactive user sign-ins with the connecting admin's refresh token from an address other than 64.236.54.139\
   Why it matters: Stolen refresh tokens show up here. Inforcer found the attempts failed where the token had expired through inactivity.\
   Log source: Entra non-interactive user sign-in logs\
   Source: [Inforcer](https://www.inforcer.com/insights/when-a-gdap-vendor-is-breached-check-your-own-tenant)

4. **Alert** · Tenant changes made by the MSP Process app\
   Look for: New app credentials, app role assignments, new users or GDAP security-group membership changes initiated by the MSP Process app since 6 November 2026\
   Why it matters: The app permissions MSP Process asked for (AppRoleAssignment.ReadWrite.All, Application.ReadWrite.All, Directory.ReadWrite.All) allow exactly these changes.\
   Log source: Entra audit logs\
   Source: [Inforcer](https://www.inforcer.com/insights/when-a-gdap-vendor-is-breached-check-your-own-tenant)

5. **Hunt** · Graph requests with the app's tokens from another address\
   Look for: Microsoft Graph requests made with the app's tokens from an address other than 64.236.54.139\
   Why it matters: Sign-in and audit logs cannot show what a token read; Graph activity logs can, and UniqueTokenIdentifier links a sign-in to its Graph requests.\
   Log source: Microsoft Graph activity logs (only if already enabled on 7 November)\
   Source: [Inforcer](https://www.inforcer.com/insights/when-a-gdap-vendor-is-breached-check-your-own-tenant)

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

- [Inforcer – When a GDAP vendor is breached, check your own tenant](https://www.inforcer.com/insights/when-a-gdap-vendor-is-breached-check-your-own-tenant)
- [The Stack – MSP software firm hacked, customer Entra environments getting pwned (Huntress IOCs)](https://www.thestack.technology/msp-software-firm-hacked-with-customer-entra-environments-now-getting-pwned/)

---

[Back to index](../../../../README.md#latest-threats)
