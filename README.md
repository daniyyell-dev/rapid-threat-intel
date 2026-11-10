# rapid-threat-intel

Move fast with threat intel from different sources.

Daily, deduplicated indicators of compromise (IOCs) collected only from published vendor and researcher reports (ESET, Huntress, Sekoia, GreyNoise, Socket, CISA and others). Every indicator links back to its source.

## Layout

| Path | Contents |
|---|---|
| `latest/` | The most recent feed |
| `feeds/YYYY-MM-DD/` | Daily snapshots |

Each feed contains:

- `block_now.txt` – high-confidence indicators to block now (IPs, domains, URLs, SHA256/SHA1)
- `block_now_defender.csv` – the same set in Microsoft Defender XDR bulk indicator import format
- `defender_xdr_indicators.csv` – full Defender import set (block plus audit-only)
- `iocs.csv` – master list: `indicator,type,threat,confidence,recommended_action,source_url,notes`
- `hunt.kql` – Defender XDR advanced hunting queries for the indicators

## Using it

- Hunt first (`hunt.kql`) to check for past hits, then block.
- Defender IP indicators only block outbound traffic from endpoints; block inbound attacker IPs at the firewall.
- Many attacker IPs sit in shared cloud or residential ranges and get reassigned. Indicators in the Defender files expire after 90 days.
- Test file-hash blocks on one host first where the threat replaces legitimate system files.

## Disclaimer

Provided as-is for defensive use. Verify before blocking in production. All indicators come from the public sources listed in `iocs.csv`.

## Licence

MIT
