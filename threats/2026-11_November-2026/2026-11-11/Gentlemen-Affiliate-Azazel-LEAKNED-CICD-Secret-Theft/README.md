# Gentlemen Ransomware Affiliate Azazel: CI/CD Secret Theft, LEAKNED Extortion and MCP Command Execution

[Back to index](../../../../README.md#latest-threats) · [November 2026](../../README.md) · [2026-11-11](../README.md)

| Published | First added | Last updated | Category | Indicators | Block now |
|---|---|---|---|---|---|
| 2026-10-05 | 2026-11-11 10:21 | 2026-11-11 | Ransomware / data theft and extortion | 9 | 3 |

## Summary

CloudSEK traced an exposed open directory and storage server to Azazel, a Russian-speaking affiliate of The Gentlemen ransomware-as-a-service operation, and confirmed more than two dozen breached organisations in six countries across logistics, insurance, pharmaceuticals, medical devices, AI and government-linked services. Azazel used The Gentlemen's tooling and ransom note template but published victims on his own leak site, LEAKNED, and kept the proceeds; Bitdefender's November 2026 debrief reports more than 6 TB of stolen data. Most victims were reached through secrets harvested from GitLab CI/CD variables and repository history (database passwords, API tokens and SSH keys), and one AI platform was entered through a server-side URL fetch (SSRF). Data left through aws s3 sync, mc mirror, scp, pg_dump and HTTP POST to port 9999 on the C2 server, then moved to MEGA. After exfiltration Azazel killed a production PostgreSQL process and deleted its data directory, and planted ransom notes on eight surfaces, including /etc/motd, the SSH banner and ATTENTION_SENSITIVE_INFORMATION.txt in the root and ubuntu home directories. He also ran commands through exec_in_session, a Model Context Protocol (MCP) tool served on 127.0.0.1:35367, and scanned the internet for exposed MCP servers.

## Affected countries and sectors

- **Countries:** Not stated in the sources
- **Sectors:** Logistics, Insurance, Pharmaceuticals, Medical devices, Technology, Government
- **Note:** CloudSEK confirmed more than two dozen breached organisations in six countries but does not name the countries. Sectors are those CloudSEK lists; the government entry is a platform hosting a government-linked financial registry.
- **Source:** [CloudSEK – Caught in 4K: The Gentlemen Files](https://www.cloudsek.com/blog/caught-in-4k-the-gentlemen-files)

## At a glance

| File | What it is |
|---|---|
| [`block_now.txt`](https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/threats/2026-11_November-2026/2026-11-11/Gentlemen-Affiliate-Azazel-LEAKNED-CICD-Secret-Theft/block_now.txt) (raw) | 3 high-confidence indicators to block now |
| [`iocs.csv`](iocs.csv) | All 9 indicators with description, confidence, action and source |
| [`defender_xdr_indicators.csv`](defender_xdr_indicators.csv) | 6 rows for Defender XDR bulk import |
| [`hunt.kql`](hunt.kql) | Defender XDR advanced hunting query |

Indicators by type: 5 IPv4, 2 other, 1 domain, 1 file name. See `iocs.csv` for full details and descriptions.

## MITRE ATT&CK

| ID | Technique |
|---|---|
| [T1552.001](https://attack.mitre.org/techniques/T1552/001/) | Credentials In Files |
| [T1213.003](https://attack.mitre.org/techniques/T1213/003/) | Code Repositories |
| [T1190](https://attack.mitre.org/techniques/T1190/) | Exploit Public-Facing Application |
| [T1021.004](https://attack.mitre.org/techniques/T1021/004/) | SSH |
| [T1059.004](https://attack.mitre.org/techniques/T1059/004/) | Unix Shell |
| [T1110.002](https://attack.mitre.org/techniques/T1110/002/) | Password Cracking |
| [T1567.002](https://attack.mitre.org/techniques/T1567/002/) | Exfiltration to Cloud Storage |
| [T1485](https://attack.mitre.org/techniques/T1485/) | Data Destruction |
| [T1491.001](https://attack.mitre.org/techniques/T1491/001/) | Internal Defacement |

## Recommended actions

1. Block 23.236.169.183, 162.220.163.26 and 66.179.30.155 at the perimeter and in Defender XDR, and search 90 days of firewall, NetFlow and GitLab access logs for them, including SSH and outbound HTTP to port 9999.
2. Rotate every secret held in GitLab CI/CD variables and in repository history (database passwords, API tokens, SSH keys and cloud keys), make variables masked and protected, and review CI/CD variable reads and API token use from unexpected addresses.
3. Search Linux servers for ATTENTION_SENSITIVE_INFORMATION.txt in the root and ubuntu home directories, and for changes to /etc/motd, the sshd_config Banner setting, the PostgreSQL cluster_name and the pgAdmin login template; also check GitLab for README edits or issues opened with a pipeline token.
4. Alert on mc mirror, aws s3 sync, pg_dump or mega-cmd-server runs to destinations you do not own, keep any MCP server bound to loopback with an approved client allowlist, and alert on MCP clients named internet-census-mcp-scanner.

## Hunt

Run this before blocking to find past activity.

1. Open [`hunt.kql`](hunt.kql) and copy the query.
2. In the [Microsoft Defender portal](https://security.microsoft.com), go to **Hunting > Advanced hunting** and paste it into a new query tab.
3. Select **Run query**. Results cover the last 30 days, one row per table, entity and indicator.

Non-network leads such as file names or URL paths are listed as comments at the end of the query. See the [Defender XDR guide](../../../../docs/defender-xdr.md) for more.

## Sources

- [CloudSEK – Caught in 4K: The Gentlemen Files](https://www.cloudsek.com/blog/caught-in-4k-the-gentlemen-files)
- [Bitdefender – Threat Debrief November 2026](https://www.bitdefender.com/en-us/blog/businessinsights/bitdefender-threat-debrief-november-2026)

---

[Back to index](../../../../README.md#latest-threats)
