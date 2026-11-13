# wfx: Hijacked GitHub Accounts Plant a CI Secret Stealer in Thousands of Repositories

[Back to index](../../../../README.md) · [November 2026](../../README.md) · [2026-11-12](../README.md)

| Published | First added | Last updated | Category | Indicators | Block now |
|---|---|---|---|---|---|
| 2026-11-11 | 2026-11-12 08:05 | 2026-11-13 11:23 | Supply chain / CI/CD | 11 | 4 |

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

From about 12:45 UTC on 10 November 2026 an attacker used stolen credentials for 4,837 GitHub accounts to plant a CI secret stealer, named wfx after the prefix it puts on its files, branches and cloud objects, in repositories those accounts could write to. Each attack starts with a probe pull request titled 'docs: dependency audit notes' from a wfx-docs branch; Aikido counted these in 61,764 repositories and treats any account that opened one as compromised. The payload, a single shell script of about 1,500 lines, then arrives in one of three ways: injected into an existing workflow ('ci: refresh build cache'), as an npm postinstall hook that runs a .ci-xxxxxx.sh script on every npm install, including on developer machines ('chore: add ci helper'), or as a new build-audit workflow on a short-lived chore/ branch. The actor usually reverts the change within minutes and deletes the workflow run and its logs, so a missing run number is often the only trace. Aikido says the stealer ran in at least 1,806 repositories; SafeDep counted 8,093 repositories that received malicious commits between 10 November 12:46 UTC and 12 November 04:36 UTC, and probe pull requests were still being opened early on 12 November. The script takes repository secrets and variables, GITHUB_TOKEN and Actions runtime tokens, keys found in runner memory, credential files for cloud, SSH, package registries and developer tools, and .env and Terraform state files, and sends them by HTTP POST to port 8080 on three servers or to a Telegram chat. It also swaps GitHub OIDC tokens for AWS, Azure and GCP sessions and leaves backdoors that survive rotation: new AWS access keys, role trust policies opened to any account, and Entra ID federated credentials named wfx-ci-*. The stealer reached the Packagist package digitalelvis/neuronai-studio 3.14.3 and Go module versions of vkuznet/gocurl and onuragtas/docker-env, and 28 WebdriverIO repositories through the project's release account. Aikido found that the accounts overlap with October's GhostAction wave but does not attribute the two to one actor. On 12 November 2026 Fly.io reported that GitHub tokens issued to its GitHub App had been scraped from .git/config files left in some apps deployed from GitHub and used in this campaign; it revoked the tokens and notified the small number of affected customers. The first exfil server and its URL appear in both reports and sit in a network on Spamhaus's ASN-DROP list, so they are on the block-now list; the Amazon-hosted server is alert-only because the address may be reassigned, 153.75.82.159 is on the block list too, and the other single-report indicators stay at medium confidence for alerting.

## Affected countries and sectors

