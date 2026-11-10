# Turla (FSB) - Cereal Exchange espionage toolset

**Category:** APT / espionage  
**Last updated:** 2026-11-10  
**Indicators:** 26 (18 sha1, 5 url, 3 filename)  
**Block now:** 18

## Files

- `block_now.txt` - high-confidence indicators to block
- `iocs.csv` - every indicator with confidence, action, source and notes
- `defender_xdr_indicators.csv` - Microsoft Defender XDR bulk import (block and audit)
- `hunt.kql` - Defender XDR advanced hunting query

## Indicators

| Indicator | Type | Action | Confidence | Source |
|---|---|---|---|---|
| `4a3c263977417fb6977b0e598c9e3bc5924f390c` | sha1 | block | high | [web-assets.esetstatic.com](https://web-assets.esetstatic.com/wls/en/papers/white-papers/turla-cereal-tricks.pdf) |
| `7742c6b0aaf114335cef7ebab11290cb18a0b8b3` | sha1 | block | high | [web-assets.esetstatic.com](https://web-assets.esetstatic.com/wls/en/papers/white-papers/turla-cereal-tricks.pdf) |
| `afe448dd95494cd14438f04f0c5f6b384664a3b7` | sha1 | block | high | [web-assets.esetstatic.com](https://web-assets.esetstatic.com/wls/en/papers/white-papers/turla-cereal-tricks.pdf) |
| `4a65040646e354303f067d47aa1c953d467f65cb` | sha1 | block | high | [web-assets.esetstatic.com](https://web-assets.esetstatic.com/wls/en/papers/white-papers/turla-cereal-tricks.pdf) |
| `d1e17520a2435edcdcc47f582381416fbdf75f94` | sha1 | block | high | [web-assets.esetstatic.com](https://web-assets.esetstatic.com/wls/en/papers/white-papers/turla-cereal-tricks.pdf) |
| `7ab784d0049890d9844aee7f214ba173e3cc23be` | sha1 | block | high | [web-assets.esetstatic.com](https://web-assets.esetstatic.com/wls/en/papers/white-papers/turla-cereal-tricks.pdf) |
| `5d80118b1ee974936322475f740ab3aeff70b8f3` | sha1 | block | high | [web-assets.esetstatic.com](https://web-assets.esetstatic.com/wls/en/papers/white-papers/turla-cereal-tricks.pdf) |
| `d51c58c2e95d4561848e0a5a8b9fb33c847c50a4` | sha1 | block | high | [web-assets.esetstatic.com](https://web-assets.esetstatic.com/wls/en/papers/white-papers/turla-cereal-tricks.pdf) |
| `5b94fe76ec4feb0b5cb6ea3bca4c48d2fe22597b` | sha1 | block | high | [web-assets.esetstatic.com](https://web-assets.esetstatic.com/wls/en/papers/white-papers/turla-cereal-tricks.pdf) |
| `1408a8f62b09a5ad0dff279b2878d8f59f70a330` | sha1 | block | high | [web-assets.esetstatic.com](https://web-assets.esetstatic.com/wls/en/papers/white-papers/turla-cereal-tricks.pdf) |
| `3d1a534ce0d0c293f62ece556cbc6d0728213104` | sha1 | block | high | [web-assets.esetstatic.com](https://web-assets.esetstatic.com/wls/en/papers/white-papers/turla-cereal-tricks.pdf) |
| `ad85fbf2cc879d4325bce1e6fb5f12ab59e3d387` | sha1 | block | high | [web-assets.esetstatic.com](https://web-assets.esetstatic.com/wls/en/papers/white-papers/turla-cereal-tricks.pdf) |
| `3ea03188dba8898d97e965732c1d6a68c5437edc` | sha1 | block | high | [web-assets.esetstatic.com](https://web-assets.esetstatic.com/wls/en/papers/white-papers/turla-cereal-tricks.pdf) |
| `3fba18af966deacf7ae09e4d4238952dd90a6d6f` | sha1 | block | high | [web-assets.esetstatic.com](https://web-assets.esetstatic.com/wls/en/papers/white-papers/turla-cereal-tricks.pdf) |
| `eb9ba1da5363f5d04e2f98673595fce93f39a78e` | sha1 | block | high | [web-assets.esetstatic.com](https://web-assets.esetstatic.com/wls/en/papers/white-papers/turla-cereal-tricks.pdf) |
| `0b4e4a1ce7fee91bfc62b2a2ec572c325642bb60` | sha1 | block | high | [web-assets.esetstatic.com](https://web-assets.esetstatic.com/wls/en/papers/white-papers/turla-cereal-tricks.pdf) |
| `a4e477ce257f2c635401ef554e05506c080967c0` | sha1 | block | high | [web-assets.esetstatic.com](https://web-assets.esetstatic.com/wls/en/papers/white-papers/turla-cereal-tricks.pdf) |
| `a5be8706032a0798fd63214a9f22efa6309355f5` | sha1 | block | high | [web-assets.esetstatic.com](https://web-assets.esetstatic.com/wls/en/papers/white-papers/turla-cereal-tricks.pdf) |
| `iph.dat` | filename | alert | med | [web-assets.esetstatic.com](https://web-assets.esetstatic.com/wls/en/papers/white-papers/turla-cereal-tricks.pdf) |
| `C:\Windows\System32\wbem\ncobjapi.dll` | filename | alert | med | [web-assets.esetstatic.com](https://web-assets.esetstatic.com/wls/en/papers/white-papers/turla-cereal-tricks.pdf) |
| `C:\Windows\System32\wbem\wbemcomn.dll` | filename | alert | med | [web-assets.esetstatic.com](https://web-assets.esetstatic.com/wls/en/papers/white-papers/turla-cereal-tricks.pdf) |
| `/owa/sdds/` | url | alert | med | [web-assets.esetstatic.com](https://web-assets.esetstatic.com/wls/en/papers/white-papers/turla-cereal-tricks.pdf) |
| `/AUTODISCOVER/MICROSOFT.EXCHANGE.PROXYSERVICE/` | url | alert | med | [web-assets.esetstatic.com](https://web-assets.esetstatic.com/wls/en/papers/white-papers/turla-cereal-tricks.pdf) |
| `/AUTODISCOVER/INTEGRATED/API/` | url | alert | med | [web-assets.esetstatic.com](https://web-assets.esetstatic.com/wls/en/papers/white-papers/turla-cereal-tricks.pdf) |
| `/AUTODISCOVER/PROXYSERVICE/` | url | alert | med | [web-assets.esetstatic.com](https://web-assets.esetstatic.com/wls/en/papers/white-papers/turla-cereal-tricks.pdf) |
| `/MICROSOFT-SERVER-ACTIVESYNC/INTEGRATED/API/` | url | alert | med | [web-assets.esetstatic.com](https://web-assets.esetstatic.com/wls/en/papers/white-papers/turla-cereal-tricks.pdf) |

## Sources

- [web-assets.esetstatic.com](https://web-assets.esetstatic.com/wls/en/papers/white-papers/turla-cereal-tricks.pdf)
