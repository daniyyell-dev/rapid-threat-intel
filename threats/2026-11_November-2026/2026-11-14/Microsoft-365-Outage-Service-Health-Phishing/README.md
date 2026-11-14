# Fake Microsoft 365 Outage Notices Lure Users to Restore Held Messages

[Live entry](https://iocwatch.com/t/Microsoft-365-Outage-Service-Health-Phishing/) · [Back to index](../../../../README.md) · [November 2026](../../README.md) · [2026-11-14](../README.md)

| Published | First added | Last updated | Category | Indicators | Block now |
|---|---|---|---|---|---|
| 2026-11-14 | 2026-11-14 16:16 | 2026-11-14 | Phishing / identity | 5 | 1 |

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

Microsoft Threat Intelligence warned on 14 November 2026 of an active phishing campaign that exploits the real 12 November Microsoft 365 and Exchange Online outage. The emails impersonate Microsoft 365 service health notices, cite the genuine incident EX1550543, claim four messages were held and will be deleted within 24 hours, and use a RESTORE MESSAGES button. Subjects follow the pattern 'Outage - ' plus a six-character code, and sender display names pair an organisation-specific prefix with 'Outage Notification' or 'Service Health'. Microsoft names three sender domains (moments-notice.com, planetmaison.com, newbooker.com) and recipient-specific SendGrid click-tracking links that redirect to reallifeaccounting.com/themelist0.html; it saw organisations in multiple US sectors targeted and says credential collection has not been confirmed. Field Effect caught the same lure on 13 November, describes the landing page as credential harvesting, and warns of parallel outage-themed texts and fake IT support calls. The landing path is on the block list; the long-registered sender and landing domains are alert and hunt.

> [!WARNING]
> The four domains were registered between 1996 and 2015 and may be compromised or repurposed sites, so only the exact landing path is blocked; the domains are alert and hunt. Microsoft says credential collection and malware delivery have not been confirmed. Genuine Microsoft quarantine digests come from quarantine@messaging.microsoft.com.

## Affected countries and sectors

- **Countries:** name (code)
- **Regions:** North America
- **Sectors:** Organisations across multiple US sectors (not named)
- **Note:** Microsoft saw the emails target organisations across multiple US sectors; any Microsoft 365 tenant could receive the lure.
- **Source:** [Microsoft Threat Intelligence – Active phishing campaign exploiting the 12 November Microsoft 365 disruption (X)](https://x.com/MsftSecIntel/status/2121491564161581148)

## At a glance

| File | What it is |
|---|---|
| [`block_now.txt`](https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/threats/2026-11_November-2026/2026-11-14/Microsoft-365-Outage-Service-Health-Phishing/block_now.txt) (raw) | 1 high-confidence indicators to block now |
| [`iocs.csv`](iocs.csv) | All 5 indicators with description, confidence, action and source |
| [`defender_xdr_indicators.csv`](defender_xdr_indicators.csv) | 5 rows for Defender XDR bulk import |
| [`hunt.kql`](hunt.kql) | Defender XDR advanced hunting query |
| [`hunt.spl`](hunt.spl) | Splunk hunt over the CIM data models |
| [`hunt_raw.spl`](hunt_raw.spl) | Splunk hunt for data not mapped to CIM ([macros](../../../../all/splunk_macros.conf)) |
| [`hunt.yaral`](hunt.yaral) | Google SecOps YARA-L 2.0 detection rule |

Indicators by type: 4 domains, 1 URL. See `iocs.csv` for full details and descriptions.

## MITRE ATT&CK

| ID | Technique |
|---|---|
| [T1566.002](https://attack.mitre.org/techniques/T1566/002/) | Phishing: Spearphishing Link |
| [T1656](https://attack.mitre.org/techniques/T1656/) | Impersonation |
| [T1078.004](https://attack.mitre.org/techniques/T1078/004/) | Valid Accounts: Cloud Accounts |
| [T1564.008](https://attack.mitre.org/techniques/T1564/008/) | Hide Artifacts: Email Hiding Rules |

## Recommended actions

1. Search EmailEvents and Threat Explorer from 12 November 2026 for subjects starting 'Outage - ' with a six-character code, sender display names containing 'Outage Notification' or 'Service Health', and the sender domains moments-notice.com, planetmaison.com and newbooker.com; purge matches and block the senders in Exchange Online.
2. Use UrlClickEvents and proxy logs to find anyone who clicked through to reallifeaccounting.com; for each, reset the password, revoke sessions and tokens, and review new sign-in locations, MFA method registrations, OAuth consents and inbox or forwarding rules since 12 November.
3. Confirm Safe Links policies cover all users, and tell staff that outage updates appear only on the Microsoft 365 admin center Service health page.
4. Verify any password reset, MFA change or payment change requested by phone, text or Teams during or after the outage by calling back on a known number, and limit Quick Assist and other remote support tools to IT staff.

## Behaviours to hunt

> Behaviours are leads, not confirmed indicators, and can match legitimate activity. Compare any hit against your own baseline and environment before acting.

1. **Alert** · 'Outage - ' subject with a Service Health sender name\
   Look for: Email with subject 'Outage - ' plus a six-character code and an 'Outage Notification' or 'Service Health' sender display name from a non-Microsoft domain\
   Why it matters: Microsoft Threat Intelligence reports that the lures use subjects of the form 'Outage - [six-character code]' and sender display names that pair an organisation-specific prefix with 'Outage Notification' or 'Service Health', while citing the real Exchange Online incident EX1550543. Genuine Microsoft 365 service health and quarantine mail is sent from microsoft.com domains, so requiring the exact subject shape, the display-name wording and a non-Microsoft sender domain keeps false positives close to none. Expected false positives are internal IT teams that send their own outage notices with a similar subject; exclude your own accepted domains if they do.\
   Log source: Defender XDR EmailEvents; Defender for Office 365 Threat Explorer; email gateway logs\
   Source: [X](https://x.com/MsftSecIntel/status/2121491564161581148)

2. **Alert** · Outage lure sender domains or landing-page clicks\
   Look for: Mail from the three named sender domains, or clicks through to the /themelist0.html landing path\
   Why it matters: Microsoft names moments-notice.com, planetmaison.com and newbooker.com as the sender domains and says each email carries a recipient-specific SendGrid click-tracking link that redirects to reallifeaccounting.com/themelist0.html; Field Effect describes the landing page as credential harvesting. Matching the sender domain in message trace finds every recipient even when the domain block never fires, and a click on the landing path marks the users whose passwords may have been entered. The domains are long-registered and may be compromised sites, so confirm the subject and lure before acting; legitimate mail from those businesses is the expected false positive.\
   Log source: Defender XDR EmailEvents and UrlClickEvents; email gateway and web proxy logs\
   Source: [X](https://x.com/MsftSecIntel/status/2121491564161581148)

3. **Hunt** · New mailbox rules or MFA methods after a lure\
   Look for: New inbox or forwarding rules, MFA method registrations or OAuth consents on accounts that received or clicked an outage lure since 12 November\
   Why it matters: Field Effect warns that a password reset alone leaves anything the attacker created with stolen credentials: inbox rules, mailbox forwarding, OAuth app consents and newly registered MFA methods stay active until removed. Review these only for users identified by the two hunts above, which keeps the volume small; routine rule changes by those users are the expected false positives.\
   Log source: Microsoft Purview unified audit log; Entra ID audit and sign-in logs\
   Source: [Field Effect](https://fieldeffect.com/blog/microsoft-365-outage-theme)

Behaviours that map cleanly to log fields are included in [`hunt.kql`](hunt.kql) and [`hunt.spl`](hunt.spl), and alert behaviours in [`hunt.yaral`](hunt.yaral). The rest are listed in the Behaviours section above with where to look. Use behaviours to hunt and alert, never to block.

## Sources

- [Microsoft Threat Intelligence – Active phishing campaign exploiting the 12 November Microsoft 365 disruption (X)](https://x.com/MsftSecIntel/status/2121491564161581148)
- [Field Effect – Microsoft 365 outage theme drives credential phishing and support scams](https://fieldeffect.com/blog/microsoft-365-outage-theme)
- [Sulat – Phishers use Microsoft 365 outage as bait, Microsoft Threat Intelligence says](https://news.sulat.com/2026/11/14/microsoft-365-outage-phishing/)

---

[Back to index](../../../../README.md)
