# Fake Zillow Pages Deliver NetSupport RAT through ClickFix

[Back to index](../../../../README.md#latest-threats) · [November 2026](../../README.md) · [2026-11-13](../README.md)

| Published | First added | Last updated | Category | Indicators | Block now |
|---|---|---|---|---|---|
| 2026-11-12 | 2026-11-13 03:50 | 2026-11-13 | Malware / RAT | 25 | 21 |

## Summary

EfficientIP Research Labs, writing on 12 November 2026, traces a ClickFix campaign that used fake Zillow apartment-review pages on short-lived apartments-review<digits>.sbs domains, first spotted in passive DNS in August 2026. Clicking Continue copied a PowerShell command that fetched a script from the decimal address 1495423691, which is 89.34.90.203, at /winup2. The script hid its window, used a downloaded Python runtime to pull http://89.34.90.203/mestos2.zip, installed NetSupport RAT into %APPDATA%\NetSupport and dropped a NetSupport.lnk shortcut in the user Startup folder pointing at Service.exe. The installed client was configured to use the gateway domains asgomd.com and asgrsv.com; pivoting on their Flyservers addresses 45.227.254.179 and 45.227.254.10 uncovered seven further short -md and -rsv domains on the same hosts. Help Net Security reported the same findings on 13 November. The landing domains, payload host, URLs and gateway infrastructure are on the block list. Do not block the Cloudflare addresses that only fronted the short-lived landing pages, and do not treat legitimate NetSupport Manager as malware.

> [!WARNING]
> The landing domains were short-lived and sat behind Cloudflare; those Cloudflare anycast addresses also serve unrelated sites and must not be blocked. NetSupport Manager is legitimate remote administration software: block only the attacker staging and gateway infrastructure, and hunt the ClickFix command and mestos2.zip install path rather than the product name alone. EfficientIP did not publish a sample hash or confirm victims.

## At a glance

| File | What it is |
|---|---|
| [`block_now.txt`](https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/threats/2026-11_November-2026/2026-11-13/Fake-Zillow-ClickFix-NetSupport-RAT/block_now.txt) (raw) | 21 high-confidence indicators to block now |
| [`iocs.csv`](iocs.csv) | All 25 indicators with description, confidence, action and source |
| [`defender_xdr_indicators.csv`](defender_xdr_indicators.csv) | 23 rows for Defender XDR bulk import |
| [`hunt.kql`](hunt.kql) | Defender XDR advanced hunting query |
| [`hunt.spl`](hunt.spl) | Splunk hunt over the CIM data models |
| [`hunt_raw.spl`](hunt_raw.spl) | Splunk hunt for data not mapped to CIM ([macros](../../../../all/splunk_macros.conf)) |
| [`hunt.yaral`](hunt.yaral) | Google SecOps YARA-L 2.0 detection rule |

Indicators by type: 16 domains, 3 IPv4, 2 URLs, 2 file names, 2 other. See `iocs.csv` for full details and descriptions.

## MITRE ATT&CK

| ID | Technique |
|---|---|
| [T1583.001](https://attack.mitre.org/techniques/T1583/001/) | Domains |
| [T1204.001](https://attack.mitre.org/techniques/T1204/001/) | Malicious Link |
| [T1059.001](https://attack.mitre.org/techniques/T1059/001/) | PowerShell |
| [T1059.006](https://attack.mitre.org/techniques/T1059/006/) | Python |
| [T1105](https://attack.mitre.org/techniques/T1105/) | Ingress Tool Transfer |
| [T1547.001](https://attack.mitre.org/techniques/T1547/001/) | Registry Run Keys / Startup Folder |
| [T1219](https://attack.mitre.org/techniques/T1219/) | Remote Access Software |
| [T1036.005](https://attack.mitre.org/techniques/T1036/005/) | Match Legitimate Name or Location |

## Recommended actions

1. Block the seven apartments-review*.sbs landing domains, 89.34.90.203, the /winup2 and /mestos2.zip URLs, the nine gateway domains and the two Flyservers addresses (they are in the Defender XDR import file), and search 90 days of DNS, proxy and firewall logs for them and for the decimal address 1495423691.
2. Hunt for explorer.exe launching PowerShell that uses iwr to fetch winup2, for %TEMP%\winup2.ps1, and for a Startup-folder NetSupport.lnk whose target is Service.exe under %APPDATA%\NetSupport after a hidden PowerShell or Python download.
3. Treat genuine NetSupport Manager installs as legitimate; do not block the product. If a host ran the ClickFix command, isolate it, remove the Startup shortcut and the %APPDATA%\NetSupport copy, and rotate credentials the logged-on user could reach.

## Behaviours to hunt

> Behaviours are leads, not confirmed indicators, and can match legitimate activity. Compare any hit against your own baseline and environment before acting.

1. **Alert** · ClickFix PowerShell iwr of winup2 from the decimal IP\
   Look for: explorer.exe launching powershell.exe that uses Invoke-WebRequest (iwr) to fetch winup2 from 89.34.90.203 or the decimal address 1495423691\
   Why it matters: EfficientIP recovered the ClickFix clipboard command: after the victim pressed Win+R, explorer.exe launched PowerShell, which downloaded /winup2 from the decimal DWORD 1495423691 (89.34.90.203) to %TEMP%\winup2.ps1 and ran it.\
   Log source: Defender XDR DeviceProcessEvents\
   Source: [EfficientIP](https://efficientip.com/blog/clickfix-netsupport-rat/ https://www.helpnetsecurity.com/2026/11/13/fake-zillow-clickfix-netsupport-rat/)

2. **Alert** · winup2.ps1 or mestos2.zip written or downloaded\
   Look for: PowerShell writing or running %TEMP%\winup2.ps1, or downloading http://89.34.90.203/mestos2.zip\
   Why it matters: winup2.ps1 relaunches itself hidden, writes an embedded Python script and uses a downloaded Python runtime to retrieve mestos2.zip from the same host, then unpacks NetSupport RAT.\
   Log source: Defender XDR DeviceProcessEvents and DeviceFileEvents\
   Source: [EfficientIP](https://efficientip.com/blog/clickfix-netsupport-rat/ https://www.helpnetsecurity.com/2026/11/13/fake-zillow-clickfix-netsupport-rat/)

3. **Alert** · Startup NetSupport.lnk pointing at AppData Service.exe\
   Look for: A Startup-folder shortcut named NetSupport.lnk whose target is Service.exe under %APPDATA%\NetSupport\
   Why it matters: The downloader copies the ZIP contents to %APPDATA%\NetSupport, finds Service.exe and drops NetSupport.lnk in the user Startup folder, then starts Service.exe hidden. Genuine NetSupport Manager can also live under AppData, so treat this as a lead unless winup2 or mestos2.zip is also present.\
   Log source: Defender XDR DeviceFileEvents and DeviceProcessEvents\
   Source: [EfficientIP](https://efficientip.com/blog/clickfix-netsupport-rat/ https://www.helpnetsecurity.com/2026/11/13/fake-zillow-clickfix-netsupport-rat/)

4. **Alert** · Lookups for apartments-review*.sbs or the gateway domains\
   Look for: DNS or web requests for apartments-review followed by digits on the .sbs TLD, or for the NetSupport gateway domains asgomd.com, asgrsv.com and the related -md and -rsv hosts\
   Why it matters: The landing pages used the apartments-review<digits>.sbs pattern, including *.verify.apartments-review*.sbs wildcards. The installed NetSupport client used asgomd.com and asgrsv.com, and EfficientIP found seven further short gateway names on the same Flyservers addresses.\
   Log source: Defender XDR DeviceNetworkEvents, DNS and proxy logs\
   Source: [EfficientIP](https://efficientip.com/blog/clickfix-netsupport-rat/ https://www.helpnetsecurity.com/2026/11/13/fake-zillow-clickfix-netsupport-rat/)

Behaviours that map cleanly to log fields are included in [`hunt.kql`](hunt.kql) and [`hunt.spl`](hunt.spl), and alert behaviours in [`hunt.yaral`](hunt.yaral). The rest are listed in the Behaviours section above with where to look. Use behaviours to hunt and alert, never to block.

## Hunt

Run one of these before blocking to find past activity. Each file is the same hunt written for a different platform; pick the one for your SIEM or XDR.

| File | Platform | How to run it |
|---|---|---|
| [`hunt.kql`](hunt.kql) | Microsoft Defender XDR | In the [Defender portal](https://security.microsoft.com), open **Hunting > Advanced hunting**, paste the query and select **Run query**. It covers the last 30 days. |
| [`hunt.spl`](hunt.spl) | Splunk | In **Search & Reporting**, set the time picker to the last 30 days or more, paste the search and run it. It reads the CIM data models. |
| [`hunt_raw.spl`](hunt_raw.spl) | Splunk without CIM | The same hunt over raw events. Define the `rti_*` macros from [`splunk_macros.conf`](../../../../all/splunk_macros.conf) first. |
| [`hunt.yaral`](hunt.yaral) | Google SecOps | In **Detection > Rules & Detections > Rules Editor**, paste the rule, run a Retrohunt over the last 30 days, then turn on live mode. |

Leads that are not network or hash indicators are in [`iocs.csv`](iocs.csv), and behaviours with no clean field mapping are in the Behaviours section above. Guides: [Defender XDR](../../../../docs/defender-xdr.md), [Splunk](../../../../docs/splunk.md), [Google SecOps](../../../../docs/google-secops.md).

## Sources

- [EfficientIP Research Labs – From Fake Zillow Pages to ClickFix NetSupport RAT](https://efficientip.com/blog/clickfix-netsupport-rat/)
- [Help Net Security – Fake Zillow pages use ClickFix NetSupport RAT to target apartment hunters](https://www.helpnetsecurity.com/2026/11/13/fake-zillow-clickfix-netsupport-rat/)
- [ThreatFox – bksnb.com](https://threatfox.abuse.ch/ioc/1837183/)
- [ThreatFox – jpgomd.com](https://threatfox.abuse.ch/ioc/1837182/)
- [URLhaus – 89.34.90.203](https://urlhaus.abuse.ch/host/89.34.90.203/)

---

[Back to index](../../../../README.md#latest-threats)
