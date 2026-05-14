# Item / Product Master Gap Status

Status: COMPLETE for touched pack scope.

## Closed Gaps
- Governed classification fields remain lookup/select controls: item group/category, subcategory, product family, business segment, reporting bucket, UOM, and measurement profile.
- Numeric and decimal controls are enforced for weight, dimensions, planning quantities, MOQ, lead time, and physical specifications.
- Live item profile loading no longer silently falls back to generated operational profile data when the live profile API fails.
- Item media upload uses the shared platform attachment workflow for saved live items.
- Media lifecycle actions that are not yet supported are disabled with business-facing reasons.
- Save/reopen test coverage proves edited UOM IDs, packaging UOM, weights, dimensions, and planning quantities round-trip through the profile payload.

## Remaining Blockers
- None for the touched Item/Product Master completion pack scope.

## Evidence
- Tests: `tests/web/item-product-master/*`
- Screenshots: `docs/codex-review-screens/ERP-COMPLETION-PACKS-V1/item-product-master/`
