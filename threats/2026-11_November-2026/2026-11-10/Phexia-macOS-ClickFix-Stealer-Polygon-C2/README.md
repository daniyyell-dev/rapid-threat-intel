# Phexia: macOS ClickFix Stealer with Polygon C2

[Live entry](https://iocwatch.com/t/Phexia-macOS-ClickFix-Stealer-Polygon-C2/) · [Back to index](../../../../README.md) · [November 2026](../../README.md) · [2026-11-10](../README.md)

| Published | First added | Last updated | Category | Indicators | Block now |
|---|---|---|---|---|---|
| 2026-11-04 | 2026-11-10 15:14 | 2026-11-10 | Malware / macOS | 48 | 25 |

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

Phexia is a modular macOS backdoor and infostealer sold to several criminal groups and delivered through ClickFix lures that get the victim to paste a curl-to-bash command into Terminal. WithSecure has tracked infections since late 2025, with a growing number of cases in 2026. From May 2026 the latest builds have fetched their C2 hostname from a Polygon smart contract (EtherHiding) rather than a hardcoded domain, so taking a C2 domain down does not stop new lookups. Once running, the backdoor steals the login password, keychain material, and browser and password-manager data, and has been used to deploy the XMRig Monero miner. A second contract appeared in a build installed on 27 October 2026. Older C2 domains can remain in use after the contract changes, and reinfection can leave more than one build active on the same Mac.

## Affected countries and sectors

- **Countries:** Not stated in the sources
- **Sectors:** Not stated in the sources
- **Note:** WithSecure describes macOS users reached through ClickFix lures, without naming countries or sectors.
- **Source:** [WithSecure – Inside Phexia: A macOS malware delivered through ClickFix](https://www.withsecure.com/en/resources-hub/w-labs/phexia-macos-malware/)

## At a glance

| File | What it is |
|---|---|
| [`block_now.txt`](https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/threats/2026-11_November-2026/2026-11-10/Phexia-macOS-ClickFix-Stealer-Polygon-C2/block_now.txt) (raw) | 25 high-confidence indicators to block now |
| [`iocs.csv`](iocs.csv) | All 48 indicators with description, confidence, action and source |
| [`defender_xdr_indicators.csv`](defender_xdr_indicators.csv) | 27 rows for Defender XDR bulk import |
| [`hunt.kql`](hunt.kql) | Defender XDR advanced hunting query |
| [`hunt.spl`](hunt.spl) | Splunk hunt over the CIM data models |
| [`hunt_raw.spl`](hunt_raw.spl) | Splunk hunt for data not mapped to CIM ([macros](../../../../all/splunk_macros.conf)) |
| [`hunt.yaral`](hunt.yaral) | Google SecOps YARA-L 2.0 detection rule |

Indicators by type: 24 domains, 12 file names, 4 other, 2 URLs, 2 Ethereum/Polygon addresses, 2 Monero addresses, 1 IPv4, 1 function selector. See `iocs.csv` for full details and descriptions.

## MITRE ATT&CK

| ID | Technique |
|---|---|
| [T1204.004](https://attack.mitre.org/techniques/T1204/004/) | Malicious Copy and Paste |
| [T1059.002](https://attack.mitre.org/techniques/T1059/002/) | AppleScript |
| [T1543.001](https://attack.mitre.org/techniques/T1543/001/) | Launch Agent |
| [T1102.001](https://attack.mitre.org/techniques/T1102/001/) | Dead Drop Resolver |
| [T1555.001](https://attack.mitre.org/techniques/T1555/001/) | Keychain |
| [T1041](https://attack.mitre.org/techniques/T1041/) | Exfiltration Over C2 Channel |
| [T1496.001](https://attack.mitre.org/techniques/T1496/001/) | Compute Hijacking |

## Recommended actions

1. Block the C2 and delivery domains and the stolen-data upload address 62.60.226.50; do not block the public Polygon RPC endpoints or the mining pools, which are legitimate services.
2. Hunt DeviceProcessEvents for a Terminal-spawned curl piped to bash, osascript droppers, dscl . authonly password checks, security find-generic-password keychain reads, and eth_call lookups of the published Polygon contracts.
3. Inspect ~/Library/LaunchAgents for com.<16 lowercase letters> and com.Apple.<16 lowercase letters> plists whose arguments pipe base64 into osascript; unload each confirmed job before deleting it, and look for more than one build.
4. On a confirmed infection, collect ~/.passphrase, ~/.txid and the staging folders, then from a trusted device reset affected passwords, revoke sessions and tokens, and check for XMRig under /tmp/rigupdater or /tmp/applecomlistupdate.

## Sources

- [WithSecure – Inside Phexia: A macOS malware delivered through ClickFix](https://www.withsecure.com/en/resources-hub/w-labs/phexia-macos-malware/)

---

[Back to index](../../../../README.md)
