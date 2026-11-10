# Contributing to Rapid Threat Intel

Thanks for helping defenders move faster. Contributions of every size are welcome, from a single indicator to a full new threat.

## What you can contribute

- **New indicators** for a threat already listed, or a new threat entirely
- **Corrections**: wrong type, wrong confidence, broken source link, typos
- **False-positive reports**: an indicator that is shared or legitimate infrastructure and should not be blocked
- **Detections**: improved `hunt.kql` queries, or YARA-L, Sigma and other rules for a threat
- **Expired infrastructure**: indicators that have been taken down or reassigned

## Rules for indicators

1. **Public source required.** Every indicator must link to a published vendor, researcher, CERT or government report. No private, leaked or unverifiable data.
2. **Describe it.** Each indicator needs a one-line description of what it is (for example "SHA256 of the loader DLL dropped in %ProgramData%").
3. **Set the action honestly.** Use `block` only for high-confidence, attacker-owned infrastructure. Shared cloud, CDN and residential IPs should be `alert` or `monitor`.
4. **Defang in prose**, but keep raw values in the CSV columns so they can be imported.
5. **No personal data** about victims.

## How to submit

### Option 1: open an issue (easiest)

Open an [issue](https://github.com/daniyyell-dev/rapid-threat-intel/issues/new) with:

- Threat name and the source report link
- The indicators (one per line) with type and a short description
- Suggested action (`block`, `alert` or `monitor`) and confidence (`high`, `medium`, `low`)

### Option 2: pull request

1. Fork the repo and create a branch, e.g. `add-<threat-name>`.
2. For an existing threat, add rows to `threats/<YYYY-MM-DD>_<Threat-Name>/iocs.csv` using the same columns: `indicator,type,threat,confidence,recommended_action,source_url,notes,description`.
3. For a new threat, create a folder named `<YYYY-MM-DD>_<Readable-Threat-Name>` (date = when the main source report was published) with at least a `README.md` (summary, sources) and `iocs.csv`.
4. Keep `defender_xdr_indicators.csv` in the Microsoft Defender XDR bulk-import format if you edit it.
5. Open a pull request explaining what you added and linking the source.

Accepted changes are merged into the combined files in `all/` and the index table in the main README.

## Reporting a false positive

If an indicator is blocking something legitimate, open an issue titled `False positive: <indicator>` with what it blocked and why it is benign. These are handled first.

## Code of conduct

Be respectful and constructive. This project is for defensive use only; do not submit offensive tooling or anything intended to harm others.

## Contact

Daniel Jeremiah, [LinkedIn](https://www.linkedin.com/in/daniel-jeremiah)
