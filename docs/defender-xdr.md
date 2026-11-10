# Microsoft Defender XDR

[Back to index](../README.md#how-to-use)

Each threat folder has two Defender files:

| File | Use |
|---|---|
| `hunt.kql` | Advanced hunting query to find past activity |
| `defender_xdr_indicators.csv` | Bulk import of custom indicators (block and audit) |

[`all/defender_xdr_indicators.csv`](../all/defender_xdr_indicators.csv) combines every threat.

## Run a hunt

Hunt first so you know whether a threat was already in your environment before you block it.

1. Open the threat's `hunt.kql` and copy it.
2. In the [Microsoft Defender portal](https://security.microsoft.com), go to **Hunting > Advanced hunting**.
3. Paste the query into a new query tab, click inside it, and select **Run query**.

The query searches the last 30 days, the advanced hunting maximum, across endpoint, email and Entra ID sign-in tables. Tables your tenant does not license are skipped (`union isfuzzy=true`). Results are grouped by table, entity and indicator, with first seen, last seen and hit count.

> [!NOTE]
> Leads that are not network or hash indicators, such as file names or URL paths seen only by the attacker's server, are listed as comments at the end of the query. Search for them manually.

## Import indicators

1. Download the threat's `defender_xdr_indicators.csv`.
2. In the Defender portal, go to **Settings > Endpoints > Indicators** (under **Rules**).
3. Select the tab for the indicator type, then **Import > Choose file**, pick the CSV and select **Import**.
4. Select **Done**.

> [!WARNING]
> Only 500 indicators can be uploaded per batch, and a tenant can hold 15,000 indicators in total. Split `all/defender_xdr_indicators.csv` if it grows past 500 rows.

Things to know before importing:

- **Actions.** High-confidence attacker infrastructure is `Block`; file hashes are `Block` or `BlockAndRemediate`. Shared infrastructure, such as cloud or proxy IPs, is `Audit` with an alert, so it is detected but not blocked.
- **Expiry.** Every row expires 90 days after it was added (`ExpirationTime`), because attacker infrastructure is often reassigned.
- **Network indicators** need network protection turned on in block mode on your devices. IP indicators act on outbound connections from the device, so block inbound attacker IPs at the firewall. Full URL paths are enforced in Microsoft Edge for HTTPS; domains and IPs work in any browser.
- **File hashes** do not apply when Microsoft Defender Antivirus runs in passive mode. Test them on one device first where a threat reuses legitimate file names.

## Turn a hunt into a detection rule

Custom detection rules run a query on a schedule and raise alerts. The shipped `hunt.kql` summarises results, so adapt it to return single events with the columns Defender needs: `Timestamp`, `DeviceId` and `ReportId`.

Example for the domains of one threat:

```kusto
let Domains = dynamic(["tac.vpnla.org"]);
DeviceNetworkEvents
| where RemoteUrl has_any (Domains)
| project Timestamp, DeviceId, DeviceName, ReportId, RemoteUrl, RemoteIP, InitiatingProcessFileName
```

1. Run the query in **Advanced hunting** and check the results.
2. Select **Create detection rule**.
3. Set the name, frequency, alert title, severity, category and MITRE techniques (take these from the threat's README).
4. Choose response actions, such as isolating the device, and the device scope.
5. Review and select **Create**.

A rule can raise at most 150 alerts per run. A rule that queries one table, uses no `union` or `join` and has no comment lines can run as **Continuous (NRT)**.

## References

- [Manage indicators](https://learn.microsoft.com/en-us/defender-endpoint/indicator-manage)
- [Indicators overview and limits](https://learn.microsoft.com/en-us/defender-endpoint/indicators-overview)
- [Create custom detection rules](https://learn.microsoft.com/en-us/defender-xdr/custom-detection-rules)
