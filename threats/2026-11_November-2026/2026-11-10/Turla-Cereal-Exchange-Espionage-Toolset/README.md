# Turla Cereal: Exchange Server Espionage Toolset

[Live entry](https://iocwatch.com/t/Turla-Cereal-Exchange-Espionage-Toolset/) · [Back to index](../../../../README.md) · [November 2026](../../README.md) · [2026-11-10](../README.md)

| Published | First added | Last updated | Category | Indicators | Block now |
|---|---|---|---|---|---|
| 2026-11-10 | 2026-11-10 13:43 | 2026-11-10 | APT / espionage | 26 | 18 |

## Hunt

Run one of these before blocking to find past activity. Each file is the same hunt written for a different platform; pick the one for your SIEM or XDR.

| File | Platform | How to run it |
|---|---|---|
| [`hunt.kql`](hunt.kql) | Microsoft Defender XDR | In the [Defender portal](https://security.microsoft.com), open **Hunting > Advanced hunting**, paste the query and select **Run query**. It covers the last 30 days. |
| [`hunt.spl`](hunt.spl) | Splunk | In **Search & Reporting**, set the time picker to the last 30 days or more, paste the search and run it. It reads the CIM data models. |
| [`hunt_raw.spl`](hunt_raw.spl) | Splunk without CIM | The same hunt over raw events. Define the `rti_*` macros from [`splunk_macros.conf`](../../../../all/splunk_macros.conf) first. |
| [`hunt.yaral`](hunt.yaral) | Google SecOps | In **Detection > Rules & Detections > Rules Editor**, paste the rule, run a Retrohunt over the last 30 days, then turn on live mode. |

Leads that are not network or hash indicators are in [`iocs.csv`](iocs.csv), and behaviours with no clean field mapping are in the Behaviours section below. Guides: [Defender XDR](../../../../docs/defender-xdr.md), [Splunk](../../../../docs/splunk.md), [Google SecOps](../../../../docs/google-secops.md).

## Summary

ESET attributes Cereal, a previously undocumented modular .NET toolset, with high confidence to the Russia-aligned APT group Turla. It was found on Microsoft Exchange servers of governmental organisations in Kazakhstan (November 2025) and Romania, where an email collection module injected into legitimate Exchange processes taps the mail transport pipeline and was configured to pick out email sent to or from NATO and the EU. There is no external C2: the CerealNeuron passive backdoor turns the victim's own Exchange server into the C2 through HttpListener URL prefixes, and the loaders abuse DLL search-order hijacking and the .NET native image cache.

## Affected countries and sectors

- **Countries:** Kazakhstan (KZ), Romania (RO)
- **Sectors:** Government
- **Note:** Two national governmental organisations; the Romanian implant filtered email to or from NATO and EU addresses.
- **Source:** [welivesecurity.com](https://www.welivesecurity.com/en/eset-research/exchange-for-breakfast-turlas-cereal-tricks-are-not-for-kids/)

## At a glance

| File | What it is |
|---|---|
| [`block_now.txt`](https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/threats/2026-11_November-2026/2026-11-10/Turla-Cereal-Exchange-Espionage-Toolset/block_now.txt) (raw) | 18 high-confidence indicators to block now |
| [`iocs.csv`](iocs.csv) | All 26 indicators with description, confidence, action and source |
| [`defender_xdr_indicators.csv`](defender_xdr_indicators.csv) | 18 rows for Defender XDR bulk import |
| [`hunt.kql`](hunt.kql) | Defender XDR advanced hunting query |
| [`hunt.spl`](hunt.spl) | Splunk hunt over the CIM data models |
| [`hunt_raw.spl`](hunt_raw.spl) | Splunk hunt for data not mapped to CIM ([macros](../../../../all/splunk_macros.conf)) |
| [`hunt.yaral`](hunt.yaral) | Google SecOps YARA-L 2.0 detection rule |

Indicators by type: 18 SHA1, 5 URLs, 3 file names. See `iocs.csv` for full details and descriptions.

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

## Sources

- [ESET – Turla Cereal white paper (PDF)](https://web-assets.esetstatic.com/wls/en/papers/white-papers/turla-cereal-tricks.pdf)
- [ESET WeLiveSecurity – Exchange for breakfast: Turla's Cereal tricks are not for kids](https://www.welivesecurity.com/en/eset-research/exchange-for-breakfast-turlas-cereal-tricks-are-not-for-kids/)

---

[Back to index](../../../../README.md)
