# Global Definition of Done

## Screen Done

A screen is done only if:
- route is discoverable for the correct role
- list view loads live data or clear empty state
- filters/search work or are disabled with reason
- create/edit/detail opens correct workspace
- required fields exist
- governed fields use lookup/select controls
- numeric fields use numeric controls
- every action is working/disabled/hidden
- save/load/reopen works if screen is editable
- validation errors are visible and useful
- audit/status behavior is truthful
- screenshots exist

## Field Done

A field is done only if:
- business label is correct
- API/DB field is mapped
- control type is correct
- data type is correct
- validation is defined and enforced
- dependency rules are enforced
- role/editability rules are enforced
- create/edit/read-only behavior is correct

## Action Done

An action is done only if it is:
- WORKING, or
- DISABLED WITH REASON, or
- HIDDEN

No active dead buttons.

## Transaction Done

A transaction is done only if:
- header works
- lines work where applicable
- add/remove line works
- line calculations work
- header totals work
- discounts/taxes/charges/rounding work
- save draft works
- save/release/post lifecycle works or is honestly disabled
- print/export works or is honestly disabled
- audit/status works
- reload/reopen shows saved data

## Integration Done

An integration is done only if:
- provider setup exists
- credentials are masked and externalized
- test connection works or is disabled
- event logs exist
- retry/failure states exist
- no secret leaks

## Upload Done

Upload is done only if:
- storage/API exists
- authorization exists
- upload action works
- file appears in document/media list
- metadata saves
- preview/download works or disabled
- audit exists

Otherwise upload must be disabled or hidden.
