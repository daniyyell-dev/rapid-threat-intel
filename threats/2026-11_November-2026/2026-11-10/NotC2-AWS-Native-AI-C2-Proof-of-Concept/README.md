# NotC2: AWS-Native AI C2 Proof of Concept

[Back to index](../../../../README.md) · [November 2026](../../README.md) · [2026-11-10](../README.md)

| Published | First added | Last updated | Category | Indicators | Block now |
|---|---|---|---|---|---|
| 2026-11-06 | 2026-11-10 15:14 | 2026-11-10 | Cloud / C2 | 2 | 0 |

## Hunt

Run one of these to find past activity. Each file is the same hunt written for a different platform; pick the one for your SIEM or XDR.

| File | Platform | How to run it |
|---|---|---|
| [`hunt.kql`](hunt.kql) | Microsoft Defender XDR | In the [Defender portal](https://security.microsoft.com), open **Hunting > Advanced hunting**, paste the query and select **Run query**. It covers the last 30 days. |
| [`hunt.spl`](hunt.spl) | Splunk | In **Search & Reporting**, set the time picker to the last 30 days or more, paste the search and run it. It reads the CIM data models. |
| [`hunt_raw.spl`](hunt_raw.spl) | Splunk without CIM | The same hunt over raw events. Define the `rti_*` macros from [`splunk_macros.conf`](../../../../all/splunk_macros.conf) first. |
| [`hunt.yaral`](hunt.yaral) | Google SecOps | In **Detection > Rules & Detections > Rules Editor**, paste the rule, run a Retrohunt over the last 30 days, then turn on live mode. |

Leads that are not network or hash indicators are in [`iocs.csv`](iocs.csv), and behaviours with no clean field mapping are in the Behaviours section below. Guides: [Defender XDR](../../../../docs/defender-xdr.md), [Splunk](../../../../docs/splunk.md), [Google SecOps](../../../../docs/google-secops.md).

## Summary

NotC2 is a proof-of-concept command-and-control framework published by Varonis Threat Labs on 6 November 2026. It assumes the attacker already holds AWS credentials and runs the whole C2 loop on native AWS services: commands arrive through Amazon SQS, a Lambda function executes them, Amazon Bedrock translates natural-language prompts into AWS API calls through a generic tool named execute_aws_operation, and results leave through Amazon SNS to an external HTTPS endpoint. There is no conventional C2 server to block. Varonis has not reported in-the-wild use and published no network indicators. Detection depends on CloudTrail and related AWS logs: new SQS-to-Lambda event source mappings, unexpected Bedrock InvokeModel or Converse calls from Lambda roles, and SNS subscriptions to external endpoints.

> [!WARNING]
> This is a researcher-published proof of concept. Varonis has not reported in-the-wild use and published no network indicators to block. Hunt in AWS CloudTrail for the behaviours below.

## Affected countries and sectors

- **Countries:** Not stated in the sources
- **Sectors:** Not stated in the sources
- **Note:** Researcher proof of concept with no reported victims.
- **Source:** [Varonis – NotC2: How We Built an AI-Powered C2 Channel With AWS Services](https://www.varonis.com/blog/notc2-ai-powered-c2-channel)

## At a glance

| File | What it is |
|---|---|
| [`block_now.txt`](https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/threats/2026-11_November-2026/2026-11-10/NotC2-AWS-Native-AI-C2-Proof-of-Concept/block_now.txt) (raw) | None yet: no indicator is high-confidence enough to block, so use the files below to hunt |
| [`iocs.csv`](iocs.csv) | All 2 indicators with description, confidence, action and source |
| [`hunt.kql`](hunt.kql) | Defender XDR advanced hunting query |
| [`hunt.spl`](hunt.spl) | Splunk hunt over the CIM data models |
| [`hunt_raw.spl`](hunt_raw.spl) | Splunk hunt for data not mapped to CIM ([macros](../../../../all/splunk_macros.conf)) |
| [`hunt.yaral`](hunt.yaral) | Google SecOps YARA-L 2.0 detection rule |

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

## Behaviours to hunt

> Behaviours are leads, not confirmed indicators, and can match legitimate activity. Compare any hit against your own baseline and environment before acting.

1. **Alert** · SNS subscription to an external HTTP(S) endpoint by a Lambda role\
   Look for: SNS Subscribe with protocol http or https, made by a Lambda execution role (assumed-role session, often with exec-env/AWS_Lambda in the user agent)\
   Why it matters: This is how NotC2 sends command output to the operator's server. Lambda functions rarely create new external subscriptions at runtime.\
   Log source: CloudTrail management events (sns.amazonaws.com), or CloudAppEvents with the AWS connector\
   Source: [Varonis](https://www.varonis.com/blog/notc2-ai-powered-c2-channel)

2. **Hunt** · SNS subscription confirmed for a new external endpoint\
   Look for: SNS ConfirmSubscription for a new external HTTP or HTTPS endpoint\
   Why it matters: NotC2 only receives results once the operator's endpoint confirms the subscription. Record the confirmation's source address as a lead.\
   Log source: CloudTrail management events (sns.amazonaws.com)\
   Source: [Varonis](https://www.varonis.com/blog/notc2-ai-powered-c2-channel)

3. **Hunt** · SNS topic created by a Lambda role\
   Look for: SNS CreateTopic called by a Lambda execution role\
   Why it matters: The NotC2 function creates or resolves its results topic at runtime (create_topic). Application functions usually publish to topics that already exist.\
   Log source: CloudTrail management events (sns.amazonaws.com)\
   Source: [Varonis](https://www.varonis.com/blog/notc2-ai-powered-c2-channel)

4. **Alert** · New SQS-to-Lambda trigger\
   Look for: New SQS-to-Lambda event source mapping (CreateEventSourceMapping with an SQS queue ARN)\
   Why it matters: The mapping is what makes each queued command run the function automatically. New mappings on new or unused queues and functions are unusual outside deployments.\
   Log source: CloudTrail management events (lambda.amazonaws.com)\
   Source: [Varonis](https://www.varonis.com/blog/notc2-ai-powered-c2-channel)

5. **Alert** · Queue, function and trigger created by one identity within an hour\
   Look for: One identity calling sqs:CreateQueue, lambda:CreateFunction and lambda:CreateEventSourceMapping within an hour\
   Why it matters: These are the minimum deployment steps Varonis lists for NotC2 when a suitable Lambda role already exists (iam:PassRole is a permission check, not a separate event).\
   Log source: CloudTrail management events\
   Source: [Varonis](https://www.varonis.com/blog/notc2-ai-powered-c2-channel)

6. **Alert** · AWS resources named NotC2\
   Look for: SQS queue named NotC2-Commands, or queue, function or topic names containing NotC2\
   Why it matters: NotC2-Commands is the command queue name in Varonis's published screenshots. The name is trivial to change, so a miss means little.\
   Log source: CloudTrail management events (sqs CreateQueue requestParameters.queueName), AWS CLI command lines on endpoints\
   Source: [Varonis](https://www.varonis.com/blog/notc2-ai-powered-c2-channel)

7. **Hunt** · First Bedrock use by a Lambda role\
   Look for: Bedrock InvokeModel, Converse or ConverseStream from a Lambda execution role that has not used Bedrock in the previous 30 days\
   Why it matters: Bedrock is NotC2's command interpreter. Varonis calls out a sudden rise in Converse or InvokeModel calls from a Lambda role, especially one new to Bedrock.\
   Log source: CloudTrail management events (bedrock.amazonaws.com)\
   Source: [Varonis](https://www.varonis.com/blog/notc2-ai-powered-c2-channel)

8. **Hunt** · Lambda role calling Bedrock and discovery APIs together\
   Look for: The same Lambda role calling Bedrock and broad discovery APIs (ec2 DescribeInstances, dynamodb ListTables, rds DescribeDBInstances, lambda ListFunctions, s3 ListBuckets) in the same hour\
   Why it matters: Varonis shows NotC2 using Bedrock to enumerate EC2, DynamoDB, databases and Lambda functions; Bedrock use plus unrelated APIs from one role strengthens the signal.\
   Log source: CloudTrail management events\
   Source: [Varonis](https://www.varonis.com/blog/notc2-ai-powered-c2-channel)

9. **Alert** · Bedrock function named execute_aws_operation\
   Look for: A Bedrock tool definition named execute_aws_operation, or prompts starting with "ai:"\
   Why it matters: NotC2 passes every AWS action through one generic tool, execute_aws_operation, with service, operation, parameters and region fields. Only model invocation logging records the request body.\
   Log source: Bedrock model invocation logs (CloudWatch Logs or S3); not in CloudTrail\
   Source: [Varonis](https://www.varonis.com/blog/notc2-ai-powered-c2-channel)

10. **Hunt** · Lambda logs relaying commands through SNS\
   Look for: Lambda log lines "SNS message body:" followed by Command:, Target:, Exit Code:, Output: and Error: fields, or functions with SNS_TOPIC_ARN or SNS_TOPIC_NAME\
   Why it matters: These strings appear in the NotC2 code in Varonis's screenshots. Default names are easy to change, so a match is a strong lead and a miss is no proof.\
   Log source: Lambda CloudWatch Logs and function configuration\
   Source: [Varonis](https://www.varonis.com/blog/notc2-ai-powered-c2-channel)

11. **Hunt** · Full SQS to Lambda to Bedrock to SNS command chain\
   Look for: An SQS message from an unexpected source, then a Lambda run, Bedrock calls, other AWS API calls and an SNS publish to an external subscriber within minutes, all on the same queue, function and topic\
   Why it matters: Each event is normal on its own; Varonis says the sequence is the C2 loop. Data events are not logged by default and must be enabled first.\
   Log source: CloudTrail data events (SQS, Lambda, SNS), SNS delivery-status logs, Bedrock invocation logs\
   Source: [Varonis](https://www.varonis.com/blog/notc2-ai-powered-c2-channel)

Behaviours that map cleanly to log fields are included in [`hunt.kql`](hunt.kql) and [`hunt.spl`](hunt.spl), and alert behaviours in [`hunt.yaral`](hunt.yaral). The rest are listed in the Behaviours section above with where to look. Use behaviours to hunt and alert, never to block.

## Sources

- [Varonis – NotC2: How We Built an AI-Powered C2 Channel With AWS Services](https://www.varonis.com/blog/notc2-ai-powered-c2-channel)

---

[Back to index](../../../../README.md)
