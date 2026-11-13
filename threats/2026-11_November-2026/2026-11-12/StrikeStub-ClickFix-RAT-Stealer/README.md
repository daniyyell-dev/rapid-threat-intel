# StrikeStub: ClickFix PowerShell Dropper and Modular RAT/Stealer

[Back to index](../../../../README.md) · [November 2026](../../README.md) · [2026-11-12](../README.md)

| Published | First added | Last updated | Category | Indicators | Block now |
|---|---|---|---|---|---|
| 2026-11-12 | 2026-11-12 15:11 | 2026-11-12 | Malware / RAT and stealer | 6 | 2 |

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

Akamai, writing on 12 November 2026, describes StrikeStub, a modular Windows remote access trojan and stealer likely sold as malware-as-a-service, delivered through a ClickFix lure on the compromised site spiraldirect.ch. A fake 'Verify you are human' prompt copies a hidden PowerShell command that downloads http://squidscript.com/Cloudflare.exe to %TEMP%\svc.exe and runs it. The payload masquerades as RuntimeBroker.exe with spoofed Microsoft version resources, persists as Microsoft\WindowsUpdate.exe through a Registry Run key and the user Startup folder, and talks to a config-driven C2 over WebSockets with the user agent StrikeStub/1.0. Operators can toggle hidden VNC, keylogging, webcam capture, live desktop streaming, clipboard monitoring and DPAPI theft of browser credentials. squidscript.com and the Cloudflare.exe URL are attacker infrastructure and are on the block list; spiraldirect.ch is a compromised legitimate site and is alert only. Akamai did not publish a sample hash or the C2 host, which is read from a runtime config, so hunt on the behaviours and the user agent as well as the staging URL.

> [!WARNING]
> Single-source indicators (Akamai). The C2 host and port are config-driven and were not published. spiraldirect.ch is a compromised legitimate site: alert only, do not block it as attacker infrastructure.

## Affected countries and sectors

