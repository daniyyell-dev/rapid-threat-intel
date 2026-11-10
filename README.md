<div align="center">

<img src="assets/banner.png" alt="Rapid Threat Intel - Move fast with threat intel from different sources" width="100%">

[![licence](https://img.shields.io/badge/licence-MIT-blue)](LICENSE) [![threats](https://img.shields.io/badge/threats-7-informational)](#latest-threats) ![IOCs](https://img.shields.io/badge/IOCs-223-informational) ![last updated](https://img.shields.io/badge/last_updated-2026--11--10-success) [![PRs](https://img.shields.io/badge/PRs-welcome-brightgreen)](CONTRIBUTING.md)

</div>

## What is this

Curated, deduplicated indicators of compromise (IOCs) for current attacks, one folder per named threat. Every indicator comes from a published vendor, researcher or government report, has a one-line description, and links back to its source. Each threat ships ready-to-use files: a block list, a Microsoft Defender XDR import file and an advanced hunting query.

## Why this exists

Working in a high-intensity threat environment every day, there is rarely time to browse a dozen threat intel sites and dig through each report for the IOCs, artefacts and behavioural context that threat hunters and incident responders actually need to act on.

Commercial threat intelligence is also expensive, and not every team or organisation can afford it.

So this project does that work once, for everyone. It collects threats from many trusted sources, then:

1. **Verifies** each indicator against its original published report
2. **Cleans and deduplicates** it across sources
3. **Aggregates** it per threat and in one combined set
4. **Makes it actionable** with block lists, Defender XDR import files and ready-to-run hunt queries

The result is one place where SOC analysts, threat hunters and incident responders can find what they need and act on it straight away.

## Quick start

1. **Pick a threat** from [Latest threats](#latest-threats) and read its summary and recommended actions.
2. **Hunt first.** Run its `hunt.kql` in Defender XDR Advanced hunting to find past activity ([guide](docs/defender-xdr.md#run-a-hunt)).
3. **Block.** Import `defender_xdr_indicators.csv` into Defender, or feed `block_now.txt` to your firewall ([Defender](docs/defender-xdr.md#import-indicators), [firewall and EDR](docs/firewall-and-edr.md)).

## Latest threats

Grouped by month, newest first. The date is when the main source report was published. Last updated 2026-11-10.

### [November 2026](threats/2026-11_November-2026/)

| Date | Threat | Category | IOCs | Block now | Summary |
|---|---|---|---|---|---|
| 2026-11-10 | [Turla Cereal: Exchange Server Espionage Toolset](threats/2026-11_November-2026/2026-11-10_Turla-Cereal-Exchange-Espionage-Toolset/) | APT / espionage | 26 | 18 | Russia-aligned Turla .NET toolset turning Exchange servers into passive backdoors |
| 2026-11-09 | [MSP Process GDAP Breach: Entra Token Abuse in Partner Tenants](threats/2026-11_November-2026/2026-11-09_MSP-Process-GDAP-Breach-Entra-Token-Abuse/) | Supply chain / identity | 57 | 1 | Stolen partner app secrets used for Graph token abuse in MSP customer tenants |
| 2026-11-09 | [Ethersphere bee-js and Swarm Desktop Supply-Chain Attack (SleepyDuck / evjawbreaker)](threats/2026-11_November-2026/2026-11-09_Ethersphere-bee-js-Swarm-Desktop-Supply-Chain-Attack/) | Supply chain / npm | 57 | 37 | Malicious npm and desktop releases dropping a backdoor with Ethereum-based C2 |
| 2026-11-09 | [BYOD Ransomware and Extortion: Vanderbilt University Attack](threats/2026-11_November-2026/2026-11-09_BYOD-Ransomware-Vanderbilt-University-Attack/) | Ransomware | 4 | 1 | New ransomware and extortion group claiming Vanderbilt University |
| 2026-11-08 | [SSHole: OpenSSH CVE-2026-123158 Exploitation and TAC Agent Implant](threats/2026-11_November-2026/2026-11-08_SSHole-OpenSSH-CVE-2026-123158-Exploitation/) | Exploitation / Linux | 40 | 10 | Password bypass on musl-based OpenSSH exploited to gain root and drop an implant |
| 2026-11-05 | [FreeSWITCH CVE-2026-116779 SIP Command Injection Cryptominer Campaign](threats/2026-11_November-2026/2026-11-05_FreeSWITCH-CVE-2026-116779-Cryptominer-Campaign/) | Exploitation / cryptomining | 12 | 0 | SIP MESSAGE command injection used to install a cryptominer |
| 2026-11-04 | [APT29 Watering Holes Targeting iOS and Android with N-Day Exploits](threats/2026-11_November-2026/2026-11-04_APT29-Mobile-Watering-Hole-Exploit-Chains/) | APT / espionage | 27 | 22 | Watering holes serving n-day exploit chains to iOS and Android visitors |

To block everything at once, use [`all/`](all/): 89 high-confidence block indicators across all threats.

## Repository structure

```text
rapid-threat-intel/
├── threats/
│   └── <YYYY-MM>_<Month-YYYY>/               one folder per month, e.g. 2026-11_November-2026
│       ├── README.md                         that month's threats
│       └── <YYYY-MM-DD>_<Threat-Name>/
│           ├── README.md                     summary, MITRE, actions, sources
│           ├── block_now.txt                 high-confidence indicators to block
│           ├── iocs.csv                      every indicator with description and source
│           ├── defender_xdr_indicators.csv   Defender XDR bulk import
│           └── hunt.kql                      Defender XDR advanced hunting query
├── all/                                      every threat combined
│   ├── block_now.txt
│   ├── block_now_<type>.txt                  one clean list per type for firewalls
│   ├── iocs.csv
│   └── defender_xdr_indicators.csv
└── docs/                                     how-to guides
```

## How to use

| Tool | Guide |
|---|---|
| Microsoft Defender XDR | [Import indicators, run hunts, create detection rules](docs/defender-xdr.md) |
| Firewalls and EDR | [Use block lists as external dynamic lists](docs/firewall-and-edr.md) |
| Google SecOps | [Data tables and YARA-L 2.0 rules](docs/google-secops.md) |
| Anything else | [Data format reference](docs/data-format.md) |

Per-type block lists, ready for external dynamic lists:

| File | Entries | Raw URL |
|---|---|---|
| `block_now_ipv4.txt` | 11 | https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/all/block_now_ipv4.txt |
| `block_now_domain.txt` | 14 | https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/all/block_now_domain.txt |
| `block_now_url.txt` | 10 | https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/all/block_now_url.txt |
| `block_now_sha256.txt` | 35 | https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/all/block_now_sha256.txt |
| `block_now_sha1.txt` | 19 | https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/all/block_now_sha1.txt |

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

## Contributing

New indicators, corrections, false-positive reports and better detections are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md), then open an [issue](https://github.com/daniyyell-dev/rapid-threat-intel/issues/new/choose) or a pull request. To report a security problem privately, see [SECURITY.md](SECURITY.md).

## Author

Maintained by **Daniel Jeremiah**: [LinkedIn](https://www.linkedin.com/in/daniel-jeremiah) · [daniyyell.com](https://daniyyell.com/)

## Disclaimer

> [!NOTE]
> Provided as-is for defensive use only. Infrastructure changes hands quickly, so verify indicators against your environment before blocking in production.

## Licence

Released under the [MIT Licence](LICENSE).
