<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/banner-dark.webp">
  <img src="assets/banner-light.webp" alt="AI Rapid Threat Intel – Move fast with threat intel from different sources" width="70%">
</picture>

**Agentic AI collects it. Analysts verify it. Community acts on it.**<br>
<sub>AI threat intel from defenders, for defenders.</sub>

[![licence](https://img.shields.io/badge/licence-MIT-blue)](LICENSE) [![threats](https://img.shields.io/badge/threats-46-informational)](threats/) ![IOCs](https://img.shields.io/badge/IOCs-1452-informational) ![last updated](https://img.shields.io/badge/last_updated-2026--11--13_11:12-success) [![PRs](https://img.shields.io/badge/PRs-welcome-brightgreen)](CONTRIBUTING.md)

</div>

<a id="what-is-this"></a>
<a id="why-this-exists"></a>
## Overview

When a serious attack breaks, the indicators SOC teams need are scattered across reports, often buried in PDFs and in formats no security tool can load directly. Commercial feeds are expensive and bury the attacks that matter under low-value indicators, and most teams do not have time to dig through every source themselves. This project does that work once, for everyone, focusing on attacks against banking, insurance and financial services, UK organisations and critical systems such as identity providers, edge devices and core enterprise software. Each threat comes with a short research summary, curated indicators that each have a description and a source, and ready-to-use block lists, Defender XDR import files and hunt queries.

> [!CAUTION]
> **Handle all indicators as live and malicious.** Do not visit, open, download or resolve any IP address, domain, URL or file listed here from a corporate or personal device. Analyse them only in an isolated environment, such as a hosted sandbox like [ANY.RUN](https://any.run/) or a self-hosted one like [OpenSandbox](https://github.com/opensandbox-group/OpenSandbox), and follow your organisation's security policies. These indicators are provided for defensive use only, and the maintainers accept no responsibility for any damage, data loss or policy breach caused by their misuse or careless handling.

## How it works

An autonomous agentic system runs 24/7, collecting threat intel from vendor research, CERT advisories, IOC repos, dark-web trackers, Telegram and social media. Anything without real impact or actionable IOCs and IOAs is dropped by design. Every indicator is cross-checked against independent sources and weighed on likelihood before it passes the acceptance gate. Intel is published every 2 hours, and analysts review every verdict.

Threats move fast. Defenders have to as well.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/how-it-works-dark.png">
  <img src="assets/how-it-works-light.png" alt="How it works: collect from vendor reports, CERT advisories, IOC repos, Telegram, dark-web trackers and social media, filter for high impact and actionable, verify and cross-check sources, clean and deduplicate, describe and map to MITRE, build block lists, Defender import, hunt.kql, SPL and YARA-L, quality checks, publish every 2 hours, expire after 90 days" width="100%">
</picture>

## Quick start

1. **Block now:** Point your firewall, proxy or EDR at a [raw feed URL](#raw-feeds), or import [`defender_xdr_indicators.csv`](all/defender_xdr_indicators.csv) into Defender ([how](docs/defender-xdr.md#import-indicators)).
2. **Hunt in Defender:** Paste [`live_feed_hunt.kql`](all/live_feed_hunt.kql) into Advanced hunting. It loads the latest indicators itself, so there is nothing to copy in ([guide](docs/defender-xdr.md#hunt-with-the-live-feed)).
3. **Hunt in Splunk:** Load [`splunk_rti_iocs.csv`](all/splunk_rti_iocs.csv) as a lookup and run [`live_feed_hunt.spl`](all/live_feed_hunt.spl) ([guide](docs/splunk.md)).
4. **Detect in Google SecOps:** Load the feeds into data tables and run [`live_feed.yaral`](all/live_feed.yaral) ([guide](docs/google-secops.md)).

To block everything at once, use [`all/`](all/): 648 high-confidence block indicators across all threats.

<a id="how-to-use"></a>
## Use the data

| Tool | Guide |
|---|---|
| Live feed dashboard | [Browse threats, check an indicator, download files](docs/dashboard.md) |
| Microsoft Defender XDR | [Import indicators, run hunts, create detection rules](docs/defender-xdr.md) |
| Firewalls and EDR | [Use block lists as external dynamic lists](docs/firewall-and-edr.md) |
| Splunk | [Run hunts over CIM or raw data, live-feed lookup](docs/splunk.md) |
| Google SecOps | [Per-threat YARA-L 2.0 rules, data tables, live-feed rule](docs/google-secops.md) |
| Anything else | [Data format reference](docs/data-format.md) |

### Raw feeds

These stable links always serve the latest data. Use them as external dynamic lists or scheduled imports.

| Feed | Use | Raw URL |
|---|---|---|
| [`block_now_ipv4.txt`](all/block_now_ipv4.txt) | Firewall / EDR IP block list | https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/all/block_now_ipv4.txt |
| [`block_now_domain.txt`](all/block_now_domain.txt) | DNS / proxy domain block list | https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/all/block_now_domain.txt |
| [`block_now_url.txt`](all/block_now_url.txt) | Proxy / web filter URL block list | https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/all/block_now_url.txt |
| [`block_now_sha256.txt`](all/block_now_sha256.txt) | EDR SHA256 hash block list | https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/all/block_now_sha256.txt |
| [`block_now_sha1.txt`](all/block_now_sha1.txt) | EDR SHA1 hash block list | https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/all/block_now_sha1.txt |
| [`defender_xdr_indicators.csv`](all/defender_xdr_indicators.csv) | Defender XDR indicator import | https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/all/defender_xdr_indicators.csv |
| [`iocs.csv`](all/iocs.csv) | Every indicator with description and source, for a SIEM or TIP | https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/all/iocs.csv |

> [!WARNING]
> Hunt before you block, and test file-hash blocks on one host first where a threat abuses legitimate file names. Defender IP indicators only cover outbound connections from endpoints, so block inbound attacker IPs at the firewall.

<a id="repository-structure"></a>
## Repository

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
│               ├── hunt.kql                  Defender XDR advanced hunting query
│               ├── hunt.spl                  Splunk hunt (CIM data models)
│               ├── hunt_raw.spl              Splunk hunt for data not mapped to CIM
│               └── hunt.yaral                Google SecOps YARA-L 2.0 rule
├── all/                                      every threat combined
│   ├── block_now.txt
│   ├── block_now_<type>.txt                  one clean list per type for firewalls
│   ├── iocs.csv
│   ├── defender_xdr_indicators.csv
│   ├── live_feed_hunt.kql                    Defender hunt that loads the live feeds
│   ├── live_feed_hunt.spl                    Splunk hunt using the splunk_rti_iocs.csv lookup
│   ├── live_feed.yaral                       Google SecOps rule using reference lists
│   ├── splunk_rti_iocs.csv                   block-now indicators as a Splunk lookup
│   └── splunk_macros.conf                    rti_* macros for hunt_raw.spl
└── docs/                                     how-to guides
```

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
| `recommended_action` | `block`, `alert` or `monitor`. Every `block` indicator is `high` confidence |
| `source_url` | Report the indicator came from |
| `description` | One-line description of what it is |
| `notes` | Extra context from the source |
| `sources` | Every source that publishes the indicator, space-separated |

Full reference, including the Defender file and expiry: [docs/data-format.md](docs/data-format.md).

## Contributing

New indicators, corrections, false-positive reports and better detections are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md), then open an [issue](https://github.com/daniyyell-dev/rapid-threat-intel/issues/new/choose) or a pull request. To report a security problem privately, see [SECURITY.md](SECURITY.md).

<a id="acknowledgements"></a>
## Sources

Thanks to the organisations whose published research these indicators come from. Inclusion does not imply endorsement.

| Type | Sources |
| --- | --- |
| **Security research** | [Aikido](https://www.aikido.dev/blog) · [ANY.RUN](https://any.run/cybersecurity-blog/) · [Arctic Wolf](https://arcticwolf.com/resources/blog/) · [Beazley Security](https://labs.beazley.security/) · [Bitdefender](https://www.bitdefender.com/) · [Check Point Research](https://research.checkpoint.com/) · [CloudSEK](https://www.cloudsek.com/) · [ConnectWise](https://www.connectwise.com/) · [Corgea](https://corgea.com/) · [Cynet](https://www.cynet.com/) · [Datadog Security Labs](https://securitylabs.datadoghq.com/) · [EfficientIP](https://efficientip.com/) · [Elastic Security Labs](https://www.elastic.co/security-labs/) · [Enea](https://www.enea.com/insights/) · [ESET](https://www.eset.com/) · [FortiGuard Labs](https://fortiguard.fortinet.com/) · [Gambit Security](https://gambit.security/) · [GreyNoise](https://www.greynoise.io/) · [Group-IB](https://www.group-ib.com/blog/) · [Halcyon](https://www.halcyon.ai/) · [Huntress](https://www.huntress.com/) · [Inforcer](https://www.inforcer.com/) · [Kaspersky](https://securelist.com/) · [Malbear Labs](https://malbearlabs.com/) · [Malwarebytes](https://www.malwarebytes.com/) · [Microsoft Threat Intelligence](https://www.microsoft.com/en-us/security/blog/) · [N-able](https://www.n-able.com/) · [Previdian](https://www.previdian.com/) · [Rapid7](https://www.rapid7.com/) · [Recorded Future](https://www.recordedfuture.com/research) · [Safeguard](https://safeguard.sh/) · [SANS ISC](https://isc.sans.edu/) · [Sansec](https://sansec.io/) · [Sekoia](https://www.sekoia.com/) · [Seqrite Labs](https://www.seqrite.com/blog/) · [Socket](https://socket.dev/) · [Sophos](https://www.sophos.com/) · [Symantec Threat Hunter Team](https://www.security.com/threat-intelligence) · [Tenable](https://www.tenable.com/) · [Unit 42](https://unit42.paloaltonetworks.com/) · [Varonis](https://www.varonis.com/) · [Vates](https://vates.tech/) · [Volexity](https://www.volexity.com/) · [WithSecure](https://www.withsecure.com/) · [ZeroPath](https://zeropath.com/) · [Zscaler ThreatLabz](https://www.zscaler.com/blogs/security-research) |
| **Government / CERT** | [CERT-FR](https://www.cert.cyber.gouv.fr/) · [CISA](https://www.cisa.gov/) · [FBI](https://www.ic3.gov/) |
| **Community tracker** | [ransomware.live](https://www.ransomware.live/) · [Reddit r/msp](https://www.reddit.com/r/msp/) · [Spamhaus](https://www.spamhaus.org/) |
| **Security news** | [BleepingComputer](https://www.bleepingcomputer.com/) · [GBHackers](https://gbhackers.com/) · [Help Net Security](https://www.helpnetsecurity.com/) · [Infosecurity Magazine](https://www.infosecurity-magazine.com/) · [Nashville Banner](https://nashvillebanner.com/) · [SecurityWeek](https://www.securityweek.com/) · [The Hacker News](https://thehackernews.com/) · [The Stack](https://www.thestack.technology/) |
| **Also monitored** | [Mandiant / Google Threat Intelligence](https://cloud.google.com/security/mandiant) · [Cisco Talos](https://blog.talosintelligence.com/) · [Kaspersky Securelist](https://securelist.com/) · [SentinelLabs](https://www.sentinelone.com/labs/) · [Trend Micro](https://www.trendmicro.com/en_us/research.html) · [Sophos X-Ops](https://www.sophos.com/) · [CrowdStrike](https://www.crowdstrike.com/en-us/blog/) · [The DFIR Report](https://thedfirreport.com/) · [Wiz](https://www.wiz.io/blog) · [StepSecurity](https://www.stepsecurity.io/blog) · [CrowdSec](https://www.crowdsec.net/) · [watchTowr](https://labs.watchtowr.com/) · [VulnCheck](https://www.vulncheck.com/kev) · [JPCERT/CC](https://blogs.jpcert.or.jp/en/) · [Symantec](https://www.security.com/threat-intelligence) · [Infoblox Threat Intel](https://www.infoblox.com/blog/threat-intelligence/) · [Black Lotus Labs](https://blog.lumen.com/) · [Red Canary](https://redcanary.com/blog/) · [Silent Push](https://www.silentpush.com/blog/) · [Hunt.io](https://hunt.io/blog) · [ReversingLabs](https://www.reversinglabs.com/blog) · [JFrog Security Research](https://jfrog.com/blog/) · [Orange Cyberdefense](https://www.orangecyberdefense.com/) · [HarfangLab](https://harfanglab.io/insidethreat/) · [abuse.ch](https://abuse.ch/) · [Censys](https://censys.com/blog/) · [NCSC UK](https://www.ncsc.gov.uk/) · [CERT-EU](https://cert.europa.eu/) · [ENISA](https://www.enisa.europa.eu/) · [FBI IC3](https://www.ic3.gov/) · [ACSC](https://www.cyber.gov.au/) · [NSA Cybersecurity](https://www.nsa.gov/Cybersecurity/) · [Canadian Centre for Cyber Security](https://www.cyber.gc.ca/) · [BSI](https://www.bsi.bund.de/) · [NHS England Cyber Alerts](https://digital.nhs.uk/cyber-alerts) · [FS-ISAC](https://www.fsisac.com/) · [The Record](https://therecord.media/) · [Splunk Threat Research](https://www.splunk.com/en_us/blog/security.html) · [IBM X-Force](https://www.ibm.com/think/x-force) · [Cloudflare Cloudforce One](https://www.cloudflare.com/cloudforce-one/research/) · [Akamai SIRT](https://www.akamai.com/blog/security-research) · [Trellix Advanced Research Center](https://www.trellix.com/blogs/research/) · [Netskope Threat Labs](https://threatlabs.netskope.com/blog/) · [LevelBlue SpiderLabs](https://www.levelblue.com/blogs/spiderlabs-blog) · [Securonix Threat Labs](https://www.securonix.com/blog/) · [CERT Polska](https://cert.pl/en/) · [CERT-UA](https://cert.gov.ua/articles) · [Push Security](https://pushsecurity.com/blog) · [Permiso](https://permiso.io/blog) · [Detections AI](https://detections.ai/resources/blog) |

## Disclaimer

> [!NOTE]
> Everything here is provided as is, for defensive use only. Infrastructure changes hands quickly, so verify indicators against your environment before blocking in production.

## Licence

Released under the [MIT Licence](LICENSE).

## Sponsored by

<p>
<a href="https://prynoid.com/"><picture><source media="(prefers-color-scheme: dark)" srcset="site/img/sponsors/prynoid.webp"><img src="site/img/sponsors/prynoid-light.webp" alt="Prynoid" height="32"></picture></a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a href="https://phishcore.io/"><img src="site/img/sponsors/phishcore.png" alt="PhishCore" height="28"></a>
</p>

<p><a href="https://buymeacoffee.com/daniyyell" target="_blank" rel="noopener"><img src="assets/bmc-button.png" alt="Buy me a coffee" height="42"></a></p>

## Limitations

This is not a full threat feed. We leave out routine threat intel and noise, and only publish confirmed attacks that are actively happening and have high impact. We also watch Telegram channels, dark-web leak posts, social media and security websites for early warning. A threat only goes in once a reputable vendor, researcher or government source publishes indicators for it. Unverified claims are never published. Because we focus on the threats that matter, some activity will be missing on purpose. If you think we've missed something important, please [open an issue](https://github.com/daniyyell-dev/rapid-threat-intel/issues/new/choose) or contribute through the [contributing guide](CONTRIBUTING.md).
