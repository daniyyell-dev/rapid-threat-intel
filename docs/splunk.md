# Splunk

[Back to index](../README.md#use-the-data)

Each threat folder has two Splunk searches, and [`all/`](../all/) has a live-feed search, a lookup and example macros:

| File | Use |
|---|---|
| `hunt.spl` | Hunt over the Splunk Common Information Model (CIM) data models with `tstats` |
| `hunt_raw.spl` | The same hunt over raw events, for data not mapped to CIM |
| [`all/live_feed_hunt.spl`](../all/live_feed_hunt.spl) | Hunts every high-confidence indicator in the feed through a lookup |
| [`all/splunk_rti_iocs.csv`](../all/splunk_rti_iocs.csv) | Block-now indicators as a lookup (`indicator,type,threat`) |
| [`all/splunk_macros.conf`](../all/splunk_macros.conf) | Example `rti_*` macros that `hunt_raw.spl` calls |

## Run a hunt

Hunt first so you know whether a threat was already in your environment before you block it.

1. Open the threat's `hunt.spl` and copy it.
2. In **Search & Reporting**, set the time picker to the last 30 days, or back to the earliest activity in the threat's sources.
3. Paste the search and run it.

Results have one row per indicator, host and connection, with `first_seen`, `last_seen`, `ioc`, `ioc_type`, `data_model`, `host`, `user`, `src`, `dest`, `detail` and `count`.

The search reads these CIM data models, depending on the indicators: `Network_Traffic`, `Network_Resolution` (DNS), `Web`, `Endpoint` (processes and files) and `Email`. A data model with no data returns nothing, so the search still runs.

`summariesonly=false` also reads events that data model acceleration has not summarised yet. If your data models are accelerated, change it to `summariesonly=true` for a much faster search over the summarised range.

> [!NOTE]
> A URL indicator only matches that URL, not every page on its host, because many URLs sit on shared services such as paste sites or webhook hosts. Leads that are not network or hash indicators are not in the search; find them in `iocs.csv` and on the threat page.

## Behaviours

Where a threat has behaviours (indicators of attack) that map cleanly to log fields, `hunt.spl` adds them as extra sections. Their rows have `ioc_type` set to `behaviour (alert)` or `behaviour (hunt)`.

- Process, file, network and web behaviours use the CIM `Endpoint`, `Network_Traffic` and `Web` data models.
- Cloud and appliance behaviours read raw events: AWS CloudTrail (`sourcetype="aws:cloudtrail"` from the Splunk Add-on for AWS), Microsoft Entra ID logs (the Microsoft Azure and Microsoft Cloud Services add-on sourcetypes) and syslog lines from appliances and hypervisors. These sections use `index=*`; replace it with your own index names to make them faster.
- Behaviours that cannot be mapped to a reliable field are left out of the search; the threat page lists them with where to look.

> [!IMPORTANT]
> Behaviours are leads, not confirmed indicators, and can match legitimate activity. Compare any hit against your own baseline and environment before acting. Use them to hunt and alert, never to block.

## Data not mapped to CIM

`hunt_raw.spl` runs the same hunt over raw events through four search macros, which you define once to point at your own indexes and field names:

| Macro | Output fields |
|---|---|
| `rti_network(1)` | `src_ip`, `dest_ip`, `dest_port`, `action`, `user`, `dvc` |
| `rti_dns(1)` | `src`, `dest`, `query`, `answer`, `user` |
| `rti_web(1)` | `src`, `user`, `dest`, `url`, `http_user_agent`, `status`, `cookie` |
| `rti_endpoint(1)` | `dest`, `user`, `process`, `process_name`, `process_path`, `parent_process_name`, `process_hash`, `parent_process_hash`, `file_path`, `file_name`, `file_hash` |

1. Copy [`all/splunk_macros.conf`](../all/splunk_macros.conf) and change the `index=` constraints and the `coalesce()` field lists to match your data.
2. Add each macro in **Settings > Advanced search > Search macros**, with one argument named `terms`, or put the file in `$SPLUNK_HOME/etc/apps/<your_app>/local/macros.conf`.
3. Run the threat's `hunt_raw.spl` the same way as `hunt.spl`.

Each macro must keep `($terms$)` in its base search, which pre-filters raw events, and must only use streaming commands (`eval`, `rex`, `rename`, `spath`, `fields`, `search`), because the hunt runs the macros inside `multisearch`.

## Hunt with the live feed

[`all/live_feed_hunt.spl`](../all/live_feed_hunt.spl) hunts every high-confidence indicator in the feed at once through a lookup.

1. Download [`all/splunk_rti_iocs.csv`](../all/splunk_rti_iocs.csv).
2. In **Settings > Lookups > Lookup table files**, add it with the destination file name `rti_iocs.csv`.
3. Paste `live_feed_hunt.spl` into a search, set the time picker to the last 30 days and run it.

The feed updates every 2 hours at most and indicators expire after 90 days, so refresh the lookup on a schedule, for example with a job that downloads the raw file into your app's `lookups` folder:

```
https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/all/splunk_rti_iocs.csv
```

## Turn a hunt into an alert

1. Run the hunt and confirm the results look right in your environment.
2. Select **Save As > Alert**, set a schedule such as every hour over the last 65 minutes, and trigger when the number of results is greater than 0.
3. For `tstats` searches on accelerated data models, switch to `summariesonly=true` before scheduling.

## References

- [Splunk Common Information Model](https://help.splunk.com/en/splunk-enterprise-security-8/common-information-model/8.6/introduction/overview-of-the-splunk-common-information-model)
- [tstats command](https://help.splunk.com/en/splunk-enterprise/spl-search-reference/10.0/search-commands/tstats)
- [Search macros](https://help.splunk.com/en/splunk-enterprise/manage-knowledge-objects/knowledge-management-manual/10.4/search-macros/define-search-macros-in-settings)
