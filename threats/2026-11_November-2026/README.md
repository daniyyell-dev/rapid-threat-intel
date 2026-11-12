# November 2026

[Back to index](../../README.md#latest-threats)

27 threats, 969 indicators, 79 to block now. Newest first.

### [2026-11-12](2026-11-12/)

| Date | Threat | Category | IOCs | Block now | Summary |
|---|---|---|---|---|---|
| 2026-11-09 | [Able2Shell N-able N-central Zero-Days](2026-11-12/Able2Shell-N-able-N-central-Zero-Days/) | Exploitation / MSP RMM | 4 | 1 | Public N-central RCE chains that still work on HF2, honeypot exploitation seen; hunt the server and N-able Agent activity |
| 2026-11-11 | [GSocket Linux Web-Server C2](2026-11-12/GSocket-Linux-Web-Server-C2/) | Post-exploitation / Linux C2 | 9 | 0 | GSocket relay clients on compromised Linux web servers, with hashes and paths only — do not block the public relay |
| 2026-11-09 | [ARTEX AWS Financial-Data Hunting](2026-11-12/ARTEX-AWS-Financial-Data-Hunting/) | Financially motivated intrusion / cloud | 10 | 0 | ARTEX operators in AWS hunting financial logs and Cognito, with hunt-only operator IPs |
| 2026-10-13 | [Ivanti Connect Secure UTA0576 CVE-2026-118527](2026-11-12/Ivanti-Connect-Secure-UTA0576-CVE-2026-118527/) | Exploitation / VPN appliance | 2 | 0 | UTA0576 chaining Ivanti Connect Secure zero-days to steal LAPS, BitLocker and AD credentials |
| 2026-11-11 | [Falcon C2 (XG): Browser Framework and Antino Implant Targeting Government Webmail](2026-11-12/Falcon-C2-XG-Antino-Browser-Implant/) | APT / browser implant | 27 | 1 | Browser C2 framework and Antino implant used against government webmail, with a malicious extension and OneDrive C2 |
| 2026-11-11 | [AntiFox: ARTEX Fork Used to Implant IIS Web Shells and Steal AWS Secrets](2026-11-12/AntiFox-ARTEX-Fork-IIS-AWS-Secret-Theft/) | Exploitation / cloud credential theft | 2 | 0 | ARTEX fork used to implant IIS web shells and steal AWS production secrets |
| 2026-11-08 | [Operation Snowball: Cisco BroadWorks CVE-2026-20320 Exploited Against a European Telecom](2026-11-12/Operation-Snowball-Cisco-BroadWorks-CVE-2026-20320/) | Exploitation / telecom | 4 | 0 | AI-driven intrusion of a European telecom through exploited Cisco BroadWorks CVE-2026-20320 |
| 2026-11-10 | [Outlook CVE-2026-124194: Exploited NTLM Hash Leak (Hunt Only)](2026-11-12/Outlook-CVE-2026-124194-NTLM-Hash-Leak/) | Exploitation / credential theft | 1 | 0 | Exploited Outlook flaw that leaks NTLMv2 hashes, with no published network indicators |
| 2026-11-11 | [wfx: Hijacked GitHub Accounts Plant a CI Secret Stealer in Thousands of Repositories](2026-11-12/GitHub-Hijacked-Accounts-wfx-CI-Secret-Stealer/) | Supply chain / CI/CD | 11 | 2 | Stolen GitHub accounts plant a CI secret stealer that exfiltrates repository secrets and backdoors cloud accounts |

### [2026-11-11](2026-11-11/)

| Date | Threat | Category | IOCs | Block now | Summary |
|---|---|---|---|---|---|
| 2026-11-11 | [ScreenConnect Cloud Panel Hijack: Rogue Clients Pushed to MSP-Managed Endpoints](2026-11-11/ScreenConnect-Cloud-Panel-Hijack-MSP-Rogue-Client-Campaign/) | Supply chain / MSP remote access | 39 | 7 | Hijacked cloud ScreenConnect panels push rogue clients to MSP-managed endpoints and pivot back to technicians |
| 2026-11-11 | [Trigram: DPRK Dropper Chain Targeting AI, Blockchain and Logistics (Kimsuky / UNK_DeadDrop)](2026-11-11/Trigram-DPRK-Dropper-Kimsuky-UNK-DeadDrop/) | APT / infostealer | 275 | 9 | DPRK ClickFix and supply-chain dropper, tied to Kimsuky and UNK_DeadDrop, that steals wallets and credentials |
| 2026-10-27 | [SkyW4lker: Microsoft 365 Device-Code Phishing Kit Targeting Enterprises](2026-11-11/SkyW4lker-Microsoft-365-Device-Code-Phishing/) | Phishing / identity | 90 | 0 | Microsoft 365 device-code phishing kit that obtains tokens through genuine sign-in and MFA |
| 2026-10-05 | [Gentlemen Ransomware Affiliate Azazel: CI/CD Secret Theft, LEAKNED Extortion and MCP Command Execution](2026-11-11/Gentlemen-Affiliate-Azazel-LEAKNED-CICD-Secret-Theft/) | Ransomware / data theft and extortion | 9 | 0 | Gentlemen ransomware affiliate stealing CI/CD secrets and leaking victims on its own LEAKNED site |
| 2026-11-10 | [Xen Orchestra Authentication Bypass (VSA-2026-062) Exploited to Take Over XCP-ng Hosts](2026-11-11/Xen-Orchestra-VSA-2026-062-Auth-Bypass-XCP-ng-Takeover/) | Exploitation / hypervisor management | 17 | 0 | Cookie-based auth bypass in the Xen Orchestra console exploited to take over XCP-ng hosts as root |
| 2026-11-10 | [GhostFrame: ESXi Hypervisor Implant Linked to Settra Ransomware (TAG-218)](2026-11-11/GhostFrame-ESXi-Hypervisor-Implant-Settra-Ransomware/) | Ransomware / hypervisor | 4 | 1 | ESXi hypervisor implant used by a Settra-linked group after VPN appliance intrusions in the US and Europe |
| 2026-11-06 | [Storm-3358 ARTEX Agentic Intrusions Against the Financial Sector](2026-11-11/Storm-3358-ARTEX-Agentic-Intrusions-Financial-Sector/) | Financially motivated intrusion / financial sector | 8 | 1 | Agentic AI framework used to exploit web apps at banks and drop WISP, vshell and AdaptixC2 RATs |

### [2026-11-10](2026-11-10/)

| Date | Threat | Category | IOCs | Block now | Summary |
|---|---|---|---|---|---|
| 2026-11-09 | [AhsayCBS Backup Server Exploitation: Webshells, Cryptominer and Python Implant](2026-11-10/AhsayCBS-Backup-Server-Exploitation-Webshells-Python-Implant/) | Exploitation / backup server | 25 | 0 | Backup server auth bypass and RCE used to plant webshells, a cryptominer and a Python implant |
| 2026-11-10 | [CopperDragon: China-Nexus Sparrow Framework Targeting Government and Telecoms](2026-11-10/CopperDragon-Sparrow-Framework-China-Nexus-Espionage/) | APT / espionage | 158 | 14 | China-nexus Sparrow malware supplier behind espionage against government and telecoms in 21 countries |
| 2026-11-06 | [NotC2: AWS-Native AI C2 Proof of Concept](2026-11-10/NotC2-AWS-Native-AI-C2-Proof-of-Concept/) | Cloud / C2 | 2 | 0 | Proof-of-concept C2 built on AWS SQS, Lambda, SNS and Bedrock, with no network IOCs to block |
| 2026-11-04 | [Phexia: macOS ClickFix Stealer with Polygon C2](2026-11-10/Phexia-macOS-ClickFix-Stealer-Polygon-C2/) | Malware / macOS | 48 | 15 | macOS ClickFix backdoor and stealer that resolves C2 from a Polygon smart contract |
| 2026-11-10 | [Turla Cereal: Exchange Server Espionage Toolset](2026-11-10/Turla-Cereal-Exchange-Espionage-Toolset/) | APT / espionage | 26 | 2 | Russia-aligned Turla .NET toolset turning Exchange servers into passive backdoors |
| 2026-11-09 | [MSP Process GDAP Breach: Entra Token Abuse in Partner Tenants](2026-11-10/MSP-Process-GDAP-Breach-Entra-Token-Abuse/) | Supply chain / identity | 57 | 0 | Stolen partner app secrets used for Graph token abuse in MSP customer tenants |
| 2026-11-09 | [Ethersphere bee-js and Swarm Desktop Supply-Chain Attack (SleepyDuck / evjawbreaker)](2026-11-10/Ethersphere-bee-js-Swarm-Desktop-Supply-Chain-Attack/) | Supply chain / npm | 57 | 25 | Malicious npm and desktop releases dropping a backdoor with Ethereum-based C2 |
| 2026-11-09 | [BYOD Ransomware and Extortion: Vanderbilt University Attack](2026-11-10/BYOD-Ransomware-Vanderbilt-University-Attack/) | Ransomware | 5 | 0 | New ransomware and extortion group claiming Vanderbilt University |
| 2026-11-08 | [SSHole: OpenSSH CVE-2026-123158 Exploitation and TAC Agent Implant](2026-11-10/SSHole-OpenSSH-CVE-2026-123158-Exploitation/) | Exploitation / Linux | 40 | 1 | Password bypass on musl-based OpenSSH exploited to gain root and drop an implant |
| 2026-11-05 | [FreeSWITCH CVE-2026-116779 SIP Command Injection Cryptominer Campaign](2026-11-10/FreeSWITCH-CVE-2026-116779-Cryptominer-Campaign/) | Exploitation / cryptomining | 12 | 0 | SIP MESSAGE command injection used to install a cryptominer |
| 2026-11-04 | [APT29 Watering Holes Targeting iOS and Android with N-Day Exploits](2026-11-10/APT29-Mobile-Watering-Hole-Exploit-Chains/) | APT / espionage | 27 | 0 | Watering holes serving n-day exploit chains to iOS and Android visitors |

