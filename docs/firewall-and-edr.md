# Firewalls and EDR

[Back to index](../README.md#how-to-use)

Most firewalls can pull a plain-text list from a URL and refresh it on a schedule. Point them at the raw files in this repository.

## Pick the right file

`block_now.txt` mixes IPs, domains, URLs and hashes, with `#` comment headers. Firewalls expect **one type per list**, so use the per-type files in `all/`:

| List type | Raw URL |
|---|---|
| IPv4 | https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/all/block_now_ipv4.txt |
| Domains | https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/all/block_now_domain.txt |
| URLs | https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/all/block_now_url.txt |
| SHA256 | https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/all/block_now_sha256.txt |
| SHA1 | https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/all/block_now_sha1.txt |

These hold one value per line with no comments, and contain only `high` confidence `block` indicators.

### Split a single threat

To block just one threat, split its `block_now.txt`:

```bash
URL="https://raw.githubusercontent.com/daniyyell-dev/rapid-threat-intel/main/threats/<YYYY-MM>_<Month-YYYY>/<YYYY-MM-DD>_<HHMM>_<Threat-Name>/block_now.txt"
curl -fsSL "$URL" | grep -Ev '^(#|$)' > all.txt
grep -E '^[0-9]{1,3}(\.[0-9]{1,3}){3}$' all.txt          > ipv4.txt
grep -E '://' all.txt                                    > urls.txt
grep -Ei '^[a-f0-9]{64}$' all.txt                        > sha256.txt
grep -Ei '^[a-f0-9]{40}$' all.txt                        > sha1.txt
grep -Evi '://|^[0-9.]+$|^[a-f0-9]{40}$|^[a-f0-9]{64}$' all.txt > domains.txt
```

Host the output files on an internal web server your firewall can reach.

## Palo Alto Networks (PAN-OS)

1. Go to **Objects > External Dynamic Lists** and select **Add**.
2. Set **Type** to **IP List**, **Domain List** or **URL List**, and set **Source** to the matching raw URL above.
3. Set the repeat interval, for example hourly, and commit.
4. Use the IP list as a destination in a deny security policy rule, the URL list in a URL Filtering profile, and the domain list in an Anti-Spyware profile's DNS policies.

PAN-OS strips `http://` and `https://` from URL list entries, so the full URLs work as is.

## Fortinet (FortiGate)

1. Go to **Security Fabric > External Connectors** and select **Create New**.
2. Under **External Feeds**, choose **IP Address**, **Domain Name**, **FortiGuard Category** (for URLs) or **Malware Hash**.
3. Set **URI of external resource** to the matching raw URL and a refresh rate.
4. Use the IP feed in firewall policies, the domain feed in a DNS filter profile, the category in a web filter profile, and the hash feed in an antivirus profile with the external malware block list turned on.

Fortinet recommends one hash type per malware hash feed, so use the SHA256 and SHA1 files separately.

## pfSense and OPNsense

Both accept IP lists only.

1. **pfSense:** go to **Firewall > Aliases > URLs**, add an alias of type **URL Table (IPs)** with the IPv4 raw URL.
   **OPNsense:** go to **Firewall > Aliases**, add an alias of type **URL Table (IPs)** with the IPv4 raw URL.
2. Use the alias as the destination (outbound) or source (inbound) in a block rule.

## EDR and other tools

- **Microsoft Defender for Endpoint:** import `defender_xdr_indicators.csv` instead. See the [Defender XDR guide](defender-xdr.md).
- **Other EDRs:** most accept SHA256 lists; use `block_now_sha256.txt`.

> [!WARNING]
> Lists in this repository change as threats are added and indicators expire. Review what a list contains before enforcing it, and keep a way to allow-list a false positive quickly.

## References

- [PAN-OS external dynamic list formatting](https://docs.paloaltonetworks.com/network-security/security-policy/administration/objects/external-dynamic-lists/formatting-guidelines-for-an-external-dynamic-list)
- [FortiGate external feeds](https://docs.fortinet.com/document/fortigate/8.0.2/administration-guide/9463/external-feeds)
