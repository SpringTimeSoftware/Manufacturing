# VERIFY-LIVE-VS-MAIN-01 Comparison Report

Date: 2026-05-11
Branch: `main`
Commit inspected: `0c88caf`

## Verdict

Live does not match latest `main`.

The published latest-main build served locally from `http://127.0.0.1:5099` uses `assets/index-CVsIt348.js`. The live site at `http://103.127.30.2:5088` serves `assets/index-B_NeeSYz.js`. The live asset does not contain the latest item taxonomy and media-truth strings that exist in the latest published main asset.

## Asset Check

| Target | JS asset served | Latest taxonomy string present | Latest item media reason present | Result |
| --- | --- | --- | --- | --- |
| Local latest main | `assets/index-CVsIt348.js` | Yes | Yes | Matches current source |
| Live site | `assets/index-B_NeeSYz.js` | No | No | Outdated deploy or stale asset cache |

## Field-by-field Comparison

| Field / action | Expected behavior | Local latest main result | Live result | Root cause classification | Recommended next step |
| --- | --- | --- | --- | --- | --- |
| Item group/category | Governed lookup/select | `select`, `data-control-type=lookup` | `select`, `data-control-type=lookup` | Matches | No action needed for this field |
| Category | Governed lookup/select | `select`, `data-control-type=lookup` | plain `input type=text` | LIVE DEPLOY OUTDATED | Redeploy latest publish folder and clear stale browser/proxy assets |
| Subcategory | Governed lookup/select or disabled governed selector | `select`, `data-control-type=lookup` | plain `input type=text` | LIVE DEPLOY OUTDATED | Redeploy latest publish folder and clear stale browser/proxy assets |
| Product family | Governed lookup/select or disabled governed selector | `select`, `data-control-type=lookup` | plain `input type=text` | LIVE DEPLOY OUTDATED | Redeploy latest publish folder and clear stale browser/proxy assets |
| Business segment | Governed lookup/select or disabled governed selector | `select`, `data-control-type=lookup` | plain `input type=text` | LIVE DEPLOY OUTDATED | Redeploy latest publish folder and clear stale browser/proxy assets |
| Reporting bucket | Governed lookup/select or disabled governed selector | `select`, `data-control-type=lookup` | plain `input type=text` | LIVE DEPLOY OUTDATED | Redeploy latest publish folder and clear stale browser/proxy assets |
| Stock UOM | Governed lookup/select | `select`, `data-control-type=lookup` | `select`, `data-control-type=lookup` | Matches | No action needed for this field |
| Base UOM | Governed lookup/select | `select`, `data-control-type=lookup` | `select`, `data-control-type=lookup` | Matches | No action needed for this field |
| Purchase UOM | Governed lookup/select | `select`, `data-control-type=lookup` | `select`, `data-control-type=lookup` | Matches | No action needed for this field |
| Sales UOM | Governed lookup/select | `select`, `data-control-type=lookup` | `select`, `data-control-type=lookup` | Matches | No action needed for this field |
| Packaging UOM | Governed lookup/select | `select`, `data-control-type=lookup` | `select`, `data-control-type=lookup` | Matches | No action needed for this field |
| Net weight | Governed decimal numeric control | `input type=number`, `data-control-type=decimal`, unit `kg` | plain `input type=text` | LIVE DEPLOY OUTDATED | Redeploy latest publish folder and clear stale browser/proxy assets |
| Gross weight | Governed decimal numeric control | `input type=number`, `data-control-type=decimal`, unit `kg` | plain `input type=text` | LIVE DEPLOY OUTDATED | Redeploy latest publish folder and clear stale browser/proxy assets |
| Package length/width/height | Governed decimal numeric controls | `input type=number`, `data-control-type=decimal`, unit `mm` | fields not present in observed live packaging tab | LIVE DEPLOY OUTDATED | Redeploy latest publish folder and clear stale browser/proxy assets |
| Image/media upload | Working, disabled with reason, or hidden | Disabled with reason: `Media storage is not enabled for item records.` | Disabled with older reason: `Media storage is not enabled for this workspace.` | LIVE DEPLOY OUTDATED | Redeploy latest publish folder; upload remains intentionally disabled until storage workflow exists |

## Screenshot Evidence

- Local latest main: `docs/codex-review-screens/VERIFY-LIVE-VS-MAIN-01/local/`
- Live site: `docs/codex-review-screens/VERIFY-LIVE-VS-MAIN-01/live/`

Captured evidence includes item list, new item draft modal, existing item edit modal, classification tab, UOM tab, packaging tab, and media tab for both targets.

## Root Cause Decision

The reported live free-text fields are not reproduced in latest `main`. They are reproduced on the live IP because the live server is serving an older web bundle.

Classification for the main mismatches:

- Category: LIVE DEPLOY OUTDATED
- Subcategory: LIVE DEPLOY OUTDATED
- Product family: LIVE DEPLOY OUTDATED
- Business segment: LIVE DEPLOY OUTDATED
- Reporting bucket: LIVE DEPLOY OUTDATED
- Net weight: LIVE DEPLOY OUTDATED
- Gross weight: LIVE DEPLOY OUTDATED
- Package dimensions: LIVE DEPLOY OUTDATED
- Media disabled reason wording: LIVE DEPLOY OUTDATED

No checked Item Master field/action is classified as CODE STILL WRONG in latest `main`.

## Redeploy Runbook

Use the existing publish-folder deployment model. Do not copy raw source files to the server.

1. Build/publish from latest `main`:
   ```powershell
   dotnet publish src/server/STS.Mfg.Host/STS.Mfg.Host.csproj -c Release
   ```
2. Copy the contents of:
   ```text
   C:\StsPackages\Manufacturing_ERP\src\server\STS.Mfg.Host\bin\Release\net9.0\publish\
   ```
   to the server publish folder.
3. Stop the running Windows service or IIS app pool for the ERP before replacing files.
4. Delete old `wwwroot\assets\index-*.js` files on the server if the deploy process does not already clean them.
5. Start the service/app pool again.
6. Verify live `index.html` now references `assets/index-CVsIt348.js` or a newer asset built from the same or later commit.
7. Hard-refresh the browser or clear browser cache for the live IP.

