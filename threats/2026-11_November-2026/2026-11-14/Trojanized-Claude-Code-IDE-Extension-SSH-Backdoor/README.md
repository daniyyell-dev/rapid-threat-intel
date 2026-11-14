# Trojanized Claude Code IDE Extension Plants Persistent Reverse SSH Backdoor on Developer Machines

[Live entry](https://iocwatch.com/t/Trojanized-Claude-Code-IDE-Extension-SSH-Backdoor/) · [Back to index](../../../../README.md) · [November 2026](../../README.md) · [2026-11-14](../README.md)

| Published | First added | Last updated | Category | Indicators | Block now |
|---|---|---|---|---|---|
| 2026-10-30 | 2026-11-14 10:17 | 2026-11-14 | Supply chain / developer tools | 8 | 6 |

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

On 29 October 2026 an attacker used a credential stolen in a vendor-side key exposure to place tampered copies of the anthropic.claude-code extension (versions 2.1.312 and 2.1.313, macOS arm64 and Windows x64) on the cache that serves the Cursor editor's extension marketplace. The builds were live for about 11 hours (09:27-20:35 UTC) and up to 5,000 users may have received them; Anthropic did not publish them and the VS Code Marketplace, npm and Open VSX copies were clean. A loader prepended to extension.js runs when the editor starts, collects the hostname, user, OS, git email, public IP and the names of secret-looking environment variables, adds an attacker SSH key marked svc-telemetry to authorized_keys, tries to enable SSH, opens a persistent reverse SSH tunnel to 134.209.82.225 as user tunnel, installs persistence (SysMon scheduled task or Startup sysmon.cmd on Windows, com.apple.sysmond LaunchAgent on macOS, @reboot cron on Linux) and posts host details to port 8099. The six file hashes are on the block list; the C2 address is alert and hunt.

> [!WARNING]
> 134.209.82.225 is DigitalOcean cloud hosting and was reported taken down, so it is alert and hunt rather than block; use it to find past victims in 30-90 days of network logs. Removing or updating the extension does not remove the SSH key, scripts or startup entries. ifconfig.me and api.ipify.org lookups are legitimate services the loader also calls and are not indicators on their own.

## Affected countries and sectors

- **Countries:** Not stated in the sources
- **Regions:** Worldwide
- **Sectors:** Software development
- **Note:** Developers who installed the tampered extension builds from the editor marketplace on 29 October 2026; no countries or sectors are named.
- **Source:** [Cursor – Security notice: malicious Anthropic.claude-code 2.1.312 and 2.1.313 in the extension marketplace](https://cursor.com/blog/claude-code-extension-security-notice)

## At a glance

| File | What it is |
|---|---|
| [`block_now.txt`](https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/threats/2026-11_November-2026/2026-11-14/Trojanized-Claude-Code-IDE-Extension-SSH-Backdoor/block_now.txt) (raw) | 6 high-confidence indicators to block now |
| [`iocs.csv`](iocs.csv) | All 8 indicators with description, confidence, action and source |
| [`defender_xdr_indicators.csv`](defender_xdr_indicators.csv) | 8 rows for Defender XDR bulk import |
| [`hunt.kql`](hunt.kql) | Defender XDR advanced hunting query |
| [`hunt.spl`](hunt.spl) | Splunk hunt over the CIM data models |
| [`hunt_raw.spl`](hunt_raw.spl) | Splunk hunt for data not mapped to CIM ([macros](../../../../all/splunk_macros.conf)) |
| [`hunt.yaral`](hunt.yaral) | Google SecOps YARA-L 2.0 detection rule |

Indicators by type: 6 SHA256, 1 IPv4, 1 URL. See `iocs.csv` for full details and descriptions.

## MITRE ATT&CK

| ID | Technique |
|---|---|
| [T1195.002](https://attack.mitre.org/techniques/T1195/002/) | Supply Chain Compromise: Compromise Software Supply Chain |
| [T1098.004](https://attack.mitre.org/techniques/T1098/004/) | Account Manipulation: SSH Authorized Keys |
| [T1572](https://attack.mitre.org/techniques/T1572/) | Protocol Tunneling |
| [T1021.004](https://attack.mitre.org/techniques/T1021/004/) | Remote Services: SSH |
| [T1053.005](https://attack.mitre.org/techniques/T1053/005/) | Scheduled Task/Job: Scheduled Task |
| [T1547.001](https://attack.mitre.org/techniques/T1547/001/) | Boot or Logon Autostart: Startup Folder |
| [T1543.001](https://attack.mitre.org/techniques/T1543/001/) | Create or Modify System Process: Launch Agent |
| [T1053.003](https://attack.mitre.org/techniques/T1053/003/) | Scheduled Task/Job: Cron |
| [T1082](https://attack.mitre.org/techniques/T1082/) | System Information Discovery |
| [T1071.001](https://attack.mitre.org/techniques/T1071/001/) | Application Layer Protocol: Web Protocols |

## Recommended actions

1. Find every machine that installed or auto-updated anthropic.claude-code 2.1.312 or 2.1.313 from the Cursor marketplace between 09:27 and 20:35 UTC on 29 October 2026, and search 90 days of firewall, proxy and EDR network logs for 134.209.82.225 (TCP 22 and 8099).
2. On those machines check ~/.ssh/authorized_keys (Windows: %USERPROFILE%\.ssh\authorized_keys and C:\ProgramData\ssh\administrators_authorized_keys) for a key with the comment svc-telemetry and fingerprint SHA256:0Z6R+DF64Do2nwQic8a7kkfDLNNk4IiK+2U2Rci4htk, and remove only that entry after collecting evidence.
3. Remove the persistence: ~/.config/.smt, ~/.config/.smtk and ~/Library/LaunchAgents/com.apple.sysmond.plist on macOS, the @reboot crontab line on Linux, and the SysMon scheduled task, Startup\sysmon.cmd, %USERPROFILE%\.config\smt.cmd and smtk on Windows; kill ssh or autossh processes running -N -R *:0:localhost:22 and delete $TMPDIR/.stk_* files.
4. Rotate every credential reachable from an affected machine (git, SSH, cloud, API keys and tokens held in environment variables) from a clean device, and review SSH logons to the machine since 29 October.
5. Restrict editor extensions to approved publishers and set an installation cooldown for newly published versions.

## Behaviours to hunt

> Behaviours are leads, not confirmed indicators, and can match legitimate activity. Compare any hit against your own baseline and environment before acting.

1. **Alert** · ssh reverse tunnel to local port 22\
   Look for: ssh or autossh opening a reverse forward from a server-assigned remote port to the local SSH port (-R *:0:localhost:22)\
   Why it matters: Microsoft and Netskope show the loader launching ssh (autossh -M 0 on macOS and Linux, a hidden PowerShell retry loop on Windows) with -N -R '*:0:localhost:22', host-key checks disabled and a key file from $TMPDIR/.stk_* or ~/.config/.smtk, so the attacker can reach the workstation's own SSH service through their server. Asking the remote server to allocate any port (0) and forward it back to local port 22 is not how developers or remote-support tools normally use SSH. Expected false positives are rare admin-built reverse tunnels for remote access, which usually use a fixed remote port; review the destination and parent process.\
   Log source: Defender XDR DeviceProcessEvents (Windows and macOS); EDR process events; Linux auditd\
   Source: [Microsoft](https://www.microsoft.com/en-us/security/blog/2026/10/30/inside-malicious-claude-code-branded-cursor-extension-persistent-ssh-backdoor/)

2. **Alert** · SysMon, sysmond or .smt persistence files\
   Look for: Loader persistence files .smt, .smtk, smt.cmd, smtk, $TMPDIR/.stk_*, com.apple.sysmond.plist or Startup\sysmon.cmd, or a SysMon scheduled task that runs smt\
   Why it matters: Microsoft and Netskope list these exact names: ~/.config/.smt and .smtk (macOS, Linux), %USERPROFILE%\.config\smt.cmd and smtk plus a SysMon scheduled task or a Startup-folder sysmon.cmd (Windows), ~/Library/LaunchAgents/com.apple.sysmond.plist (macOS) and a temporary .stk_ followed by ten hex characters key file. The names imitate monitoring tools but none belongs to Sysinternals Sysmon (which installs as a service, not a Startup batch file or a user LaunchAgent) or to Apple. Matching sysmon.cmd only in the Startup folder and the task only when it references smt keeps false positives close to none.\
   Log source: Defender XDR DeviceFileEvents and DeviceEvents (ScheduledTaskCreated); EDR file events\
   Source: [Netskope Threat Labs](https://threatlabs.netskope.com/blog/2026/10/trojanized-claude-code-extension)

3. **Hunt** · Editor process writing authorized_keys\
   Look for: authorized_keys or administrators_authorized_keys written by the code editor or its Node.js extension host\
   Why it matters: The loader runs inside the editor's extension host and appends an Ed25519 key with the comment svc-telemetry to the user's authorized_keys (and administrators_authorized_keys on Windows where present), per Microsoft. Editors do not normally write SSH authorisation files on the local machine; remote-development extensions do this on the remote host, not the workstation. Expected false positives are developers deliberately editing authorized_keys in the editor, so confirm the svc-telemetry comment or fingerprint SHA256:0Z6R+DF64Do2nwQic8a7kkfDLNNk4IiK+2U2Rci4htk.\
   Log source: Defender XDR DeviceFileEvents; file integrity monitoring on SSH key files\
   Source: [Microsoft](https://www.microsoft.com/en-us/security/blog/2026/10/30/inside-malicious-claude-code-branded-cursor-extension-persistent-ssh-backdoor/)

Behaviours that map cleanly to log fields are included in [`hunt.kql`](hunt.kql) and [`hunt.spl`](hunt.spl), and alert behaviours in [`hunt.yaral`](hunt.yaral). The rest are listed in the Behaviours section above with where to look. Use behaviours to hunt and alert, never to block.

## Sources

- [Cursor – Security notice: malicious Anthropic.claude-code 2.1.312 and 2.1.313 in the extension marketplace](https://cursor.com/blog/claude-code-extension-security-notice)
- [Cursor – An update on our recent security incident (13 November 2026)](https://cursor.com/blog/security-incident-update)
- [Microsoft Threat Intelligence – Inside a malicious Claude Code-branded extension and its persistent SSH backdoor](https://www.microsoft.com/en-us/security/blog/2026/10/30/inside-malicious-claude-code-branded-cursor-extension-persistent-ssh-backdoor/)
- [Netskope Threat Labs – Trojanized Claude Code extension](https://threatlabs.netskope.com/blog/2026/10/trojanized-claude-code-extension)
- [ThreatFox – 134.209.82.225:8099/beacon (IOC 2004556)](https://threatfox.abuse.ch/ioc/2004556/)
- [MalwareBazaar – extension.js loader sample](https://bazaar.abuse.ch/sample/ecb58cb29078d9646ad1dcdbe51526f2d9cfea06be5fb2ab183e8ecc3ab6bf15/)

---

[Back to index](../../../../README.md)
