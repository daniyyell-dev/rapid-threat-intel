# Able2Shell N-able N-central Zero-Days

[Back to index](../../../../README.md#latest-threats) · [November 2026](../../README.md) · [2026-11-12](../README.md)

| Published | First added | Last updated | Category | Indicators | Block now |
|---|---|---|---|---|---|
| 2026-11-09 | 2026-11-12 09:55 | 2026-11-12 | Exploitation / MSP RMM | 4 | 1 |

## Summary

An independent researcher published proof-of-concept code for 33 flaws in N-able N-central, the remote monitoring and management platform used by MSPs and IT teams, under the name Able2Shell. N-able took Hosted N-central offline on 9 November and shipped 2026.4 HF2 on 10 November, but late on 11 November the researcher released two more chains, 4EverAble2Shell (unauthenticated root RCE on the server) and Agent2Shell (commands as SYSTEM on managed Windows endpoints), which Huntress says work against HF2, so a fully patched server should be treated as vulnerable. watchTowr, Lupovis and Previdian have seen exploitation attempts against N-central honeypots, and N-able reports scanning tied to the public code; no customer compromise has been confirmed. Earlier N-central zero-days were exploited and are in CISA KEV, and Beazley notes past state-sponsored targeting. 5.231.45.175 is reported by both Previdian and Lupovis and is a block candidate; the AWS address 3.74.48.121 is alert-only. Most of the value here is in the behaviours: hunt N-central web logs, the appliance file system and N-able Agent child processes on managed endpoints.

> [!WARNING]
> Exploitation attempts are from honeypots; no confirmed customer compromise yet. Huntress's file and process indicators come from static analysis of the public code and may not match modified exploits. 3.74.48.121 is AWS: alert only.

## Affected countries and sectors

- **Countries:** Not stated in the sources
- **Regions:** Global
- **Sectors:** Managed service providers, IT operations
- **Note:** Any MSP or IT team running N-central is exposed, along with the customer networks it manages; Censys counts about 1,728 internet-exposed instances. No victim organisations have been named.
- **Source:** [Huntress – N-able disables cloud services following disclosure of Able2Shell exploit chains](https://www.huntress.com/blog/n-able-disables-cloud-services-following-disclosure-of-able2shell-exploit-chains)

## At a glance

| File | What it is |
|---|---|
| [`block_now.txt`](https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/threats/2026-11_November-2026/2026-11-12/Able2Shell-N-able-N-central-Zero-Days/block_now.txt) (raw) | 1 high-confidence indicators to block now |
| [`iocs.csv`](iocs.csv) | All 4 indicators with description, confidence, action and source |
| [`defender_xdr_indicators.csv`](defender_xdr_indicators.csv) | 4 rows for Defender XDR bulk import |
| [`hunt.kql`](hunt.kql) | Defender XDR advanced hunting query |
| [`hunt.spl`](hunt.spl) | Splunk hunt over the CIM data models |
| [`hunt_raw.spl`](hunt_raw.spl) | Splunk hunt for data not mapped to CIM ([macros](../../../../all/splunk_macros.conf)) |
| [`hunt.yaral`](hunt.yaral) | Google SecOps YARA-L 2.0 detection rule |

Indicators by type: 2 IPv4, 2 URLs. See `iocs.csv` for full details and descriptions.

## MITRE ATT&CK

| ID | Technique |
|---|---|
| [T1190](https://attack.mitre.org/techniques/T1190/) | Exploit Public-Facing Application |
| [T1199](https://attack.mitre.org/techniques/T1199/) | Trusted Relationship |
| [T1072](https://attack.mitre.org/techniques/T1072/) | Software Deployment Tools |
| [T1136](https://attack.mitre.org/techniques/T1136/) | Create Account |
| [T1059.001](https://attack.mitre.org/techniques/T1059/001/) | PowerShell |
| [T1068](https://attack.mitre.org/techniques/T1068/) | Exploitation for Privilege Escalation |
| [T1005](https://attack.mitre.org/techniques/T1005/) | Data from Local System |

## Recommended actions

1. Take on-premises N-central servers off the internet, even on 2026.4 HF2, until N-able publishes a fix for 4EverAble2Shell and Agent2Shell; do not rely on IP allowlisting alone, because agents and probes use the same endpoints.
2. Block 5.231.45.175 and alert on 3.74.48.121 at the perimeter, and search N-central web and proxy logs from 8 November for both addresses and for requests to /dms/services/ServerUI and /dms2/services2/ServerMMS2 from unexpected external sources.
3. On the server, look for new or enabled Default Administrator accounts, unexpected password resets, new scripts, software or policy deployments and remote sessions, plus serverchild-* files under /var/opt/n-central/tmp and CodeDropMeta.xml ZIPs.
4. On managed Windows endpoints, hunt for encoded PowerShell run as SYSTEM by the N-able Agent, wsp.exe or service.cfg written to the Windows Software Probe folder, and taskkill of wsp.exe from a .cmd in %TEMP%. If anything is confirmed, treat every network managed by that server as in scope.

## Behaviours to hunt

> Behaviours are leads, not confirmed indicators, and can match legitimate activity. Compare any hit against your own baseline and environment before acting.

1. **Alert** · N-central ServerUI or ServerMMS2 exploit requests\
   Look for: Unauthenticated SOAP POSTs to /dms/services/ServerUI or /dms2/services2/ServerMMS2 from external addresses, carrying SessionHello, GenericAgentXMPPMessageExchange or RemoteExecutionTaskSubmit with SessionID -1, importServiceFromFile with a remote FilePath, or an XML DOCTYPE\
   Why it matters: These are the endpoints and messages used by the public Able2Shell chains. watchTowr saw SessionHello posts to ServerMMS2, Previdian captured XXE DOCTYPE and importServiceFromFile requests to ServerUI, and Huntress lists the jline.internal.TerminalLineSettings, GenericAgentXMPPMessageExchange and RemoteExecutionTaskSubmit patterns. Agents and probes also use these endpoints, so focus on unexpected external sources and the listed message contents.\
   Log source: N-central web server, reverse-proxy and WAF logs\
   Source: [Huntress](https://www.huntress.com/blog/n-able-disables-cloud-services-following-disclosure-of-able2shell-exploit-chains)

2. **Alert** · N-central-sec-audit/1.0 user agent\
   Look for: HTTP requests whose User-Agent ends in N-central-sec-audit/1.0\
   Why it matters: watchTowr's published exploitation attempt used this User-Agent. It is trivial to change, so its absence does not rule out exploitation.\
   Log source: N-central web server, reverse-proxy and WAF logs\
   Source: [Beazley Security](https://labs.beazley.security/advisories/BSL-A1242)

3. **Alert** · serverchild, flag_default.json or CodeDropMeta.xml on the server\
   Look for: Files on the N-central server: /var/opt/n-central/flag/flag_default.json as a symlink to ServerChild.sh, /var/opt/n-central/tmp/serverchild-<12 hex>.bak, .sh or .out, or ZIPs under /download/scheduled_tasks/output_files/ containing CodeDropMeta.xml\
   Why it matters: Huntress identified these files from static analysis of the 4EverAble2Shell and Agent2Shell code; they would appear if the public exploit is run unmodified.\
   Log source: File integrity or EDR file events on the N-central appliance\
   Source: [Huntress](https://www.huntress.com/blog/n-able-disables-cloud-services-following-disclosure-of-able2shell-exploit-chains)

4. **Hunt** · Encoded PowerShell as SYSTEM from the N-able Agent\
   Look for: powershell.exe -NoProfile -NonInteractive -EncodedCommand run as SYSTEM by the N-able Agent or Windows Software Probe on a managed Windows endpoint\
   Why it matters: Agent2Shell lets an unauthenticated attacker who can reach the server run commands on managed endpoints as SYSTEM. PowerShell is a very common child of the N-able Agent, so the encoded command line, not the process tree, is the signal; decode it and compare with scripts your MSP actually deploys.\
   Log source: EDR process events on Windows endpoints managed by N-central\
   Source: [Huntress](https://www.huntress.com/blog/n-able-disables-cloud-services-following-disclosure-of-able2shell-exploit-chains)

5. **Alert** · Windows Software Probe binary or config replaced\
   Look for: wsp.exe or service.cfg written to the Windows Software Probe bin folder, a CodeDrop ServiceBackup copy of wsp.exe, or files in Temp CodeDropTmp\
   Why it matters: Huntress lists these writes as artefacts of the Agent2Shell probe-replacement chain. The probe is normally updated by N-able, so check for writes outside a planned upgrade.\
   Log source: EDR file events on N-central probe hosts\
   Source: [Huntress](https://www.huntress.com/blog/n-able-disables-cloud-services-following-disclosure-of-able2shell-exploit-chains)

6. **Alert** · Probe service killed from a temp .cmd\
   Look for: taskkill /f /im wsp.exe or a stop and start of the Windows Software Probe Service, run from a .cmd file in %TEMP%\
   Why it matters: Huntress lists this service restart from a temporary batch file as part of the Agent2Shell chain. Legitimate upgrades also restart the probe, so look at the launching script location.\
   Log source: EDR process events on N-central probe hosts\
   Source: [Huntress](https://www.huntress.com/blog/n-able-disables-cloud-services-following-disclosure-of-able2shell-exploit-chains)

7. **Hunt** · New N-central admins, resets, scripts or sessions\
   Look for: New or newly enabled N-central administrator accounts (including Default Administrator), unexpected password resets, new scripts, software or policy deployments, and remote control sessions from unfamiliar addresses since 8 November\
   Why it matters: The unauthenticated XXE chain resets an account password and can create an enabled administrator; earlier N-central exploitation was followed by scripts sprayed into managed environments. Beazley and Huntress both recommend this review.\
   Log source: N-central audit and login logs\
   Source: [Beazley Security](https://labs.beazley.security/advisories/BSL-A1242)

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

- [Huntress – N-able disables cloud services following disclosure of Able2Shell exploit chains](https://www.huntress.com/blog/n-able-disables-cloud-services-following-disclosure-of-able2shell-exploit-chains)
- [Beazley Security Labs – Emerging threat: critical vulnerabilities in N-able N-central (watchTowr and Lupovis observations)](https://labs.beazley.security/advisories/BSL-A1242)
- [Previdian – N-able N-central critical vulnerabilities: what we know so far](https://blog.previdian.com/n-able-n-central-critical-vulnerabilities-what-we-know-so-far/)
- [N-able – Update on N-central 2026.4 HF2 and ongoing security response](https://www.n-able.com/blog/update-on-n-central-2026-4-hf2-and-ongoing-security-response)
- [Tenable – Able2Shell FAQ: N-able N-central zero-days and Hotfix 2](https://www.tenable.com/blog/able2shell-frequently-asked-questions-for-reported-n-able-n-central-zero-day-vulnerabilities)
- [Rapid7 – Critical vulnerabilities in N-able N-central prompt hosted shutdown](https://www.rapid7.com/blog/post/etr-critical-vulnerabilities-in-n-able-n-central-prompt-hosted-shutdown/)

---

[Back to index](../../../../README.md#latest-threats)
