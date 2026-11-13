# Qubole Cross-Account Access Abused: Vendor IAM Credentials Used to Assume Customer AWS Roles

[Live entry](https://daniyyell.com/rapid-threat-intel/t/Qubole-Cross-Account-AWS-Role-Abuse/) · [Back to index](../../../../README.md) · [November 2026](../../README.md) · [2026-11-13](../README.md)

| Published | First added | Last updated | Category | Indicators | Block now |
|---|---|---|---|---|---|
| 2026-11-09 | 2026-11-13 11:40 | 2026-11-13 | Supply chain / cloud intrusion | 12 | 5 |

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

Wiz, working with Sentra and Mandiant, reports that between 14 and 26 October 2026 a threat actor used IAM credentials from AWS account 805246085872, which Qubole's data platform uses to reach customer accounts, to assume the cross-account integration roles that dozens of customers had created to trust Qubole. Every AssumeRole call carried a valid External ID and succeeded, and most of the roles were otherwise unused. Using session names starting quiam-, the actor enumerated S3, EC2, RDS, IAM and KMS, read Lambda environment variables, Secrets Manager secrets and SSM parameters, downloaded whole S3 buckets, and validated the credentials it found with TruffleHog against AWS, Entra ID and Okta. Traffic came from an OVH server (57.129.54.120, which also hosted a bootable sso_agent.iso that beacons to TCP 23458) and Mullvad VPN exits. An actor calling itself n0n has claimed the intrusion. The OVH address and the ISO hashes are on the block list; the Mullvad exits, the vendor account and its principal IDs are alert-only hunt leads.

> [!WARNING]
> Account 805246085872 and the principal AIDAJYRRH5Y3A7AAJM2HW also carry legitimate Qubole traffic from AWS infrastructure; alert on them only when the source address is not an AWS address. AIDA3W7DIFLYOLTK63SFS was seen only in attacker activity. The Mullvad addresses are shared VPN exits and are not blocked. 57.129.54.120 was attacker-controlled from 15 to 26 October 2026 and may be reassigned later. The user agents Wiz lists are common and are only useful alongside another indicator.

## Affected countries and sectors

- **Countries:** Not stated in the sources
- **Regions:** Global
- **Sectors:** Organisations using Qubole data platform integrations on AWS
- **Note:** Wiz saw dozens of AWS customer environments with Qubole integration roles accessed between 14 and 26 October 2026; victims are not named.
- **Source:** [Wiz – Trusted by Default: Qubole Cross-Account Access Abused in the Wild](https://www.wiz.io/blog/qubole-cross-account-access-abused-in-the-wild)

## At a glance

| File | What it is |
|---|---|
| [`block_now.txt`](https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/threats/2026-11_November-2026/2026-11-13/Qubole-Cross-Account-AWS-Role-Abuse/block_now.txt) (raw) | 5 high-confidence indicators to block now |
| [`iocs.csv`](iocs.csv) | All 12 indicators with description, confidence, action and source |
| [`defender_xdr_indicators.csv`](defender_xdr_indicators.csv) | 8 rows for Defender XDR bulk import |
| [`hunt.kql`](hunt.kql) | Defender XDR advanced hunting query |
| [`hunt.spl`](hunt.spl) | Splunk hunt over the CIM data models |
| [`hunt_raw.spl`](hunt_raw.spl) | Splunk hunt for data not mapped to CIM ([macros](../../../../all/splunk_macros.conf)) |
| [`hunt.yaral`](hunt.yaral) | Google SecOps YARA-L 2.0 detection rule |

Indicators by type: 4 IPv4, 4 other, 1 IPv6, 1 SHA256, 1 SHA1, 1 MD5. See `iocs.csv` for full details and descriptions.

## MITRE ATT&CK

| ID | Technique |
|---|---|
| [T1199](https://attack.mitre.org/techniques/T1199/) | Trusted Relationship |
| [T1078.004](https://attack.mitre.org/techniques/T1078/004/) | Cloud Accounts |
| [T1580](https://attack.mitre.org/techniques/T1580/) | Cloud Infrastructure Discovery |
| [T1552.001](https://attack.mitre.org/techniques/T1552/001/) | Credentials In Files |
| [T1555.006](https://attack.mitre.org/techniques/T1555/006/) | Cloud Secrets Management Stores |
| [T1530](https://attack.mitre.org/techniques/T1530/) | Data from Cloud Storage |
| [T1090.002](https://attack.mitre.org/techniques/T1090/002/) | External Proxy |

## Recommended actions

1. List every IAM role whose trust policy allows account 805246085872 or any other external vendor account; delete roles for integrations you no longer use.
2. Search CloudTrail from 1 October 2026 in every account with a Qubole role for AssumeRole by account 805246085872 from a non-AWS address, any activity by principal AIDA3W7DIFLYOLTK63SFS, and role sessions named quiam-*.
3. For any session you find, review its Secrets Manager, SSM Parameter Store, Lambda and S3 activity, rotate every secret, parameter and Lambda environment variable the role could read, and revoke the role's active sessions.
4. Block 57.129.54.120 and search 90 days of CloudTrail, proxy and identity-provider logs for it and for the Mullvad exits 45.83.220.211, 185.209.199.73 and 89.37.63.175.
5. Pin vendor trust policies to the vendor's specific principal and add aws:SourceIp or aws:SourceVpce conditions; Wiz notes a source-IP condition alone would have blocked every role assumption it saw.
6. Check identity-provider sign-in logs for TruffleHog user agents on service principals and Okta clients from the listed addresses.

## Behaviours to hunt

> Behaviours are leads, not confirmed indicators, and can match legitimate activity. Compare any hit against your own baseline and environment before acting.

1. **Alert** · Qubole account role assumption from a non-AWS address\
   Look for: AssumeRole by AWS account 805246085872 (Qubole) from a source address that is not an AWS address, or any CloudTrail activity by principal AIDA3W7DIFLYOLTK63SFS\
   Why it matters: Wiz saw all legitimate Qubole platform traffic come from AWS infrastructure, while every attacker role assumption came from OVH or Mullvad addresses with a valid External ID. AIDA3W7DIFLYOLTK63SFS appeared only in attacker activity. Tuning: in Defender XDR, calls whose ISP is Amazon (AWS infrastructure) or whose source is an AWS service name are excluded. In Splunk and Google SecOps, which have no ISP field here, the rule matches the vendor account only from the published attacker addresses, plus any use of AIDA3W7DIFLYOLTK63SFS; add an AWS ip-ranges lookup to widen it to any non-AWS source. Expected false positives: a Qubole support engineer assuming a role from an office address, which should itself be questioned.\
   Log source: AWS CloudTrail management events, or Defender XDR CloudAppEvents with the AWS connector\
   Source: [Wiz](https://www.wiz.io/blog/qubole-cross-account-access-abused-in-the-wild)

2. **Alert** · quiam-* role sessions harvesting secrets or S3\
   Look for: Role sessions named quiam-* (for example quiam-enum or quiam-scope-full), followed by ListSecrets, GetSecretValue, GetParameter, GetFunctionConfiguration or bulk S3 GetObject\
   Why it matters: The actor named every assumed-role session quiam- plus a word describing the task, then harvested Lambda environment variables, Secrets Manager secrets and SSM parameters and downloaded S3 buckets. Tuning: the quiam- prefix is specific to this actor. Expected false positives: none known.\
   Log source: AWS CloudTrail management and S3 data events, or Defender XDR CloudAppEvents with the AWS connector\
   Source: [Wiz](https://www.wiz.io/blog/qubole-cross-account-access-abused-in-the-wild)

3. **Alert** · TruffleHog credential checks from the attacker addresses\
   Look for: GetCallerIdentity, Entra ID service-principal sign-ins or Okta client-credential token requests with a TruffleHog user agent from 57.129.54.120, 2001:41d0:70d:7800:: or the Mullvad exits\
   Why it matters: The actor validated the keys and client secrets it stole from customer accounts with TruffleHog, in bursts lasting seconds. TruffleHog is also run by security teams, so the hunt requires one of the attacker addresses as well. Expected false positives: none when paired with the addresses.\
   Log source: AWS CloudTrail, Entra ID service principal sign-in logs, Okta system log; Defender XDR CloudAppEvents and AADSpnSignInEventsBeta\
   Source: [Wiz](https://www.wiz.io/blog/qubole-cross-account-access-abused-in-the-wild)

Behaviours that map cleanly to log fields are included in [`hunt.kql`](hunt.kql) and [`hunt.spl`](hunt.spl), and alert behaviours in [`hunt.yaral`](hunt.yaral). The rest are listed in the Behaviours section above with where to look. Use behaviours to hunt and alert, never to block.

## Sources

- [Wiz – Trusted by Default: Qubole Cross-Account Access Abused in the Wild](https://www.wiz.io/blog/qubole-cross-account-access-abused-in-the-wild)
- [BleepingComputer – Hackers exploit trusted AWS access to breach multiple cloud environments](https://www.bleepingcomputer.com/news/security/hackers-exploit-trusted-aws-access-to-breach-multiple-cloud-environments/)
- [The Hacker News – Hackers exploit Qubole's trusted AWS access to breach customer accounts and steal data](https://thehackernews.com/2026/11/hackers-exploit-quboles-trusted-aws.html)
- [The Register – Attackers backdoor trusted AWS integrations to steal secrets](https://www.theregister.com/security/2026/11/09/attackers-backdoor-trusted-aws-integrations-to-steal-secrets/5308553)

---

[Back to index](../../../../README.md)
