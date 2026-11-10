# APT29 (SVR) - mobile watering holes

**Category:** APT / espionage  
**Last updated:** 2026-11-10  
**Indicators:** 27 (10 domain, 9 sha256, 4 url, 3 ipv4, 1 filename)  
**Block now:** 22

## Files

- `block_now.txt` - high-confidence indicators to block
- `iocs.csv` - every indicator with confidence, action, source and notes
- `defender_xdr_indicators.csv` - Microsoft Defender XDR bulk import (block and audit)
- `hunt.kql` - Defender XDR advanced hunting query

## Indicators

| Indicator | Type | Action | Confidence | Source |
|---|---|---|---|---|
| `theowo.club` | domain | block | high | [sekoia.com](https://www.sekoia.com/blog/poisoned-source-apt29-watering-holes-targets-mobile-devices-with-n-day-exploits) |
| `america250.holiday` | domain | block | high | [sekoia.com](https://www.sekoia.com/blog/poisoned-source-apt29-watering-holes-targets-mobile-devices-with-n-day-exploits) |
| `adsprism-stat.com` | domain | block | high | [sekoia.com](https://www.sekoia.com/blog/poisoned-source-apt29-watering-holes-targets-mobile-devices-with-n-day-exploits) |
| `static.flux-telemetry.com` | domain | block | high | [sekoia.com](https://www.sekoia.com/blog/poisoned-source-apt29-watering-holes-targets-mobile-devices-with-n-day-exploits) |
| `edge-ord.clouds-stacks.com` | domain | block | high | [sekoia.com](https://www.sekoia.com/blog/poisoned-source-apt29-watering-holes-targets-mobile-devices-with-n-day-exploits) |
| `ad.starx-net.com` | domain | block | high | [sekoia.com](https://www.sekoia.com/blog/poisoned-source-apt29-watering-holes-targets-mobile-devices-with-n-day-exploits) |
| `ads-it-assets.com` | domain | block | high | [sekoia.com](https://www.sekoia.com/blog/poisoned-source-apt29-watering-holes-targets-mobile-devices-with-n-day-exploits) |
| `cdn.adv-static.com` | domain | block | high | [sekoia.com](https://www.sekoia.com/blog/poisoned-source-apt29-watering-holes-targets-mobile-devices-with-n-day-exploits) |
| `wpvortex-mod.com` | domain | block | high | [sekoia.com](https://www.sekoia.com/blog/poisoned-source-apt29-watering-holes-targets-mobile-devices-with-n-day-exploits) |
| `assets-int.com` | domain | block | high | [sekoia.com](https://www.sekoia.com/blog/poisoned-source-apt29-watering-holes-targets-mobile-devices-with-n-day-exploits) |
| `https://ad.starx-net.com:8881/telemetry/v12` | url | block | high | [sekoia.com](https://www.sekoia.com/blog/poisoned-source-apt29-watering-holes-targets-mobile-devices-with-n-day-exploits) |
| `https://static.flux-telemetry.com/module/5b4c8fea5cbcee273e8d830f52-temfp.js` | url | block | high | [sekoia.com](https://www.sekoia.com/blog/poisoned-source-apt29-watering-holes-targets-mobile-devices-with-n-day-exploits) |
| `https://edge-ord.clouds-stacks.com/module/5b4c8fea5cbcee273e8d830f52-temfp.js` | url | block | high | [sekoia.com](https://www.sekoia.com/blog/poisoned-source-apt29-watering-holes-targets-mobile-devices-with-n-day-exploits) |
| `5b4c8fea5cbcee273e8d830f52-temfp.js` | filename | alert | high | [sekoia.com](https://www.sekoia.com/blog/poisoned-source-apt29-watering-holes-targets-mobile-devices-with-n-day-exploits) |
| `https://a.plerdy.com/public/js/click/main.js` | url | monitor | med | [sekoia.com](https://www.sekoia.com/blog/poisoned-source-apt29-watering-holes-targets-mobile-devices-with-n-day-exploits) |
| `109.104.106.107` | ipv4 | block | med | [sekoia.com](https://www.sekoia.com/blog/poisoned-source-apt29-watering-holes-targets-mobile-devices-with-n-day-exploits) |
| `95.133.231.28` | ipv4 | block | med | [sekoia.com](https://www.sekoia.com/blog/poisoned-source-apt29-watering-holes-targets-mobile-devices-with-n-day-exploits) |
| `195.58.140.105` | ipv4 | block | med | [sekoia.com](https://www.sekoia.com/blog/poisoned-source-apt29-watering-holes-targets-mobile-devices-with-n-day-exploits) |
| `a7d2493df00565c21587b0cad2a9fe7ca1e5590acf796da6e499be0ffde44cc3` | sha256 | block | high | [sekoia.com](https://www.sekoia.com/blog/poisoned-source-apt29-watering-holes-targets-mobile-devices-with-n-day-exploits) |
| `bee3e014e3df87ddce0250b0985b87f6868a427a7b650a74b7ffedb9d57f3088` | sha256 | block | high | [sekoia.com](https://www.sekoia.com/blog/poisoned-source-apt29-watering-holes-targets-mobile-devices-with-n-day-exploits) |
| `c170fda024183645c0aa681149304e50506509c3498bb6b9a5f5ced6aa73e5fa` | sha256 | block | high | [sekoia.com](https://www.sekoia.com/blog/poisoned-source-apt29-watering-holes-targets-mobile-devices-with-n-day-exploits) |
| `2ffb35e3f9e55286a930fb887e73764a913166648135fe0ca7551736d97d7bfa` | sha256 | block | high | [sekoia.com](https://www.sekoia.com/blog/poisoned-source-apt29-watering-holes-targets-mobile-devices-with-n-day-exploits) |
| `69b6cb327a4d5da99399718f6a66f84de69f89425b0a31f2dcee0682f811596f` | sha256 | block | high | [sekoia.com](https://www.sekoia.com/blog/poisoned-source-apt29-watering-holes-targets-mobile-devices-with-n-day-exploits) |
| `29d283ebd08d0cd3b2e6f4a67718d3d6e7a6be01d0613d716bce218dba57a928` | sha256 | block | high | [sekoia.com](https://www.sekoia.com/blog/poisoned-source-apt29-watering-holes-targets-mobile-devices-with-n-day-exploits) |
| `06c17b31d36838f3d29044784aa047d5c2d9174d3356c1211cf25f9df677445f` | sha256 | block | high | [sekoia.com](https://www.sekoia.com/blog/poisoned-source-apt29-watering-holes-targets-mobile-devices-with-n-day-exploits) |
| `183d62d682aea8018491c8559544e8d6a9ab0e1abd05ecbb6c97daa4f438d2b8` | sha256 | block | high | [sekoia.com](https://www.sekoia.com/blog/poisoned-source-apt29-watering-holes-targets-mobile-devices-with-n-day-exploits) |
| `387a7fb768db1350a9788d9704e7a72abe07152734e0ff026af72b417e36268c` | sha256 | block | high | [sekoia.com](https://www.sekoia.com/blog/poisoned-source-apt29-watering-holes-targets-mobile-devices-with-n-day-exploits) |

## Sources

- [sekoia.com](https://www.sekoia.com/blog/poisoned-source-apt29-watering-holes-targets-mobile-devices-with-n-day-exploits)
