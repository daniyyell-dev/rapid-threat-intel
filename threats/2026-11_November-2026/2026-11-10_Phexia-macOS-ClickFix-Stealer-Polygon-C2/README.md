# Phexia: macOS ClickFix Stealer with Polygon C2

[Back to index](../../../README.md#latest-threats) · [November 2026](../README.md)

| Published | First added | Last updated | Category | Indicators | Block now |
|---|---|---|---|---|---|
| 2026-11-04 | 2026-11-10 15:14 | 2026-11-10 | Malware / macOS | 48 | 25 |

## Summary

Phexia is a modular macOS backdoor and infostealer sold to several criminal groups and delivered through ClickFix lures that get the victim to paste a curl-to-bash command into Terminal. WithSecure has tracked infections since late 2025 and a growing number of cases in 2026. From May 2026 the latest builds have fetched their C2 hostname from a Polygon smart contract (EtherHiding) rather than a hardcoded domain, so taking a C2 domain down does not stop new lookups. Once running, the backdoor steals the login password, keychain material, and browser and password-manager data, and has been used to deploy the XMRig Monero miner. A second contract appeared in a build installed on 27 October 2026. Older C2 domains can remain in use after the contract changes, and reinfection can leave more than one build active on the same Mac.

## At a glance

| File | What it is |
|---|---|
| [`block_now.txt`](https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/threats/2026-11_November-2026/2026-11-10_Phexia-macOS-ClickFix-Stealer-Polygon-C2/block_now.txt) (raw) | 25 high-confidence indicators to block now |
| [`iocs.csv`](iocs.csv) | All 48 indicators with description, confidence, action and source |
| [`defender_xdr_indicators.csv`](defender_xdr_indicators.csv) | 27 rows for Defender XDR bulk import |
| [`hunt.kql`](hunt.kql) | Defender XDR advanced hunting query |

Indicators by type: 24 domain, 12 file name, 4 other, 2 URL, 2 Ethereum/Polygon address, 2 Monero address, 1 IPv4, 1 function selector. See `iocs.csv` for full details and descriptions.

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

## Hunt

Run this before blocking to find past activity.

1. Open [`hunt.kql`](hunt.kql) and copy the query.
2. In the [Microsoft Defender portal](https://security.microsoft.com), go to **Hunting > Advanced hunting** and paste it into a new query tab.
3. Select **Run query**. Results cover the last 30 days, one row per table, entity and indicator.

Non-network leads such as file names or URL paths are listed as comments at the end of the query. More in the [Defender XDR guide](../../../docs/defender-xdr.md).

## Sources

- [WithSecure - Inside Phexia: A macOS malware delivered through ClickFix](https://www.withsecure.com/en/resources-hub/w-labs/phexia-macos-malware/)

---

[Back to index](../../../README.md#latest-threats)
