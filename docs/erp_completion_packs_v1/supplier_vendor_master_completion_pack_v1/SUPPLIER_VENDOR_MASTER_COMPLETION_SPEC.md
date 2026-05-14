# SUPPLIER / VENDOR MASTER COMPLETION SPEC

## Purpose
Complete Supplier/Vendor master to ERP-grade depth for procurement, receiving, invoicing, compliance, quality, and sourcing.

## Completion definition
Supplier Master is complete only if:
- supplier create/edit/view/save/reopen works;
- supplier sites, remit/order/receiving/subcontract site types, contacts, commercial terms, receiving route, invoice match, approved items, lead times, compliance docs, bank/payment metadata, scorecard, and audit are represented truthfully;
- all governed fields use lookup/selects;
- numeric fields such as MOQ, lead time, tolerance, capacity, ratings use governed numeric controls;
- document upload is working or disabled with reason;
- all visible actions are working, disabled with reason, or hidden.

## Critical invalid states
- Supplier type/category/payment terms/currency/tax/site type/contact role are free text.
- Lead time/MOQ/tolerance are unrestricted text.
- New Supplier opens nothing.
- Add site/contact/approved item is dead.
- Save does not persist and reload.
- Upload compliance doc looks active without storage.
- Supplier approved item/lead-time does not feed PO/MRP references where exposed.
