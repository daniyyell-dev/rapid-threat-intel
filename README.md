# rapid-threat-intel

Move fast with threat intel from different sources.

Deduplicated indicators of compromise (IOCs), organised by named threat, collected only from published vendor and researcher reports. Every indicator has a description and links back to its source.

## Threats

_Last updated: 2026-11-10. Newest first; the date is when the main source report was published._

| Date | Threat | Category | IOCs | Block now |
|---|---|---|---|---|
| 2026-11-10 | [Turla Cereal: Exchange Server Espionage Toolset](threats/2026-11-10_Turla-Cereal-Exchange-Espionage-Toolset/) | APT / espionage | 26 | 18 |
| 2026-11-10 | [Danfoss Refrigeration Controller Attacks on European Supermarkets](threats/2026-11-10_Danfoss-Refrigeration-Controller-Attacks-Europe/) | ICS / OT | 2 | 0 |
| 2026-11-09 | [MSP Process GDAP Breach: Entra Token Abuse in Partner Tenants](threats/2026-11-09_MSP-Process-GDAP-Breach-Entra-Token-Abuse/) | Supply chain / identity | 57 | 1 |
| 2026-11-09 | [Ethersphere bee-js and Swarm Desktop Supply-Chain Attack (SleepyDuck / evjawbreaker)](threats/2026-11-09_Ethersphere-bee-js-Swarm-Desktop-Supply-Chain-Attack/) | Supply chain / npm | 57 | 37 |
| 2026-11-09 | [BYOD Ransomware and Extortion: Vanderbilt University Attack](threats/2026-11-09_BYOD-Ransomware-Vanderbilt-University-Attack/) | Ransomware | 4 | 1 |
| 2026-11-08 | [SSHole: OpenSSH CVE-2026-123158 Exploitation and TAC Agent Implant](threats/2026-11-08_SSHole-OpenSSH-CVE-2026-123158-Exploitation/) | Exploitation / Linux | 40 | 10 |
| 2026-11-05 | [FreeSWITCH CVE-2026-116779 SIP Command Injection Cryptominer Campaign](threats/2026-11-05_FreeSWITCH-CVE-2026-116779-Cryptominer-Campaign/) | Exploitation / cryptomining | 12 | 0 |
| 2026-11-04 | [APT29 Watering Holes Targeting iOS and Android with N-Day Exploits](threats/2026-11-04_APT29-Mobile-Watering-Hole-Exploit-Chains/) | APT / espionage | 27 | 22 |

## Layout

- `threats/<YYYY-MM-DD>_<Threat-Name>/` - one folder per attack or campaign: `README.md` (summary, actions, indicator table), `block_now.txt`, `iocs.csv`, `defender_xdr_indicators.csv`, `hunt.kql`
- `all/` - every threat combined in one place, so you can import or block everything at once (`block_now.txt`, `iocs.csv`, `defender_xdr_indicators.csv`)

## Using it

- Run the threat's `hunt.kql` first to check for past hits, then block.
- Defender IP indicators only block outbound traffic from endpoints; block inbound attacker IPs at the firewall.
- Many attacker IPs sit in shared cloud or residential ranges and get reassigned. Defender indicators expire after 90 days.
- Test file-hash blocks on one host first where a threat replaces legitimate system files.

## Contributing

Contributions are welcome: new indicators, corrections, false-positive reports, better hunt queries or detections (KQL, YARA-L, Sigma). See [CONTRIBUTING.md](CONTRIBUTING.md) for how to submit.

## Author

Maintained by [Daniel Jeremiah](https://www.linkedin.com/in/daniel-jeremiah) ([daniyyell.com](https://daniyyell.com/)).

## Disclaimer

Provided as-is for defensive use. Verify before blocking in production.

## Licence

MIT
