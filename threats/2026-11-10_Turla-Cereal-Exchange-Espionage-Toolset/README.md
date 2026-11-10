# Turla Cereal: Exchange Server Espionage Toolset

## Summary

ESET attributes Cereal, a previously undocumented modular .NET toolset, with high confidence to the Russia-aligned APT group Turla. It was found on Microsoft Exchange servers of governmental organisations in Kazakhstan (November 2025) and Romania, where an email collection module injected into legitimate Exchange processes taps the mail transport pipeline and was configured to pick out email sent to or from NATO and the EU. There is no external C2: the CerealNeuron passive backdoor turns the victim's own Exchange server into the C2 through HttpListener URL prefixes, and the loaders abuse DLL search-order hijacking and the .NET native image cache.

**Published:** 2026-11-10  
**First added:** 2026-11-10  
**Last updated:** 2026-11-10  
**Category:** APT / espionage  
**Indicators:** 26 (18 sha1, 5 url, 3 filename)  
**Block now:** 18

## MITRE ATT&CK

Mapped from the behaviour described in the sources.

- T1114 Email Collection
- T1505 Server Software Component
- T1574.001 DLL Search Order Hijacking
- T1055 Process Injection
- T1620 Reflective Code Loading

## Recommended actions

1. Hash-sweep every Exchange server for the SHA1 values below; test file blocks on one server first because the loaders use Exchange and WMI file names.
2. Hunt IIS and HTTP.sys logs for the CerealNeuron URL prefixes; ESET found no external C2 IPs to block.
3. Check System32\wbem for ncobjapi.dll and wbemcomn.dll copies whose hashes do not match Microsoft's.
4. If found, rebuild the Exchange server and review transport rules and mail flow for exfiltration.

## Files

- `block_now.txt` - high-confidence indicators to block
- `iocs.csv` - every indicator with description, confidence, action, source and notes
- `defender_xdr_indicators.csv` - Microsoft Defender XDR bulk import (block and audit)
- `hunt.kql` - Defender XDR advanced hunting query

## Indicators

