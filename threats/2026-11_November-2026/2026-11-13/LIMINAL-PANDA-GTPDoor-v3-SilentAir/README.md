# LIMINAL PANDA GTPDoor v3 and SilentAir Mobile-Network Espionage

[Back to index](../../../../README.md) · [November 2026](../../README.md) · [2026-11-13](../README.md)

| Published | First added | Last updated | Category | Indicators | Block now |
|---|---|---|---|---|---|
| 2026-11-11 | 2026-11-13 11:03 | 2026-11-13 | Nation-state / espionage | 2 | 2 |

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

Enea, writing on 11 November 2026 and adding key takeaways on 12 November, reports ongoing 2026 activity by the China-nexus actor LIMINAL PANDA inside mobile-operator networks, and names a second signalling-plane actor, SilentAir, whose activity it also believes aligns with China-nexus operations, with the link between the two unconfirmed. SilentAir has been observed in at least six Asian operators, with Taiwanese subscribers the primary target and high-profile people in about a dozen other countries, Europe included; it abuses SS7 and Diameter to track location, intercept calls and text messages (including two-factor authentication codes) and send silent SMS. LIMINAL PANDA now uses GTPDoor v3, which hides command-and-control inside GTP-U rather than GTP-C and captures traffic with libpcap instead of a raw-socket receive path. Enea also publishes an MD5 for SCTPE, a kernel-level tool that sends and receives SS7 and Diameter, as a sample reference. Both hashes are on the block list. This activity is specific to mobile-operator and signalling networks.

> [!WARNING]
> Enea published only MD5s, with no SHA256 or network indicators. A raw-socket or libpcap process on a telco node is too common (packet capture, probes, signalling firewalls) to hunt on its own without a published process name or path, so that behaviour is omitted. SilentAir's link to LIMINAL PANDA is unconfirmed.

## Affected countries and sectors

- **Countries:** Taiwan (TW)
- **Regions:** Asia, Europe
- **Sectors:** Telecommunications, Government
- **Note:** Enea says SilentAir-related sources in at least six Asian countries targeted a dozen additional countries and territories, with Taiwan the primary target, including political and government VIPs and activity affecting Europe. LIMINAL PANDA was detected across multiple mobile operators (an estimated 5 to 10 infected, with dozens more potentially affected). This activity is specific to mobile-operator and signalling networks.
- **Source:** [Enea – The Enemy Within: Tracking LIMINAL PANDA and SilentAir through Mobile Networks](https://www.enea.com/insights/the-enemy-within-tracking-liminal-panda-and-silentair-through-mobile-networks/)

## At a glance

| File | What it is |
|---|---|
| [`block_now.txt`](https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/threats/2026-11_November-2026/2026-11-13/LIMINAL-PANDA-GTPDoor-v3-SilentAir/block_now.txt) (raw) | 2 high-confidence indicators to block now |
| [`iocs.csv`](iocs.csv) | All 2 indicators with description, confidence, action and source |
| [`defender_xdr_indicators.csv`](defender_xdr_indicators.csv) | 2 rows for Defender XDR bulk import |
| [`hunt.kql`](hunt.kql) | Defender XDR advanced hunting query |
| [`hunt.spl`](hunt.spl) | Splunk hunt over the CIM data models |
| [`hunt_raw.spl`](hunt_raw.spl) | Splunk hunt for data not mapped to CIM ([macros](../../../../all/splunk_macros.conf)) |
| [`hunt.yaral`](hunt.yaral) | Google SecOps YARA-L 2.0 detection rule |

Indicators by type: 2 MD5. See `iocs.csv` for full details and descriptions.

## MITRE ATT&CK

| ID | Technique |
|---|---|
| [T1572](https://attack.mitre.org/techniques/T1572/) | Protocol Tunneling |
| [T1040](https://attack.mitre.org/techniques/T1040/) | Network Sniffing |
| [T1205](https://attack.mitre.org/techniques/T1205/) | Traffic Signaling |
| [T1036](https://attack.mitre.org/techniques/T1036/) | Masquerading |
| [T1059](https://attack.mitre.org/techniques/T1059/) | Command and Scripting Interpreter |

## Recommended actions

1. Block the MD5s 35f0d4d0c5519a2957338e448fce53bc (GTPDoor v3) and da35d98c9a22e8ede93595d21fe7e63e (SCTPE), and hunt file and process hashes on Linux hosts, especially telco and signalling nodes.
2. On mobile-operator networks, deploy or tighten GTP-C and GTP-U security and align it with SS7 and Diameter signalling defences.
3. For high-risk people who may be SilentAir targets, stop relying on SMS two-factor authentication.

## Behaviours to hunt

> Behaviours are leads, not confirmed indicators, and can match legitimate activity. Compare any hit against your own baseline and environment before acting.

1. **Alert** · GTPDoor v3 or SCTPE MD5 on a Linux host\
   Look for: A file or process whose MD5 is 35f0d4d0c5519a2957338e448fce53bc (GTPDoor v3) or da35d98c9a22e8ede93595d21fe7e63e (SCTPE) on a Linux host, especially a telco or signalling node\
   Why it matters: These are the only indicators Enea published for GTPDoor v3 and SCTPE. A hash match is high fidelity. This activity is specific to mobile-operator and signalling networks; a generic raw-socket or libpcap process on a telco node is too common (packet capture, probes, signalling firewalls) to hunt without a published process name, so that behaviour is omitted. Expected false positives: none of practical concern for an exact MD5 match.\
   Log source: Defender XDR DeviceFileEvents and DeviceProcessEvents, Splunk endpoint file and process logs, Google SecOps file and process UDM\
   Source: [Enea](https://www.enea.com/insights/the-enemy-within-tracking-liminal-panda-and-silentair-through-mobile-networks/)

Behaviours that map cleanly to log fields are included in [`hunt.kql`](hunt.kql) and [`hunt.spl`](hunt.spl), and alert behaviours in [`hunt.yaral`](hunt.yaral). The rest are listed in the Behaviours section above with where to look. Use behaviours to hunt and alert, never to block.

## Sources

- [Enea – The Enemy Within: Tracking LIMINAL PANDA and SilentAir through Mobile Networks](https://www.enea.com/insights/the-enemy-within-tracking-liminal-panda-and-silentair-through-mobile-networks/)

---

[Back to index](../../../../README.md)
