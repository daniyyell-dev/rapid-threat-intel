# AntiFox: ARTEX Fork Used to Implant IIS Web Shells and Steal AWS Secrets

[Back to index](../../../../README.md) · [November 2026](../../README.md) · [2026-11-12](../README.md)

| Published | First added | Last updated | Category | Indicators | Block now |
|---|---|---|---|---|---|
| 2026-11-11 | 2026-11-12 09:25 | 2026-11-12 | Exploitation / cloud credential theft | 2 | 0 |

## Summary

Arctic Wolf Labs, reported on 11 November 2026, observed intrusions in which self-hosted AntiFox consoles on Alibaba Cloud were used against internet-facing IIS applications. AntiFox is an open-source agentic penetration-testing platform built on ARTEX. In the observed cases, access to a compromised IIS application was used to drop an ASPX web shell through w3wp.exe, run whoami and icacls, read web.config and connection strings, and then abuse valid AWS identities to enumerate many services. In some instances the actor called GetSecretValue on a production secret, or used the identity for S3 discovery and object operations. This is a different fork and different infrastructure from the Storm-3358 ARTEX campaign already in this feed. Arctic Wolf did not publish network indicators in the public write-ups; two IP addresses circulating on third-party sites are included as medium-confidence alert-only leads and have not been confirmed by Arctic Wolf. Do not block Alibaba Cloud.

> [!WARNING]
> The two IP addresses were not published by Arctic Wolf or The Hacker News. Treat them as unconfirmed alert-only leads. Do not block Alibaba Cloud.

## Affected countries and sectors

- **Countries:** Not stated in the sources
- **Sectors:** Cloud services, Technology
- **Note:** Arctic Wolf described confirmed malicious actions against internet-facing IIS applications and associated AWS environments. No countries were named.
- **Source:** [The Hacker News – AntiFox AI pentesting platform linked to attacks that accessed AWS production secrets](https://thehackernews.com/2026/11/antifox-ai-pentesting-platform-linked.html)

## At a glance

| File | What it is |
|---|---|
| [`block_now.txt`](https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/threats/2026-11_November-2026/2026-11-12/AntiFox-ARTEX-Fork-IIS-AWS-Secret-Theft/block_now.txt) (raw) | None yet: no indicator is high-confidence enough to block, so use the files below to hunt |
| [`iocs.csv`](iocs.csv) | All 2 indicators with description, confidence, action and source |
| [`defender_xdr_indicators.csv`](defender_xdr_indicators.csv) | 2 rows for Defender XDR bulk import |
| [`hunt.kql`](hunt.kql) | Defender XDR advanced hunting query |
| [`hunt.spl`](hunt.spl) | Splunk hunt over the CIM data models |
| [`hunt_raw.spl`](hunt_raw.spl) | Splunk hunt for data not mapped to CIM ([macros](../../../../all/splunk_macros.conf)) |
| [`hunt.yaral`](hunt.yaral) | Google SecOps YARA-L 2.0 detection rule |

Indicators by type: 2 IPv4. See `iocs.csv` for full details and descriptions.

## MITRE ATT&CK

| ID | Technique |
|---|---|
| [T1190](https://attack.mitre.org/techniques/T1190/) | Exploit Public-Facing Application |
| [T1505.003](https://attack.mitre.org/techniques/T1505/003/) | Web Shell |
| [T1059.001](https://attack.mitre.org/techniques/T1059/001/) | PowerShell |
| [T1083](https://attack.mitre.org/techniques/T1083/) | File and Directory Discovery |
| [T1552.001](https://attack.mitre.org/techniques/T1552/001/) | Credentials in Files |
| [T1078](https://attack.mitre.org/techniques/T1078/) | Valid Accounts |
| [T1526](https://attack.mitre.org/techniques/T1526/) | Cloud Service Discovery |
| [T1530](https://attack.mitre.org/techniques/T1530/) | Data from Cloud Storage Object |

## Recommended actions

1. Hunt IIS servers for w3wp.exe creating new .aspx files, and for w3wp.exe launching cmd, PowerShell, whoami or icacls.
2. In AWS CloudTrail, hunt valid identities that enumerate many services and, in particular, ListSecrets followed by GetSecretValue or unexpected S3 object access.
3. Treat the two circulated IP addresses as alert-only leads only; do not block Alibaba Cloud.
4. This is a separate AntiFox fork from Storm-3358; review both entries if you already hunt ARTEX behaviour.

## Behaviours to hunt

> Behaviours are leads, not confirmed indicators, and can match legitimate activity. Compare any hit against your own baseline and environment before acting.

1. **Alert** · IIS worker dropping an ASPX web shell\
   Look for: w3wp.exe creating a new .aspx file under the web root or an upload directory\
   Why it matters: Arctic Wolf saw the IIS worker process drop an ASPX web shell after the web application was compromised, then run commands through that shell.\
   Log source: EDR file events on IIS servers\
   Source: [The Hacker News](https://thehackernews.com/2026/11/antifox-ai-pentesting-platform-linked.html)

2. **Alert** · IIS worker running whoami, icacls or PowerShell\
   Look for: w3wp.exe starting cmd, PowerShell, whoami or icacls, or PowerShell that searches for web.config and connection strings\
   Why it matters: Arctic Wolf reported commands run through w3wp.exe to identify the execution context, enumerate the application directory, check permissions with icacls, and locate configuration and credentials.\
   Log source: EDR process events on IIS servers\
   Source: [The Hacker News](https://thehackernews.com/2026/11/antifox-ai-pentesting-platform-linked.html)

3. **Hunt** · AWS secret and service enumeration\
   Look for: Valid AWS identities enumerating many services, especially Secrets Manager ListSecrets followed by GetSecretValue, or rapid List, Get and Describe calls across IAM, EC2, S3, Lambda, RDS, KMS and similar APIs\
   Why it matters: Arctic Wolf saw attackers abuse valid IAM identities to enumerate dozens of AWS services and, in some cases, successfully call GetSecretValue on a production secret or perform S3 object operations.\
   Log source: AWS CloudTrail, or CloudAppEvents with the AWS connector\
   Source: [The Hacker News](https://thehackernews.com/2026/11/antifox-ai-pentesting-platform-linked.html)

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

- [The Hacker News – AntiFox AI pentesting platform linked to attacks that accessed AWS production secrets](https://thehackernews.com/2026/11/antifox-ai-pentesting-platform-linked.html)
- [BleepingComputer – Hackers use AntiFox AI agents in AWS credential-theft attacks](https://www.bleepingcomputer.com/news/security/hackers-use-antifox-ai-agents-in-aws-credential-theft-attacks/)

---

[Back to index](../../../../README.md)
