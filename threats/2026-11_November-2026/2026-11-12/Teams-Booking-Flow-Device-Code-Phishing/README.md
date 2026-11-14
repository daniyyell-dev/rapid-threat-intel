# Microsoft Teams Booking-Flow Device-Code Phishing

[Live entry](https://iocwatch.com/t/Teams-Booking-Flow-Device-Code-Phishing/) · [Back to index](../../../../README.md) · [November 2026](../../README.md) · [2026-11-12](../README.md)

| Published | First added | Last updated | Category | Indicators | Block now |
|---|---|---|---|---|---|
| 2026-11-12 | 2026-11-12 22:55 | 2026-11-12 | Phishing / identity | 4 | 2 |

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

Huntress reports a mid-October device-code phishing incident against a construction-sector company that hid the Microsoft device-code flow inside a convincing Microsoft Teams meeting-booking page. The spear-phishing email impersonated a real senior vice president at another construction firm, using a typo-squatted domain that Huntress has redacted, and a Microsoft Safe Links-wrapped Google short link to reach a lure that looked like a Teams Meeting Scheduler. Behind the scenes the page started a device-code sign-in; when the target clicked Confirm Meeting the user code was copied to the clipboard and Microsoft's real device-login page opened. Completing that step authorised a Cmsi:Cmsi Microsoft Authentication Broker session, which the attacker then replayed through a residential proxy. The phishing kit was delivered as AES-256-GCM ciphertext and talked to gpimmlgration.com/static-export. That domain and URL are on the block list. Do not block Microsoft or Google; the specific short-link query is alert only.

> [!WARNING]
> Huntress redacted the typo-squatted lure domain, so it is not listed. The Google short link sits on a legitimate service: alert on the specific query, do not block share.google. Microsoft's device-login page is genuine and must not be blocked.

## Affected countries and sectors

- **Countries:** Not stated in the sources
- **Sectors:** Construction
- **Note:** Huntress observed the mid-October incident at a company in the construction sector and redacted the impersonated firm and typo-squatted domain. No other victims are named.
- **Source:** [Huntress – Crafty Microsoft Teams Booking Flow Disguises Device Code Phishing](https://www.huntress.com/blog/crafty-microsoft-teams-booking-flow-disguises-device-code-phishing)

## At a glance

| File | What it is |
|---|---|
| [`block_now.txt`](https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/threats/2026-11_November-2026/2026-11-12/Teams-Booking-Flow-Device-Code-Phishing/block_now.txt) (raw) | 2 high-confidence indicators to block now |
| [`iocs.csv`](iocs.csv) | All 4 indicators with description, confidence, action and source |
| [`defender_xdr_indicators.csv`](defender_xdr_indicators.csv) | 3 rows for Defender XDR bulk import |
| [`hunt.kql`](hunt.kql) | Defender XDR advanced hunting query |
| [`hunt.spl`](hunt.spl) | Splunk hunt over the CIM data models |
| [`hunt_raw.spl`](hunt_raw.spl) | Splunk hunt for data not mapped to CIM ([macros](../../../../all/splunk_macros.conf)) |
| [`hunt.yaral`](hunt.yaral) | Google SecOps YARA-L 2.0 detection rule |

Indicators by type: 2 URLs, 1 domain, 1 other. See `iocs.csv` for full details and descriptions.

## MITRE ATT&CK

| ID | Technique |
|---|---|
| [T1583.001](https://attack.mitre.org/techniques/T1583/001/) | Domains |
| [T1566.002](https://attack.mitre.org/techniques/T1566/002/) | Spearphishing Link |
| [T1204.001](https://attack.mitre.org/techniques/T1204/001/) | Malicious Link |
| [T1528](https://attack.mitre.org/techniques/T1528/) | Steal Application Access Token |
| [T1557](https://attack.mitre.org/techniques/T1557/) | Adversary-in-the-Middle |
| [T1550.004](https://attack.mitre.org/techniques/T1550/004/) | Web Session Cookie |
| [T1090](https://attack.mitre.org/techniques/T1090/) | Proxy |
| [T1078.004](https://attack.mitre.org/techniques/T1078/004/) | Cloud Accounts |

## Recommended actions

1. Block gpimmlgration.com and https://gpimmlgration.com/static-export, and search email, proxy and DNS logs for them and for the short-link query UltJkMsVWI5V9GJM1.
2. Hunt Entra ID sign-in logs for unexpected Cmsi:Cmsi or device-code authentications after a meeting-booking lure, for programmatic user agents such as python-requests or node, and for a mid-session change of ASN or region.
3. Restrict or monitor device-code authentication where it is not required, enforce phishing-resistant MFA, and after a confirmed hit check for rogue MFA methods, unrecognised devices, app consents, mailbox rules and unusual outbound mail.
4. Train staff that a meeting-booking page which asks them to copy or enter a Microsoft code should be verified out of band before they approve it.

## Behaviours to hunt

> Behaviours are leads, not confirmed indicators, and can match legitimate activity. Compare any hit against your own baseline and environment before acting.

1. **Alert** · An unexpected Microsoft device-code or Cmsi:Cmsi Authentication Broker...\
   Look for: An unexpected Microsoft device-code or Cmsi:Cmsi Authentication Broker sign-in that follows a Teams meeting-booking page, a Confirm Meeting control that copies a code to the clipboard, or a link through share.google/?q=UltJkMsVWI5V9GJM1\
   Why it matters: Huntress saw a typo-squatted executive lure that walked the target through a fake Microsoft Teams Meeting Scheduler, silently started a device-code request, copied the user code when they confirmed the meeting, then opened Microsoft's real device-login page. Completing that step hands the attacker the session.\
   Log source: Entra ID / Microsoft 365 sign-in logs, email safe-link and URL logs, endpoint clipboard or browser events\
   Source: [Huntress](https://www.huntress.com/blog/crafty-microsoft-teams-booking-flow-disguises-device-code-phishing)

2. **Alert** · Device-code or Cmsi:Cmsi sign-ins from programmatic user agents such as...\
   Look for: Device-code or Cmsi:Cmsi sign-ins from programmatic user agents such as python-requests or node, or a mid-session change of ASN or region consistent with a residential proxy\
   Why it matters: Huntress saw the captured session replayed through a residential callback proxy so it looked like ordinary consumer traffic, and noted programmatic user agents in the sign-in logs. The kit also restarts the device-code flow when Microsoft returns AADSTS50076 or interaction_required.\
   Log source: Entra ID interactive and non-interactive sign-in logs\
   Source: [Huntress](https://www.huntress.com/blog/crafty-microsoft-teams-booking-flow-disguises-device-code-phishing)

Behaviours that map cleanly to log fields are included in [`hunt.kql`](hunt.kql) and [`hunt.spl`](hunt.spl), and alert behaviours in [`hunt.yaral`](hunt.yaral). The rest are listed in the Behaviours section above with where to look. Use behaviours to hunt and alert, never to block.

## Sources

- [Huntress – Crafty Microsoft Teams Booking Flow Disguises Device Code Phishing](https://www.huntress.com/blog/crafty-microsoft-teams-booking-flow-disguises-device-code-phishing)

---

[Back to index](../../../../README.md)
