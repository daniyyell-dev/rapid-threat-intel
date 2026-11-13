# Barracuda Managed XDR Integration Credential Store Breach

[Back to index](../../../../README.md) · [November 2026](../../README.md) · [2026-11-13](../README.md)

| Published | First added | Last updated | Category | Indicators | Block now |
|---|---|---|---|---|---|
| 2026-11-01 | 2026-11-13 11:23 | 2026-11-13 | Cloud / identity | 5 | 2 |

## Hunt

Run one of these before blocking to find past activity. Each file is the same hunt written for a different platform; pick the one for your SIEM or XDR.

| File | Platform | How to run it |
|---|---|---|
| [`hunt.kql`](hunt.kql) | Microsoft Defender XDR | In the [Defender portal](https://security.microsoft.com), open **Hunting > Advanced hunting**, paste the query and select **Run query**. It covers the last 30 days. |
| [`hunt.spl`](hunt.spl) | Splunk | In **Search & Reporting**, set the time picker to the last 30 days or more, paste the search and run it. It reads the CIM data models. |
| [`hunt_raw.spl`](hunt_raw.spl) | Splunk without CIM | The same hunt over raw events. Define the `rti_*` macros from [`splunk_macros.conf`](../../../../all/splunk_macros.conf) first. |
| [`hunt.yaral`](hunt.yaral) | Google SecOps | In **Detection > Rules & Detections > Rules Editor**, paste the rule, run a Retrohunt over the last 30 days, then turn on live mode. |

Leads that are not network or hash indicators are in [`iocs.csv`](iocs.csv), and behaviours with no clean field mapping are in the Behaviours section below. Guides: [Defender XDR](../../../../docs/defender-xdr.md), [Splunk](../../../../docs/splunk.md), [Google SecOps](../../../../docs/google-secops.md).

## Summary

Barracuda, writing on its Trust Center, says it found unauthorised activity in parts of its internal cloud between 1 and 2 November 2026. Initial access was a third-party cloud access key. One affected system stores credentials that Barracuda Managed XDR uses to collect data from customer integrations such as Microsoft 365, Google Workspace and endpoint security platforms. Barracuda says it has found no direct evidence those customer credentials were viewed or used, has rotated its own secrets, and has notified only the customers whose integrations may have been affected. Those organisations should revoke and recreate the credentials and review connected-system logs since 1 November; Barracuda says organisations that were not notified do not need to take action. The activity looks financially motivated: the operator searched for cryptocurrency wallets and related secrets. Two attacker source addresses on N963/Netsec hosting (180.178.56.10 and 52.128.238.126; the latter is APNIC space, not Microsoft Azure) are on the block list, as hosts only. A Korea Telecom address and a Cloudflare WARP IPv6 are alert only and must not be blocked. Hunt cloud and identity sign-ins and API calls from all four addresses, or with the distinctive user agent Mozilla/5.0 (compatible; read-only-audit), since 1 November, especially Barracuda connector service principals and OAuth apps. The other user agents Barracuda listed (Boto3, curl and Python-urllib) are ordinary client strings and are not indicators.

> [!WARNING]
> Barracuda has found no direct evidence that customer integration credentials were accessed. Do not block 221.146.68.107 (Korea Telecom) or 2a09:bac1:7680:3d0::26b:5b (Cloudflare WARP), and do not widen the two N963/Netsec blocks to the surrounding ranges. Do not treat Boto3/1.43.122, curl/8.5.0, curl/7.81.0 or Python-urllib/3.10 as indicators.

## Affected countries and sectors

- **Countries:** Not stated in the sources
- **Regions:** Worldwide
- **Sectors:** Cloud services, Managed security, Enterprise IT
- **Note:** Barracuda says this applies only to organisations using an API integration for Barracuda Managed XDR Cloud or Monitored Endpoint, and that only notified customers need to revoke and recreate those credentials. No countries were named.
- **Source:** [Barracuda – Barracuda XDR Integration Credentials](https://trust.barracuda.com/security/barracuda-xdr-integration-credentials)

## At a glance

| File | What it is |
|---|---|
| [`block_now.txt`](https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/threats/2026-11_November-2026/2026-11-13/Barracuda-Managed-XDR-Integration-Credential-Store-Breach/block_now.txt) (raw) | 2 high-confidence indicators to block now |
| [`iocs.csv`](iocs.csv) | All 5 indicators with description, confidence, action and source |
| [`defender_xdr_indicators.csv`](defender_xdr_indicators.csv) | 4 rows for Defender XDR bulk import |
| [`hunt.kql`](hunt.kql) | Defender XDR advanced hunting query |
| [`hunt.spl`](hunt.spl) | Splunk hunt over the CIM data models |
| [`hunt_raw.spl`](hunt_raw.spl) | Splunk hunt for data not mapped to CIM ([macros](../../../../all/splunk_macros.conf)) |
| [`hunt.yaral`](hunt.yaral) | Google SecOps YARA-L 2.0 detection rule |

Indicators by type: 3 IPv4, 1 IPv6, 1 other. See `iocs.csv` for full details and descriptions.

## MITRE ATT&CK

| ID | Technique |
|---|---|
| [T1199](https://attack.mitre.org/techniques/T1199/) | Trusted Relationship |
| [T1078.004](https://attack.mitre.org/techniques/T1078/004/) | Valid Accounts: Cloud Accounts |
| [T1528](https://attack.mitre.org/techniques/T1528/) | Steal Application Access Token |
| [T1552.001](https://attack.mitre.org/techniques/T1552/001/) | Credentials In Files |
| [T1078](https://attack.mitre.org/techniques/T1078/) | Valid Accounts |

## Recommended actions

1. If Barracuda notified you, revoke and recreate Managed XDR Cloud or Monitored Endpoint integration credentials (Microsoft 365, Google Workspace and endpoint connectors) and review connected-system logs since 1 November 2026.
2. Block 180.178.56.10 and 52.128.238.126 as individual hosts (N963/Netsec hosting, not Azure). Do not block 221.146.68.107 (Korea Telecom) or 2a09:bac1:7680:3d0::26b:5b (Cloudflare WARP), and do not widen the blocks to the surrounding ranges.
3. Hunt Entra ID, Cloud App and AWS CloudTrail sign-ins and API calls from those four addresses, or with the user agent Mozilla/5.0 (compatible; read-only-audit), since 1 November, especially Barracuda connector service principals and OAuth apps.
4. Treat Boto3/1.43.122, curl/8.5.0, curl/7.81.0 and Python-urllib/3.10 as context only, not as indicators.

## Behaviours to hunt

> Behaviours are leads, not confirmed indicators, and can match legitimate activity. Compare any hit against your own baseline and environment before acting.

1. **Alert** · Cloud or identity sign-ins from the Barracuda addresses or the read-only-audit user agent\
   Look for: Cloud or identity sign-ins and API calls from 180.178.56.10, 52.128.238.126, 221.146.68.107 or 2a09:bac1:7680:3d0::26b:5b, or with the user agent Mozilla/5.0 (compatible; read-only-audit), since 1 November 2026, especially by Barracuda connector service principals or OAuth apps\
   Why it matters: Barracuda published these four addresses and the distinctive read-only-audit user agent as the source of the 1-2 November 2026 intrusion into the store that holds Managed XDR integration credentials. A hit on a Barracuda connector service principal or OAuth app is the highest-priority case, but any sign-in or API call from those indicators since 1 November is worth investigating. Tuning: match only those four addresses or a user agent containing read-only-audit; do not hunt the generic Boto3, curl or Python-urllib agents from the advisory. 221.146.68.107 is Korea Telecom subscriber space and 2a09:bac1:7680:3d0::26b:5b is Cloudflare WARP, so a match on those two is an alert lead, not a reason to block the network. Expected false positives: a legitimate user or service reaching your tenant through that exact Cloudflare WARP address or that Korea Telecom subscriber; or an internal audit tool that already uses the read-only-audit user agent. Confirm whether the principal is a Barracuda connector and whether the activity was expected.\
   Log source: Defender XDR EntraIdSignInEvents, AADSignInEventsBeta, EntraIdSpnSignInEvents, AADSpnSignInEventsBeta and CloudAppEvents; AWS CloudTrail (AWSCloudTrail in Sentinel). The CloudTrail and some web tables need Microsoft Sentinel connected to the Defender portal.\
   Source: [Barracuda](https://trust.barracuda.com/security/barracuda-xdr-integration-credentials)

Behaviours that map cleanly to log fields are included in [`hunt.kql`](hunt.kql) and [`hunt.spl`](hunt.spl), and alert behaviours in [`hunt.yaral`](hunt.yaral). The rest are listed in the Behaviours section above with where to look. Use behaviours to hunt and alert, never to block.

## Sources

- [Barracuda – Barracuda XDR Integration Credentials](https://trust.barracuda.com/security/barracuda-xdr-integration-credentials)

---

[Back to index](../../../../README.md)
