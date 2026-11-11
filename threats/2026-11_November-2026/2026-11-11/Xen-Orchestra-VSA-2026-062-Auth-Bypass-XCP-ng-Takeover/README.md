# Xen Orchestra Authentication Bypass (VSA-2026-062) Exploited to Take Over XCP-ng Hosts

[Back to index](../../../../README.md#latest-threats) · [November 2026](../../README.md) · [2026-11-11](../README.md)

| Published | First added | Last updated | Category | Indicators | Block now |
|---|---|---|---|---|---|
| 2026-11-10 | 2026-11-11 10:05 | 2026-11-11 | Exploitation / hypervisor management | 17 | 2 |

## Summary

Vates reports active exploitation of VSA-2026-062, a critical authentication bypass in Xen Orchestra, the web console that manages XCP-ng virtualisation pools. A request carrying the cookie authenticationToken=j:{} (or its URL-encoded form, j:%7B%7D) makes Xen Orchestra treat the value as an empty object, return the first stored token and log the sender in as that token's owner, usually an administrator; the /rest/v0/users/me/authentication_tokens route then hands back reusable login tokens. From there an attacker can run code on managed pools and take over XCP-ng hosts as root. The threat actor operated initially from 91.211.251.112:8001 and a Tor onion service on port 3333, ran a VM named pivot2, configured VMs with a file-backed serial port and planted /etc/cron.d/zz-ustar, /etc/cron.d/zz-ustar2, /.ustar5 and /.ustar6 on hosts. Xen Orchestra does not log the bypass. Six of the eight addresses Vates lists for blocking are public Tor relays, including a Tor directory authority, so they are marked alert rather than block. The flaw has no CVE yet; it is fixed in Xen Orchestra 6.9.2 (stable) and 6.10.1 (latest), and was discovered by TDC NET Security.

## Affected countries and sectors

- **Countries:** Not stated in the sources
- **Sectors:** Not stated in the sources
- **Note:** Vates confirms active exploitation of internet-reachable Xen Orchestra instances but does not name countries, sectors or victims.
- **Source:** [Vates – VSA-2026-062: Empty-object login token](https://docs.vates.tech/security-advisories/advisories/2026/vates-sa-2026-062/)

## At a glance

| File | What it is |
|---|---|
| [`block_now.txt`](https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/threats/2026-11_November-2026/2026-11-11/Xen-Orchestra-VSA-2026-062-Auth-Bypass-XCP-ng-Takeover/block_now.txt) (raw) | 2 high-confidence indicators to block now |
| [`iocs.csv`](iocs.csv) | All 17 indicators with description, confidence, action and source |
| [`defender_xdr_indicators.csv`](defender_xdr_indicators.csv) | 8 rows for Defender XDR bulk import |
| [`hunt.kql`](hunt.kql) | Defender XDR advanced hunting query |

Indicators by type: 8 IPv4, 5 other, 4 file names. See `iocs.csv` for full details and descriptions.

## MITRE ATT&CK

| ID | Technique |
|---|---|
| [T1190](https://attack.mitre.org/techniques/T1190/) | Exploit Public-Facing Application |
| [T1550.001](https://attack.mitre.org/techniques/T1550/001/) | Application Access Token |
| [T1564.006](https://attack.mitre.org/techniques/T1564/006/) | Run Virtual Instance |
| [T1053.003](https://attack.mitre.org/techniques/T1053/003/) | Cron |
| [T1090.003](https://attack.mitre.org/techniques/T1090/003/) | Multi-hop Proxy |
| [T1571](https://attack.mitre.org/techniques/T1571/) | Non-Standard Port |

## Recommended actions

1. Update Xen Orchestra to 6.9.2 (stable) or 6.10.1 (latest), or xo-server to 5.211.2 or 5.213.1, and keep the console on a dedicated management network that is not reachable from the internet.
2. Block 91.211.251.112 and 193.148.56.72 in both directions, block Tor from management networks, and search 30 days of firewall and proxy logs for these addresses and the six Tor relays.
3. Add a WAF or reverse-proxy rule for authenticationToken=j:{} and authenticationToken=j:%7B%7D, and search proxy and web server logs for both patterns, because Xen Orchestra does not log the bypass.
4. On every XCP-ng host, look for a VM named pivot2, VMs with hvm_serial: file, '-serial file:' in /var/log/xensource.log*, and /etc/cron.d/zz-ustar*, /.ustar5, /.ustar6 and /etc/ld.so.preload. If compromised, reinstall and rotate every Vates VMS secret, including backup remotes, the pool secret, root and user passwords, OTP secrets and mail settings.

## Hunt

Run this before blocking to find past activity.

1. Open [`hunt.kql`](hunt.kql) and copy the query.
2. In the [Microsoft Defender portal](https://security.microsoft.com), go to **Hunting > Advanced hunting** and paste it into a new query tab.
3. Select **Run query**. Results cover the last 30 days, one row per table, entity and indicator.

Non-network leads such as file names or URL paths are listed as comments at the end of the query. See the [Defender XDR guide](../../../../docs/defender-xdr.md) for more.

## Sources

- [Vates – VSA-2026-062: Empty-object login token](https://docs.vates.tech/security-advisories/advisories/2026/vates-sa-2026-062/)
- [The Hacker News – Hackers Exploit Critical Xen Orchestra Auth Bypass Flaw to Gain Admin Access](https://thehackernews.com/2026/11/hackers-exploit-critical-xen-orchestra.html)

---

[Back to index](../../../../README.md#latest-threats)
