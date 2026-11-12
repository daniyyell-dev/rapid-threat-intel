# 2026-11-12

[Back to index](../../../README.md#latest-threats) · [November 2026](../README.md)

15 threats, 148 indicators, 63 to block now. Newest first.

| Date | Threat | Category | IOCs | Block now | Summary |
|---|---|---|---|---|---|
| 2026-11-05 | [BBNet: Multi-Architecture Linux Botnet with Divergent Scanners](BBNet-Linux-Botnet-Multi-Arch-Scanners/) | Malware / botnet | 8 | 0 | Multi-arch Linux botnet that scans before it talks to C2, with no published C2 addresses or hashes |
| 2026-11-12 | [StrikeStub: ClickFix PowerShell Dropper and Modular RAT/Stealer](StrikeStub-ClickFix-RAT-Stealer/) | Malware / RAT and stealer | 6 | 2 | ClickFix PowerShell that drops a modular WebSocket RAT and stealer, with attacker staging on squidscript.com |
| 2026-11-11 | [Panzer RaaS: Self-Propagating Ransomware Spread Through Network Shares](Panzer-RaaS-Share-Propagation-Ransomware/) | Ransomware | 5 | 0 | Rust RaaS payload that copies itself to every share and runs as PanzerUpdateTask; names and behaviour only, no hashes |
| 2026-11-11 | [Citrus Ransomware: Certighost AD CS Exploitation, Xray VLESS Tunnels and Sn00py](Citrus-Ransomware-Certighost-Sn00py/) | Ransomware | 14 | 2 | Contractor-account ransomware using Certighost AD CS certificates, Xray VLESS tunnels and a fake Kaspersky GPO to push Sn00py |
| 2026-10-21 | [Lazarus Operation FlashHole: CrossWeb EX Abuse, GitHub-Issue C2 and Post-Quantum LPEClient](Lazarus-Operation-FlashHole-CrossWeb-EX/) | Espionage / APT | 22 | 9 | Lazarus abusing CrossWeb EX with GitHub-issue C2 (TechHub) and compromised Korean sites for Cubridge and ClientHub |
| 2026-11-11 | [Silent Lynx Strix AI-Agent Espionage Against Tajikistan](Silent-Lynx-Strix-AI-Agent-Espionage-Tajikistan/) | Espionage / APT | 22 | 13 | CloudSEK found an exposed server belonging to Silent Lynx (UAT-6275 at Cisco Talos, TAG-193 at Recorded Future), a Ka... |
| 2026-11-09 | [Able2Shell N-able N-central Zero-Days](Able2Shell-N-able-N-central-Zero-Days/) | Exploitation / MSP RMM | 5 | 2 | Public N-central RCE chains that still work on HF2, honeypot exploitation seen; hunt the server and N-able Agent activity |
| 2026-11-11 | [GSocket Linux Web-Server C2](GSocket-Linux-Web-Server-C2/) | Post-exploitation / Linux C2 | 9 | 4 | GSocket relay clients on compromised Linux web servers, with hashes and paths only — do not block the public relay |
| 2026-11-09 | [ARTEX AWS Financial-Data Hunting](ARTEX-AWS-Financial-Data-Hunting/) | Financially motivated intrusion / cloud | 10 | 0 | ARTEX operators in AWS hunting financial logs and Cognito, with hunt-only operator IPs |
| 2026-10-13 | [Ivanti Connect Secure UTA0576 CVE-2026-118527](Ivanti-Connect-Secure-UTA0576-CVE-2026-118527/) | Exploitation / VPN appliance | 2 | 0 | UTA0576 chaining Ivanti Connect Secure zero-days to steal LAPS, BitLocker and AD credentials |
| 2026-11-11 | [Falcon C2 (XG): Browser Framework and Antino Implant Targeting Government Webmail](Falcon-C2-XG-Antino-Browser-Implant/) | APT / browser implant | 27 | 27 | Browser C2 framework and Antino implant used against government webmail, with a malicious extension and OneDrive C2 |
| 2026-11-11 | [AntiFox: ARTEX Fork Used to Implant IIS Web Shells and Steal AWS Secrets](AntiFox-ARTEX-Fork-IIS-AWS-Secret-Theft/) | Exploitation / cloud credential theft | 2 | 0 | ARTEX fork used to implant IIS web shells and steal AWS production secrets |
| 2026-11-08 | [Operation Snowball: Cisco BroadWorks CVE-2026-20320 Exploited Against a European Telecom](Operation-Snowball-Cisco-BroadWorks-CVE-2026-20320/) | Exploitation / telecom | 4 | 0 | AI-driven intrusion of a European telecom through exploited Cisco BroadWorks CVE-2026-20320 |
| 2026-11-10 | [Outlook CVE-2026-124194: Exploited NTLM Hash Leak (Hunt Only)](Outlook-CVE-2026-124194-NTLM-Hash-Leak/) | Exploitation / credential theft | 1 | 0 | Exploited Outlook flaw that leaks NTLMv2 hashes, with no published network indicators |
| 2026-11-11 | [wfx: Hijacked GitHub Accounts Plant a CI Secret Stealer in Thousands of Repositories](GitHub-Hijacked-Accounts-wfx-CI-Secret-Stealer/) | Supply chain / CI/CD | 11 | 4 | Stolen GitHub accounts plant a CI secret stealer that exfiltrates repository secrets and backdoors cloud accounts |