- **Countries:** Not stated in the sources
- **Sectors:** Not stated in the sources
- **Note:** Akamai describes a ClickFix campaign delivered from a compromised Swiss site (spiraldirect.ch); no victim count or sector list was published.
- **Source:** [Akamai – Dissecting StrikeStub: ClickFix PowerShell Malware and Modular RAT](https://www.akamai.com/blog/security-research/strikestub-clickfix-powershell-malware-modular-rat)

## At a glance

| File | What it is |
|---|---|
| [`block_now.txt`](https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/threats/2026-11_November-2026/2026-11-12/StrikeStub-ClickFix-RAT-Stealer/block_now.txt) (raw) | 2 high-confidence indicators to block now |
| [`iocs.csv`](iocs.csv) | All 6 indicators with description, confidence, action and source |
| [`defender_xdr_indicators.csv`](defender_xdr_indicators.csv) | 3 rows for Defender XDR bulk import |
| [`hunt.kql`](hunt.kql) | Defender XDR advanced hunting query |
| [`hunt.spl`](hunt.spl) | Splunk hunt over the CIM data models |
| [`hunt_raw.spl`](hunt_raw.spl) | Splunk hunt for data not mapped to CIM ([macros](../../../../all/splunk_macros.conf)) |
| [`hunt.yaral`](hunt.yaral) | Google SecOps YARA-L 2.0 detection rule |

Indicators by type: 2 domains, 2 file names, 1 URL, 1 other. See `iocs.csv` for full details and descriptions.

## MITRE ATT&CK

| ID | Technique |
|---|---|
| [T1204.001](https://attack.mitre.org/techniques/T1204/001/) | Malicious Link |
| [T1059.001](https://attack.mitre.org/techniques/T1059/001/) | PowerShell |
| [T1105](https://attack.mitre.org/techniques/T1105/) | Ingress Tool Transfer |
| [T1036.005](https://attack.mitre.org/techniques/T1036/005/) | Match Legitimate Name or Location |
| [T1547.001](https://attack.mitre.org/techniques/T1547/001/) | Registry Run Keys / Startup Folder |
| [T1071](https://attack.mitre.org/techniques/T1071/) | Application Layer Protocol |
| [T1555.003](https://attack.mitre.org/techniques/T1555/003/) | Credentials from Web Browsers |
| [T1056.001](https://attack.mitre.org/techniques/T1056/001/) | Keylogging |
| [T1021](https://attack.mitre.org/techniques/T1021/) | Remote Services |

## Recommended actions

1. Block squidscript.com and http://squidscript.com/Cloudflare.exe (they are in the Defender XDR import file).
2. Hunt for explorer.exe launching hidden PowerShell that uses iwr or irm to write %TEMP%\svc.exe, for RuntimeBroker.exe running outside System32, and for WindowsUpdate.exe in a user Run key or Startup folder.
3. Search proxy, firewall and TLS-inspection logs for the WebSocket user agent StrikeStub/1.0; the C2 address was not published.
4. Treat spiraldirect.ch as a compromised site: alert on visits and review the host, but do not block the legitimate domain as if it were attacker infrastructure.
5. If confirmed, isolate the host, remove the Run-key and Startup persistence, and rotate browser and other credentials that may have been taken through DPAPI.

## Behaviours to hunt

> Behaviours are leads, not confirmed indicators, and can match legitimate activity. Compare any hit against your own baseline and environment before acting.

1. **Alert** · explorer.exe launching hidden PowerShell to drop svc.exe\
   Look for: explorer.exe launching powershell.exe with -w hidden and Invoke-WebRequest or Invoke-RestMethod (iwr or irm) saving a payload to %TEMP%\svc.exe\
   Why it matters: Akamai saw the compromised site copy a hidden PowerShell one-liner to the clipboard; after the victim pasted it into Win+R, explorer.exe launched PowerShell, which downloaded http://squidscript.com/Cloudflare.exe to %TEMP%\svc.exe and started it.\
   Log source: Defender XDR DeviceProcessEvents\
   Source: [Akamai](https://www.akamai.com/blog/security-research/strikestub-clickfix-powershell-malware-modular-rat)

2. **Alert** · RuntimeBroker.exe running outside System32\
   Look for: RuntimeBroker.exe running from a path outside Windows\System32, Windows\SysWOW64 or WinSxS\
   Why it matters: StrikeStub masquerades as RuntimeBroker.exe with spoofed Microsoft version resources, but it is a MinGW/GCC build. A genuine RuntimeBroker.exe lives under System32.\
   Log source: Defender XDR DeviceProcessEvents\
   Source: [Akamai](https://www.akamai.com/blog/security-research/strikestub-clickfix-powershell-malware-modular-rat)

3. **Alert** · WindowsUpdate.exe Run-key and Startup persistence\
   Look for: WindowsUpdate.exe persisting through a Registry Run key and as Microsoft\WindowsUpdate.exe under the user Startup folder\
   Why it matters: StrikeStub uses dual persistence: a Run key and a Startup-folder drop named Microsoft\WindowsUpdate.exe, separate from the RuntimeBroker disguise of the main payload.\
   Log source: Defender XDR DeviceRegistryEvents and DeviceFileEvents\
   Source: [Akamai](https://www.akamai.com/blog/security-research/strikestub-clickfix-powershell-malware-modular-rat)

4. **Hunt** · WebSocket C2 with user agent StrikeStub/1.0\
   Look for: WebSocket command-and-control traffic using the user agent StrikeStub/1.0\
   Why it matters: Akamai recovered the StrikeStub/1.0 user agent from the RAT's WebSocket enrolment handshake. The C2 host and port are config-driven and were not published.\
   Log source: Proxy, firewall, TLS-inspection and web logs; endpoint network telemetry if user-agent fields are collected\
   Source: [Akamai](https://www.akamai.com/blog/security-research/strikestub-clickfix-powershell-malware-modular-rat)

5. **Hunt** · HVNC, dated keylog files or DPAPI browser theft\
   Look for: Hidden VNC (hvnc_start), keylog files named keylog_YYYY-MM-DD.txt, or DPAPI / profile-cloning access to browser credential stores by a disguised RuntimeBroker.exe or WindowsUpdate.exe\
   Why it matters: Operators can toggle hidden VNC, keylogging, webcam capture, live desktop streaming, clipboard monitoring and DPAPI theft of Chromium credentials, plus a Firefox profile-clone workaround for locked SQLite databases.\
   Log source: Defender XDR DeviceFileEvents and DeviceProcessEvents\
   Source: [Akamai](https://www.akamai.com/blog/security-research/strikestub-clickfix-powershell-malware-modular-rat)

Behaviours that map cleanly to log fields are included in [`hunt.kql`](hunt.kql) and [`hunt.spl`](hunt.spl), and alert behaviours in [`hunt.yaral`](hunt.yaral). The rest are listed in the Behaviours section above with where to look. Use behaviours to hunt and alert, never to block.

## Sources

- [Akamai – Dissecting StrikeStub: ClickFix PowerShell Malware and Modular RAT](https://www.akamai.com/blog/security-research/strikestub-clickfix-powershell-malware-modular-rat)

---

[Back to index](../../../../README.md)
