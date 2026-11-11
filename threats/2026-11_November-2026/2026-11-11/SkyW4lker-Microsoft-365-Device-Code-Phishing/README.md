# SkyW4lker: Microsoft 365 Device-Code Phishing Kit Targeting Enterprises

[Back to index](../../../../README.md#latest-threats) · [November 2026](../../README.md) · [2026-11-11](../README.md)

| Published | First added | Last updated | Category | Indicators | Block now |
|---|---|---|---|---|---|
| 2026-10-27 | 2026-11-11 16:11 | 2026-11-11 | Phishing / identity | 90 | 0 |

## Summary

ANY.RUN describes SkyW4lker (also branded SkyW4lker x365 Sentinel) as a device-code phishing kit aimed at Microsoft 365 users, most often in technology, manufacturing and government organisations in the United States, and also seen in India, Canada, the United Kingdom and elsewhere in Europe. The victim is sent a password-protected PDF, DOCX or XLSX, typically framed as a contract, invoice or proposal, with the password in the email body; a CAPTCHA and sometimes a lure page on a trusted service then leads to a page that tells them to enter a Microsoft device code on Microsoft's own sign-in site. Completing that genuine sign-in, including MFA, hands the attacker a Microsoft 365 token without a password being stolen. The kit's PHP backend and obfuscated JavaScript register the visit with action=start on /session_public.php and poll with action=poll until authentication finishes. ANY.RUN counted 618 related sandbox analyses between 23 June and 21 October 2026, rising from about 20 in June to about 200 in September, and assesses with high confidence that SkyW4lker and the Gabagool credential-phishing kit were built by the same developer. These figures are sandbox submissions, not a confirmed victim count, and the indicators come from a single source, so they are published at medium confidence for alerting and hunting, not for blocking.

## Affected countries and sectors

- **Countries:** United States (US), India (IN), Canada (CA), United Kingdom (GB)
- **Regions:** United States, Europe
- **Sectors:** Technology, Manufacturing, Government
- **Note:** Figures are sandbox submissions, not a confirmed victim census. ANY.RUN says 46–47% of submissions came from the United States, more than twice the share of any other country, and that submitting organisations were mainly in technology, manufacturing and government, most often from the United States, India, Canada and the United Kingdom.
- **Source:** [ANY.RUN – SkyW4lker Exposed: A Growing Microsoft 365 Phishing Threat to American Enterprises](https://any.run/cybersecurity-blog/skyw4lker-phishing-kit-analysis/)

## At a glance

| File | What it is |
|---|---|
| [`block_now.txt`](https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/threats/2026-11_November-2026/2026-11-11/SkyW4lker-Microsoft-365-Device-Code-Phishing/block_now.txt) (raw) | None yet: no indicator is high-confidence enough to block, so use the files below to hunt |
| [`iocs.csv`](iocs.csv) | All 90 indicators with description, confidence, action and source |
| [`defender_xdr_indicators.csv`](defender_xdr_indicators.csv) | 81 rows for Defender XDR bulk import |
| [`hunt.kql`](hunt.kql) | Defender XDR advanced hunting query |
| [`hunt.spl`](hunt.spl) | Splunk hunt over the CIM data models |
| [`hunt_raw.spl`](hunt_raw.spl) | Splunk hunt for data not mapped to CIM ([macros](../../../../all/splunk_macros.conf)) |
| [`hunt.yaral`](hunt.yaral) | Google SecOps YARA-L 2.0 detection rule |

Indicators by type: 80 domains, 7 URLs, 2 other, 1 SHA256. See `iocs.csv` for full details and descriptions.

## MITRE ATT&CK

| ID | Technique |
|---|---|
| [T1566.001](https://attack.mitre.org/techniques/T1566/001/) | Phishing: Spearphishing Attachment |
| [T1566.002](https://attack.mitre.org/techniques/T1566/002/) | Phishing: Spearphishing Link |
| [T1528](https://attack.mitre.org/techniques/T1528/) | Steal Application Access Token |
| [T1583.001](https://attack.mitre.org/techniques/T1583/001/) | Acquire Infrastructure: Domains |
| [T1656](https://attack.mitre.org/techniques/T1656/) | Impersonation |
| [T1027](https://attack.mitre.org/techniques/T1027/) | Obfuscated Files or Information |
| [T1497](https://attack.mitre.org/techniques/T1497/) | Virtualization/Sandbox Evasion |

## Recommended actions

1. Hunt proxy, DNS and web logs for /session_public.php?action=start, repeated ?action=poll, and the JavaScript modules /assets/js/client_geo.js, endpoint.js and url_helper.js.
2. In Entra ID, review unexpected device-code sign-ins, especially shortly after a password-protected contract or invoice email, and restrict the device-code flow with Conditional Access where it is not required.
3. Alert on the listed typo-squatted and kit-hosting domains; do not block them yet, because they come from a single source, and some other hosts in the same report look like compromised legitimate sites and were left out.
4. Treat password-protected business attachments whose password is in the email body as suspicious, and never enter a Microsoft device code from an email, a document or a page that is not a sign-in you started.

## Behaviours to hunt

> Behaviours are leads, not confirmed indicators, and can match legitimate activity. Compare any hit against your own baseline and environment before acting.

1. **Alert** · Outbound requests to /session_public.php?action=start\
   Look for: Outbound requests to /session_public.php?action=start, followed by repeated /session_public.php?action=poll\
   Why it matters: The SkyW4lker phishing page registers a session with the visitor's IP and geolocation, then polls every few seconds to see whether the victim has completed Microsoft device-code authentication.\
   Log source: Web proxy, firewall or endpoint network logs\
   Source: [ANY.RUN](https://any.run/cybersecurity-blog/skyw4lker-phishing-kit-analysis/)

2. **Alert** · Loads of /assets/js/client_geo.js\
   Look for: Loads of /assets/js/client_geo.js, /assets/js/endpoint.js or /assets/js/url_helper.js\
   Why it matters: These JavaScript modules are distinctive SkyW4lker kit fingerprints, and they are also used by the related Gabagool credential-phishing kit.\
   Log source: Web proxy or endpoint network logs\
   Source: [ANY.RUN](https://any.run/cybersecurity-blog/skyw4lker-phishing-kit-analysis/)

3. **Alert** · Unexpected Microsoft Entra ID device-code sign-ins\
   Look for: Unexpected Microsoft Entra ID device-code sign-ins, especially shortly after a password-protected contract, invoice or proposal email\
   Why it matters: SkyW4lker does not steal a password or bypass MFA. The victim completes a genuine Microsoft device-code sign-in, and the attacker's backend receives the issued token.\
   Log source: Entra ID / Microsoft 365 sign-in logs\
   Source: [ANY.RUN](https://any.run/cybersecurity-blog/skyw4lker-phishing-kit-analysis/)

4. **Hunt** · Landing paths matching //it[A-Za-z0-9]{32}us or the earlier...\
   Look for: Landing paths matching //it[A-Za-z0-9]{32}us or the earlier //zt[A-Za-z0-9]{32}op, including links that end with ? or ??\
   Why it matters: ANY.RUN observed these landing-token formats on SkyW4lker (and Gabagool) pages from June to October 2026.\
   Log source: Email URL, proxy and web logs\
   Source: [ANY.RUN](https://any.run/cybersecurity-blog/skyw4lker-phishing-kit-analysis/)

5. **Hunt** · Requests for /assets/private_captcha/public/widget.js or...\
   Look for: Requests for /assets/private_captcha/public/widget.js or /assets/php/endpoints/private_captcha_challenge.php, or /assets/php/endpoints/confirm_visit.php\
   Why it matters: SkyW4lker and Gabagool use a self-hosted CAPTCHA gate and a shared visit-confirmation endpoint to hide the phishing page from automated scanners.\
   Log source: Web proxy or endpoint network logs\
   Source: [ANY.RUN](https://any.run/cybersecurity-blog/skyw4lker-phishing-kit-analysis/)

Behaviours that map cleanly to log fields are included in [`hunt.kql`](hunt.kql) and [`hunt.spl`](hunt.spl), and alert behaviours in [`hunt.yaral`](hunt.yaral). The rest are listed in the Behaviours section above with where to look. Use behaviours to hunt and alert, never to block.

## Hunt

Run one of these to find past activity. Each file is the same hunt written for a different platform; pick the one for your SIEM or XDR.

| File | Platform | How to run it |
|---|---|---|
| [`hunt.kql`](hunt.kql) | Microsoft Defender XDR | In the [Defender portal](https://security.microsoft.com), open **Hunting > Advanced hunting**, paste the query and select **Run query**. It covers the last 30 days. |
| [`hunt.spl`](hunt.spl) | Splunk | In **Search & Reporting**, set the time picker to the last 30 days or more, paste the search and run it. It reads the CIM data models. |
| [`hunt_raw.spl`](hunt_raw.spl) | Splunk without CIM | The same hunt over raw events. Define the `rti_*` macros from [`splunk_macros.conf`](../../../../all/splunk_macros.conf) first. |
| [`hunt.yaral`](hunt.yaral) | Google SecOps | In **Detection > Rules & Detections > Rules Editor**, paste the rule, run a Retrohunt over the last 30 days, then turn on live mode. |

Leads that are not network or hash indicators are in [`iocs.csv`](iocs.csv), and behaviours with no clean field mapping are in the Behaviours section above. Guides: [Defender XDR](../../../../docs/defender-xdr.md), [Splunk](../../../../docs/splunk.md), [Google SecOps](../../../../docs/google-secops.md).

## Sources

- [ANY.RUN – SkyW4lker Exposed: A Growing Microsoft 365 Phishing Threat to American Enterprises](https://any.run/cybersecurity-blog/skyw4lker-phishing-kit-analysis/)

---

[Back to index](../../../../README.md#latest-threats)
