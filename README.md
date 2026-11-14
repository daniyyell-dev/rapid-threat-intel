<div align="center">

<a href="https://iocwatch.com/">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/iocwatch-banner-dark.svg">
  <img src="assets/iocwatch-banner-light.svg" alt="IOCWatch – AI threat intelligence" width="440">
</picture>
</a>

<p><strong>Agentic AI collects it. Analysts verify it. Community acts on it.</strong><br>
<sub>From defenders, for defenders.</sub></p>

[![live site](https://img.shields.io/badge/live_site-iocwatch.com-22d3ee)](https://iocwatch.com/) [![threats](https://img.shields.io/badge/threats-60-0e7490)](https://iocwatch.com/#threats) [![rumours](https://img.shields.io/badge/rumours-8-64748b)](https://iocwatch.com/#rumours) [![block list](https://img.shields.io/badge/block_list-723-0891b2)](all/block_now.txt) [![feed.json](https://img.shields.io/badge/feed.json-live-0ea5e9)](https://iocwatch.com/feed.json)

</div>

> [!CAUTION]
> **Handle all indicators as live and malicious.** Do not visit, open, download or resolve any IP address, domain, URL or file listed here from a corporate or personal device. Analyse them only in an isolated environment, such as a hosted sandbox like [ANY.RUN](https://any.run/) or a self-hosted one like [OpenSandbox](https://github.com/opensandbox-group/OpenSandbox), and follow your organisation's security policies. These indicators are provided for defensive use only, and the maintainers accept no responsibility for any damage, data loss or policy breach caused by their misuse or careless handling.

## What you get

- Verified indicators of compromise, each with a description, a source and a recommended action
- Block lists for firewalls, DNS and EDR
- Ready-to-run hunts for Defender XDR (KQL), Splunk (SPL) and Google SecOps (YARA-L)
- Rumours: early reports that are not yet confirmed and have no IOCs, so they never go on the block list

## Quick start

```text
https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/all/block_now_ipv4.txt
https://iocwatch.com/feed.json
https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/all/defender_xdr_indicators.csv
```

The first URL is the IPv4 block list; swap `block_now_ipv4.txt` for `block_now_domain.txt`, `block_now_url.txt` or `block_now_sha256.txt` as needed. Import the CSV into Defender XDR ([how](docs/defender-xdr.md#import-indicators)). Hunt guides: [Defender](docs/defender-xdr.md), [Splunk](docs/splunk.md), [Google SecOps](docs/google-secops.md).

## Repository

```text
rapid-threat-intel/
├── threats/   one folder per threat: summary, IOCs, block list, KQL, SPL and YARA-L
├── all/       combined feeds, Defender CSV and live-feed hunts
└── docs/      import and hunt guides
```

New indicators, corrections and false-positive reports are welcome: [CONTRIBUTING.md](CONTRIBUTING.md). To report a security problem privately, see [SECURITY.md](SECURITY.md).

<a id="acknowledgements"></a>
## Sources

Thanks to the organisations whose published research these indicators come from. Inclusion does not imply endorsement.

| Type | Sources |
| --- | --- |
| **Security research** | [Aikido](https://www.aikido.dev/blog) · [Amazon Threat Intelligence](https://aws.amazon.com/blogs/security/) · [ANY.RUN](https://any.run/cybersecurity-blog/) · [Arctic Wolf](https://arcticwolf.com/resources/blog/) · [Barracuda](https://trust.barracuda.com/) · [Beazley Security](https://labs.beazley.security/) · [Bitdefender](https://www.bitdefender.com/) · [Check Point Research](https://research.checkpoint.com/) · [Cisco](https://sec.cloudapps.cisco.com/security/center/publicationListing.x) · [CloudSEK](https://www.cloudsek.com/) · [ConnectWise](https://www.connectwise.com/) · [Corgea](https://corgea.com/) · [CrowdStrike](https://www.crowdstrike.com/en-us/blog/) · [Cursor](https://cursor.com/blog) · [Cyderes Howler Cell](https://www.cyderes.com/howler-cell) · [Cynet](https://www.cynet.com/) · [Datadog Security Labs](https://securitylabs.datadoghq.com/) · [EfficientIP](https://efficientip.com/) · [Elastic Security Labs](https://www.elastic.co/security-labs/) · [Enea](https://www.enea.com/insights/) · [ESET](https://www.eset.com/) · [Field Effect](https://fieldeffect.com/blog) · [Fly.io](https://fly.io/) · [FortiGuard Labs](https://fortiguard.fortinet.com/) · [Gambit Security](https://gambit.security/) · [GreyNoise](https://www.greynoise.io/) · [Group-IB](https://www.group-ib.com/blog/) · [Halcyon](https://www.halcyon.ai/) · [Huntress](https://www.huntress.com/) · [Inforcer](https://www.inforcer.com/) · [JFrog Security Research](https://research.jfrog.com/) · [Kaspersky](https://securelist.com/) · [Malbear Labs](https://malbearlabs.com/) · [Malwarebytes](https://www.malwarebytes.com/) · [Microsoft Threat Intelligence](https://www.microsoft.com/en-us/security/blog/) · [N-able](https://www.n-able.com/) · [Netskope Threat Labs](https://threatlabs.netskope.com/blog/) · [Previdian](https://www.previdian.com/) · [Rapid7](https://www.rapid7.com/) · [Recorded Future](https://www.recordedfuture.com/research) · [Safeguard](https://safeguard.sh/) · [SANS ISC](https://isc.sans.edu/) · [Sansec](https://sansec.io/) · [Sekoia](https://www.sekoia.com/) · [Seqrite Labs](https://www.seqrite.com/blog/) · [Socket](https://socket.dev/) · [SOCRadar](https://socradar.io/blog/) · [Sophos](https://www.sophos.com/) · [StepSecurity](https://www.stepsecurity.io/blog) · [Symantec Threat Hunter Team](https://www.security.com/threat-intelligence) · [Tenable](https://www.tenable.com/) · [Unit 42](https://unit42.paloaltonetworks.com/) · [Varonis](https://www.varonis.com/) · [Vates](https://vates.tech/) · [Volexity](https://www.volexity.com/) · [WithSecure](https://www.withsecure.com/) · [Wiz](https://www.wiz.io/blog) · [ZeroPath](https://zeropath.com/) · [Zscaler ThreatLabz](https://www.zscaler.com/blogs/security-research) |
| **Government / CERT** | [Cal-CSIC](https://www.caloes.ca.gov/) · [CERT-FR](https://www.cert.cyber.gouv.fr/) · [CISA](https://www.cisa.gov/) · [FBI](https://www.ic3.gov/) |
| **Community tracker** | [ransomware.live](https://www.ransomware.live/) · [Reddit r/msp](https://www.reddit.com/r/msp/) · [Spamhaus](https://www.spamhaus.org/) |
| **Security news** | [BleepingComputer](https://www.bleepingcomputer.com/) · [GBHackers](https://gbhackers.com/) · [Help Net Security](https://www.helpnetsecurity.com/) · [Infosecurity Magazine](https://www.infosecurity-magazine.com/) · [Nashville Banner](https://nashvillebanner.com/) · [SecurityWeek](https://www.securityweek.com/) · [The Hacker News](https://thehackernews.com/) · [The Stack](https://www.thestack.technology/) |
| **Also monitored** | [Mandiant / Google Threat Intelligence](https://cloud.google.com/security/mandiant) · [Cisco Talos](https://blog.talosintelligence.com/) · [Kaspersky Securelist](https://securelist.com/) · [SentinelLabs](https://www.sentinelone.com/labs/) · [Trend Micro](https://www.trendmicro.com/en_us/research.html) · [Sophos X-Ops](https://www.sophos.com/) · [The DFIR Report](https://thedfirreport.com/) · [CrowdSec](https://www.crowdsec.net/) · [watchTowr](https://labs.watchtowr.com/) · [VulnCheck](https://www.vulncheck.com/kev) · [JPCERT/CC](https://blogs.jpcert.or.jp/en/) · [Symantec](https://www.security.com/threat-intelligence) · [Infoblox Threat Intel](https://www.infoblox.com/blog/threat-intelligence/) · [Black Lotus Labs](https://www.lumen.com/en-us/security/black-lotus-labs.html) · [Red Canary](https://redcanary.com/blog/) · [Silent Push](https://www.silentpush.com/blog/) · [Hunt.io](https://hunt.io/blog) · [ReversingLabs](https://www.reversinglabs.com/blog) · [Orange Cyberdefense](https://www.orangecyberdefense.com/) · [HarfangLab](https://harfanglab.io/insidethelab/) · [abuse.ch](https://abuse.ch/) · [Censys](https://censys.com/resources/blog/) · [NCSC UK](https://www.ncsc.gov.uk/) · [CERT-EU](https://cert.europa.eu/) · [ENISA](https://www.enisa.europa.eu/) · [FBI IC3](https://www.ic3.gov/) · [ACSC](https://www.cyber.gov.au/) · [NSA Cybersecurity](https://www.nsa.gov/Cybersecurity/) · [Canadian Centre for Cyber Security](https://www.cyber.gc.ca/) · [BSI](https://www.bsi.bund.de/) · [NHS England Cyber Alerts](https://digital.nhs.uk/cyber-alerts) · [FS-ISAC](https://www.fsisac.com/) · [The Record](https://therecord.media/) · [Splunk Threat Research](https://www.splunk.com/en_us/blog/security.html) · [IBM X-Force](https://www.ibm.com/think/x-force) · [Cloudflare Cloudforce One](https://www.cloudflare.com/cloudforce-one/research/) · [Akamai SIRT](https://www.akamai.com/blog/security-research) · [Trellix Advanced Research Center](https://www.trellix.com/blogs/research/) · [LevelBlue SpiderLabs](https://www.levelblue.com/blogs/spiderlabs-blog) · [Securonix Threat Labs](https://www.securonix.com/blog/) · [CERT Polska](https://cert.pl/en/) · [CERT-UA](https://cert.gov.ua/articles) · [Push Security](https://pushsecurity.com/blog) · [Permiso](https://permiso.io/blog) · [Detections AI](https://detections.ai/resources/blog) |

## Licence

Released under the [MIT Licence](LICENSE). Maintained by [Daniel Jeremiah](https://www.linkedin.com/in/daniel-jeremiah).

## Sponsored by

<p>
<a href="https://prynoid.com/"><picture><source media="(prefers-color-scheme: dark)" srcset="site/img/sponsors/prynoid.webp"><img src="site/img/sponsors/prynoid-light.webp" alt="Prynoid" height="32"></picture></a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a href="https://phishcore.io/"><img src="site/img/sponsors/phishcore.png" alt="PhishCore" height="28"></a>
</p>

<p><a href="https://buymeacoffee.com/daniyyell" target="_blank" rel="noopener"><img src="assets/bmc-button.png" alt="Buy me a coffee" height="42"></a></p>
