# Silent Lynx Strix AI-Agent Espionage Against Tajikistan

[Back to index](../../../../README.md) · [November 2026](../../README.md) · [2026-11-12](../README.md)

| Published | First added | Last updated | Category | Indicators | Block now |
|---|---|---|---|---|---|
| 2026-11-11 | 2026-11-12 11:30 | 2026-11-12 | Espionage / APT | 22 | 13 |

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

CloudSEK found an exposed server belonging to Silent Lynx (UAT-6275 at Cisco Talos, TAG-193 at Recorded Future), a Kazakhstan-nexus espionage group. The operator had domain-level access to Tajikistan's national railway from mid-August to at least 10 October 2026, dumped NTDS credentials, and used one railway employee's account on the government SSO portal to pull more than 2,000 documents from the national electronic document (EDO) platform, including defence correspondence. The group also broke into Uzbekistan's Smart Forestry GeoServer through malicious WAR files and a PostgreSQL COPY FROM PROGRAM reverse shell, and built Turkmenistan-themed lures in October. Much of the reconnaissance, collection and cleanup was run by a self-hosted Hermes agent branded Strix, which used DeepSeek and Gemini models through OpenRouter and took tasks over Telegram. The operator server 89.125.213.123, its two stage URLs, foreverpeace.ru and the nine implant and lure hashes are on the block list. 134.17.14.24 is alert-only because its ownership is unconfirmed. OpenRouter, DeepSeek, Gemini and Telegram are legitimate services: hunt for them on servers, never block them.

> [!WARNING]
> All indicators come from CloudSEK's analysis of one exposed server; Threadlinqs repeats some of them. 134.17.14.24 is alert-only because CloudSEK could not confirm who owns it. The AI agent ran on the operator's server, so OpenRouter, DeepSeek, Gemini and Telegram traffic is only a hunting lead on your own servers and must not be blocked. The file names are lookalikes of Windows services and need the hashes or the path to confirm.

## Affected countries and sectors

