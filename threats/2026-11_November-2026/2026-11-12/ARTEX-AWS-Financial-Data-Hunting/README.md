# ARTEX AWS Financial-Data Hunting

[Back to index](../../../../README.md) · [November 2026](../../README.md) · [2026-11-12](../README.md)

| Published | First added | Last updated | Category | Indicators | Block now |
|---|---|---|---|---|---|
| 2026-11-09 | 2026-11-12 09:50 | 2026-11-12 | Financially motivated intrusion / cloud | 10 | 0 |

## Summary

Datadog Security Labs documented ARTEX operators in the Storm-0940 cluster hunting financial data in AWS environments. The agents call CloudWatch FilterLogEvents for card, payment and invoice terms with a 1,000-event limit, probe S3 anonymously then move into Amazon Cognito (SignUp and InitiateAuth), and send distinctive ARTEX user agents such as artex-readonly/1.0 and ARTeX-authorized-pentest. Ten operator IP addresses were published by Datadog only, so they are medium confidence and for hunt and alert only; do not block whole hosting ASNs or unrelated hosts on the same networks. This activity is distinct from the Cambodia-based Storm-3358 web-RAT campaign, which has its own entry. Sophos X-Ops has also described ARTEX tradecraft against financial organisations, without publishing these AWS addresses.

> [!WARNING]
> Single-source network indicators (Datadog). Alert and hunt only; do not block entire ASNs or shared hosting ranges. Distinct from Storm-3358.

## Affected countries and sectors

