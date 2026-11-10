# Ethersphere bee-js and Swarm Desktop Supply-Chain Attack (SleepyDuck / evjawbreaker)

[Back to index](../../../README.md#latest-threats) · [November 2026](../README.md)

| Published | First added | Last updated | Category | Indicators | Block now |
|---|---|---|---|---|---|
| 2026-11-09 | 2026-11-10 | 2026-11-10 | Supply chain / npm | 57 | 37 |

## Summary

On 9 November 2026 an attacker abused Ethersphere's own GitHub release workflow to publish a malicious @ethersphere/bee-js 13.3.0 to npm and a trojanized Swarm Desktop 0.56.2 release on GitHub. Both carry a small loader that fetches and runs JavaScript from api.frameworkmetrics.xyz; later stages find their C2 through an Ethereum smart-contract dead drop shared with the SleepyDuck / EtherDuck campaign, steal Swarm wallet keys, and install the evjawbreaker backdoor on Linux and macOS or a rogue ScreenConnect client on Windows. npm removed 13.3.0 about 75 minutes after publication; the last clean bee-js version is 13.2.0.

## At a glance

| File | What it is |
|---|---|
| [`block_now.txt`](https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/threats/2026-11_November-2026/2026-11-09_Ethersphere-bee-js-Swarm-Desktop-Supply-Chain-Attack/block_now.txt) (raw) | 37 high-confidence indicators to block now |
| [`iocs.csv`](iocs.csv) | All 57 indicators with description, confidence, action and source |
| [`defender_xdr_indicators.csv`](defender_xdr_indicators.csv) | 41 rows for Defender XDR bulk import |
| [`hunt.kql`](hunt.kql) | Defender XDR advanced hunting query |

Indicators by type: 25 SHA256, 9 URL, 8 IPv4, 8 file name, 4 Ethereum/Polygon address, 2 domain, 1 SHA1. See `iocs.csv` for full details and descriptions.

## MITRE ATT&CK

| ID | Technique |
|---|---|
| [T1195.002](https://attack.mitre.org/techniques/T1195/002/) | Compromise Software Supply Chain |
| [T1102.001](https://attack.mitre.org/techniques/T1102/001/) | Dead Drop Resolver |
| [T1543.002](https://attack.mitre.org/techniques/T1543/002/) | Systemd Service |
| [T1543.001](https://attack.mitre.org/techniques/T1543/001/) | Launch Agent |
| [T1219](https://attack.mitre.org/techniques/T1219/) | Remote Access Software |
| [T1567.004](https://attack.mitre.org/techniques/T1567/004/) | Exfiltration Over Webhook |

## Recommended actions

1. Search lockfiles and installed apps for @ethersphere/bee-js 13.3.0 and Swarm Desktop 0.56.2; pin bee-js to 13.2.0.
2. Block the frameworkmetrics.xyz domains, the C2 IPs and the exact webhook.site and pastebin URLs.
3. On affected hosts look for ~/.solidity/, the solidity-langsupport persistence units and the rogue ScreenConnect service, then rebuild.
4. Move any Swarm or Ethereum wallet funds to new keys and rotate npm, GitHub and CI secrets present on the host.

## Hunt

Run this before blocking to find past activity.

1. Open [`hunt.kql`](hunt.kql) and copy the query.
2. In the [Microsoft Defender portal](https://security.microsoft.com), go to **Hunting > Advanced hunting** and paste it into a new query tab.
3. Select **Run query**. Results cover the last 30 days, one row per table, entity and indicator.

Non-network leads such as file names or URL paths are listed as comments at the end of the query. More in the [Defender XDR guide](../../../docs/defender-xdr.md).

## Sources

- [Socket - Malicious bee-js npm release and Swarm Desktop releases deliver SleepyDuck Ethereum C2 backdoor](https://socket.dev/blog/bee-js-compromise)
- [Corgea - bee-js 13.3.0 and Swarm Desktop 0.56.2 hijacked to deploy evjawbreaker](https://corgea.com/research/ethersphere-bee-js-13-3-0-swarm-desktop-0-56-2-evjawbreaker-ethereum-c2-november-2026)
- [The Hacker News - Hackers compromise Ethersphere's bee-js](https://thehackernews.com/2026/11/hackers-compromise-etherspheres-bee-js.html)

---

[Back to index](../../../README.md#latest-threats)
