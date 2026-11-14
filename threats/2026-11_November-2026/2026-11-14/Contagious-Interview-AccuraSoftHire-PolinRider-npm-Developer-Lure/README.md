# Contagious Interview: AccuraSoftHire Fake Employer Plants PolinRider Loader on Developer Machines

[Live entry](https://daniyyell.com/rapid-threat-intel/t/Contagious-Interview-AccuraSoftHire-PolinRider-npm-Developer-Lure/) · [Back to index](../../../../README.md) · [November 2026](../../README.md) · [2026-11-14](../README.md)

| Published | First added | Last updated | Category | Indicators | Block now |
|---|---|---|---|---|---|
| 2026-11-09 | 2026-11-14 04:14 | 2026-11-14 | Nation-state / social engineering | 10 | 9 |

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

JFrog Security Research reported on 9 November 2026 that a fake company, AccuraSoftHire, with a careers site, Indeed and Glassdoor job ads, ID-verified LinkedIn recruiters and GitHub accounts, gives software engineers a take-home React test whose Tailwind config loads a trojanised look-alike plugin such as tailwind-custom-forms. The loader runs when Tailwind builds the CSS, not at npm install. Candidates are also pushed a fake camera driver and a job-alerts browser extension from the site. The loader, which researchers track as PolinRider, reads the newest transaction from Ethereum wallet 0xa322E5f3D311D3080e6f0121063e9aDC2490Ef1a, decodes the C2 address from it and fetches two stages over plain HTTP on port 443 from /0x/cls and /0x/ls. StepSecurity decoded all 609 wallet transactions (July to 19 October 2026) into eight C2 addresses, and reports the malware steals browser, wallet, SSH, cloud and git credentials and injects itself into the victim's other repositories. The tradecraft matches North Korea-linked Contagious Interview, the same lure Binance says began its 29 October theft of about $6.34 billion, though JFrog found no link between AccuraSoftHire and that intrusion. The careers domain and all eight C2 addresses are on the block list.

> [!WARNING]
> Attribution to North Korea rests on shared tradecraft and markers with PolinRider and ClickFake, not on a confirmed link; JFrog found no tie to the Binance intrusion. The wallet has posted no new address since 19 October 2026, so a loader running today would still contact 103.179.142.155; if the operator moves to a new wallet, new addresses will not appear here. The npm package names, account names and email addresses in the report are not network indicators and are covered in the actions.

## Affected countries and sectors

- **Countries:** Not stated in the sources
- **Regions:** Worldwide
- **Sectors:** Software development, Cryptocurrency
- **Note:** Fake job interviews aimed at software engineers and their employers' credentials; the reports cite the same lure in the Binance theft and name no target countries.
- **Source:** [JFrog Security Research – Contagious Interview: One Interview Away From Infection](https://research.jfrog.com/post/accurasofthire-fake-interview/)

## At a glance

| File | What it is |
|---|---|
| [`block_now.txt`](https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/threats/2026-11_November-2026/2026-11-14/Contagious-Interview-AccuraSoftHire-PolinRider-npm-Developer-Lure/block_now.txt) (raw) | 9 high-confidence indicators to block now |
| [`iocs.csv`](iocs.csv) | All 10 indicators with description, confidence, action and source |
| [`defender_xdr_indicators.csv`](defender_xdr_indicators.csv) | 9 rows for Defender XDR bulk import |
| [`hunt.kql`](hunt.kql) | Defender XDR advanced hunting query |
| [`hunt.spl`](hunt.spl) | Splunk hunt over the CIM data models |
| [`hunt_raw.spl`](hunt_raw.spl) | Splunk hunt for data not mapped to CIM ([macros](../../../../all/splunk_macros.conf)) |
| [`hunt.yaral`](hunt.yaral) | Google SecOps YARA-L 2.0 detection rule |

Indicators by type: 8 IPv4, 1 domain, 1 Ethereum/Polygon address. See `iocs.csv` for full details and descriptions.

## MITRE ATT&CK

| ID | Technique |
|---|---|
| [T1566.003](https://attack.mitre.org/techniques/T1566/003/) | Phishing: Spearphishing via Service |
| [T1195.001](https://attack.mitre.org/techniques/T1195/001/) | Supply Chain Compromise: Compromise Software Dependencies and Development Tools |
| [T1204.002](https://attack.mitre.org/techniques/T1204/002/) | User Execution: Malicious File |
| [T1102.001](https://attack.mitre.org/techniques/T1102/001/) | Web Service: Dead Drop Resolver |
| [T1071.001](https://attack.mitre.org/techniques/T1071/001/) | Application Layer Protocol: Web Protocols |
| [T1176](https://attack.mitre.org/techniques/T1176/) | Browser Extensions |
| [T1555.003](https://attack.mitre.org/techniques/T1555/003/) | Credentials from Web Browsers |
| [T1552.001](https://attack.mitre.org/techniques/T1552/001/) | Unsecured Credentials: Credentials In Files |

## Recommended actions

1. Block accurasofthire.com and the eight C2 addresses at the proxy and firewall, and search 90 days of proxy, DNS and firewall logs for them, for any request to /0x/cls or /0x/ls, and for a Sec-V request header.
2. Search developer machines and project folders for the npm packages tailwind-custom-forms, tailwindcss-contact-forms, tailwind-form-styles, tailwind-forms-kit, tailwind-lines-clamps, tailwind-clamps-line, tailwind-lineclamp, scrollbar-hide-plugin, tailwindcss-anim and tailwind-anim, for .vscode/tasks.json files with "runOn": "folderOpen", and for a browser extension loaded from a folder named job-new-alerts.
3. If a machine matches, treat every credential on it as stolen: rotate git, SSH, cloud, npm and browser-stored credentials, and review the developer's repositories for loader code added under backdated commits.
4. Set VS Code task.allowAutomaticTasks to off, keep Workspace Trust on, and make it policy that interview assignments, drivers and setup commands from outside the company never run on work machines.

## Behaviours to hunt

> Behaviours are leads, not confirmed indicators, and can match legitimate activity. Compare any hit against your own baseline and environment before acting.

1. **Hunt** · Node.js reads the Ethereum dead drop, then calls a bare IP on 443\
   Look for: Node.js reading the Ethereum block explorer eth.blockscout.com, then connecting to a bare public IP on port 443 within five minutes\
   Why it matters: JFrog and StepSecurity show the PolinRider loader running inside a Tailwind build (node) and querying the operator's wallet history through eth.blockscout.com, then fetching /0x/cls and /0x/ls over plain HTTP on port 443 from the decoded IP, with no hostname. StepSecurity names these two connections as ones a frontend build would not normally make. The hunt only fires when the same device does both within five minutes, which a normal frontend build never does. Expected false positives are developers who build Web3 dApps or wallet tooling and call a raw-IP RPC node; review the node command line and the destination, and exclude known internal Web3 projects by path.\
   Log source: Defender XDR DeviceNetworkEvents; proxy and firewall logs\
   Source: [StepSecurity](https://www.stepsecurity.io/blog/accurasofthire-fake-interview-developer-machines)

2. **Alert** · com.accurasoft.jobalerts native host or .nvm\bootstrap.cmd\
   Look for: Native messaging host com.accurasoft.jobalerts registered for Chrome or Edge, or bootstrap.cmd written under %USERPROFILE%\.nvm\
   Why it matters: JFrog found the site's job-alerts setup script registers a native messaging host named com.accurasoft.jobalerts for Chrome and Edge in the user's registry, whose only extra job is to run curl http://accurasofthire.com/notification-settings-win?download=1 \| cmd. That batch file creates a .nvm folder in the user profile and starts notification-bootstrap-win as bootstrap.cmd, hidden. Neither name belongs to legitimate software (nvm-windows keeps its files under AppData\Roaming\nvm and has no bootstrap.cmd), so expected false positives are close to none.\
   Log source: Defender XDR DeviceRegistryEvents and DeviceFileEvents; Windows Registry and file auditing\
   Source: [JFrog Security Research](https://research.jfrog.com/post/accurasofthire-fake-interview/)

Behaviours that map cleanly to log fields are included in [`hunt.kql`](hunt.kql) and [`hunt.spl`](hunt.spl), and alert behaviours in [`hunt.yaral`](hunt.yaral). The rest are listed in the Behaviours section above with where to look. Use behaviours to hunt and alert, never to block.

## Sources

- [JFrog Security Research – Contagious Interview: One Interview Away From Infection](https://research.jfrog.com/post/accurasofthire-fake-interview/)
- [StepSecurity – Inside the AccuraSoftHire fake interview campaign](https://www.stepsecurity.io/blog/accurasofthire-fake-interview-developer-machines)
- [ThreatFox – 103.179.142.155:443 loader C2 (IOC 1971739)](https://threatfox.abuse.ch/ioc/1971739/)
- [ThreatFox – 23.27.13.72:443 loader C2 (IOC 1967882)](https://threatfox.abuse.ch/ioc/1967882/)
- [ThreatFox – 91.218.183.174:443 loader C2 (IOC 2018861)](https://threatfox.abuse.ch/ioc/2018861/)
- [ThreatFox – 166.88.134.75:443 loader C2 (IOC 1926649)](https://threatfox.abuse.ch/ioc/1926649/)
- [ThreatFox – 193.247.144.38:443 loader C2 (IOC 2018860)](https://threatfox.abuse.ch/ioc/2018860/)
- [ThreatFox – 166.88.73.46:443 loader C2 (IOC 2018859)](https://threatfox.abuse.ch/ioc/2018859/)
- [ThreatFox – 23.27.13.135:443 loader C2 (IOC 2018858)](https://threatfox.abuse.ch/ioc/2018858/)
- [ThreatFox – 166.88.134.62:443 loader C2 (IOC 2018857)](https://threatfox.abuse.ch/ioc/2018857/)

---

[Back to index](../../../../README.md)
