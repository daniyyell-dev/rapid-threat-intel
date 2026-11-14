# SANSAR: Linux GPU Cryptomining Toolkit with a Tor Orchestrator, Rootkit and Ethereum C2

[Live entry](https://iocwatch.com/t/SANSAR-Linux-GPU-Cryptomining-Toolkit/) · [Back to index](../../../../README.md) · [November 2026](../../README.md) · [2026-11-13](../README.md)

| Published | First added | Last updated | Category | Indicators | Block now |
|---|---|---|---|---|---|
| 2026-11-12 | 2026-11-13 03:50 | 2026-11-13 | Crimeware / cryptomining | 11 | 5 |

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

Elastic Security Labs, writing on 12 November 2026, describes REF3364, a Linux cryptomining intrusion on GPU hosts that started through an exposed, unauthenticated Ray job agent between 22 and 25 October. After a job ran nvidia-smi and a Python reverse shell, the actor obtained root, staged a toolkit under /opt/vadi_/, and installed SANSAR, a Rust orchestrator that talks to the onion service efxisnqldelyr5ra25oqfrsut54b34g26e7zrsiuupsoekjof2gho2id.onion:9051 over Tor. The toolkit also includes an acpi_thermal_mgr kernel rootkit loaded through DKMS and initramfs, an NVML wrapper that reports 0% GPU utilisation, public XMRig and SRBMiner binaries, and a backdoor named netns that retrieves its controller IPv4 address from Ethereum contract 0x43eb291f56688c63c93e8a93c4591fc997cf6349 using selector 0x6ded96e7, then connects to that address on TCP port 8080. The custom SANSAR, netns, rootkit and NVML-wrapper hashes and the onion C2 are on the block list. The XMRig and SRBMiner hashes are alert only because those are public miners. Do not block the Tor Project's lyrebird helper, public Ethereum RPC services, or Ray itself.

> [!WARNING]
> Elastic published the official Tor lyrebird 0.8.1 helper hash alongside the toolkit; it is legitimate Tor software and is not listed. Public Ethereum RPC endpoints must not be blocked; hunt eth_call to the published contract from non-crypto hosts. Ray is a legitimate distributed-computing framework; restrict who can submit jobs and whether the job agent is exposed to the internet. The acpi_thermal_mgr module name could collide with a plausible ACPI helper, so confirm the published hash.

## At a glance

| File | What it is |
|---|---|
| [`block_now.txt`](https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/threats/2026-11_November-2026/2026-11-13/SANSAR-Linux-GPU-Cryptomining-Toolkit/block_now.txt) (raw) | 5 high-confidence indicators to block now |
| [`iocs.csv`](iocs.csv) | All 11 indicators with description, confidence, action and source |
| [`defender_xdr_indicators.csv`](defender_xdr_indicators.csv) | 9 rows for Defender XDR bulk import |
| [`hunt.kql`](hunt.kql) | Defender XDR advanced hunting query |
| [`hunt.spl`](hunt.spl) | Splunk hunt over the CIM data models |
| [`hunt_raw.spl`](hunt_raw.spl) | Splunk hunt for data not mapped to CIM ([macros](../../../../all/splunk_macros.conf)) |
| [`hunt.yaral`](hunt.yaral) | Google SecOps YARA-L 2.0 detection rule |

Indicators by type: 6 SHA256, 2 file names, 1 domain, 1 Ethereum/Polygon address, 1 function selector. See `iocs.csv` for full details and descriptions.

## MITRE ATT&CK

| ID | Technique |
|---|---|
| [T1190](https://attack.mitre.org/techniques/T1190/) | Exploit Public-Facing Application |
| [T1059.006](https://attack.mitre.org/techniques/T1059/006/) | Python |
| [T1059.004](https://attack.mitre.org/techniques/T1059/004/) | Unix Shell |
| [T1098.004](https://attack.mitre.org/techniques/T1098/004/) | SSH Authorized Keys |
| [T1543.002](https://attack.mitre.org/techniques/T1543/002/) | Systemd Service |
| [T1547.006](https://attack.mitre.org/techniques/T1547/006/) | Kernel Modules and Extensions |
| [T1014](https://attack.mitre.org/techniques/T1014/) | Rootkit |
| [T1562](https://attack.mitre.org/techniques/T1562/) | Impair Defenses |
| [T1090.003](https://attack.mitre.org/techniques/T1090/003/) | Multi-hop Proxy |
| [T1102.001](https://attack.mitre.org/techniques/T1102/001/) | Dead Drop Resolver |
| [T1496.001](https://attack.mitre.org/techniques/T1496/001/) | Compute Hijacking |

## Recommended actions

1. Block the four custom hashes (sansar, the NVML wrapper, acpi_thermal_mgr.ko and netns) and the onion C2 (they are in the Defender XDR import file), and hunt 90 days of logs for /opt/vadi_/ and for eth_call to 0x43eb291f56688c63c93e8a93c4591fc997cf6349.
2. Treat the XMRig (kurt) and SRBMiner (tilki) hashes as alert-only public miners; confirm the /opt/vadi_/ path or the custom implants before calling the host this intrusion.
3. Hunt for an internet-exposed unauthenticated Ray job agent, nvidia-smi output leaving the host shortly before a Python reverse shell, DKMS builds of acpi_thermal_mgr, and unexpected replacement of libnvidia-ml.so.1.
4. If confirmed, isolate the host, rebuild it from known-good media rather than just removing files (the rootkit hides processes and can reload from initramfs), rotate SSH keys and credentials, and close the exposed Ray job agent.

## Behaviours to hunt

> Behaviours are leads, not confirmed indicators, and can match legitimate activity. Compare any hit against your own baseline and environment before acting.

1. **Alert** · Files or processes under /opt/vadi_/\
   Look for: Files or processes under /opt/vadi_/, including sansar, kurt, tilki or netns\
   Why it matters: After obtaining root, the actor staged the toolkit under /opt/vadi_/. A kernel log later recorded /opt/vadi_/tilki starting on one GPU host.\
   Log source: Linux EDR, auditd, and Defender XDR DeviceFileEvents or DeviceProcessEvents where Linux onboarding is present\
   Source: [Elastic](https://www.elastic.co/security-labs/threat-command/sansar-linux-cryptomining-malware)

2. **Alert** · acpi_thermal_mgr kernel module built or loaded\
   Look for: The acpi_thermal_mgr kernel module being built through DKMS or loaded at boot\
   Why it matters: The actor built acpi_thermal_mgr.ko through DKMS and added an initramfs loader so the rootkit could hide processes, files and sockets and reload after reboot. Confirm the published hash; the name could collide with a plausible ACPI helper.\
   Log source: Linux syslog, kernel logs, DKMS logs, and EDR file or process events\
   Source: [Elastic](https://www.elastic.co/security-labs/threat-command/sansar-linux-cryptomining-malware)

3. **Hunt** · eth_call to the netns Ethereum C2 contract\
   Look for: eth_call requests to Ethereum contract 0x43eb291f56688c63c93e8a93c4591fc997cf6349 with selector 0x6ded96e7, followed by a TCP connection to port 8080\
   Why it matters: netns sends eth_call through public Ethereum RPC services to this embedded contract, decodes an IPv4 address from the response and connects to it on TCP 8080, then can be told to open a Bash reverse shell to a different host.\
   Log source: Proxy, TLS-inspection and Linux process or network logs; public Ethereum RPC services must not be blocked\
   Source: [Elastic](https://www.elastic.co/security-labs/threat-command/sansar-linux-cryptomining-malware)

4. **Hunt** · Exposed Ray job agent or nvidia-smi then a Python shell\
   Look for: An internet-exposed Ray job agent accepting unauthenticated job submissions, or nvidia-smi output leaving the host shortly before a Python reverse shell\
   Why it matters: On the first host the Ray dashboard listened only on loopback but the job agent remained reachable from the internet without authentication. Between 22 and 25 October 2026, probes were followed by a job that ran nvidia-smi and sent the GPU inventory out, then a Python reverse shell and an SSH key added to authorized_keys. Ray itself is legitimate software.\
   Log source: Ray dashboard and job-agent logs, Linux process and network telemetry\
   Source: [Elastic](https://www.elastic.co/security-labs/threat-command/sansar-linux-cryptomining-malware)

5. **Hunt** · Unexpected replacement of libnvidia-ml.so.1\
   Look for: Replacement of libnvidia-ml.so.1 with a wrapper that falsifies GPU utilisation\
   Why it matters: The toolkit replaces the NVIDIA Management Library with a wrapper so monitoring tools report 0% GPU utilisation while mining continues. Hunt unexpected replacement of this library; do not block the legitimate NVIDIA file name.\
   Log source: Linux file integrity, package and EDR file events\
   Source: [Elastic](https://www.elastic.co/security-labs/threat-command/sansar-linux-cryptomining-malware)

Behaviours that map cleanly to log fields are included in [`hunt.kql`](hunt.kql) and [`hunt.spl`](hunt.spl), and alert behaviours in [`hunt.yaral`](hunt.yaral). The rest are listed in the Behaviours section above with where to look. Use behaviours to hunt and alert, never to block.

## Sources

- [Elastic Security Labs – 0% GPU utilization: How SANSAR hides Linux cryptomining](https://www.elastic.co/security-labs/threat-command/sansar-linux-cryptomining-malware)

---

[Back to index](../../../../README.md)
