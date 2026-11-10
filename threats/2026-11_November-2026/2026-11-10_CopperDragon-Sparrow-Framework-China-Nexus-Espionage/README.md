# CopperDragon: China-Nexus Sparrow Framework Targeting Government and Telecoms

[Back to index](../../../README.md#latest-threats) · [November 2026](../README.md)

| Published | First added | Last updated | Category | Indicators | Block now |
|---|---|---|---|---|---|
| 2026-11-10 | 2026-11-10 | 2026-11-10 | APT / espionage | 158 | 116 |

## Summary

Check Point Research tracks CopperDragon as a possible supplier of malware and infrastructure, the Sparrow framework, to several China-nexus groups including activity previously reported as FamousSparrow (linked to Salt Typhoon), Earth Estries, TropicTrooper and UAT-9244. A year-long investigation found activity in 21 countries across Europe, Asia and Latin America against government, telecommunications, military, research and critical infrastructure organisations, split into three clusters. SilentDelivery compromises legitimate websites in countries including Germany, France and the Czech Republic and shows selected visitors a fake Chrome certificate error that installs the SquadC backdoor or SparrowDoor. OceanGate exploits internet-facing Linux servers, mainly in India, deploys AnnobinDoor, SparrowShell with a modified Reptile rootkit and trojanized SSH, then moves into Windows. DarkWire targets telecoms and government, mainly in Latin America, with the in-memory CopperDoor and DNS-tunnelling CopperDNS backdoors and LSASS credential theft tools.

> [!WARNING]
> The report covers about a year of activity and gives no per-address dates, so some IPs may no longer be in use by the operators.

## At a glance

| File | What it is |
|---|---|
| [`block_now.txt`](https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/threats/2026-11_November-2026/2026-11-10_CopperDragon-Sparrow-Framework-China-Nexus-Espionage/block_now.txt) (raw) | 116 high-confidence indicators to block now |
| [`iocs.csv`](iocs.csv) | All 158 indicators with description, confidence, action and source |
| [`defender_xdr_indicators.csv`](defender_xdr_indicators.csv) | 158 rows for Defender XDR bulk import |
| [`hunt.kql`](hunt.kql) | Defender XDR advanced hunting query |

Indicators by type: 93 IPv4, 51 SHA256, 14 domain. See `iocs.csv` for full details and descriptions.

## MITRE ATT&CK

| ID | Technique |
|---|---|
| [T1189](https://attack.mitre.org/techniques/T1189/) | Drive-by Compromise |
| [T1190](https://attack.mitre.org/techniques/T1190/) | Exploit Public-Facing Application |
| [T1574.002](https://attack.mitre.org/techniques/T1574/002/) | DLL Side-Loading |
| [T1556](https://attack.mitre.org/techniques/T1556/) | Modify Authentication Process |
| [T1003.001](https://attack.mitre.org/techniques/T1003/001/) | LSASS Memory |
| [T1071.004](https://attack.mitre.org/techniques/T1071/004/) | DNS |
| [T1090](https://attack.mitre.org/techniques/T1090/) | Proxy |
| [T1014](https://attack.mitre.org/techniques/T1014/) | Rootkit |

## Recommended actions

1. Block the domains, the C2 IPs marked block and the file hashes; alert on the cloud-hosted IPs rather than blocking them.
2. Hunt for CertFixer.msi downloads and fake certificate-repair prompts, and for signed applications loading the listed DLL names from unusual folders.
3. On internet-facing Linux servers, verify the ssh and sshd binaries against package checksums and look for containerd-demo, xfs_rudp and aplk.
4. Alert on new LSA security packages, LSASS dumps and hidden local administrator accounts, and on unusual DNS MX query volumes to rare domains.

## Hunt

Run this before blocking to find past activity.

1. Open [`hunt.kql`](hunt.kql) and copy the query.
2. In the [Microsoft Defender portal](https://security.microsoft.com), go to **Hunting > Advanced hunting** and paste it into a new query tab.
3. Select **Run query**. Results cover the last 30 days, one row per table, entity and indicator.

Non-network leads such as file names or URL paths are listed as comments at the end of the query. More in the [Defender XDR guide](../../../docs/defender-xdr.md).

## Sources

- [Check Point Research - Not All That Glitters Is Gold: Tracking CopperDragon's Sparrow Framework Around the Globe](https://research.checkpoint.com/2026/not-all-that-glitters-is-gold-tracking-copperdragons-sparrow-framework-around-the-globe/)
- [Check Point - CopperDragon: Uncovering a Global China-Nexus Cyber Espionage Framework](https://blog.checkpoint.com/security/copperdragon-uncovering-a-global-china-nexus-cyber-espionage-framework/)

---

[Back to index](../../../README.md#latest-threats)
