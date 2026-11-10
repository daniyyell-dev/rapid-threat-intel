# Data format

[Back to index](../README.md#data-format)

## Files

| File | Format | Contents |
|---|---|---|
| `iocs.csv` | CSV | Every indicator, with description and source |
| `block_now.txt` | Text | High-confidence `block` indicators, grouped by type under `#` headers |
| `all/block_now_<type>.txt` | Text | One type per file, one value per line, no comments |
| `defender_xdr_indicators.csv` | CSV | Microsoft Defender XDR bulk-import format |
| `hunt.kql` | KQL | Defender XDR advanced hunting query |

## iocs.csv

| Column | Description |
|---|---|
| `indicator` | The raw value. Not defanged, so it can be imported. |
| `type` | See [Types](#types) |
| `threat` | Threat the indicator belongs to |
| `confidence` | `high`, `med` or `low` |
| `recommended_action` | `block`, `alert` or `monitor` |
| `source_url` | Published report the indicator came from |
| `description` | One line on what the indicator is |
| `notes` | Extra context from the source, such as file names or caveats |

### Types

| Type | Example |
|---|---|
| `ipv4` | `192.0.2.10` |
| `domain` | `example.com` |
| `url` | `https://example.com/path` or a URL path such as `/owa/x/` |
| `sha256`, `sha1` | File hash |
| `filename` | File name or path, used for hunting only |
| `email` | Attacker contact address |
| `eth_address`, `ssh_pubkey`, `session_id` | Other attacker identifiers, used for hunting only |

### Confidence and action

| Value | Meaning |
|---|---|
| `high` | Confirmed by the source with direct evidence |
| `med` | Credible but shared or not fully confirmed |
| `low` | Weak or short-lived signal |
| `block` | Attacker-owned infrastructure or malware |
| `alert` | Shared infrastructure, such as cloud, VPN or residential proxy IPs. Detect, don't block. |
| `monitor` | Context or hunt lead |

`block_now.txt` contains only rows that are both `high` and `block`.

## defender_xdr_indicators.csv

Follows Microsoft's bulk-import columns: `IndicatorType, IndicatorValue, ExpirationTime, Action, Severity, Title, Description, RecommendedActions, RbacGroups, Category, MitreTechniques, GenerateAlert`.

| iocs.csv | Defender |
|---|---|
| `ipv4`, `domain`, `url`, `sha256`, `sha1` | `IpAddress`, `DomainName`, `Url`, `FileSha256`, `FileSha1` |
| `block` | `Block`, or `BlockAndRemediate` for file hashes |
| `alert` | `Audit` with `GenerateAlert` set to `True` |
| `high`, `med`, `low` | `Severity` `High`, `Medium`, `Low` |

Rows with `monitor` and types Defender does not support (file names, email addresses and so on) are left out. URLs are written without the `https://` prefix. `Description` holds the indicator description and its source link.

## Expiry

Every Defender indicator expires **90 days** after it was added. Re-import the latest file to extend indicators that are still active.

## Folder names

`threats/<YYYY-MM>_<Month-YYYY>/<YYYY-MM-DD>_<Threat-Name>/`, for example `threats/2026-11_November-2026/2026-11-10_Turla-Cereal-Exchange-Espionage-Toolset/`. Both dates come from when the main source report was published. Each month folder has a README listing its threats.
