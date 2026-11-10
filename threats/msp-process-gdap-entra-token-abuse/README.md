# MSP Process breach - Entra GDAP token abuse

**Category:** Supply chain / identity  
**Last updated:** 2026-11-10  
**Indicators:** 57 (57 ipv4)  
**Block now:** 1

## Files

- `block_now.txt` - high-confidence indicators to block
- `iocs.csv` - every indicator with confidence, action, source and notes
- `defender_xdr_indicators.csv` - Microsoft Defender XDR bulk import (block and audit)
- `hunt.kql` - Defender XDR advanced hunting query

## Indicators

| Indicator | Type | Action | Confidence | Source |
|---|---|---|---|---|
| `172.169.63.30` | ipv4 | block | high | [inforcer.com](https://www.inforcer.com/insights/when-a-gdap-vendor-is-breached-check-your-own-tenant) |
| `64.236.54.139` | ipv4 | monitor | high | [inforcer.com](https://www.inforcer.com/insights/when-a-gdap-vendor-is-breached-check-your-own-tenant) |
| `172.169.207.227` | ipv4 | alert | med | [thestack.technology](https://www.thestack.technology/msp-software-firm-hacked-with-customer-entra-environments-now-getting-pwned/) |
| `172.169.187.35` | ipv4 | alert | med | [thestack.technology](https://www.thestack.technology/msp-software-firm-hacked-with-customer-entra-environments-now-getting-pwned/) |
| `172.169.63.29` | ipv4 | alert | med | [thestack.technology](https://www.thestack.technology/msp-software-firm-hacked-with-customer-entra-environments-now-getting-pwned/) |
| `172.169.63.35` | ipv4 | alert | med | [thestack.technology](https://www.thestack.technology/msp-software-firm-hacked-with-customer-entra-environments-now-getting-pwned/) |
| `172.169.29.166` | ipv4 | alert | med | [thestack.technology](https://www.thestack.technology/msp-software-firm-hacked-with-customer-entra-environments-now-getting-pwned/) |
| `172.169.58.181` | ipv4 | alert | med | [thestack.technology](https://www.thestack.technology/msp-software-firm-hacked-with-customer-entra-environments-now-getting-pwned/) |
| `172.169.206.55` | ipv4 | alert | med | [thestack.technology](https://www.thestack.technology/msp-software-firm-hacked-with-customer-entra-environments-now-getting-pwned/) |
| `172.168.41.166` | ipv4 | alert | med | [thestack.technology](https://www.thestack.technology/msp-software-firm-hacked-with-customer-entra-environments-now-getting-pwned/) |
| `172.168.117.170` | ipv4 | alert | med | [thestack.technology](https://www.thestack.technology/msp-software-firm-hacked-with-customer-entra-environments-now-getting-pwned/) |
| `172.168.253.63` | ipv4 | alert | med | [thestack.technology](https://www.thestack.technology/msp-software-firm-hacked-with-customer-entra-environments-now-getting-pwned/) |
| `64.236.112.134` | ipv4 | alert | med | [thestack.technology](https://www.thestack.technology/msp-software-firm-hacked-with-customer-entra-environments-now-getting-pwned/) |
| `64.236.112.237` | ipv4 | alert | med | [thestack.technology](https://www.thestack.technology/msp-software-firm-hacked-with-customer-entra-environments-now-getting-pwned/) |
| `64.236.112.251` | ipv4 | alert | med | [thestack.technology](https://www.thestack.technology/msp-software-firm-hacked-with-customer-entra-environments-now-getting-pwned/) |
| `64.236.112.221` | ipv4 | alert | med | [thestack.technology](https://www.thestack.technology/msp-software-firm-hacked-with-customer-entra-environments-now-getting-pwned/) |
| `64.236.112.120` | ipv4 | alert | med | [thestack.technology](https://www.thestack.technology/msp-software-firm-hacked-with-customer-entra-environments-now-getting-pwned/) |
| `64.236.112.111` | ipv4 | alert | med | [thestack.technology](https://www.thestack.technology/msp-software-firm-hacked-with-customer-entra-environments-now-getting-pwned/) |
| `64.236.113.15` | ipv4 | alert | med | [thestack.technology](https://www.thestack.technology/msp-software-firm-hacked-with-customer-entra-environments-now-getting-pwned/) |
| `64.236.113.23` | ipv4 | alert | med | [thestack.technology](https://www.thestack.technology/msp-software-firm-hacked-with-customer-entra-environments-now-getting-pwned/) |
| `64.236.113.32` | ipv4 | alert | med | [thestack.technology](https://www.thestack.technology/msp-software-firm-hacked-with-customer-entra-environments-now-getting-pwned/) |
| `52.230.237.27` | ipv4 | alert | med | [thestack.technology](https://www.thestack.technology/msp-software-firm-hacked-with-customer-entra-environments-now-getting-pwned/) |
| `52.230.237.16` | ipv4 | alert | med | [thestack.technology](https://www.thestack.technology/msp-software-firm-hacked-with-customer-entra-environments-now-getting-pwned/) |
| `52.230.237.18` | ipv4 | alert | med | [thestack.technology](https://www.thestack.technology/msp-software-firm-hacked-with-customer-entra-environments-now-getting-pwned/) |
| `52.230.237.21` | ipv4 | alert | med | [thestack.technology](https://www.thestack.technology/msp-software-firm-hacked-with-customer-entra-environments-now-getting-pwned/) |
| `52.230.237.13` | ipv4 | alert | med | [thestack.technology](https://www.thestack.technology/msp-software-firm-hacked-with-customer-entra-environments-now-getting-pwned/) |
| `52.230.237.9` | ipv4 | alert | med | [thestack.technology](https://www.thestack.technology/msp-software-firm-hacked-with-customer-entra-environments-now-getting-pwned/) |
| `52.228.167.149` | ipv4 | alert | med | [thestack.technology](https://www.thestack.technology/msp-software-firm-hacked-with-customer-entra-environments-now-getting-pwned/) |
| `52.228.167.121` | ipv4 | alert | med | [thestack.technology](https://www.thestack.technology/msp-software-firm-hacked-with-customer-entra-environments-now-getting-pwned/) |
| `52.154.255.0` | ipv4 | alert | med | [thestack.technology](https://www.thestack.technology/msp-software-firm-hacked-with-customer-entra-environments-now-getting-pwned/) |
| `40.89.240.243` | ipv4 | alert | med | [thestack.technology](https://www.thestack.technology/msp-software-firm-hacked-with-customer-entra-environments-now-getting-pwned/) |
| `40.89.240.113` | ipv4 | alert | med | [thestack.technology](https://www.thestack.technology/msp-software-firm-hacked-with-customer-entra-environments-now-getting-pwned/) |
| `40.83.16.22` | ipv4 | alert | med | [thestack.technology](https://www.thestack.technology/msp-software-firm-hacked-with-customer-entra-environments-now-getting-pwned/) |
| `13.89.111.197` | ipv4 | alert | med | [thestack.technology](https://www.thestack.technology/msp-software-firm-hacked-with-customer-entra-environments-now-getting-pwned/) |
| `20.84.171.92` | ipv4 | alert | med | [thestack.technology](https://www.thestack.technology/msp-software-firm-hacked-with-customer-entra-environments-now-getting-pwned/) |
| `130.131.144.244` | ipv4 | alert | med | [thestack.technology](https://www.thestack.technology/msp-software-firm-hacked-with-customer-entra-environments-now-getting-pwned/) |
| `135.233.107.143` | ipv4 | alert | med | [thestack.technology](https://www.thestack.technology/msp-software-firm-hacked-with-customer-entra-environments-now-getting-pwned/) |
| `172.215.180.155` | ipv4 | alert | med | [thestack.technology](https://www.thestack.technology/msp-software-firm-hacked-with-customer-entra-environments-now-getting-pwned/) |
| `143.198.68.206` | ipv4 | block | med | [thestack.technology](https://www.thestack.technology/msp-software-firm-hacked-with-customer-entra-environments-now-getting-pwned/) |
| `187.15.92.123` | ipv4 | alert | med | [thestack.technology](https://www.thestack.technology/msp-software-firm-hacked-with-customer-entra-environments-now-getting-pwned/) |
| `178.61.224.154` | ipv4 | alert | low | [thestack.technology](https://www.thestack.technology/msp-software-firm-hacked-with-customer-entra-environments-now-getting-pwned/) |
| `46.148.159.8` | ipv4 | alert | low | [thestack.technology](https://www.thestack.technology/msp-software-firm-hacked-with-customer-entra-environments-now-getting-pwned/) |
| `109.171.38.144` | ipv4 | alert | low | [thestack.technology](https://www.thestack.technology/msp-software-firm-hacked-with-customer-entra-environments-now-getting-pwned/) |
| `213.5.16.40` | ipv4 | alert | low | [thestack.technology](https://www.thestack.technology/msp-software-firm-hacked-with-customer-entra-environments-now-getting-pwned/) |
| `91.210.236.74` | ipv4 | alert | low | [thestack.technology](https://www.thestack.technology/msp-software-firm-hacked-with-customer-entra-environments-now-getting-pwned/) |
| `202.44.193.79` | ipv4 | alert | low | [thestack.technology](https://www.thestack.technology/msp-software-firm-hacked-with-customer-entra-environments-now-getting-pwned/) |
| `24.220.57.81` | ipv4 | alert | low | [thestack.technology](https://www.thestack.technology/msp-software-firm-hacked-with-customer-entra-environments-now-getting-pwned/) |
| `188.137.78.112` | ipv4 | alert | low | [thestack.technology](https://www.thestack.technology/msp-software-firm-hacked-with-customer-entra-environments-now-getting-pwned/) |
| `188.25.140.193` | ipv4 | alert | low | [thestack.technology](https://www.thestack.technology/msp-software-firm-hacked-with-customer-entra-environments-now-getting-pwned/) |
| `193.188.198.233` | ipv4 | alert | low | [thestack.technology](https://www.thestack.technology/msp-software-firm-hacked-with-customer-entra-environments-now-getting-pwned/) |
| `46.151.219.60` | ipv4 | alert | low | [thestack.technology](https://www.thestack.technology/msp-software-firm-hacked-with-customer-entra-environments-now-getting-pwned/) |
| `178.205.170.18` | ipv4 | alert | low | [thestack.technology](https://www.thestack.technology/msp-software-firm-hacked-with-customer-entra-environments-now-getting-pwned/) |
| `188.137.76.53` | ipv4 | alert | low | [thestack.technology](https://www.thestack.technology/msp-software-firm-hacked-with-customer-entra-environments-now-getting-pwned/) |
| `213.226.214.89` | ipv4 | alert | low | [thestack.technology](https://www.thestack.technology/msp-software-firm-hacked-with-customer-entra-environments-now-getting-pwned/) |
| `177.52.113.45` | ipv4 | alert | low | [thestack.technology](https://www.thestack.technology/msp-software-firm-hacked-with-customer-entra-environments-now-getting-pwned/) |
| `46.253.235.237` | ipv4 | alert | low | [thestack.technology](https://www.thestack.technology/msp-software-firm-hacked-with-customer-entra-environments-now-getting-pwned/) |
| `138.118.86.78` | ipv4 | alert | low | [thestack.technology](https://www.thestack.technology/msp-software-firm-hacked-with-customer-entra-environments-now-getting-pwned/) |

## Sources

- [inforcer.com](https://www.inforcer.com/insights/when-a-gdap-vendor-is-breached-check-your-own-tenant)
- [thestack.technology](https://www.thestack.technology/msp-software-firm-hacked-with-customer-entra-environments-now-getting-pwned/)
