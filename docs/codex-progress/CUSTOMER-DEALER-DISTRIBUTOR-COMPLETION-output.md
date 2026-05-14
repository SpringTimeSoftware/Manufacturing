# CUSTOMER-DEALER-DISTRIBUTOR-COMPLETION

Pack status: COMPLETE

## Files Changed
- `src/web/src/pages/PartnerPages.tsx`
- `tests/web/partner-master/CustomerDealerDistributorCompletion.test.tsx`

## Screens Touched
- Customer list/detail
- New customer draft modal
- Existing customer edit modal
- Sites, contacts, credit, terms/commercial, documents, and audit sections

## Fields Corrected
- Tax category, currency, payment terms, customer type, lifecycle, credit status, credit hold rule, dispatch preference, contact role, and communication channel are governed selectors.
- Credit limit and credit days use numeric controls.
- Price list, discount scheme, salesperson, and default branch are disabled governed selectors with visible business reasons where assignment source or workflow is not editable on this screen.

## Actions Corrected
- New customer draft opens the centered workspace.
- Add customer site, add contact point, and add document metadata work in the workspace.
- Save Draft and Save & Continue are disabled with reason in review/demo mode.
- Upload customer document is disabled with reason until a saved live customer is available.

## Tests Added/Updated
- `CustomerDealerDistributorCompletion.test.tsx`

## Validation Results
- `npm run typecheck`: passed
- `npm test`: passed
- `npm run audit:erp-completion`: passed
- `npm run build`: passed
- `npm run build:host`: passed
- `dotnet build src/server/STS.Mfg.sln`: passed
- `dotnet test src/server/STS.Mfg.sln --no-build`: passed
- `dotnet publish src/server/STS.Mfg.Host/STS.Mfg.Host.csproj -c Release`: passed

## Screenshot Folder
- `docs/codex-review-screens/ERP-COMPLETION-PACKS-V1/customer-dealer-distributor/`

## Remaining Blockers
- None for touched pack scope.
