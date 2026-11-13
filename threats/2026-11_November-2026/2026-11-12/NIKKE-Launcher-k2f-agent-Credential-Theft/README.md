# NIKKE Launcher Abused to Deliver the k2f-agent Stealer

[Back to index](../../../../README.md) · [November 2026](../../README.md) · [2026-11-12](../README.md)

| Published | First added | Last updated | Category | Indicators | Block now |
|---|---|---|---|---|---|
| 2026-11-12 | 2026-11-12 22:55 | 2026-11-12 | Supply chain / information stealer | 9 | 5 |

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

Bitdefender reports that from 30 October 2026 attackers abused the Goddess of Victory: NIKKE PC launcher's server-pushed task channel to deliver k2f-agent, a 46-module Lua stealer, without patching the signed launcher or the game distribution. The payload arrived as obfuscated LuaJIT bytecode disguised as a log file, ran inside the launcher's embedded browser, and harvested Chrome, Edge and Opera passwords and cookies, including those protected by Chrome App-Bound Encryption, plus MetaMask, Phantom, Coinbase Wallet, Keplr and TronLink extension data and developer secrets such as SSH and GPG keys, Git credentials and Kubernetes configs. Stolen data left through the launcher's normal telemetry, and the download, collection, exfiltration and cleanup finished in under ten minutes. The delivery domain insightjs.com was registered on 27 September 2026 and hosted in Iceland at 89.127.233.127; the provider has taken the server down. The domains, IP, payload URL and SHA-256 hash are on the block list. Bitdefender has no evidence that Shift Up or Level Infinite took part in the attack; do not block the game vendor's own infrastructure.

> [!WARNING]
> The malicious delivery server has been taken down, but a suspension can be lifted. The NIKKE launcher is legitimate software that was abused; do not block Shift Up, Level Infinite or other official game domains. Treat a machine that ran the launcher during the attack window as compromised and rotate browser, wallet and developer secrets from a clean device.

## Affected countries and sectors

