# VERIFY-LIVE-VS-MAIN-01 Output

Date: 2026-05-11
Branch: `main`
Commit inspected: `0c88caf`

## Phases Completed

- PHASE 1: inspected current `main` Item Master code truth.
- PHASE 2: built, published, and ran latest `main` locally on `http://127.0.0.1:5099`.
- PHASE 3: compared live `http://103.127.30.2:5088` against local latest main.
- PHASE 4: classified root cause for each checked Item Master mismatch.
- PHASE 5: documented safe redeploy runbook; no blind production deploy was performed.

## Summary

Live does not match latest `main`.

Latest `main` renders the checked Item Master classification fields as governed lookup/select controls and net/gross/package measurements as governed decimal numeric controls. The live site still renders Category, Subcategory, Product family, Business segment, Reporting bucket, Net weight, and Gross weight as plain text fields.

The root cause is deployment/cache consistency, not current source code. Latest local main serves `assets/index-CVsIt348.js`; live serves older `assets/index-B_NeeSYz.js`.

## Checked Item Fields and Actions

| Field / action | Latest main status | Live status | Classification |
| --- | --- | --- | --- |
| Category | Governed lookup/select | Free text | LIVE DEPLOY OUTDATED |
| Subcategory | Governed lookup/select | Free text | LIVE DEPLOY OUTDATED |
| Product family | Governed lookup/select | Free text | LIVE DEPLOY OUTDATED |
| Business segment | Governed lookup/select | Free text | LIVE DEPLOY OUTDATED |
| Reporting bucket | Governed lookup/select | Free text | LIVE DEPLOY OUTDATED |
| UOM fields | Governed lookup/select | Governed lookup/select | Matches |
| Net weight | Governed decimal numeric | Free text | LIVE DEPLOY OUTDATED |
| Gross weight | Governed decimal numeric | Free text | LIVE DEPLOY OUTDATED |
| Package dimensions | Governed decimal numeric | Not present in observed live packaging tab | LIVE DEPLOY OUTDATED |
| Image/media upload | Disabled with item-record storage reason | Disabled with older workspace reason | LIVE DEPLOY OUTDATED; upload workflow intentionally not implemented |

## Validation Results

- `npm run typecheck`: PASS
- `npm test`: PASS, 36 files / 152 tests
- `npm run build`: PASS, Vite chunk-size warning only
- `npm run build:host`: PASS
- `dotnet build src/server/STS.Mfg.sln`: PASS
- `dotnet test src/server/STS.Mfg.sln --no-build`: PASS, 20 tests
- `dotnet publish src/server/STS.Mfg.Host/STS.Mfg.Host.csproj -c Release`: PASS, Vite chunk-size warning only

## Evidence

- Code truth: `docs/codex-progress/VERIFY-LIVE-VS-MAIN-01-code-truth.md`
- Comparison report: `docs/codex-progress/VERIFY-LIVE-VS-MAIN-01-comparison-report.md`
- Local screenshots: `docs/codex-review-screens/VERIFY-LIVE-VS-MAIN-01/local/`
- Live screenshots: `docs/codex-review-screens/VERIFY-LIVE-VS-MAIN-01/live/`

## Stop Decision

Verification complete. No feature code was changed in this pass. Documentation and screenshot evidence were created to prove the current live mismatch.

