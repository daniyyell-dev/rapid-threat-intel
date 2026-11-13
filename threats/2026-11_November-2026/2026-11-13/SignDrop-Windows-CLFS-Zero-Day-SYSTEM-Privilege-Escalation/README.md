# SignDrop: Public Windows CLFS Zero-Day for SYSTEM Privilege Escalation (Hunt Only)

[Live entry](https://daniyyell.com/rapid-threat-intel/t/SignDrop-Windows-CLFS-Zero-Day-SYSTEM-Privilege-Escalation/) · [Back to index](../../../../README.md) · [November 2026](../../README.md) · [2026-11-13](../README.md)

| Published | First added | Last updated | Category | Indicators | Block now |
|---|---|---|---|---|---|
| 2026-11-12 | 2026-11-13 19:25 | 2026-11-13 | Exploitation / Windows privilege escalation | 1 | 0 |

## Hunt

Run one of these to find past activity. Each file is the same hunt written for a different platform; pick the one for your SIEM or XDR.

| File | Platform | How to run it |
|---|---|---|
| [`hunt.kql`](hunt.kql) | Microsoft Defender XDR | In the [Defender portal](https://security.microsoft.com), open **Hunting > Advanced hunting**, paste the query and select **Run query**. It covers the last 30 days. |
| [`hunt.spl`](hunt.spl) | Splunk | In **Search & Reporting**, set the time picker to the last 30 days or more, paste the search and run it. It reads the CIM data models. |
| [`hunt_raw.spl`](hunt_raw.spl) | Splunk without CIM | The same hunt over raw events. Define the `rti_*` macros from [`splunk_macros.conf`](../../../../all/splunk_macros.conf) first. |
| [`hunt.yaral`](hunt.yaral) | Google SecOps | In **Detection > Rules & Detections > Rules Editor**, paste the rule, run a Retrohunt over the last 30 days, then turn on live mode. |

Leads that are not network or hash indicators are in [`iocs.csv`](iocs.csv), and behaviours with no clean field mapping are in the Behaviours section below. Guides: [Defender XDR](../../../../docs/defender-xdr.md), [Splunk](../../../../docs/splunk.md), [Google SecOps](../../../../docs/google-secops.md).

## Summary

On 10 November 2026 the researcher behind the Nightmare-Eclipse releases (GitHub MSNightmare) published SignDrop, a working exploit that takes a standard user to SYSTEM on Windows with CLFS authentication active (Mode 0 or 1). It makes Microsoft Defender's signature-update RPC open a crafted CLFS log, so clfs.sys writes the .cnpf signature file as SYSTEM to a path chosen through Object Manager links, overwritten as C:\Program Files\Common Files\microsoft shared\ink\hid.dll and loaded by consent.exe. Cyderes reproduced a SYSTEM shell. There is no CVE or patch, and no in-the-wild use has been reported.

> [!WARNING]
> No attacker infrastructure or hashes exist; the path row is a host artefact for hunting, not something to block. Do not disable CLFS authentication as a workaround: it reopens the older memory-corruption bugs.

## Affected countries and sectors

- **Countries:** Not stated in the sources
- **Regions:** Global
- **Sectors:** Not stated in the sources
- **Note:** No victims or in-the-wild use reported. Windows hosts with CLFS authentication in Mode 0 or 1 are in scope; the researcher estimates about 80% of Windows installs.
- **Source:** [Cyderes Howler Cell – SignDrop: Windows zero-day that turns Microsoft's own CLFS mitigation into a privilege escalation path](https://www.cyderes.com/howler-cell/signdrop-zero-day)

## At a glance

| File | What it is |
|---|---|
| [`block_now.txt`](https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/threats/2026-11_November-2026/2026-11-13/SignDrop-Windows-CLFS-Zero-Day-SYSTEM-Privilege-Escalation/block_now.txt) (raw) | None yet: no indicator is high-confidence enough to block, so use the files below to hunt |
| [`iocs.csv`](iocs.csv) | All 1 indicators with description, confidence, action and source |
| [`hunt.kql`](hunt.kql) | Defender XDR advanced hunting query |
| [`hunt.spl`](hunt.spl) | Splunk hunt over the CIM data models |
| [`hunt_raw.spl`](hunt_raw.spl) | Splunk hunt for data not mapped to CIM ([macros](../../../../all/splunk_macros.conf)) |
| [`hunt.yaral`](hunt.yaral) | Google SecOps YARA-L 2.0 detection rule |

Indicators by type: 1 other. See `iocs.csv` for full details and descriptions.

## MITRE ATT&CK

| ID | Technique |
|---|---|
| [T1068](https://attack.mitre.org/techniques/T1068/) | Exploitation for Privilege Escalation |
| [T1574.001](https://attack.mitre.org/techniques/T1574/001/) | DLL Search Order Hijacking |
| [T1070.004](https://attack.mitre.org/techniques/T1070/004/) | File Deletion |
| [T1106](https://attack.mitre.org/techniques/T1106/) | Native API |

## Recommended actions

1. Record HKLM\SYSTEM\CurrentControlSet\Services\CLFS\Authentication Mode on every host; Mode 0 or 1 is in scope.
2. Alert on hid.dll created in or loaded from the ink folder and on consent.exe starting a console or shell.
3. Tighten application and script control, since the exploit needs code running as a local user first.
4. Apply Microsoft's fix when released; do not turn off CLFS authentication.

## Behaviours to hunt

> Behaviours are leads, not confirmed indicators, and can match legitimate activity. Compare any hit against your own baseline and environment before acting.

1. **Alert** · hid.dll written to or loaded from the ink folder\
   Look for: hid.dll written to, or loaded from, C:\Program Files\Common Files\microsoft shared\ink\ (the DLL SignDrop plants through the SYSTEM .cnpf write)\
   Why it matters: SignDrop redirects the CLFS .cnpf signature file, created as SYSTEM, to the ink folder as hid.dll, overwrites it with its payload and has consent.exe load it, then deletes it with a transacted delete. Windows does not ship hid.dll in the ink folder (the real one is in System32), so Cyderes rates any appearance there as alert-worthy whatever the variant. Tuning: matched on the exact file name and folder only. Expected false positives: none known; keep file and image-load telemetry for the ink folder because the file is removed after use.\
   Log source: Defender XDR DeviceFileEvents and DeviceImageLoadEvents; Sysmon events 11 and 7 in Splunk or Google SecOps\
   Source: [Cyderes Howler Cell](https://www.cyderes.com/howler-cell/signdrop-zero-day)

2. **Alert** · consent.exe starting a console or shell\
   Look for: consent.exe (the UAC consent UI) starting conhost.exe, cmd.exe, PowerShell or rundll32.exe\
   Why it matters: Cyderes found consent.exe, started as SYSTEM by the exploit's runas request, loads the planted hid.dll, whose payload opens a SYSTEM console on the user's desktop and kills the UAC prompt. consent.exe only draws the elevation prompt and does not start shells or consoles, so a child like this means code is running inside it. Tuning: parent and child names only, no command-line matching. Expected false positives: none known; confirm with the hid.dll hunt on the same device.\
   Log source: Defender XDR DeviceProcessEvents; Sysmon event 1 or Windows 4688 in Splunk or Google SecOps\
   Source: [Cyderes Howler Cell](https://www.cyderes.com/howler-cell/signdrop-zero-day)

3. **Alert** · Unmodified SignDrop proof-of-concept working folder\
   Look for: Files created under a %TEMP%\SigDrop_ working folder (the unmodified public proof of concept)\
   Why it matters: The public exploit stages its CLFS container, .cnpf file and bait MpEngine.dll in %TEMP%\SigDrop_ and deletes the folder when it finishes. This only catches the unchanged release; a recompiled copy can rename the folder, so rely on the hid.dll and consent.exe hunts for variants. Expected false positives: your own authorised testing of the proof of concept.\
   Log source: Defender XDR DeviceFileEvents; Sysmon event 11 in Splunk or Google SecOps\
   Source: [Cyderes Howler Cell](https://www.cyderes.com/howler-cell/signdrop-zero-day)

Behaviours that map cleanly to log fields are included in [`hunt.kql`](hunt.kql) and [`hunt.spl`](hunt.spl), and alert behaviours in [`hunt.yaral`](hunt.yaral). The rest are listed in the Behaviours section above with where to look. Use behaviours to hunt and alert, never to block.

## Sources

- [Cyderes Howler Cell – SignDrop: Windows zero-day that turns Microsoft's own CLFS mitigation into a privilege escalation path](https://www.cyderes.com/howler-cell/signdrop-zero-day)
- [MSNightmare – SignDrop Windows CLFS authentication zero-day proof of concept](https://github.com/msnightmare/signdrop)
- [SecurityWeek – Nightmare Eclipse drops Windows zero-day exploit SignDrop](https://www.securityweek.com/nightmare-eclipse-drops-windows-zero-day-exploit-signdrop/)
- [BleepingComputer – New Windows SignDrop zero-day gives hackers SYSTEM privileges](https://www.bleepingcomputer.com/news/security/new-windows-signdrop-zero-day-gives-hackers-system-privileges/)

---

[Back to index](../../../../README.md)
