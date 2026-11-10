# Turla Cereal: Exchange Server Espionage Toolset

[Back to index](../../../README.md#latest-threats) · [November 2026](../README.md)

| Published | First added | Last updated | Category | Indicators | Block now |
|---|---|---|---|---|---|
| 2026-11-10 | 2026-11-10 13:43 | 2026-11-10 | APT / espionage | 26 | 18 |

## Summary

ESET attributes Cereal, a previously undocumented modular .NET toolset, with high confidence to the Russia-aligned APT group Turla. It was found on Microsoft Exchange servers of governmental organisations in Kazakhstan (November 2025) and Romania, where an email collection module injected into legitimate Exchange processes taps the mail transport pipeline and was configured to pick out email sent to or from NATO and the EU. There is no external C2: the CerealNeuron passive backdoor turns the victim's own Exchange server into the C2 through HttpListener URL prefixes, and the loaders abuse DLL search-order hijacking and the .NET native image cache.

## At a glance

| File | What it is |
|---|---|
| [`block_now.txt`](https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/threats/2026-11_November-2026/2026-11-10_1349_Turla-Cereal-Exchange-Espionage-Toolset/block_now.txt) (raw) | 18 high-confidence indicators to block now |
| [`iocs.csv`](iocs.csv) | All 26 indicators with description, confidence, action and source |
| [`defender_xdr_indicators.csv`](defender_xdr_indicators.csv) | 18 rows for Defender XDR bulk import |
| [`hunt.kql`](hunt.kql) | Defender XDR advanced hunting query |

Indicators by type: 18 SHA1, 5 URL, 3 file name. See `iocs.csv` for full details and descriptions.

## MITRE ATT&CK

| ID | Technique |
|---|---|
| [T1114](https://attack.mitre.org/techniques/T1114/) | Email Collection |
| [T1505](https://attack.mitre.org/techniques/T1505/) | Server Software Component |
| [T1574.001](https://attack.mitre.org/techniques/T1574/001/) | DLL Search Order Hijacking |
| [T1055](https://attack.mitre.org/techniques/T1055/) | Process Injection |
| [T1620](https://attack.mitre.org/techniques/T1620/) | Reflective Code Loading |

## Recommended actions

1. Hash-sweep every Exchange server for the SHA1 values in iocs.csv (or run hunt.kql); test file blocks on one server first because the loaders use Exchange and WMI file names.
2. Hunt IIS and HTTP.sys logs for the CerealNeuron URL prefixes; ESET found no external C2 IPs to block.
3. Check System32\wbem for ncobjapi.dll and wbemcomn.dll copies whose hashes do not match Microsoft's.
4. If found, rebuild the Exchange server and review transport rules and mail flow for exfiltration.

## Hunt

Run this before blocking to find past activity.

1. Open [`hunt.kql`](hunt.kql) and copy the query.
2. In the [Microsoft Defender portal](https://security.microsoft.com), go to **Hunting > Advanced hunting** and paste it into a new query tab.
3. Select **Run query**. Results cover the last 30 days, one row per table, entity and indicator.

Non-network leads such as file names or URL paths are listed as comments at the end of the query. More in the [Defender XDR guide](../../../docs/defender-xdr.md).

## Sources

- [ESET - Turla Cereal white paper (PDF)](https://web-assets.esetstatic.com/wls/en/papers/white-papers/turla-cereal-tricks.pdf)
- [ESET WeLiveSecurity - Exchange for breakfast: Turla's Cereal tricks are not for kids](https://www.welivesecurity.com/en/eset-research/exchange-for-breakfast-turlas-cereal-tricks-are-not-for-kids/)

---

[Back to index](../../../README.md#latest-threats)