- **Countries:** Not stated in the sources
- **Regions:** Worldwide
- **Sectors:** Software development, Technology, Cloud services
- **Note:** Public and possibly private GitHub repositories reachable by 4,837 compromised accounts, plus downstream users of the affected Packagist and Go packages; no countries named.
- **Source:** [Aikido – Compromised GitHub accounts push CI secret stealer to tens of thousands of repositories](https://www.aikido.dev/blog/compromised-github-accounts-push-ci-secret-stealer-to-tens-of-thousands-of-repositories)

## At a glance

| File | What it is |
|---|---|
| [`block_now.txt`](https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/threats/2026-11_November-2026/2026-11-12/GitHub-Hijacked-Accounts-wfx-CI-Secret-Stealer/block_now.txt) (raw) | 4 high-confidence indicators to block now |
| [`iocs.csv`](iocs.csv) | All 11 indicators with description, confidence, action and source |
| [`defender_xdr_indicators.csv`](defender_xdr_indicators.csv) | 7 rows for Defender XDR bulk import |
| [`hunt.kql`](hunt.kql) | Defender XDR advanced hunting query |
| [`hunt.spl`](hunt.spl) | Splunk hunt over the CIM data models |
| [`hunt_raw.spl`](hunt_raw.spl) | Splunk hunt for data not mapped to CIM ([macros](../../../../all/splunk_macros.conf)) |
| [`hunt.yaral`](hunt.yaral) | Google SecOps YARA-L 2.0 detection rule |

Indicators by type: 4 IPv4, 4 file names, 2 URLs, 1 SHA256. See `iocs.csv` for full details and descriptions.

## MITRE ATT&CK

| ID | Technique |
|---|---|
| [T1078](https://attack.mitre.org/techniques/T1078/) | Valid Accounts |
| [T1195.002](https://attack.mitre.org/techniques/T1195/002/) | Compromise Software Supply Chain |
| [T1677](https://attack.mitre.org/techniques/T1677/) | Poisoned Pipeline Execution |
| [T1059.004](https://attack.mitre.org/techniques/T1059/004/) | Unix Shell |
| [T1552.001](https://attack.mitre.org/techniques/T1552/001/) | Credentials In Files |
| [T1552.005](https://attack.mitre.org/techniques/T1552/005/) | Cloud Instance Metadata API |
| [T1528](https://attack.mitre.org/techniques/T1528/) | Steal Application Access Token |
| [T1098.001](https://attack.mitre.org/techniques/T1098/001/) | Additional Cloud Credentials |
| [T1070](https://attack.mitre.org/techniques/T1070/) | Indicator Removal |
| [T1041](https://attack.mitre.org/techniques/T1041/) | Exfiltration Over C2 Channel |
| [T1567](https://attack.mitre.org/techniques/T1567/) | Exfiltration Over Web Service |

## Recommended actions

1. Search every repository you can write to for a wfx-docs branch, pull requests titled 'docs: dependency audit notes', and commits 'ci: refresh build cache', 'chore: add ci helper', 'chore: add dependency audit workflow', 'ci: restore' or 'ci: cleanup' since 10 November; close the probe pull request and delete the branch.
2. For any account that opened a probe pull request, revoke its tokens, OAuth app grants, SSH keys and sessions and turn on 2FA; then rotate every secret and variable the affected repository can read, including environment and organisation secrets.
3. Check cloud accounts for backdoors that survive rotation: AWS sessions named wfx-* followed by CreateAccessKey or UpdateAssumeRolePolicy, Entra ID federated credentials named wfx-ci-*, GCP GenerateAccessToken or SignJwt from your GitHub workload identity pool, and Vault JWT logins from the GitHub OIDC issuer.
4. Block 194.150.166.244 and its /exfil URL now, block 153.75.82.159 in Defender, and alert on 18.143.168.96 (Amazon-hosted) and the older GhostAction server 193.32.204.199.
5. Remove neuronai-studio 3.14.3 (pin 3.14.2 or earlier) and the listed gocurl and docker-env versions; treat any machine that ran npm install on an affected commit as compromised and rotate its keys.
6. If you connected GitHub to Fly.io or deployed an app from GitHub through the Fly.io dashboard, reconnect the GitHub App after the token revocation, look for a public /.git/config on the app, and also search repositories the app can access for ci-check-<4 digits> branches and a docs/wfx-audit.md file.

## Behaviours to hunt

> Behaviours are leads, not confirmed indicators, and can match legitimate activity. Compare any hit against your own baseline and environment before acting.

1. **Alert** · npm postinstall running a hidden .ci- script\
   Look for: npm postinstall hook running a hidden ./.ci-xxxxxx.sh script (sh ./.ci-<6 characters>.sh) on a CI runner or developer machine\
   Why it matters: The 'chore: add ci helper' variant adds a .ci-<6>.sh script and a package.json postinstall hook, so the stealer runs on every npm install, including on developer laptops. Projects with their own dot-prefixed CI helper scripts can match; check the script name and the commit that added it.\
   Log source: Defender XDR DeviceProcessEvents (Linux and macOS developer machines, self-hosted runners)\
   Source: [SafeDep](https://safedep.io/blog/github-actions-wfx-credential-stealer)

2. **Alert** · AWS wfx-* sessions creating keys or opening trust policies\
   Look for: AWS role sessions named wfx-* (AssumeRoleWithWebIdentity or AssumeRole) followed by CreateAccessKey or UpdateAssumeRolePolicy\
   Why it matters: The stealer swaps GitHub OIDC tokens for AWS sessions named wfx-<pid>, creates long-lived access keys for IAM users and can rewrite a role's trust policy to open it to any AWS account, so access survives secret rotation.\
   Log source: AWS CloudTrail, or Defender XDR CloudAppEvents with the AWS connector\
   Source: [SafeDep](https://safedep.io/blog/github-actions-wfx-credential-stealer)

3. **Alert** · Entra app federated credentials named wfx-ci-*\
   Look for: Federated identity credentials named wfx-ci-* added to Entra ID app registrations\
   Why it matters: The stealer adds a federated credential named wfx-ci-<n> so workflows on the repository's main branch can sign in to Azure as that app without a stored secret, even after client secrets are rotated.\
   Log source: Entra ID audit logs (Update application, Certificates and secrets management)\
   Source: [SafeDep](https://safedep.io/blog/github-actions-wfx-credential-stealer)

4. **Hunt** · wfx-docs probe pull requests and payload commits\
   Look for: A wfx-docs branch or a pull request titled 'docs: dependency audit notes', followed by commits 'ci: refresh build cache', 'chore: add ci helper', 'chore: add dependency audit workflow', 'chore: initial commit', 'ci: restore' or 'ci: cleanup', or a ci-check-<4 digits> branch or a docs/wfx-audit.md file\
   Why it matters: The probe pull request confirms the stolen token can write to the repository, and Aikido and SafeDep treat any account that opened one as compromised even if no payload followed. Fly.io later confirmed the same pull-request title, wfx-docs and chore/ branches, and also saw ci-check-<4 digits> branches and a docs/wfx-audit.md file. The commit messages are generic, so verify the diff before acting.\
   Log source: GitHub audit log, repository history and pull requests\
   Source: [Aikido](https://www.aikido.dev/blog/compromised-github-accounts-push-ci-secret-stealer-to-tens-of-thousands-of-repositories)

5. **Hunt** · Deleted workflow runs after reverted commits\
   Look for: Workflow runs deleted, or missing run numbers, on commits pushed and reverted within minutes\
   Why it matters: After the payload runs the actor reverts the commit and deletes the run and its logs, so a missing run number on the attacker's commit is the more reliable sign the stealer ran; the absence of wfx-loot artefacts, wfx- cache entries or WFX-BEGIN step summaries does not mean nothing was taken.\
   Log source: GitHub Actions run history and audit log (workflow run deletions)\
   Source: [Aikido](https://www.aikido.dev/blog/compromised-github-accounts-push-ci-secret-stealer-to-tens-of-thousands-of-repositories)

6. **Hunt** · GitHub OIDC tokens used against GCP, Vault or Kubernetes\
   Look for: GCP GenerateAccessToken or SignJwt calls from your GitHub workload identity pool, and Vault or Kubernetes JWT logins from the GitHub OIDC issuer, from repositories that do not normally use them\
   Why it matters: The stealer requests GitHub OIDC tokens for AWS, Azure and GCP even when a repository has no cloud setup, and replays them against Vault and Kubernetes APIs.\
   Log source: GCP Cloud Audit Logs, HashiCorp Vault audit logs, Kubernetes API audit logs\
   Source: [SafeDep](https://safedep.io/blog/github-actions-wfx-credential-stealer)

7. **Hunt** · Public /.git/config request returning HTTP 200\
   Look for: A web request to /.git/config that returns HTTP 200 with a response body of 100 to 20,000 bytes, from a non-internal source address\
   Why it matters: Fly.io found that apps deployed from GitHub had left a GitHub access token in .git/config inside the image, and that some apps were serving that file on the public internet. A 200 response in this size range from a public address is consistent with a real git configuration being fetched, including one that may still contain a token. Tuning: the path must end with /.git/config, the status must be 200, the response size must be between 100 and 20,000 bytes (a git config is small; this drops empty replies and large HTML shells), and the source address must not be private, loopback or link-local. Expected false positives: a site that returns HTTP 200 with a small custom HTML page for unknown paths; a vulnerability scanner or an approved external monitor that requests /.git/config. Confirm the response is a git configuration before rotating tokens. Do not treat a 404, or a 200 under 100 bytes, as exposure.\
   Log source: IIS / W3C web logs (W3CIISLog) or CEF/WAF logs (CommonSecurityLog). These tables need Microsoft Sentinel connected to the Defender portal; the hunt returns nothing until those logs are ingested.\
   Source: [Fly.io](https://community.fly.io/t/security-github-tokens-exposed-by-apps-deployed-from-github/29070)

Behaviours that map cleanly to log fields are included in [`hunt.kql`](hunt.kql) and [`hunt.spl`](hunt.spl), and alert behaviours in [`hunt.yaral`](hunt.yaral). The rest are listed in the Behaviours section above with where to look. Use behaviours to hunt and alert, never to block.

## Sources

- [Aikido – Compromised GitHub accounts push CI secret stealer to tens of thousands of repositories](https://www.aikido.dev/blog/compromised-github-accounts-push-ci-secret-stealer-to-tens-of-thousands-of-repositories)
- [SafeDep – wfx: GitHub Actions credential stealer hits 8,000 repos](https://safedep.io/blog/github-actions-wfx-credential-stealer)
- [The Hacker News – Attacker used 4,837 hijacked GitHub accounts to run a CI secret stealer](https://thehackernews.com/2026/11/4837-hijacked-github-accounts-ran-ci.html)
- [Fly.io – GitHub tokens exposed by apps deployed from GitHub](https://community.fly.io/t/security-github-tokens-exposed-by-apps-deployed-from-github/29070)

---

[Back to index](../../../../README.md)
