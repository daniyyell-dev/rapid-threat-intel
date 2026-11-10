# Contributing

Thanks for helping defenders move faster. Contributions of any size are welcome, from one indicator to a whole new threat.

## What to contribute

- **New indicators** for a listed threat, or a new threat
- **Corrections**: wrong type or confidence, broken source link, typos
- **False positives**: shared or legitimate infrastructure that should not be blocked
- **Detections**: better `hunt.kql` queries, or YARA-L, Sigma and other rules
- **Expired infrastructure**: indicators that were taken down or reassigned

## Rules for indicators

1. **Public source required.** Link a published vendor, researcher, CERT or government report. No private, leaked or unverifiable data.
2. **Describe it.** One line on what the indicator is, for example "SHA256 of the loader DLL dropped in %ProgramData%".
3. **Set the action honestly.** `block` only for high-confidence, attacker-owned infrastructure. Shared cloud, CDN and residential IPs are `alert` or `monitor`.
4. **Raw values in CSV.** Defang in prose only, so files stay importable.
5. **No personal data** about victims.

Column definitions are in [docs/data-format.md](docs/data-format.md).

## How to submit

### Open an issue (easiest)

- [New indicators](https://github.com/daniyyell-dev/rapid-threat-intel/issues/new?template=new-indicators.yml)
- [False positive](https://github.com/daniyyell-dev/rapid-threat-intel/issues/new?template=false-positive.yml)

### Open a pull request

1. Fork the repository and create a branch, for example `add-<threat-name>`.
2. **Existing threat:** add rows to `threats/<YYYY-MM>_<Month-YYYY>/<YYYY-MM-DD>_<Threat-Name>/iocs.csv` with the same columns.
3. **New threat:** create `threats/<YYYY-MM>_<Month-YYYY>/<YYYY-MM-DD>_<Readable-Threat-Name>/`, dated by the main source report's publication (for example `threats/2026-11_November-2026/2026-11-10_Example-Threat/`), with at least `README.md` (summary and sources) and `iocs.csv`.
4. If you edit `defender_xdr_indicators.csv`, keep Microsoft's bulk-import format.
5. Open the pull request and complete the [checklist](.github/pull_request_template.md).

Accepted changes are merged into `all/` and the index in the main README.

## False positives

Use the [false-positive form](https://github.com/daniyyell-dev/rapid-threat-intel/issues/new?template=false-positive.yml). These are handled first. For anything sensitive, follow [SECURITY.md](SECURITY.md).

## Code of conduct

Be respectful and constructive. This project is for defence only; do not submit offensive tooling or anything meant to harm others.

## Contact

Daniel Jeremiah: [LinkedIn](https://www.linkedin.com/in/daniel-jeremiah) · [daniyyell.com](https://daniyyell.com/)