- **Countries:** Not stated in the sources
- **Regions:** Global
- **Sectors:** Financial services
- **Note:** Datadog documented ARTEX operators (Storm-0940 cluster) hunting financial data in AWS, including card, payment and invoice log content. Specific victim organisations were not named.
- **Source:** [Datadog Security Labs – ARTEX agentic attacks in AWS environments](https://securitylabs.datadoghq.com/articles/artex-agentic-attacks-aws-environments/)

## At a glance

| File | What it is |
|---|---|
| [`block_now.txt`](https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/threats/2026-11_November-2026/2026-11-12/ARTEX-AWS-Financial-Data-Hunting/block_now.txt) (raw) | None yet: no indicator is high-confidence enough to block, so use the files below to hunt |
| [`iocs.csv`](iocs.csv) | All 10 indicators with description, confidence, action and source |
| [`defender_xdr_indicators.csv`](defender_xdr_indicators.csv) | 10 rows for Defender XDR bulk import |
| [`hunt.kql`](hunt.kql) | Defender XDR advanced hunting query |
| [`hunt.spl`](hunt.spl) | Splunk hunt over the CIM data models |
| [`hunt_raw.spl`](hunt_raw.spl) | Splunk hunt for data not mapped to CIM ([macros](../../../../all/splunk_macros.conf)) |
| [`hunt.yaral`](hunt.yaral) | Google SecOps YARA-L 2.0 detection rule |

Indicators by type: 10 IPv4. See `iocs.csv` for full details and descriptions.

## MITRE ATT&CK

| ID | Technique |
|---|---|
| [T1595](https://attack.mitre.org/techniques/T1595/) | Active Scanning |
| [T1526](https://attack.mitre.org/techniques/T1526/) | Cloud Service Discovery |
| [T1530](https://attack.mitre.org/techniques/T1530/) | Data from Cloud Storage |
| [T1213](https://attack.mitre.org/techniques/T1213/) | Data from Information Repositories |
| [T1078](https://attack.mitre.org/techniques/T1078/) | Valid Accounts |
| [T1136.003](https://attack.mitre.org/techniques/T1136/003/) | Create Cloud Account |
| [T1071](https://attack.mitre.org/techniques/T1071/) | Application Layer Protocol |

## Recommended actions

1. Alert on the ten operator IP addresses in CloudTrail, VPC flow, WAF and perimeter logs; do not block whole ASNs.
2. Hunt CloudTrail for FilterLogEvents calls whose filter patterns include financial terms (card, payment, invoice, transaction) and a limit of 1,000, and for anonymous S3 access followed by Cognito SignUp or InitiateAuth.
3. Hunt proxy, WAF and application logs for ARTEX user agents (artex-readonly/1.0, artex-pentest/1.0, artex-audit/1.0, artex-spawn/1, artex-verify/1.0, ARTEX-worker/1.0, ARTeX-authorized-pentest, Mozilla/5.0 ARTeX, artex-i21861-canary).
4. Look for canary GetObject keys such as zzz_nonexistent_abc.txt immediately before real object reads, and review IAM and Cognito changes in the same window.

## Behaviours to hunt

> Behaviours are leads, not confirmed indicators, and can match legitimate activity. Compare any hit against your own baseline and environment before acting.

1. **Hunt** · CloudWatch FilterLogEvents for financial terms\
   Look for: CloudWatch FilterLogEvents calls whose filter patterns include financial terms and a limit of 1,000\
   Why it matters: Datadog saw ARTEX agents search CloudWatch logs for card, payment and invoice terms with FilterLogEvents and a 1,000-event limit.\
   Log source: AWS CloudTrail\
   Source: [Datadog Security Labs](https://securitylabs.datadoghq.com/articles/artex-agentic-attacks-aws-environments/)

2. **Hunt** · Anonymous S3 then Cognito SignUp or InitiateAuth\
   Look for: Anonymous S3 access followed by Cognito SignUp or InitiateAuth from the same identity or address\
   Why it matters: Datadog documented ARTEX operators probing S3 anonymously, then creating or authenticating Cognito users to reach further data.\
   Log source: AWS CloudTrail\
   Source: [Datadog Security Labs](https://securitylabs.datadoghq.com/articles/artex-agentic-attacks-aws-environments/)

3. **Alert** · ARTEX user agents in AWS or proxy logs\
   Look for: HTTP or AWS API requests with ARTEX user agents such as artex-readonly/1.0, ARTeX-authorized-pentest or ARTEX-worker/1.0\
   Why it matters: Datadog published distinctive ARTEX user agents used during AWS financial-data hunting, including artex-readonly/1.0, artex-pentest/1.0, artex-audit/1.0, artex-spawn/1, artex-verify/1.0, ARTEX-worker/1.0, Mozilla/5.0 ARTeX, ARTeX-authorized-pentest and artex-i21861-canary.\
   Log source: AWS CloudTrail, WAF, proxy and application logs\
   Source: [Datadog Security Labs](https://securitylabs.datadoghq.com/articles/artex-agentic-attacks-aws-environments/)

4. **Hunt** · ARTEX canary S3 object keys\
   Look for: S3 GetObject or HeadObject for canary keys such as zzz_nonexistent_abc.txt or Notexist-xyz immediately before real object reads\
   Why it matters: Datadog observed ARTEX agents probing non-existent canary object keys before reading real financial data.\
   Log source: AWS CloudTrail\
   Source: [Datadog Security Labs](https://securitylabs.datadoghq.com/articles/artex-agentic-attacks-aws-environments/)

Behaviours that map cleanly to log fields are included in [`hunt.kql`](hunt.kql) and [`hunt.spl`](hunt.spl), and alert behaviours in [`hunt.yaral`](hunt.yaral). The rest are listed in the Behaviours section above with where to look. Use behaviours to hunt and alert, never to block.

## Hunt

Run one of these to find past activity. Each file is the same hunt written for a different platform; pick the one for your SIEM or XDR.

| File | Platform | How to run it |
|---|---|---|
| [`hunt.kql`](hunt.kql) | Microsoft Defender XDR | In the [Defender portal](https://security.microsoft.com), open **Hunting > Advanced hunting**, paste the query and select **Run query**. It covers the last 30 days. |
| [`hunt.spl`](hunt.spl) | Splunk | In **Search & Reporting**, set the time picker to the last 30 days or more, paste the search and run it. It reads the CIM data models. |
| [`hunt_raw.spl`](hunt_raw.spl) | Splunk without CIM | The same hunt over raw events. Define the `rti_*` macros from [`splunk_macros.conf`](../../../../all/splunk_macros.conf) first. |
| [`hunt.yaral`](hunt.yaral) | Google SecOps | In **Detection > Rules & Detections > Rules Editor**, paste the rule, run a Retrohunt over the last 30 days, then turn on live mode. |

Leads that are not network or hash indicators are in [`iocs.csv`](iocs.csv), and behaviours with no clean field mapping are in the Behaviours section above. Guides: [Defender XDR](../../../../docs/defender-xdr.md), [Splunk](../../../../docs/splunk.md), [Google SecOps](../../../../docs/google-secops.md).

## Sources

- [Datadog Security Labs – ARTEX agentic attacks in AWS environments](https://securitylabs.datadoghq.com/articles/artex-agentic-attacks-aws-environments/)
- [Sophos X-Ops – ARTEX attackers apply agentic AI (tradecraft corroboration, no AWS addresses)](https://www.sophos.com/en-us/blog/artex-attackers-apply-agentic-ai)

---

[Back to index](../../../../README.md)
