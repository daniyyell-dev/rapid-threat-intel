# FaceStealer: BlueNoroff Fake Zoom and Teams Meetings, Stolen Webcam Video and ClickFix Lures

[Back to index](../../../../README.md#latest-threats) · [November 2026](../../README.md) · [2026-11-13](../README.md)

| Published | First added | Last updated | Category | Indicators | Block now |
|---|---|---|---|---|---|
| 2026-11-12 | 2026-11-13 00:20 | 2026-11-13 | Nation-state / social engineering | 134 | 120 |

## Summary

On 12 November 2026 the FBI published FLASH AC-111226-MS on FaceStealer, a North Korean scheme it attributes to the actors known as Sapphire Sleet, UNC1069, BlueNoroff and APT38. Hijacked Telegram, LinkedIn, Slack or Discord accounts invite a contact to a catch-up, a Calendly invite follows, and shortly before the call the target receives a typo-squatted Zoom or Teams link such as uu01webzoom.us or teams.livemeet.us. The fake meeting plays secretly recorded webcam video of earlier victims, or deepfakes of well-known industry figures, then stages an audio fault and talks the target into running a fix that installs a cookie harvester, keylogger, screen capture and backdoor while recording their webcam for the next round. The FBI says the scheme stole more than $400 million in 18 months, seized over 900 victim videos, and nearly poisoned a JavaScript library with tens of millions of weekly downloads. The same day Arctic Wolf reported that BlueNoroff now also uses fake document viewers, a NovaStream media player, Chrome PDF updates, identity checks and security scanners, published 98 high-confidence domains on three Hostwinds servers, and noted the fix commands have barely changed. The domains, IPs, payload URLs and lure hashes are on the block list; the strongest hunts are the paste-and-run cradles.

> [!WARNING]
> Many of the domains stopped resolving after the FBI disruption on 12 November, so treat them mainly as historical hunts. Arctic Wolf's target counts describe people the actor prepared material against, not confirmed compromises. Ten domains Arctic Wolf rates medium confidence are alert only. Do not block zoom.us, teams.microsoft.com or calendly.com.

## Affected countries and sectors

- **Countries:** Not stated in the sources
- **Regions:** Global
- **Sectors:** Cryptocurrency and Web3, Venture capital, Open-source software maintainers, Executives
- **Note:** The FBI says FaceStealer stole more than $400 million in 18 months and nearly compromised a JavaScript library with tens of millions of weekly downloads. Arctic Wolf found material prepared against 677 individuals in 58 countries, 84% of them founders or C-suite executives; this counts targets, not confirmed compromises.
- **Source:** [FBI FLASH AC-111226-MS – North Korean Hackers Use Secretly Recorded Webcam Library in FaceStealer Crypto Theft Scheme](https://www.ic3.gov/CSA/2026/261112.pdf)

## At a glance

| File | What it is |
|---|---|
| [`block_now.txt`](https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/threats/2026-11_November-2026/2026-11-13/FaceStealer-BlueNoroff-Fake-Meeting-Lures/block_now.txt) (raw) | 120 high-confidence indicators to block now |
| [`iocs.csv`](iocs.csv) | All 134 indicators with description, confidence, action and source |
| [`defender_xdr_indicators.csv`](defender_xdr_indicators.csv) | 130 rows for Defender XDR bulk import |
| [`hunt.kql`](hunt.kql) | Defender XDR advanced hunting query |
| [`hunt.spl`](hunt.spl) | Splunk hunt over the CIM data models |
| [`hunt_raw.spl`](hunt_raw.spl) | Splunk hunt for data not mapped to CIM ([macros](../../../../all/splunk_macros.conf)) |
| [`hunt.yaral`](hunt.yaral) | Google SecOps YARA-L 2.0 detection rule |

Indicators by type: 112 domains, 11 URLs, 4 SHA256, 4 file names, 3 IPv4. See `iocs.csv` for full details and descriptions.

## MITRE ATT&CK

| ID | Technique |
|---|---|
| [T1586](https://attack.mitre.org/techniques/T1586/) | Compromise Accounts |
| [T1583.001](https://attack.mitre.org/techniques/T1583/001/) | Domains |
| [T1566.003](https://attack.mitre.org/techniques/T1566/003/) | Spearphishing via Service |
| [T1204.004](https://attack.mitre.org/techniques/T1204/004/) | Malicious Copy and Paste |
| [T1059.001](https://attack.mitre.org/techniques/T1059/001/) | PowerShell |
| [T1059.002](https://attack.mitre.org/techniques/T1059/002/) | AppleScript |
| [T1059.004](https://attack.mitre.org/techniques/T1059/004/) | Unix Shell |
| [T1125](https://attack.mitre.org/techniques/T1125/) | Video Capture |
| [T1539](https://attack.mitre.org/techniques/T1539/) | Steal Web Session Cookie |
| [T1056.001](https://attack.mitre.org/techniques/T1056/001/) | Keylogging |
| [T1195.001](https://attack.mitre.org/techniques/T1195/001/) | Compromise Software Dependencies and Development Tools |

## Recommended actions

1. Block the listed domains, the three Hostwinds addresses 104.168.149.230, 104.168.149.182 and 104.168.149.21, the payload URLs and the lure hashes, and search 90 days of DNS, proxy and EDR logs for them.
2. Hunt for PowerShell or curl command lines containing [Console]::In.ReadToEnd() with iex, iwr downloads of %TEMP%\update.ps1 run with -ep bypass, osacompile or osascript fed by curl on macOS, and curl -fsSL -k piped to bash on Linux.
3. Alert on DNS for any updatesdk.<domain> host or a calendly.<domain> host outside calendly.com.
4. Brief executives, finance, crypto and open-source maintainer staff: join meetings from the official app with an invite code, keep the webcam off until the inviter is confirmed, never run a fix command during a call, and confirm invites out of band.
5. After any contact, terminate all Telegram and other messaging sessions, rotate browser-stored credentials and developer tokens, and move wallet funds to new seed phrases from a clean device.

## Behaviours to hunt

> Behaviours are leads, not confirmed indicators, and can match legitimate activity. Compare any hit against your own baseline and environment before acting.

1. **Alert** · Pasted curl into PowerShell ReadToEnd and iex cradle\
   Look for: curl.exe or powershell.exe with [Console]::In.ReadToEnd() and iex / Invoke-Expression, typically pasted from a meeting "fix" prompt\
   Why it matters: Arctic Wolf says BlueNoroff changed every visible lure but kept the same fix command: the page asks the target to paste a curl into PowerShell cradle that reads the payload from standard input and runs it. The FBI says FaceStealer victims are walked through exactly this kind of command during a fake Zoom or Teams call.\
   Log source: EDR process events (DeviceProcessEvents), PowerShell 4104, Windows 4688 with command line\
   Source: [Arctic Wolf](https://arcticwolf.com/wp-content/bluenoroff_still_in_the_meeting.pdf https://www.ic3.gov/CSA/2026/261112.pdf)

2. **Alert** · update.ps1 fetched to %TEMP% and run with -ep bypass\
   Look for: iwr -UseBasicParsing downloading $env:TEMP\update.ps1, followed by powershell -ep bypass -f on that file\
   Why it matters: The docview.ink LNK chain fetches update.ps1 into %TEMP%, runs it with execution policy bypass and deletes it.\
   Log source: EDR process events, PowerShell 4104\
   Source: [Arctic Wolf](https://arcticwolf.com/resources/blog/still-in-the-meeting-bluenoroff-six-months-on/ https://arcticwolf.com/wp-content/bluenoroff_still_in_the_meeting.pdf)

3. **Alert** · Lookups for updatesdk.* or calendly.<lookalike> hosts\
   Look for: DNS or web requests to any updatesdk.<domain> host, or a calendly.<domain> host that is not calendly.com\
   Why it matters: Arctic Wolf calls these subdomain patterns fingerprints with no legitimate use: updatesdk hosts serve the fake SDK fix and calendly.<lookalike> hosts serve the verification lures.\
   Log source: DNS, proxy and EDR network logs (DeviceNetworkEvents)\
   Source: [Arctic Wolf](https://arcticwolf.com/resources/blog/still-in-the-meeting-bluenoroff-six-months-on/ https://arcticwolf.com/wp-content/bluenoroff_still_in_the_meeting.pdf)

4. **Alert** · macOS curl into osacompile or Automator from Downloads\
   Look for: macOS osacompile or osascript fed by curl, or a .scpt or Automator document.wflow launched from ~/Downloads\
   Why it matters: The macOS branches of the lures pipe curl into osacompile, run long osascript -e strings, or launch an Automator workflow from a ZIP to fetch the next stage.\
   Log source: Defender for Endpoint on macOS process events, unified log\
   Source: [Arctic Wolf](https://arcticwolf.com/resources/blog/still-in-the-meeting-bluenoroff-six-months-on/ https://arcticwolf.com/wp-content/bluenoroff_still_in_the_meeting.pdf)

5. **Alert** · Linux curl -fsSL -k piped to bash\
   Look for: Linux curl -fsSL -k piped to bash from an interactive shell\
   Why it matters: The Linux branch of the fake update tells the target to run curl -fsSL -k against an updatesdk or chromeupdate host and pipe it to bash.\
   Log source: EDR process events on Linux, auditd execve\
   Source: [Arctic Wolf](https://arcticwolf.com/resources/blog/still-in-the-meeting-bluenoroff-six-months-on/ https://arcticwolf.com/wp-content/bluenoroff_still_in_the_meeting.pdf)

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

- [FBI FLASH AC-111226-MS – North Korean Hackers Use Secretly Recorded Webcam Library in FaceStealer Crypto Theft Scheme](https://www.ic3.gov/CSA/2026/261112.pdf)
- [Arctic Wolf Labs – Still in the Meeting: BlueNoroff Six Months On](https://arcticwolf.com/resources/blog/still-in-the-meeting-bluenoroff-six-months-on/)
- [Arctic Wolf Labs – Still in the Meeting (full report and IOC appendix)](https://arcticwolf.com/wp-content/bluenoroff_still_in_the_meeting.pdf)

---

[Back to index](../../../../README.md#latest-threats)
