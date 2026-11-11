<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/banner-dark.webp">
  <img src="assets/banner-light.webp" alt="Rapid Threat Intel - Move fast with threat intel from different sources" width="70%">
</picture>

**High-impact threat intelligence and IOCs, researched and ready to deploy**

[![licence](https://img.shields.io/badge/licence-MIT-blue)](LICENSE) [![threats](https://img.shields.io/badge/threats-12-informational)](#latest-threats) ![IOCs](https://img.shields.io/badge/IOCs-464-informational) ![last updated](https://img.shields.io/badge/last_updated-2026--11--11-success) [![PRs](https://img.shields.io/badge/PRs-welcome-brightgreen)](CONTRIBUTING.md)

</div>

## What is this

When a serious attack breaks, the indicators SOC teams need are scattered across vendor blogs, government advisories and researcher posts, often buried in PDFs, mixed with noise, and in formats no security tool can load directly. Commercial feeds fill the gap for those who can pay, but they bury the attacks that matter under thousands of low-value indicators, and free feeds rarely explain what an indicator is or where it came from.

This repository closes that gap for the threats that matter most: attacks on banking, insurance and financial services, UK organisations and critical systems such as identity providers, edge devices and core enterprise software. Each threat comes with a short research summary (what happened, who is behind it, who is targeted, MITRE techniques and recommended actions), curated and deduplicated IOCs that each have a one-line description and a link to the published source, and ready-to-use files: a block list, a Microsoft Defender XDR import file and an advanced hunting query.

> [!IMPORTANT]
> This repository is updated every 2 hours, and only high-impact threat intelligence makes it in: if a threat is not exploitable or would not put a business at risk, it is left out.

## Quick start

1. **Block now.** Point your firewall, proxy or EDR at a [raw feed URL](#raw-feeds), or import [`defender_xdr_indicators.csv`](all/defender_xdr_indicators.csv) into Defender ([how](docs/defender-xdr.md#import-indicators)).
2. **Hunt in Defender.** Paste [`live_feed_hunt.kql`](all/live_feed_hunt.kql) into Advanced hunting. It loads the latest indicators itself, so there is nothing to copy in ([guide](docs/defender-xdr.md#hunt-with-the-live-feed)).
3. **Detect in Google SecOps.** Load the feeds into data tables and match them with YARA-L rules ([guide](docs/google-secops.md)).

## Why this exists

Working in a high-intensity threat environment every day, there is rarely time to browse a dozen threat intel sites and dig through each report for the IOCs, artefacts and behavioural context that threat hunters and incident responders actually need to act on.

Commercial threat intelligence is also expensive, and not every team or organisation can afford it.

So this project does that work once, for everyone. It collects threats from many trusted sources, then:

1. **Verifies** each indicator against its original published report
2. **Cleans and deduplicates** it across sources
3. **Aggregates** it per threat and in one combined set
4. **Makes it actionable** with block lists, Defender XDR import files and ready-to-run hunt queries

The result is one place where SOC analysts, threat hunters and incident responders can find what they need and act on it straight away.

## How it works

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/how-it-works-dark.png">
  <img src="assets/how-it-works-light.png" alt="How it works: collect, filter for high impact and actionable, verify, clean and deduplicate, describe and map to MITRE, build files, quality checks, publish every 2 hours, expire after 90 days" width="100%">
</picture>

## Latest threats

Grouped by the month and day they were added, newest first. The date column is when the main source report was published. Last updated 2026-11-11.

### [November 2026](threats/2026-11_November-2026/)

#### [2026-11-11](threats/2026-11_November-2026/2026-11-11/)

| Date | Threat | Category | IOCs | Block now | Summary |
|---|---|---|---|---|---|
| 2026-11-06 | [Storm-3358 ARTEX Agentic Intrusions Against the Financial Sector](threats/2026-11_November-2026/2026-11-11/Storm-3358-ARTEX-Agentic-Intrusions-Financial-Sector/) | Financially motivated intrusion / financial sector | 8 | 8 | Agentic AI framework used to exploit web apps at banks and drop WISP, vshell and AdaptixC2 RATs |

#### [2026-11-10](threats/2026-11_November-2026/2026-11-10/)

| Date | Threat | Category | IOCs | Block now | Summary |
|---|---|---|---|---|---|
| 2026-11-09 | [AhsayCBS Backup Server Exploitation: Webshells, Cryptominer and Python Implant](threats/2026-11_November-2026/2026-11-10/AhsayCBS-Backup-Server-Exploitation-Webshells-Python-Implant/) | Exploitation / backup server | 25 | 16 | Backup server auth bypass and RCE used to plant webshells, a cryptominer and a Python implant |
| 2026-11-10 | [CopperDragon: China-Nexus Sparrow Framework Targeting Government and Telecoms](threats/2026-11_November-2026/2026-11-10/CopperDragon-Sparrow-Framework-China-Nexus-Espionage/) | APT / espionage | 158 | 116 | China-nexus Sparrow malware supplier behind espionage against government and telecoms in 21 countries |
| 2026-11-06 | [NotC2: AWS-Native AI C2 Proof of Concept](threats/2026-11_November-2026/2026-11-10/NotC2-AWS-Native-AI-C2-Proof-of-Concept/) | Cloud / C2 | 2 | 0 | Proof-of-concept C2 built on AWS SQS, Lambda, SNS and Bedrock, with no network IOCs to block |
| 2026-11-04 | [Phexia: macOS ClickFix Stealer with Polygon C2](threats/2026-11_November-2026/2026-11-10/Phexia-macOS-ClickFix-Stealer-Polygon-C2/) | Malware / macOS | 48 | 25 | macOS ClickFix backdoor and stealer that resolves C2 from a Polygon smart contract |
| 2026-11-10 | [Turla Cereal: Exchange Server Espionage Toolset](threats/2026-11_November-2026/2026-11-10/Turla-Cereal-Exchange-Espionage-Toolset/) | APT / espionage | 26 | 18 | Russia-aligned Turla .NET toolset turning Exchange servers into passive backdoors |
| 2026-11-09 | [MSP Process GDAP Breach: Entra Token Abuse in Partner Tenants](threats/2026-11_November-2026/2026-11-10/MSP-Process-GDAP-Breach-Entra-Token-Abuse/) | Supply chain / identity | 57 | 1 | Stolen partner app secrets used for Graph token abuse in MSP customer tenants |
| 2026-11-09 | [Ethersphere bee-js and Swarm Desktop Supply-Chain Attack (SleepyDuck / evjawbreaker)](threats/2026-11_November-2026/2026-11-10/Ethersphere-bee-js-Swarm-Desktop-Supply-Chain-Attack/) | Supply chain / npm | 57 | 37 | Malicious npm and desktop releases dropping a backdoor with Ethereum-based C2 |
| 2026-11-09 | [BYOD Ransomware and Extortion: Vanderbilt University Attack](threats/2026-11_November-2026/2026-11-10/BYOD-Ransomware-Vanderbilt-University-Attack/) | Ransomware | 4 | 1 | New ransomware and extortion group claiming Vanderbilt University |
| 2026-11-08 | [SSHole: OpenSSH CVE-2026-123158 Exploitation and TAC Agent Implant](threats/2026-11_November-2026/2026-11-10/SSHole-OpenSSH-CVE-2026-123158-Exploitation/) | Exploitation / Linux | 40 | 10 | Password bypass on musl-based OpenSSH exploited to gain root and drop an implant |
| 2026-11-05 | [FreeSWITCH CVE-2026-116779 SIP Command Injection Cryptominer Campaign](threats/2026-11_November-2026/2026-11-10/FreeSWITCH-CVE-2026-116779-Cryptominer-Campaign/) | Exploitation / cryptomining | 12 | 0 | SIP MESSAGE command injection used to install a cryptominer |
| 2026-11-04 | [APT29 Watering Holes Targeting iOS and Android with N-Day Exploits](threats/2026-11_November-2026/2026-11-10/APT29-Mobile-Watering-Hole-Exploit-Chains/) | APT / espionage | 27 | 22 | Watering holes serving n-day exploit chains to iOS and Android visitors |

To block everything at once, use [`all/`](all/): 254 high-confidence block indicators across all threats.

## Repository structure

```text
rapid-threat-intel/
├── threats/
│   └── <YYYY-MM>_<Month-YYYY>/               one folder per month of entry, e.g. 2026-11_November-2026
│       ├── README.md                         that month's days and threats
│       └── <YYYY-MM-DD>/                     one folder per day of entry
│           ├── README.md                     that day's threats
│           └── <Threat-Name>/
│               ├── README.md                 summary, MITRE, actions, sources
│               ├── block_now.txt             high-confidence indicators to block
│               ├── iocs.csv                  every indicator with description and source
│               ├── defender_xdr_indicators.csv   Defender XDR bulk import
│               └── hunt.kql                  Defender XDR advanced hunting query
├── all/                                      every threat combined
│   ├── block_now.txt
│   ├── block_now_<type>.txt                  one clean list per type for firewalls
│   ├── iocs.csv
│   ├── defender_xdr_indicators.csv
│   └── live_feed_hunt.kql                    Defender hunt that loads the live feeds
└── docs/                                     how-to guides
```

## How to use

| Tool | Guide |
|---|---|
| Microsoft Defender XDR | [Import indicators, run hunts, create detection rules](docs/defender-xdr.md) |
| Firewalls and EDR | [Use block lists as external dynamic lists](docs/firewall-and-edr.md) |
| Google SecOps | [Data tables and YARA-L 2.0 rules](docs/google-secops.md) |
| Anything else | [Data format reference](docs/data-format.md) |

### Raw feeds

Stable links that always serve the latest data. Use them as external dynamic lists or scheduled imports.

| Feed | Use | Raw URL |
|---|---|---|
| [`block_now_ipv4.txt`](all/block_now_ipv4.txt) | Firewall / EDR IP blocklist | https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/all/block_now_ipv4.txt |
| [`block_now_domain.txt`](all/block_now_domain.txt) | DNS / proxy domain blocklist | https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/all/block_now_domain.txt |
| [`block_now_url.txt`](all/block_now_url.txt) | Proxy / web filter URL blocklist | https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/all/block_now_url.txt |
| [`block_now_sha256.txt`](all/block_now_sha256.txt) | EDR SHA256 hash blocklist | https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/all/block_now_sha256.txt |
| [`block_now_sha1.txt`](all/block_now_sha1.txt) | EDR SHA1 hash blocklist | https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/all/block_now_sha1.txt |
| [`defender_xdr_indicators.csv`](all/defender_xdr_indicators.csv) | Defender XDR indicator import | https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/all/defender_xdr_indicators.csv |
| [`iocs.csv`](all/iocs.csv) | Every indicator with description and source, for a SIEM or TIP | https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/all/iocs.csv |

> [!WARNING]
> Hunt before you block, and test file-hash blocks on one host first where a threat abuses legitimate file names. Defender IP indicators only cover outbound connections from endpoints, so block inbound attacker IPs at the firewall.

## Confidence and actions

| Value | Meaning |
|---|---|
| `block` | Attacker-owned infrastructure or malware. Safe to block. |
| `alert` | Likely malicious but shared, such as cloud, VPN or residential proxy IPs. Alert and investigate instead of blocking. |
| `monitor` | Context or a hunt lead, such as a file name. Watch for it; do not block. |
| `high` | Confirmed by the source with direct evidence. |
| `med` | Reported by a credible source but shared or not fully confirmed. |
| `low` | Weak or short-lived signal. Use for hunting only. |

`block_now.txt` contains only indicators that are both `high` and `block`.

## Data format

`iocs.csv` columns:

| Column | Description |
|---|---|
| `indicator` | The value, for example an IP, domain, URL or hash |
| `type` | `ipv4`, `domain`, `url`, `sha256`, `sha1`, `filename`, `email` and others |
| `threat` | Threat the indicator belongs to |
| `confidence` | `high`, `med` or `low` |
| `recommended_action` | `block`, `alert` or `monitor` |
| `source_url` | Report the indicator came from |
| `description` | One-line description of what it is |
| `notes` | Extra context from the source |

Full reference, including the Defender file and expiry: [docs/data-format.md](docs/data-format.md).

## Acknowledgements

Thanks to the organisations whose published research these indicators come from. Inclusion does not imply endorsement.

| Type | Sources |
| --- | --- |
| **Security research** | [Check Point Research](https://research.checkpoint.com/) · [Corgea](https://corgea.com/) · [ESET](https://www.eset.com/) · [GreyNoise](https://www.greynoise.io/) · [Huntress](https://www.huntress.com/) · [Inforcer](https://www.inforcer.com/) · [Microsoft Threat Intelligence](https://www.microsoft.com/en-us/security/blog/) · [SANS ISC](https://isc.sans.edu/) · [Sekoia](https://www.sekoia.com/) · [Socket](https://socket.dev/) · [Varonis](https://www.varonis.com/) · [WithSecure](https://www.withsecure.com/) · [ZeroPath](https://zeropath.com/) |
| **Community tracker** | [ransomware.live](https://www.ransomware.live/) |
| **Security news** | [BleepingComputer](https://www.bleepingcomputer.com/) · [The Hacker News](https://thehackernews.com/) · [The Stack](https://www.thestack.technology/) |
| **Also monitored** | [Mandiant / Google Threat Intelligence](https://cloud.google.com/security/mandiant) · [Unit 42](https://unit42.paloaltonetworks.com/) · [Cisco Talos](https://blog.talosintelligence.com/) · [Kaspersky Securelist](https://securelist.com/) · [SentinelLabs](https://www.sentinelone.com/labs/) · [Proofpoint](https://www.proofpoint.com/us/blog/threat-insight) · [Recorded Future](https://www.recordedfuture.com/research) · [Trend Micro](https://www.trendmicro.com/en_us/research.html) · [Sophos X-Ops](https://www.sophos.com/) · [CrowdStrike](https://www.crowdstrike.com/en-us/blog/) · [Volexity](https://www.volexity.com/blog/) · [Elastic Security Labs](https://www.elastic.co/security-labs) · [Rapid7](https://www.rapid7.com/blog/) · [Arctic Wolf](https://arcticwolf.com/resources/blog/) · [The DFIR Report](https://thedfirreport.com/) · [Wiz](https://www.wiz.io/blog) · [Aikido](https://www.aikido.dev/blog) · [StepSecurity](https://www.stepsecurity.io/blog) · [CrowdSec](https://www.crowdsec.net/) · [watchTowr](https://labs.watchtowr.com/) · [VulnCheck](https://www.vulncheck.com/kev) · [Bitdefender](https://www.bitdefender.com/) · [Zscaler ThreatLabz](https://www.zscaler.com/blogs/security-research) · [Datadog Security Labs](https://securitylabs.datadoghq.com/) · [JPCERT/CC](https://blogs.jpcert.or.jp/en/) · [FortiGuard Labs](https://www.fortinet.com/blog/threat-research) · [Group-IB](https://www.group-ib.com/blog/) · [Symantec](https://www.security.com/threat-intelligence) · [abuse.ch](https://abuse.ch/) · [Censys](https://censys.com/blog/) · [CISA](https://www.cisa.gov/) · [NCSC UK](https://www.ncsc.gov.uk/) · [CERT-EU](https://cert.europa.eu/) · [CERT-FR](https://www.cert.ssi.gouv.fr/) · [ENISA](https://www.enisa.europa.eu/) · [FBI IC3](https://www.ic3.gov/) · [ACSC](https://www.cyber.gov.au/) · [FS-ISAC](https://www.fsisac.com/) · [The Record](https://therecord.media/) · [SecurityWeek](https://www.securityweek.com/) |

## Contributing

New indicators, corrections, false-positive reports and better detections are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md), then open an [issue](https://github.com/daniyyell-dev/rapid-threat-intel/issues/new/choose) or a pull request. To report a security problem privately, see [SECURITY.md](SECURITY.md).

## Disclaimer

> [!NOTE]
> Provided as-is for defensive use only. Infrastructure changes hands quickly, so verify indicators against your environment before blocking in production.

## Licence

Released under the [MIT Licence](LICENSE).
