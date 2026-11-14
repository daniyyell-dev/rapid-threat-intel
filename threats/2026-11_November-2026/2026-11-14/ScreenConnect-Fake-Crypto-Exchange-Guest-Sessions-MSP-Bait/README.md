# Fake Crypto-Exchange Guest Sessions Planted on 100+ MSP ScreenConnect Servers

[Live entry](https://iocwatch.com/t/ScreenConnect-Fake-Crypto-Exchange-Guest-Sessions-MSP-Bait/) · [Back to index](../../../../README.md) · [November 2026](../../README.md) · [2026-11-14](../README.md)

| Published | First added | Last updated | Category | Indicators | Block now |
|---|---|---|---|---|---|
| 2026-11-13 | 2026-11-14 01:25 | 2026-11-14 | Supply chain / MSP remote access | 3 | 1 |

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

Huntress reported on 13 November 2026 that someone had enrolled about 2,400 unauthorized guest sessions on at least 118 self-hosted ConnectWise ScreenConnect servers belonging to 109 MSPs and other organisations between 3 and 13 November. The sessions come from a scripted emulator that impersonates a Windows ScreenConnect client and uses relay addresses taken from publicly downloadable Access installers. They carry crypto-exchange names such as KUCOIN-SRV, LAPTOP-BINANCE and BACKUP-PROBIT, show fake trading-desktop thumbnails, claim guest version 25.3.4.9288, send no guest public key and are kept online by an operator who revisits the servers every 151 seconds. About 97.8% of connections came from one IONOS VPS, 74.208.158.106. Huntress has not seen the sessions push files or run commands, but assesses they are likely bait: a technician who opens one with an unpatched client could be hit by CVE-2026-84869, the Guest-to-Host file transfer and execute flaw already used in a separate ScreenConnect campaign, and in one case a technician typed text into a fake session. 74.208.158.106 is on the block list; the Egyptian residential address that created the first sessions and a related IONOS host are alert only.

> [!WARNING]
> Huntress has seen no malicious activity from these sessions so far; the CVE-2026-84869 bait theory is its leading hypothesis, not a confirmed attack. 197.47.160.252 is a residential address and 87.106.111.220 sent no guest sessions, so alert on both and do not block them. The bait thumbnail hashes are server-side preview images, not files on endpoints, and are not included.

## Affected countries and sectors

- **Countries:** Not stated in the sources
- **Regions:** Worldwide
- **Sectors:** Managed service providers, IT services
- **Note:** Huntress found the fake sessions on 118 self-hosted ScreenConnect servers belonging to 109 MSP and organisation accounts; no countries are named.
- **Source:** [Huntress – Crypto exchange names disguise unauthorized sessions on 100+ ScreenConnect servers](https://www.huntress.com/blog/fake-crypto-exchange-sessions-screenconnect)

## At a glance

| File | What it is |
|---|---|
| [`block_now.txt`](https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/threats/2026-11_November-2026/2026-11-14/ScreenConnect-Fake-Crypto-Exchange-Guest-Sessions-MSP-Bait/block_now.txt) (raw) | 1 high-confidence indicators to block now |
| [`iocs.csv`](iocs.csv) | All 3 indicators with description, confidence, action and source |
| [`defender_xdr_indicators.csv`](defender_xdr_indicators.csv) | 3 rows for Defender XDR bulk import |
| [`hunt.kql`](hunt.kql) | Defender XDR advanced hunting query |
| [`hunt.spl`](hunt.spl) | Splunk hunt over the CIM data models |
| [`hunt_raw.spl`](hunt_raw.spl) | Splunk hunt for data not mapped to CIM ([macros](../../../../all/splunk_macros.conf)) |
| [`hunt.yaral`](hunt.yaral) | Google SecOps YARA-L 2.0 detection rule |

Indicators by type: 3 IPv4. See `iocs.csv` for full details and descriptions.

## MITRE ATT&CK

| ID | Technique |
|---|---|
| [T1133](https://attack.mitre.org/techniques/T1133/) | External Remote Services |
| [T1219](https://attack.mitre.org/techniques/T1219/) | Remote Access Software |
| [T1204](https://attack.mitre.org/techniques/T1204/) | User Execution |
| [T1203](https://attack.mitre.org/techniques/T1203/) | Exploitation for Client Execution |
| [T1056.001](https://attack.mitre.org/techniques/T1056/001/) | Input Capture: Keylogging |

## Recommended actions

1. Block 74.208.158.106 at the edge in front of self-hosted ScreenConnect servers and search 90 days of firewall and ScreenConnect server logs for it, 197.47.160.252 and 87.106.111.220.
2. Upgrade every technician Host client and Access agent to ScreenConnect 26.6.5 or later (CVE-2026-84869); until then follow ConnectWise's advice to remove TransferFiles permission from roles and session groups.
3. Search the ScreenConnect session list for guests with crypto-exchange and role names, empty company or site fields, guest version 25.3.4.9288 or no guest public key; copy App_Data\Session.db and its WAL file before deleting them.
4. Check session history for any technician who joined a fake session; if text was sent, treat it as possible credential exposure, and if the client was unpatched, inspect that workstation's ScreenConnect Temp and Startup folders and process history.
5. Keep Access installer links private, rebuild any installer that was public, restrict installer and web access where supported, and tell technicians not to join sessions they cannot tie to a customer.

## Behaviours to hunt

> Behaviours are leads, not confirmed indicators, and can match legitimate activity. Compare any hit against your own baseline and environment before acting.

1. **Alert** · ScreenConnect technician client running a file from its Temp folder\
   Look for: ScreenConnect.WindowsClient.exe on a technician workstation starting cmd.exe, powershell.exe, wscript.exe or msiexec.exe with a file under Documents\<folder>\Temp\\
   Why it matters: Huntress gives this as the host-side shape of CVE-2026-84869 exploitation, where a malicious guest makes an unpatched technician client accept and run a transferred file; the fake crypto-exchange sessions are likely bait for exactly that. Tuning: parent must be ScreenConnect.WindowsClient.exe, the child must be a shell, script host or installer, and the command line must point into a Documents\<folder>\Temp\ path, the client's transfer folder. Expected false positives: a technician deliberately opening a file pulled back from a customer machine; confirm with the session history before escalating.\
   Log source: Defender XDR DeviceProcessEvents; EDR process events in Splunk or Google SecOps\
   Source: [Huntress](https://www.huntress.com/blog/fake-crypto-exchange-sessions-screenconnect)

2. **Hunt** · Crypto-exchange-named guest sessions with no guest key\
   Look for: New ScreenConnect Access guest sessions with crypto-exchange and role names (e.g. KUCOIN-SRV, LAPTOP-BINANCE, BACKUP-PROBIT), empty company or site fields, guest version 25.3.4.9288, ClientType 1 and no guest public key, often many from one external IP in a short window\
   Why it matters: Huntress found this combination on every fake guest: the emulator claims version 25.3.4.9288, sends no guest key and uses exchange-plus-role names, and almost all enrolments came from 74.208.158.106. Tuning: the version alone is not unique, so require the empty public key or the crypto-exchange name pattern as well. These records are not in Defender XDR tables, so no XDR query is given.\
   Log source: ScreenConnect server database (App_Data\Session.db) and server connection logs\
   Source: [Huntress](https://www.huntress.com/blog/fake-crypto-exchange-sessions-screenconnect)

Behaviours that map cleanly to log fields are included in [`hunt.kql`](hunt.kql) and [`hunt.spl`](hunt.spl), and alert behaviours in [`hunt.yaral`](hunt.yaral). The rest are listed in the Behaviours section above with where to look. Use behaviours to hunt and alert, never to block.

## Sources

- [Huntress – Crypto exchange names disguise unauthorized sessions on 100+ ScreenConnect servers](https://www.huntress.com/blog/fake-crypto-exchange-sessions-screenconnect)
- [URLhaus – 74.208.158.106 (prior unrelated Mirai download listing, Nov 2025)](https://urlhaus.abuse.ch/host/74.208.158.106/)

---

[Back to index](../../../../README.md)
