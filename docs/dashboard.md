# Live feed dashboard

[Back to index](../README.md#how-to-use)

This is a dark, responsive GitHub Pages site for this repository. It is for SOC analysts, threat hunters and incident responders who need to check an indicator, read a short research summary and download ready-to-use files without browsing the folder tree.

The page is built from the same curated data as the repository. Threats appear newest first. JavaScript is required; if it is turned off, a notice points you to the [repository](https://github.com/daniyyell-dev/rapid-threat-intel).

> **Live URL:** https://daniyyell.com/rapid-threat-intel/

## Handling live indicators safely

> [!CAUTION]
> **Handle all indicators as live and malicious.** Do not visit, open, download or resolve any IP address, domain, URL or file listed here from a corporate or personal device. Analyse them only in an isolated environment, such as a hosted sandbox like [ANY.RUN](https://any.run/) or a self-hosted one like [OpenSandbox](https://github.com/opensandbox-group/OpenSandbox), and follow your organisation's security policies. These indicators are provided for defensive use only, and the maintainers accept no responsibility for any damage, data loss or policy breach caused by their misuse or careless handling.

The same wording is shown in the red caution box at the top of the dashboard. Network indicators on the page are defanged and are never links; use a sandbox if you need to analyse the real value.

## What's on the page

A slim top bar stays pinned on every view: the *Rapid Threat Intel* mark (which returns to the live feed), the last-updated time in UK time, and links to this guide, the repository and `feed.json`. The footer is also on every view.

**Headline.** The same as the repository: *High-impact threat intelligence and IOCs, researched and ready to deploy*.

**Caution.** The red box above, word for word.

**Stats.** Four figures, beside the headline on wide screens, from the current feed: number of threats, number of indicators, how many are high-confidence *block now*, and the last-updated date and time in UK time (Europe/London).

**Check an indicator.** A search box for an IP address, domain, URL or hash. Defanged input is accepted, and pressing `/` anywhere on the page jumps to it (`Esc` clears it). See [Search and filters](#search-and-filters).

**Live feed.** One row per threat, newest first. Each row shows when it was added (UK time), with a *New today* mark when the threat was added on the most recent entry date in the feed, the category, name and one-line headline, the report's published date, the indicator count, how many are set to block now, and a coloured bar with a count per indicator type. Each row also lists the affected countries (code and name, up to four plus a count of the rest) or regions, and the sectors, or *Not stated*. Open a row to go to `#threat/<id>`.

**Filters.** Category, indicator type, country or region, sector and date added, plus *Reset filters*. On wide screens they sit in a column to the left of the feed; on phones they sit above it. See below.

**Countries affected.** A ranked list of the countries named in the sources, with how many threats name each one and a short bar, followed by the regions (for example *Global* or *Latin America*). Select a country or region to filter the feed to it; select it again to clear. It sits between the filters and the combined files on wide screens, and above the feed on phones.

**Combined files.** A list, under the filters (or below the feed on phones), of links that download the latest files from [`all/`](../all/): the grouped block list, one clean list per type (IPv4, domain, URL, SHA256, SHA1), the Defender XDR import file, the full indicators CSV and the live-feed hunting query. These URLs always serve the current data, so a firewall, proxy, EDR or SIEM can point at them.

**Footer.** A one-line *Scope* note with an *Open an issue* link; *Project* links with icons (Repository, Dashboard documentation, Contributing guide, Open an issue and [`feed.json`](../site/feed.json)); *Visitors* (all time, last 24 hours and top countries), counted anonymously by GoatCounter with no cookies; a credit line (maintainer, MIT Licence, defensive use only); and a small *Sponsored by* credit.

### Threat detail (`#threat/<id>`)

The address `#threat/Storm-3358-ARTEX-Agentic-Intrusions-Financial-Sector` is a stable link to that threat. The *Live feed* link at the top returns to the feed. If the id is no longer in the feed, a short notice is shown.

The detail view has:

- Category and *block now* counts, the full name and headline
- Facts: published date, date and time added (UK time), last updated, indicator count and block-now count
- **Downloads** for that threat's files, plus *View folder in repository* (in the right-hand column on wide screens)
- A note when the threat has a caveat (for example that some IPs may no longer be in use)
- **Summary** — the research write-up
- **Affected countries and sectors** — the countries named in the sources (two-letter ISO code and name), any regions such as *Latin America* or *Global*, the targeted sectors, a one-line note on scope and the source it came from. Anything the sources do not state is shown as *Not stated in the sources*.
- **Recommended actions** — an ordered list
- **MITRE ATT&CK** — techniques linking to [attack.mitre.org](https://attack.mitre.org/)
- **Sources** — the published reports
- **Indicators** — a table of every indicator, with a text filter and a type filter. On a narrow screen the rows stack as cards. Columns are indicator, type, confidence, action, and description with source.

## Search and filters

**Search** looks up a value across every indicator in the feed. Paste a real or defanged value (for example `hxxp`, `[.]`, `(.)`, `{.}`, `[:]` or `[@]`) and select *Check*. The address bar becomes `#search/<value>` so the query can be shared. Matching ignores case; for URLs it also ignores the scheme and a trailing slash.

Results are grouped as:

| Kind | When it appears |
|---|---|
| Exact match | The value is in the feed (highlighted) |
| Related | A URL on the same host, a URL whose host is a listed domain or IP, a listed domain that is a parent of your query, or a subdomain of a listed domain |
| Partial | The indicator value contains your query, if the query is at least six characters |

Up to 50 results are shown. Each row is defanged, with a copy button, type, confidence, recommended action, a link to the threat and the one-line description.

If nothing matches, the page says the value is not in this feed, and that this does not mean it is safe: the feed only covers selected high-impact threats.

**Filters** apply to the feed list, not to search:

| Filter | What it does |
|---|---|
| Category | Threats in that category |
| Indicator type | Threats that have at least one indicator of that type. Opening a threat preselects the same type in the detail table |
| Date added | Threats added on that calendar day. Days are grouped by month, newest first |
| Country or region | Threats whose sources name that country (listed with its two-letter code) or region. *Not stated* shows threats whose sources name neither |
| Sector | Threats whose sources name that sector. *Not stated* shows threats with no sector in their sources |
| Reset filters | Clears all the filters |

Each option shows how many threats match it. The count next to the *Live feed* heading reads *n threats, newest first* when nothing is filtered, or *n of m threats* when something is. A filter that is in use is outlined in pink.

## Defanging and the copy button

Indicators are never rendered as links. What you see is defanged; what you copy is the real value. The button briefly changes to *Copied* and a short confirmation appears when the copy succeeds.

| Type | Shown as |
|---|---|
| IPv4 and domain | Dots become `[.]`, for example `199[.]19[.]95[.]66` |
| URL | `http` becomes `hxxp`, `ftp` becomes `fxp`, and the host is defanged |
| Email | `@` becomes `[@]` and dots become `[.]` |
| `other` values that look like hostnames | Dots become `[.]` |
| Hashes, file names and other identifiers | Shown as they are |

Treat a copied value as live and malicious. Do not paste it into a browser or a production tool on a corporate or personal device.

## Downloads

Each download link fetches the file from `raw.githubusercontent.com` and saves it under the suggested name (per-threat files are prefixed with the threat id). If the fetch fails, the raw URL opens in a new tab.

**Combined files** (`all/`), in order:

| File | Use |
|---|---|
| `block_now.txt` | High-confidence `block` indicators from every threat, grouped by type |
| `block_now_ipv4.txt`, `block_now_domain.txt`, `block_now_url.txt`, `block_now_sha256.txt`, `block_now_sha1.txt` | One type per file, one value per line, no comments, for a firewall, DNS or EDR list |
| `defender_xdr_indicators.csv` | Microsoft Defender XDR bulk import for every threat |
| `iocs.csv` | Every indicator with description and source, for a SIEM or TIP |
| `live_feed_hunt.kql` | Defender advanced hunting query that loads the live lists itself |

Stable raw URLs follow `https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/all/<file>`.

**Per-threat files**, in order: `block_now.txt` (always), `defender_xdr_indicators.csv` (when the threat has rows Defender can import), `hunt.kql` (when a query exists), and `iocs.csv` (always). A threat with no network or hash indicators, such as a behaviour-only proof of concept, has no Defender import file.

Formats, confidence values and the 90-day Defender expiry are in [Data format](data-format.md).

## The JSON feed (`site/feed.json`)

The dashboard loads [`site/feed.json`](../site/feed.json) from the same folder as the page (on Pages, `<site-url>/feed.json`). It is UTF-8 JSON, rebuilt from the same data as the repository and written only when the content changes. Indicator `value` fields are the real (not defanged) values; defanging happens only in the UI.

### Top-level fields

| Field | Type | Description | Example |
|---|---|---|---|
| `title` | string | Project name | `"Rapid Threat Intel"` |
| `description` | string | Headline | `"High-impact threat intelligence and IOCs, researched and ready to deploy"` |
| `repository` | string | Repository URL | `"https://github.com/daniyyell-dev/rapid-threat-intel"` |
| `documentation` | string | This guide | `"https://github.com/daniyyell-dev/rapid-threat-intel/blob/main/docs/dashboard.md"` |
| `licence` | string | Licence | `"MIT"` |
| `last_updated` | string | Newest threat's last-updated value, `YYYY-MM-DD HH:MM` UK time (or `YYYY-MM-DD`) | `"2026-11-11 03:52"` |
| `threat_count` | integer | Number of threats | `12` |
| `indicator_count` | integer | Indicators across all threats | `464` |
| `block_now_count` | integer | Indicators that are both `high` confidence and `block` | `254` |
| `combined_files` | array | Files in `all/`, in the order listed above | see file objects |
| `threats` | array | Threat objects, newest first (by internal entry order `seq`) | see below |

### File objects (`combined_files[]` and `threats[].files[]`)

| Field | Type | Description | Example |
|---|---|---|---|
| `name` | string | File name in the repository | `"block_now_ipv4.txt"` |
| `label` | string | Button label | `"IPv4 block list"` |
| `note` | string or null | Short hint, on combined files only | `"every threat, grouped"` |
| `url` | string | Raw file on `main` | `"https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/all/block_now_ipv4.txt"` |
| `download` | string | Suggested save-as name | `"Storm-3358-ARTEX-Agentic-Intrusions-Financial-Sector_block_now.txt"` |

### Threat objects (`threats[]`)

| Field | Type | Description | Example |
|---|---|---|---|
| `id` | string | Folder name; used in `#threat/<id>` | `"Storm-3358-ARTEX-Agentic-Intrusions-Financial-Sector"` |
| `folder` | string | Path of the threat folder | `"threats/2026-11_November-2026/2026-11-11/Storm-3358-ARTEX-Agentic-Intrusions-Financial-Sector"` |
| `name` | string | Full name | `"Storm-3358 ARTEX Agentic Intrusions Against the Financial Sector"` |
| `short` | string | Short name | `"Storm-3358 ARTEX financial intrusions"` |
| `category` | string | Category | `"Financially motivated intrusion / financial sector"` |
| `published` | string | Publication date of the main source report, `YYYY-MM-DD` | `"2026-11-06"` |
| `entry_date` | string | When it was added, `YYYY-MM-DD HH:MM` UK time | `"2026-11-11 03:52"` |
| `last_updated` | string | Last update of this threat, `YYYY-MM-DD` | `"2026-11-11"` |
| `seq` | integer | Internal entry order; higher is newer | `12` |
| `headline` | string | One-line summary | `"Agentic AI framework used to exploit web apps at banks and drop WISP, vshell and AdaptixC2 RATs"` |
| `summary` | string | Research summary | `"Microsoft Threat Intelligence reports that Storm-3358..."` |
| `caveat` | string or null | Caution about the data, if any | `null` |
| `targets` | object | Affected countries, regions and sectors, recorded only from the threat's own sources (see below) | `{"countries": [{"code": "KZ", "name": "Kazakhstan"}, {"code": "RO", "name": "Romania"}], "regions": [], "sectors": ["Government"], "note": "...", "source": {"url": "...", "label": "..."}}` |
| `mitre` | array | `{id, name, url}` ATT&CK techniques | `{"id": "T1595", "name": "Active Scanning", "url": "https://attack.mitre.org/techniques/T1595/"}` |
| `recommended_actions` | array of string | Ordered actions | `"Block the ARTEX server and C2 addresses at the perimeter and in Defender XDR, ..."` |
| `sources` | array | `{url, label}` source reports | `{"url": "https://www.microsoft.com/en-us/security/blog/2026/11/06/artex-abuse-expands-as-cybercriminals-target-financial-sector/", "label": "Microsoft Threat Intelligence – ARTEX abuse expands as cybercriminals target financial sector"}` |
| `indicator_count` | integer | Indicators for this threat | `8` |
| `block_now_count` | integer | High-confidence `block` indicators | `8` |
| `indicator_counts` | object | Count per type | `{"ipv4": 8}` |
| `files` | array | Per-threat downloads (see file objects) | |
| `repo_url` | string | GitHub folder URL | `"https://github.com/daniyyell-dev/rapid-threat-intel/tree/main/threats/2026-11_November-2026/2026-11-11/Storm-3358-ARTEX-Agentic-Intrusions-Financial-Sector"` |
| `indicators` | array | Indicator objects | |

### Target objects (`threats[].targets`)

Targets are recorded by hand from each threat's cited sources, never inferred. An empty list means the sources do not state it, and the dashboard shows *Not stated*.

| Field | Type | Description | Example |
|---|---|---|---|
| `countries` | array | `{code, name}` with ISO 3166-1 alpha-2 codes, only countries a source names | `{"code": "UA", "name": "Ukraine"}` |
| `regions` | array of string | Regions a source names, or `Global` when the source describes worldwide or internet-wide activity | `["Southeast Asia", "Global"]` |
| `sectors` | array of string | Targeted sectors or industries a source names | `["Financial services"]` |
| `note` | string or null | One line on scope and limits (for example, that only some of 21 countries are named) | |
| `source` | object or null | `{url, label}` of the source the targets came from | |

### Indicator objects (`threats[].indicators[]`)

| Field | Type | Description | Example |
|---|---|---|---|
| `value` | string | Real, not defanged, value | `"199.19.95.66"` |
| `type` | string | `ipv4`, `domain`, `url`, `sha256`, `sha1`, `filename`, `email`, `eth_address`, `xmr_address`, `ssh_pubkey`, `session_id`, `function_selector`, `other` | `"ipv4"` |
| `confidence` | string | `high`, `med` or `low` | `"high"` |
| `recommended_action` | string | `block`, `alert` or `monitor` | `"block"` |
| `description` | string | One-line description | `"WISP remote access trojan C2 node used by Storm-3358 against financial organisations, first seen 2 Nov 2026."` |
| `source_url` | string or null | Report the indicator came from | `"https://www.microsoft.com/en-us/security/blog/2026/11/06/artex-abuse-expands-as-cybercriminals-target-financial-sector/"` |
| `source_label` | string or null | Readable source name | `"Microsoft Threat Intelligence – ARTEX abuse expands as cybercriminals target financial sector"` |

`block` means attacker-owned infrastructure or malware and is safe to block. `alert` is likely malicious but shared (for example a cloud or VPN IP): detect, do not block. `monitor` is context or a hunt lead. `block_now` counts only indicators that are both `high` and `block`.

Short example (trimmed):

```json
{
  "last_updated": "2026-11-11 03:52",
  "threat_count": 12,
  "indicator_count": 464,
  "block_now_count": 254,
  "threats": [
    {
      "id": "Storm-3358-ARTEX-Agentic-Intrusions-Financial-Sector",
      "name": "Storm-3358 ARTEX Agentic Intrusions Against the Financial Sector",
      "category": "Financially motivated intrusion / financial sector",
      "published": "2026-11-06",
      "entry_date": "2026-11-11 03:52",
      "indicator_counts": {"ipv4": 8},
      "indicators": [
        {
          "value": "199.19.95.66",
          "type": "ipv4",
          "confidence": "high",
          "recommended_action": "block",
          "description": "WISP remote access trojan C2 node used by Storm-3358 against financial organisations, first seen 2 Nov 2026.",
          "source_url": "https://www.microsoft.com/en-us/security/blog/2026/11/06/artex-abuse-expands-as-cybercriminals-target-financial-sector/",
          "source_label": "Microsoft Threat Intelligence – ARTEX abuse expands as cybercriminals target financial sector"
        }
      ]
    }
  ]
}
```

## Using the feed in SOC tooling

Point tools at the raw GitHub URLs, which always serve the latest files on `main`. Hunt before you block, and test file-hash blocks on one host first where a threat reuses a legitimate file name.

Fetch the JSON feed or a block list with curl:

```bash
curl -fsSL https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/site/feed.json -o feed.json
curl -fsSL https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/all/block_now_ipv4.txt
```

To list threat names from the feed:

```bash
curl -fsSL https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/site/feed.json \
  | jq -r '.threats[] | "\(.entry_date)\t\(.name)\t\(.block_now_count) to block"'
```

The same in PowerShell:

```powershell
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/site/feed.json" -OutFile feed.json
(Invoke-RestMethod "https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/site/feed.json").threats |
  Select-Object entry_date, name, block_now_count
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/all/block_now_ipv4.txt" -OutFile block_now_ipv4.txt
```

**Microsoft Defender XDR.** Download `defender_xdr_indicators.csv` (combined or per threat). In the [Defender portal](https://security.microsoft.com) go to **Settings > Endpoints > Indicators**, select the tab for the indicator type, then **Import**. Only 500 indicators can be uploaded per batch. To hunt, paste `live_feed_hunt.kql` (every threat) or a threat's `hunt.kql` into **Hunting > Advanced hunting** and run it. The live-feed query loads the current per-type lists with `externaldata`, so it does not need to be edited when the feed changes. Step-by-step: [Microsoft Defender XDR](defender-xdr.md).

**Google Security Operations.** Load the per-type `block_now_*.txt` files into data tables (one value per line, no comments) and match UDM events with YARA-L 2.0 rules. The JSON feed is useful where you want descriptions and sources as well as values; the plain lists are the direct import path. Step-by-step: [Google SecOps](google-secops.md).

For firewalls, proxies and EDR lists, see [Firewalls and EDR](firewall-and-edr.md).

## Update cycle

The repository, the dashboard and `feed.json` are updated about every 2 hours, and only when there is high-impact, confirmed activity with published indicators. Each rebuild uses the same data. Files are written only when their content actually changes, so an unchanged threat keeps its previous update time.

## Publishing and self-hosting

The dashboard is the `site/` folder on `main`: `index.html`, `style.css`, `app.js`, `feed.json`, the `fonts/` folder (self-hosted Roboto and Roboto Mono, SIL Open Font License, licences in `fonts/OFL-Roboto.txt` and `fonts/OFL-RobotoMono.txt`), the `img/` folder (the project logo and banner, cut and resized from `assets/banner-dark.png` and `assets/banner-dark.webp`) and `.nojekyll`. Publish that folder as the GitHub Pages site root (for example with GitHub Actions, or by using the branch and folder your Pages settings serve). The page loads `feed.json` from the same folder, so keep those files together.

> **Live URL:** https://daniyyell.com/rapid-threat-intel/

A threat can be opened as `<site-url>/#threat/<id>` and a search as `<site-url>/#search/<value>`. The JSON feed is at `<site-url>/feed.json`.

The page is self-hosted. It uses a strict Content-Security-Policy (same origin for styles and fonts; scripts only from itself and GoatCounter; connections only to itself, `raw.githubusercontent.com` and GoatCounter), sends no referrer, and loads no third-party fonts. The only third-party script is GoatCounter's cookie-free visit counter.

**Fork.** Fork the repository and enable GitHub Pages in the same way. Download links in the shipped `feed.json` point at this project's raw files on `main` unless you regenerate the feed in your fork.

**Self-host.** Copy the contents of `site/` to any static web server or object store and serve them as a site. The search, filters and detail views will work as long as `feed.json` is next to `index.html`. Downloads still come from the raw GitHub URLs listed in the feed.

## Limitations

This is not a full threat feed. We leave out routine threat intel and noise, and only publish confirmed attacks that are actively happening and have high impact. We also watch dark-web leak posts, social media and security websites for early warning. A threat only goes in once a reputable vendor, researcher or government source publishes indicators for it. Unverified claims are never published. Because we focus on the threats that matter, some activity will be missing on purpose. If you think we've missed something important, please [open an issue](https://github.com/daniyyell-dev/rapid-threat-intel/issues/new/choose) or contribute through the [contributing guide](../CONTRIBUTING.md).

A value that is not in the feed is not necessarily safe. Infrastructure also changes hands quickly, so verify indicators against your environment before blocking in production. The dashboard is provided as is, for defensive use only.

## Contributing

New indicators, corrections, false-positive reports and better detections are welcome, and so are fixes or improvements to the dashboard. Read [CONTRIBUTING.md](../CONTRIBUTING.md), then open an [issue](https://github.com/daniyyell-dev/rapid-threat-intel/issues/new/choose) or a pull request. To report a security problem privately, see [SECURITY.md](../SECURITY.md).
