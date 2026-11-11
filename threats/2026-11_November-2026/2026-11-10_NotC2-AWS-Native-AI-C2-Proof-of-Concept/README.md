# NotC2: AWS-Native AI C2 Proof of Concept

[Back to index](../../../README.md#latest-threats) · [November 2026](../README.md)

| Published | First added | Last updated | Category | Indicators | Block now |
|---|---|---|---|---|---|
| 2026-11-06 | 2026-11-10 15:14 | 2026-11-11 | Cloud / C2 | 2 | 0 |

## Summary

NotC2 is a proof-of-concept command-and-control framework published by Varonis Threat Labs on 6 November 2026. It assumes the attacker already holds AWS credentials and runs the whole C2 loop on native AWS services: commands arrive through Amazon SQS, a Lambda function executes them, Amazon Bedrock translates natural-language prompts into AWS API calls through a generic tool named execute_aws_operation, and results leave through Amazon SNS to an external HTTPS endpoint. There is no conventional C2 server to block. Varonis has not reported in-the-wild use and published no network indicators. Detection depends on CloudTrail and related AWS logs: new SQS-to-Lambda event source mappings, unexpected Bedrock InvokeModel or Converse calls from Lambda roles, and SNS subscriptions to external endpoints.

> [!WARNING]
> This is a researcher-published proof of concept. Varonis has not reported in-the-wild use and published no network indicators to block. Hunt in AWS CloudTrail for the behaviours below.

## At a glance

| File | What it is |
|---|---|
| [`block_now.txt`](https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/threats/2026-11_November-2026/2026-11-10_NotC2-AWS-Native-AI-C2-Proof-of-Concept/block_now.txt) (raw) | None yet: no indicator is high-confidence enough to block, so use the files below to hunt |
| [`iocs.csv`](iocs.csv) | All 2 indicators with description, confidence, action and source |
| [`hunt.kql`](hunt.kql) | Defender XDR advanced hunting query |

Indicators by type: 2 other. See `iocs.csv` for full details and descriptions.

## MITRE ATT&CK

| ID | Technique |
|---|---|
| [T1078.004](https://attack.mitre.org/techniques/T1078/004/) | Valid Accounts: Cloud Accounts |
| [T1059.009](https://attack.mitre.org/techniques/T1059/009/) | Cloud API |
| [T1102](https://attack.mitre.org/techniques/T1102/) | Web Service |
| [T1567](https://attack.mitre.org/techniques/T1567/) | Exfiltration Over Web Service |

## Recommended actions

1. Hunt CloudTrail for new or unexpected SQS-to-Lambda event source mappings (CreateEventSourceMapping), especially on queues or functions that are new or unused.
2. Alert on Bedrock InvokeModel or Converse calls from a Lambda execution role that has not previously used Bedrock, particularly if the same role also starts calling unrelated AWS APIs.
3. Investigate SNS HTTP or HTTPS subscriptions to external endpoints created by a Lambda execution role, and restrict who can create or modify those subscriptions to approved destinations.
4. Enforce IAM least privilege so compromised identities cannot create queues and functions, pass powerful roles, invoke Bedrock or attach external SNS subscribers; enable CloudTrail data events and Bedrock model-invocation logging to correlate the full loop.

## Hunt

This threat has no network or hash indicators to query in Defender XDR. The comments in [`hunt.kql`](hunt.kql) list the behaviours to hunt for in the relevant logs. More in the [Defender XDR guide](../../../docs/defender-xdr.md).

## Sources

- [Varonis - NotC2: How We Built an AI-Powered C2 Channel With AWS Services](https://www.varonis.com/blog/notc2-ai-powered-c2-channel)

---

[Back to index](../../../README.md#latest-threats)