- **Countries:** Tajikistan (TJ), Uzbekistan (UZ), Turkmenistan (TM), Kyrgyzstan (KG)
- **Regions:** Central Asia
- **Sectors:** Government, Defence, Rail transport, Telecommunications
- **Note:** Confirmed victims are Tajikistan's national railway and national electronic document (EDO) platform and Uzbekistan's Smart Forestry GeoServer. Turkmenistan lures were built and tested but not yet deployed, and an implant was built for a target in Kyrgyzstan.
- **Source:** [CloudSEK – Off the Rails: inside an exposed Silent Lynx server](https://www.cloudsek.com/blog/off-the-rails-inside-an-exposed-silent-lynx-server)

## At a glance

| File | What it is |
|---|---|
| [`block_now.txt`](https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/threats/2026-11_November-2026/2026-11-12/Silent-Lynx-Strix-AI-Agent-Espionage-Tajikistan/block_now.txt) (raw) | 13 high-confidence indicators to block now |
| [`iocs.csv`](iocs.csv) | All 22 indicators with description, confidence, action and source |
| [`defender_xdr_indicators.csv`](defender_xdr_indicators.csv) | 14 rows for Defender XDR bulk import |
| [`hunt.kql`](hunt.kql) | Defender XDR advanced hunting query |
| [`hunt.spl`](hunt.spl) | Splunk hunt over the CIM data models |
| [`hunt_raw.spl`](hunt_raw.spl) | Splunk hunt for data not mapped to CIM ([macros](../../../../all/splunk_macros.conf)) |
| [`hunt.yaral`](hunt.yaral) | Google SecOps YARA-L 2.0 detection rule |

Indicators by type: 9 SHA256, 7 file names, 2 IPv4, 2 URLs, 1 domain, 1 other. See `iocs.csv` for full details and descriptions.

## MITRE ATT&CK

| ID | Technique |
|---|---|
| [T1566.001](https://attack.mitre.org/techniques/T1566/001/) | Spearphishing Attachment |
| [T1204.002](https://attack.mitre.org/techniques/T1204/002/) | Malicious File |
| [T1059.001](https://attack.mitre.org/techniques/T1059/001/) | PowerShell |
| [T1562.001](https://attack.mitre.org/techniques/T1562/001/) | Disable or Modify Tools |
| [T1543.003](https://attack.mitre.org/techniques/T1543/003/) | Windows Service |
| [T1036.004](https://attack.mitre.org/techniques/T1036/004/) | Masquerade Task or Service |
| [T1190](https://attack.mitre.org/techniques/T1190/) | Exploit Public-Facing Application |
| [T1505.003](https://attack.mitre.org/techniques/T1505/003/) | Web Shell |
| [T1053.003](https://attack.mitre.org/techniques/T1053/003/) | Cron |
| [T1078](https://attack.mitre.org/techniques/T1078/) | Valid Accounts |
| [T1003.003](https://attack.mitre.org/techniques/T1003/003/) | NTDS |
| [T1046](https://attack.mitre.org/techniques/T1046/) | Network Service Discovery |
| [T1557.001](https://attack.mitre.org/techniques/T1557/001/) | LLMNR/NBT-NS Poisoning and SMB Relay |
| [T1572](https://attack.mitre.org/techniques/T1572/) | Protocol Tunneling |
| [T1039](https://attack.mitre.org/techniques/T1039/) | Data from Network Shared Drive |
| [T1119](https://attack.mitre.org/techniques/T1119/) | Automated Collection |
| [T1030](https://attack.mitre.org/techniques/T1030/) | Data Transfer Size Limits |
| [T1102](https://attack.mitre.org/techniques/T1102/) | Web Service |
| [T1070.003](https://attack.mitre.org/techniques/T1070/003/) | Clear Command History |

## Recommended actions

1. Block 89.125.213.123, the two 89.125.213.123:8080 stage URLs and foreverpeace.ru, and BlockAndRemediate the nine SHA-256 hashes; alert on 134.17.14.24. Search 90 days of proxy, firewall and EDR logs for all of them, and for any outbound connection to TCP 46125.
2. Hunt Windows endpoints for shortcuts with a PDF icon that start hidden PowerShell, for amsiInitFailed in PowerShell command lines, and for services or binaries named srvdriv, ssdpdrv, netsrvc, ssdspsrv or CoreMessaging.exe.
3. On GeoServer, Tomcat and PostgreSQL hosts, look for new WAR deployments, a webshell under /health/, java or postgres spawning a shell, COPY ... FROM PROGRAM in database logs, and cron entries that call external addresses.
4. Review government SSO and document-management logs for one ordinary account pulling large numbers of documents outside its role in parallel, resuming after errors, and in fixed-size chunks; then reset that account and fix per-document authorisation.
5. If the network was reached, hunt for fscan, NetExec, Responder, Inveigh, Ligolo and GOST, rotate domain credentials including krbtgt twice after an NTDS dump, and change default passwords on network equipment.

## Behaviours to hunt

> Behaviours are leads, not confirmed indicators, and can match legitimate activity. Compare any hit against your own baseline and environment before acting.

1. **Alert** · LNK lure starting hidden PowerShell or a shell to port 46125\
   Look for: A shortcut with a PDF icon that starts hidden PowerShell to fetch P.ps1 and a decoy PDF from a remote server, then a raw TCP shell to port 46125 (one variant sets amsiInitFailed first)\
   Why it matters: This is Silent Lynx's delivery chain: a .lnk in a ZIP, password-protected ZIP or ISO opens a decoy, then hidden PowerShell runs P.ps1 in memory and opens a shell to the operator. Port 46125 is the operator's listener; amsiInitFailed is the AMSI bypass in one variant.\
   Log source: EDR process and network events on Windows endpoints\
   Source: [CloudSEK](https://www.cloudsek.com/blog/off-the-rails-inside-an-exposed-silent-lynx-server)

2. **Alert** · Silent Lynx lookalike service binaries\
   Look for: Services or binaries named srvdriv, ssdpdrv, netsrvc, ssdspsrv or CoreMessaging.exe\
   Why it matters: Silent Lynx's wrappers install the Laplas and Chvost shells as Windows services with names that look like drivers or the SSDP service. CoreMessaging is a real Windows DLL, so an executable with that name is unusual.\
   Log source: EDR process, file and registry events; Windows System event 7045 (service installed)\
   Source: [CloudSEK](https://www.cloudsek.com/blog/off-the-rails-inside-an-exposed-silent-lynx-server)

3. **Alert** · WAR deployed to GeoServer or Tomcat, or Java spawning a shell\
   Look for: New WAR files deployed to GeoServer or Tomcat, a webshell under /health/, or the Java process spawning a shell\
   Why it matters: Silent Lynx got into Uzbekistan's Smart Forestry GeoServer by deploying malicious WAR files (one carried a Metasploit payload servlet) and drove a webshell on the /health/ path through a curl wrapper.\
   Log source: EDR file and process events on Linux application servers; GeoServer and Tomcat access logs\
   Source: [CloudSEK](https://www.cloudsek.com/blog/off-the-rails-inside-an-exposed-silent-lynx-server)

4. **Alert** · PostgreSQL COPY FROM PROGRAM or postgres spawning a shell\
   Look for: PostgreSQL running COPY ... FROM PROGRAM, or the postgres process spawning a shell or network tool\
   Why it matters: On the Smart Forestry host the operator logged in to PostgreSQL as a superuser and used COPY ... FROM PROGRAM to open a reverse shell as the postgres user.\
   Log source: PostgreSQL server logs (log_statement); EDR process events on database hosts\
   Source: [CloudSEK](https://www.cloudsek.com/blog/off-the-rails-inside-an-exposed-silent-lynx-server)

5. **Alert** · Cron callback to an external address\
   Look for: Cron jobs on Linux servers that open shells or call back to external addresses\
   Why it matters: Cron entries on the compromised GeoServer host called back to the operator's server and to 134.17.14.24.\
   Log source: EDR process events on Linux servers; crontab file changes\
   Source: [CloudSEK](https://www.cloudsek.com/blog/off-the-rails-inside-an-exposed-silent-lynx-server)

6. **Alert** · fscan, NetExec, Responder, Inveigh, Ligolo or GOST\
   Look for: Bursts of internal reconnaissance from a new shell: whoami, hostname and ipconfig in quick succession, then fscan, NetExec, Responder, Inveigh, Ligolo or GOST\
   Why it matters: The operator's dispatcher ran whoami, hostname and ipconfig on every new shell automatically, and the agent drove scans with fscan and NetExec, poisoning with Responder and Inveigh, and tunnels through Ligolo and GOST.\
   Log source: EDR process events on Windows and Linux hosts\
   Source: [CloudSEK](https://www.cloudsek.com/blog/off-the-rails-inside-an-exposed-silent-lynx-server)

7. **Hunt** · Server calling OpenRouter, DeepSeek or Gemini APIs\
   Look for: Servers or service accounts calling OpenRouter, DeepSeek or Gemini APIs\
   Why it matters: The Strix agent sent its model calls through OpenRouter to DeepSeek V4.1 Flash and Gemini 2.5 Flash. These are legitimate services, so never block them; a server or service account with no business reason to call them is a lead.\
   Log source: Proxy, DNS and EDR network events on servers\
   Source: [CloudSEK](https://www.cloudsek.com/blog/off-the-rails-inside-an-exposed-silent-lynx-server)

8. **Hunt** · Server calling the Telegram Bot API, or .hermes on disk\
   Look for: Servers calling the Telegram Bot API, or a .hermes directory on a host\
   Why it matters: The operator tasked the agent through a Telegram bot, and the document collectors posted progress to a Telegram chat. The agent framework lived under .hermes/. Telegram is legitimate, so hunt for non-Telegram processes on servers calling api.telegram.org; do not block it.\
   Log source: Proxy, DNS and EDR network and file events\
   Source: [CloudSEK](https://www.cloudsek.com/blog/off-the-rails-inside-an-exposed-silent-lynx-server)

9. **Hunt** · Bulk document pulls by one SSO account\
   Look for: One ordinary SSO account pulling large numbers of documents from a document-management system, in parallel and in fixed-size chunks\
   Why it matters: The operator used one railway employee's standard account on the government SSO portal to pull more than 2,000 documents outside that role. The collectors ran many requests at once, resumed after failures and split the data into chunks for exfiltration.\
   Log source: SSO portal and document-management (EDO) application logs\
   Source: [CloudSEK](https://www.cloudsek.com/blog/off-the-rails-inside-an-exposed-silent-lynx-server)

Behaviours that map cleanly to log fields are included in [`hunt.kql`](hunt.kql) and [`hunt.spl`](hunt.spl), and alert behaviours in [`hunt.yaral`](hunt.yaral). The rest are listed in the Behaviours section above with where to look. Use behaviours to hunt and alert, never to block.

## Sources

- [CloudSEK – Off the Rails: inside an exposed Silent Lynx server](https://www.cloudsek.com/blog/off-the-rails-inside-an-exposed-silent-lynx-server)
- [Threadlinqs – Silent Lynx Strix AI-agent espionage (TL-2026-5756)](https://intel.threadlinqs.com/threat/TL-2026-5756)
- [Mint (Reuters) – Kazakhstan-linked hackers used AI to steal Tajik government documents, researchers say](https://www.livemint.com/technology/kazakhstanlinked-hackers-used-ai-to-steal-tajik-government-documents-researchers-say-11794394933122.html)
- [Cisco Talos – Break the silence: Kazakhstan-nexus UAT-6275 targets CIS government organizations (background)](https://blog.talosintelligence.com/break-the-silence-kazakhstan-nexus-uat-6275-targets-cis-government-organizations/)

---

[Back to index](../../../../README.md)
