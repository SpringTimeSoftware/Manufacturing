# QUOTE-DRAFT-ACTION-FIX Output

Date: 2026-05-08

## Scope

- Corrected the Sales Quotes `New quote draft` action after it was found disabled even though the backend quote create/update endpoints already exist.
- Limited the change to the quote draft UI, quote API adapter contract, tests, and governance evidence.

## Root Cause

- The previous action-truth pass classified `New quote draft` and `Save quote draft` as disabled because the quote workflow was treated as unavailable.
- Backend support was already present through `POST /api/quotes` and `PUT /api/quotes/{id}`, so the UI state was too conservative and created a visible non-working draft path.

## Fix Applied

- Added quote create/update API calls to the web API client.
- Added typed quote upsert contracts for quote headers and line drafts.
- Added a centered quote draft workspace from the Sales Quotes page.
- Added governed lookup/select controls for customer, item, UOM, priority, status, make type, and line status.
- Added governed decimal input for quote quantity.
- Wired live valid quote drafts to save through the quote API.
- Kept save disabled with a visible business-safe reason for demo/no-live sessions and incomplete drafts.
- Clarified the selected quote queue detail as review-only so its disabled save control is not misleading.
- Updated action truth rows for `New quote draft` and `Save quote draft`.

## Validation

- `npm.cmd test -- WaveUxGlobal03ModalReliability.test.tsx PriorityStabilization01.test.tsx` - PASS
- `npm.cmd run typecheck` - PASS

## Remaining Notes

- The server publish output still needs to be rebuilt before copying to the live server.
- Other draft buttons were not expanded in this corrective pass; this fix addresses the reported quote draft miss and adds regression coverage for it.