- **Countries:** Not stated in the sources
- **Regions:** Global
- **Sectors:** Consumers, Gaming, Software developers
- **Note:** Bitdefender observed the k2f-agent stealer being delivered to NIKKE PC launcher users from 30 October 2026. The game has more than 45 million downloads; Bitdefender does not name victim organisations and has no evidence the developer or publisher was involved.
- **Source:** [Bitdefender Labs – Attackers turn NIKKE's game launcher into malware](https://www.bitdefender.com/en-us/blog/labs/nikke-game-launcher-malware)

## At a glance

| File | What it is |
|---|---|
| [`block_now.txt`](https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/threats/2026-11_November-2026/2026-11-12/NIKKE-Launcher-k2f-agent-Credential-Theft/block_now.txt) (raw) | 5 high-confidence indicators to block now |
| [`iocs.csv`](iocs.csv) | All 9 indicators with description, confidence, action and source |
| [`defender_xdr_indicators.csv`](defender_xdr_indicators.csv) | 5 rows for Defender XDR bulk import |
| [`hunt.kql`](hunt.kql) | Defender XDR advanced hunting query |
| [`hunt.spl`](hunt.spl) | Splunk hunt over the CIM data models |
| [`hunt_raw.spl`](hunt_raw.spl) | Splunk hunt for data not mapped to CIM ([macros](../../../../all/splunk_macros.conf)) |
| [`hunt.yaral`](hunt.yaral) | Google SecOps YARA-L 2.0 detection rule |

Indicators by type: 2 domains, 2 file names, 2 other, 1 IPv4, 1 URL, 1 SHA256. See `iocs.csv` for full details and descriptions.

## MITRE ATT&CK

| ID | Technique |
|---|---|
| [T1195.002](https://attack.mitre.org/techniques/T1195/002/) | Compromise Software Supply Chain |
| [T1059](https://attack.mitre.org/techniques/T1059/) | Command and Scripting Interpreter |
| [T1555.003](https://attack.mitre.org/techniques/T1555/003/) | Credentials from Web Browsers |
| [T1539](https://attack.mitre.org/techniques/T1539/) | Steal Web Session Cookie |
| [T1555](https://attack.mitre.org/techniques/T1555/) | Credentials from Password Stores |
| [T1552.001](https://attack.mitre.org/techniques/T1552/001/) | Credentials In Files |
| [T1071.001](https://attack.mitre.org/techniques/T1071/001/) | Web Protocols |
| [T1070.004](https://attack.mitre.org/techniques/T1070/004/) | File Deletion |

## Recommended actions

1. Block insightjs.com, analytics.insightjs.com and 89.127.233.127, and the payload URL and SHA-256 hash, and search 90 days of DNS, proxy and firewall logs for them.
2. On PCs that ran the NIKKE launcher from late October, look for k2f_chan registered in Launcher\intl_service\debug.log, LuaJIT bytecode in Launcher\log\tinyget\tinyget.*.log, and %TEMP%\k2f-bcreds-*.db, and for the signed launcher opening browser credential stores.
3. If the agent ran, rotate passwords stored in Chrome, Edge and Opera, move assets from the targeted wallet extensions onto new seed phrases generated on a clean machine, and rotate SSH, GPG, Git, Kubernetes and Windows Credential Manager secrets.
4. Do not block official NIKKE, Shift Up or Level Infinite domains or the signed launcher by name alone.

## Behaviours to hunt

> Behaviours are leads, not confirmed indicators, and can match legitimate activity. Compare any hit against your own baseline and environment before acting.

1. **Alert** · A signed NIKKE game-launcher process opening Chrome\
   Look for: A signed NIKKE game-launcher process opening Chrome, Edge or Opera Login Data, Login Data For Account, Local State, or cryptocurrency-wallet extension Local Extension Settings .ldb files\
   Why it matters: k2f-agent runs inside the legitimate launcher and harvests browser passwords, cookies (including Chrome App-Bound Encryption) and wallet extensions (MetaMask, Phantom, Coinbase Wallet, Keplr, TronLink), plus developer secrets. The whole collection and cleanup can finish in under ten minutes.\
   Log source: EDR file and process events (DeviceFileEvents, DeviceProcessEvents), Sysmon 11 and 1\
   Source: [Bitdefender](https://www.bitdefender.com/en-us/blog/labs/nikke-game-launcher-malware)

2. **Alert** · A .log file under Launcher\log\tinyget\
   Look for: A .log file under Launcher\log\tinyget, especially tinyget.*.log larger than about 50 KB, whose first bytes are LuaJIT bytecode (\x1bLJ\x01) rather than text\
   Why it matters: The stealer arrived as obfuscated LuaJIT bytecode disguised as an ordinary log file, fetched through the launcher's server-pushed task channel. The file is usually deleted quickly.\
   Log source: Endpoint file events, forensic collection of the NIKKE Launcher log folder\
   Source: [Bitdefender](https://www.bitdefender.com/en-us/blog/labs/nikke-game-launcher-malware)

3. **Alert** · The launcher process connecting to insightjs.com or analytics.insightjs.com\
   Look for: The launcher process connecting to insightjs.com or analytics.insightjs.com, or the string k2f_chan registered in Launcher\intl_service\debug.log, or %TEMP%\k2f-bcreds-*.db\
   Why it matters: Those domains hosted the payload. k2f_chan registered shows the Lua agent executed. The temporary database holds stolen browser credentials. Do not block NIKKE, Shift Up or Level Infinite infrastructure; the launcher itself was abused, not trojanised in the game distribution.\
   Log source: Proxy, DNS and firewall logs; launcher debug.log; endpoint file events\
   Source: [Bitdefender](https://www.bitdefender.com/en-us/blog/labs/nikke-game-launcher-malware)

Behaviours that map cleanly to log fields are included in [`hunt.kql`](hunt.kql) and [`hunt.spl`](hunt.spl), and alert behaviours in [`hunt.yaral`](hunt.yaral). The rest are listed in the Behaviours section above with where to look. Use behaviours to hunt and alert, never to block.

## Sources

- [Bitdefender Labs – Attackers turn NIKKE's game launcher into malware](https://www.bitdefender.com/en-us/blog/labs/nikke-game-launcher-malware)

---

[Back to index](../../../../README.md)