| Indicator | Type | Description | Action | Confidence | Source |
|---|---|---|---|---|---|
| `4a3c263977417fb6977b0e598c9e3bc5924f390c` | sha1 | SHA1 of CerealLoader (ESET detection MSIL/Agent.YCC) written as Microsoft.Exchange.Data.Transport.ni.dll, the Turla Cereal loader on compromised Exchange servers; test the block on one server first. | block | high | [ESET - Turla Cereal white paper (PDF)](https://web-assets.esetstatic.com/wls/en/papers/white-papers/turla-cereal-tricks.pdf) |
| `7742c6b0aaf114335cef7ebab11290cb18a0b8b3` | sha1 | SHA1 of CerealLoader (ESET detection MSIL/Agent.YCC) written as version.dll, the Turla Cereal loader on compromised Exchange servers; test the block on one server first. | block | high | [ESET - Turla Cereal white paper (PDF)](https://web-assets.esetstatic.com/wls/en/papers/white-papers/turla-cereal-tricks.pdf) |
| `afe448dd95494cd14438f04f0c5f6b384664a3b7` | sha1 | SHA1 of CerealLoader (ESET detection MSIL/Agent.YCC) written as version.dll, the Turla Cereal loader on compromised Exchange servers; test the block on one server first. | block | high | [ESET - Turla Cereal white paper (PDF)](https://web-assets.esetstatic.com/wls/en/papers/white-papers/turla-cereal-tricks.pdf) |
| `4a65040646e354303f067d47aa1c953d467f65cb` | sha1 | SHA1 of CerealLoader (ESET detection MSIL/Agent.YCA) written as Microsoft.Search.Platform.dll, the Turla Cereal loader on compromised Exchange servers; test the block on one server first. | block | high | [ESET - Turla Cereal white paper (PDF)](https://web-assets.esetstatic.com/wls/en/papers/white-papers/turla-cereal-tricks.pdf) |
| `d1e17520a2435edcdcc47f582381416fbdf75f94` | sha1 | SHA1 of CerealLoader (ESET detection MSIL/Agent.YCA) written as Microsoft.Ceres.dll, the Turla Cereal loader on compromised Exchange servers; test the block on one server first. | block | high | [ESET - Turla Cereal white paper (PDF)](https://web-assets.esetstatic.com/wls/en/papers/white-papers/turla-cereal-tricks.pdf) |
| `7ab784d0049890d9844aee7f214ba173e3cc23be` | sha1 | SHA1 of CerealLoader (ESET detection MSIL/Agent.YCA) written as wbemcomn.dll, the Turla Cereal loader on compromised Exchange servers; test the block on one server first. | block | high | [ESET - Turla Cereal white paper (PDF)](https://web-assets.esetstatic.com/wls/en/papers/white-papers/turla-cereal-tricks.pdf) |
| `5d80118b1ee974936322475f740ab3aeff70b8f3` | sha1 | SHA1 of CerealLoader (ESET detection MSIL/Agent.YCC) written as EdgeTransport.ni.exe, the Turla Cereal loader on compromised Exchange servers; test the block on one server first. | block | high | [ESET - Turla Cereal white paper (PDF)](https://web-assets.esetstatic.com/wls/en/papers/white-papers/turla-cereal-tricks.pdf) |
| `d51c58c2e95d4561848e0a5a8b9fb33c847c50a4` | sha1 | SHA1 of CerealLoader (ESET detection MSIL/Agent.YCA) written as iph.dat, the Turla Cereal loader on compromised Exchange servers; test the block on one server first. | block | high | [ESET - Turla Cereal white paper (PDF)](https://web-assets.esetstatic.com/wls/en/papers/white-papers/turla-cereal-tricks.pdf) |
| `5b94fe76ec4feb0b5cb6ea3bca4c48d2fe22597b` | sha1 | SHA1 of CerealLoader (ESET detection MSIL/Agent.YCA) written as ncobjapi.dll, the Turla Cereal loader on compromised Exchange servers; test the block on one server first. | block | high | [ESET - Turla Cereal white paper (PDF)](https://web-assets.esetstatic.com/wls/en/papers/white-papers/turla-cereal-tricks.pdf) |
| `1408a8f62b09a5ad0dff279b2878d8f59f70a330` | sha1 | SHA1 of CerealLoader (ESET detection MSIL/Agent.YCC) written as Microsoft.Exchange.Search.Mdb.ni.dll, the Turla Cereal loader on compromised Exchange servers; test the block on one server first. | block | high | [ESET - Turla Cereal white paper (PDF)](https://web-assets.esetstatic.com/wls/en/papers/white-papers/turla-cereal-tricks.pdf) |
| `3d1a534ce0d0c293f62ece556cbc6d0728213104` | sha1 | SHA1 of CerealLoader (ESET detection MSIL/Agent.YCC) written as Microsoft.Exchange.EdgeSyncSvc.ni.exe, the Turla Cereal loader on compromised Exchange servers; test the block on one server first. | block | high | [ESET - Turla Cereal white paper (PDF)](https://web-assets.esetstatic.com/wls/en/papers/white-papers/turla-cereal-tricks.pdf) |
| `ad85fbf2cc879d4325bce1e6fb5f12ab59e3d387` | sha1 | SHA1 of CerealRunner (ESET detection MSIL/Agent.YBZ), a Turla Cereal module that runs in memory on compromised Exchange servers. | block | high | [ESET - Turla Cereal white paper (PDF)](https://web-assets.esetstatic.com/wls/en/papers/white-papers/turla-cereal-tricks.pdf) |
| `3ea03188dba8898d97e965732c1d6a68c5437edc` | sha1 | SHA1 of CerealSprinter (ESET detection MSIL/Agent.YBZ), a Turla Cereal module that runs in memory on compromised Exchange servers. | block | high | [ESET - Turla Cereal white paper (PDF)](https://web-assets.esetstatic.com/wls/en/papers/white-papers/turla-cereal-tricks.pdf) |
| `3fba18af966deacf7ae09e4d4238952dd90a6d6f` | sha1 | SHA1 of CerealHermit (ESET detection MSIL/Agent.YBZ), a Turla Cereal module that runs in memory on compromised Exchange servers. | block | high | [ESET - Turla Cereal white paper (PDF)](https://web-assets.esetstatic.com/wls/en/papers/white-papers/turla-cereal-tricks.pdf) |
| `eb9ba1da5363f5d04e2f98673595fce93f39a78e` | sha1 | SHA1 of CerealIron (ESET detection MSIL/Agent.YBZ), a Turla Cereal module that runs in memory on compromised Exchange servers. | block | high | [ESET - Turla Cereal white paper (PDF)](https://web-assets.esetstatic.com/wls/en/papers/white-papers/turla-cereal-tricks.pdf) |
| `0b4e4a1ce7fee91bfc62b2a2ec572c325642bb60` | sha1 | SHA1 of CerealMoth (ESET detection MSIL/Agent.YBZ), a Turla Cereal module that runs in memory on compromised Exchange servers. | block | high | [ESET - Turla Cereal white paper (PDF)](https://web-assets.esetstatic.com/wls/en/papers/white-papers/turla-cereal-tricks.pdf) |
| `a4e477ce257f2c635401ef554e05506c080967c0` | sha1 | SHA1 of the Turla Cereal x86 bootstrapper DLL (ESET detection Win32/Agent.AIOQ), run in memory on compromised Exchange servers. | block | high | [ESET - Turla Cereal white paper (PDF)](https://web-assets.esetstatic.com/wls/en/papers/white-papers/turla-cereal-tricks.pdf) |
| `a5be8706032a0798fd63214a9f22efa6309355f5` | sha1 | SHA1 of the Turla Cereal x64 bootstrapper DLL (ESET detection Win32/Agent.AIOQ), run in memory on compromised Exchange servers. | block | high | [ESET - Turla Cereal white paper (PDF)](https://web-assets.esetstatic.com/wls/en/papers/white-papers/turla-cereal-tricks.pdf) |
| `iph.dat` | filename | CerealLoader payload file name listed in the ESET IoC table. | alert | med | [ESET - Turla Cereal white paper (PDF)](https://web-assets.esetstatic.com/wls/en/papers/white-papers/turla-cereal-tricks.pdf) |
| `C:\Windows\System32\wbem\ncobjapi.dll` | filename | Path where CerealLoader is written and loaded by the WMI Provider Host; a legitimate file of the same name exists in System32, so check the hash. | alert | med | [ESET - Turla Cereal white paper (PDF)](https://web-assets.esetstatic.com/wls/en/papers/white-papers/turla-cereal-tricks.pdf) |
| `C:\Windows\System32\wbem\wbemcomn.dll` | filename | CerealLoader planted in System32\wbem for search-order hijacking of WmiPrvSE.exe; the legitimate copy lives in C:\Windows\System32, not \wbem. | alert | med | [ESET - Turla Cereal white paper (PDF)](https://web-assets.esetstatic.com/wls/en/papers/white-papers/turla-cereal-tricks.pdf) |
| `/owa/sdds/` | url | HttpListener prefix https://*:443/owa/sdds/ registered by the CerealNeuron passive backdoor on the victim's own Exchange server; hunt in IIS/HTTP.sys logs, not an external URL to block. | alert | med | [ESET - Turla Cereal white paper (PDF)](https://web-assets.esetstatic.com/wls/en/papers/white-papers/turla-cereal-tricks.pdf) |
| `/AUTODISCOVER/MICROSOFT.EXCHANGE.PROXYSERVICE/` | url | HttpListener prefix https://*:443/AUTODISCOVER/MICROSOFT.EXCHANGE.PROXYSERVICE/ registered by the CerealNeuron passive backdoor on the victim's own Exchange server; hunt in IIS/HTTP.sys logs, not an external URL to block. | alert | med | [ESET - Turla Cereal white paper (PDF)](https://web-assets.esetstatic.com/wls/en/papers/white-papers/turla-cereal-tricks.pdf) |
| `/AUTODISCOVER/INTEGRATED/API/` | url | HttpListener prefix https://*:443/AUTODISCOVER/INTEGRATED/API/ registered by the CerealNeuron passive backdoor on the victim's own Exchange server; hunt in IIS/HTTP.sys logs, not an external URL to block. | alert | med | [ESET - Turla Cereal white paper (PDF)](https://web-assets.esetstatic.com/wls/en/papers/white-papers/turla-cereal-tricks.pdf) |
| `/AUTODISCOVER/PROXYSERVICE/` | url | HttpListener prefix https://*:443/AUTODISCOVER/PROXYSERVICE/ registered by the CerealNeuron passive backdoor on the victim's own Exchange server; hunt in IIS/HTTP.sys logs, not an external URL to block. | alert | med | [ESET - Turla Cereal white paper (PDF)](https://web-assets.esetstatic.com/wls/en/papers/white-papers/turla-cereal-tricks.pdf) |
| `/MICROSOFT-SERVER-ACTIVESYNC/INTEGRATED/API/` | url | HttpListener prefix https://*:443/MICROSOFT-SERVER-ACTIVESYNC/INTEGRATED/API/ registered by the CerealNeuron passive backdoor on the victim's own Exchange server; hunt in IIS/HTTP.sys logs, not an external URL to block. | alert | med | [ESET - Turla Cereal white paper (PDF)](https://web-assets.esetstatic.com/wls/en/papers/white-papers/turla-cereal-tricks.pdf) |

## Sources

- [ESET - Turla Cereal white paper (PDF)](https://web-assets.esetstatic.com/wls/en/papers/white-papers/turla-cereal-tricks.pdf)
- [ESET WeLiveSecurity - Exchange for breakfast: Turla's Cereal tricks are not for kids](https://www.welivesecurity.com/en/eset-research/exchange-for-breakfast-turlas-cereal-tricks-are-not-for-kids/)
