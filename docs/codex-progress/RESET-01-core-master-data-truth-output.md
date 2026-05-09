# RESET-01 Core Master Data Truth Output

Date: 2026-05-09
Branch: main

## Scope

- Login/auth/session
- Notifications and approvals truth
- Item Master
- Customer Master
- Supplier Master

## What Was Fixed

- Item Master save actions are now action-truth gated:
  - live write sessions can save item drafts
  - demo/no-live sessions show disabled Save Draft and Save & Continue actions with a business-safe reason
- Item Master packaging and physical fields now use governed numeric controls:
  - inner pack, carton, pallet
  - net weight, gross weight
  - package length, width, height
  - label count
  - physical length, width, height, thickness
  - shelf life
- Item Master policy tabs no longer render controlled or numeric policy values through unrestricted text:
  - planning quantities and lead times use number/decimal controls
  - inventory warehouse/tracking/bin controls use lookup controls, with missing sources disabled
  - sourcing/BOM/routing/supplier policy references use governed selectors or disabled selectors with reason
- Item media empty copy was changed to business-facing wording.
- Notifications and approvals were reverified:
  - live authenticated API failures do not silently show seeded notification or approval rows
  - unavailable states stay business-safe
- Customer and Supplier master screens were reverified:
  - deep editors use centered modal workspaces
  - payment terms, tax, currency, type/category, contact role, channel, compliance, and site type values use governed lookup/select controls
  - upload actions remain disabled with reason when binary storage is unavailable

## Action Truth Summary

- Actions made truthful in this slice:
  - Item Master Save Draft: WORKING in live write sessions, DISABLED WITH REASON in demo/no-live sessions
  - Item Master Save & Continue: WORKING in live write sessions, DISABLED WITH REASON in demo/no-live sessions
- Actions reverified:
  - Login sign-in: WORKING
  - Forgot-password recovery guidance: WORKING
  - New item/customer/supplier draft: WORKING
  - Customer/Supplier Save Draft: WORKING in live write sessions, DISABLED WITH REASON in demo/no-live sessions
  - Item/customer/supplier upload actions: DISABLED WITH REASON where storage is not enabled

## Field Truth Summary

- Governed field fixes applied: 21
- Numeric field fixes applied: 23
- Existing Item Master category, subcategory, product family, and business segment controls were reverified:
  - category uses governed select
  - subcategory/product family/business segment remain disabled governed selectors until dedicated taxonomy masters exist

## Remaining Slice Dependencies

- Item binary media storage/upload workflow remains unavailable and is disabled with reason.
- Dedicated item taxonomy masters for subcategory, product family, and business segment remain missing; fields are disabled governed selectors, not free text.
- Bin, supplier, BOM, and routing policy selectors need full source APIs for complete live selection; current missing sources are disabled with reason.

## Screenshots

Evidence folder: `docs/codex-review-screens/RESET-01/`

- `01-login.png`
- `02-notifications.png`
- `03-approvals.png`
- `04-item-list.png`
- `05-new-item-draft-modal.png`
- `06-existing-item-edit-classification-modal.png`
- `07-existing-item-edit-packaging-modal.png`
- `08-customer-list.png`
- `09-new-customer-draft-modal.png`
- `10-existing-customer-modal.png`
- `11-supplier-list.png`
- `12-new-supplier-draft-modal.png`
- `13-existing-supplier-modal.png`

## Validation Results

- `npm run typecheck`: PASS
- `npm test`: PASS, 36 test files / 152 tests
- `npm run build`: PASS
- `npm run build:host`: PASS
- `dotnet build src/server/STS.Mfg.sln`: PASS after stopping a local `STS.Mfg.Host` process that was locking Debug DLLs
- `dotnet test src/server/STS.Mfg.sln --no-build`: PASS, 20 tests
- `dotnet publish src/server/STS.Mfg.Host/STS.Mfg.Host.csproj -c Release`: PASS
