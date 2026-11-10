# rapid-threat-intel

Move fast with threat intel from different sources.

Deduplicated indicators of compromise (IOCs), organised by named threat, collected only from published vendor and researcher reports. Every indicator links back to its source.

## Threats

_Last updated: 2026-11-10_

| Threat | Category | Indicators | Block now |
|---|---|---|---|
| [MSP Process breach - Entra GDAP token abuse](threats/msp-process-gdap-entra-token-abuse/) | Supply chain / identity | 57 | 1 |
| [Ethersphere bee-js 13.3.0 / Swarm Desktop 0.56.2 supply chain](threats/ethersphere-bee-js-swarm-desktop-supply-chain/) | Supply chain / npm | 57 | 37 |
| [SSHole - OpenSSH CVE-2026-123158 exploitation](threats/sshole-openssh-cve-2026-123158/) | Exploitation / botnet | 40 | 10 |
| [APT29 (SVR) - mobile watering holes](threats/apt29-mobile-watering-holes/) | APT / espionage | 27 | 22 |
| [Turla (FSB) - Cereal Exchange espionage toolset](threats/turla-cereal-exchange/) | APT / espionage | 26 | 18 |
| [FreeSWITCH CVE-2026-116779 cryptominer campaign](threats/freeswitch-cve-2026-116779-cryptominer/) | Exploitation / cryptomining | 12 | 0 |
| [BYOD ransomware / extortion](threats/byod-ransomware/) | Ransomware | 4 | 1 |
| [Danfoss refrigeration controller attacks (Europe)](threats/danfoss-refrigeration-controller-attacks/) | ICS / OT | 2 | 0 |

## Layout

- `threats/<threat-name>/` - one folder per attack or campaign: `README.md`, `block_now.txt`, `iocs.csv`, `defender_xdr_indicators.csv`, `hunt.kql`
- `all/` - every threat combined (`block_now.txt`, `iocs.csv`, `defender_xdr_indicators.csv`)

## Using it

- Run the threat's `hunt.kql` first to check for past hits, then block.
- Defender IP indicators only block outbound traffic from endpoints; block inbound attacker IPs at the firewall.
- Many attacker IPs sit in shared cloud or residential ranges and get reassigned. Defender indicators expire after 90 days.
- Test file-hash blocks on one host first where a threat replaces legitimate system files.

## Disclaimer

Provided as-is for defensive use. Verify before blocking in production.

## Licence

MIT
