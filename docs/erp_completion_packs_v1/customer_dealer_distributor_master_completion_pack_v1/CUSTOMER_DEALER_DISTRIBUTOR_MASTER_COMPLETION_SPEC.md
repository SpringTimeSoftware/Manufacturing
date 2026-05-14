# CUSTOMER / DEALER / DISTRIBUTOR MASTER COMPLETION SPEC

## Purpose
Complete the Customer / Dealer / Distributor master to ERP-grade depth. This pack is invalid if the implementation only contains a shallow customer list or a few fields.

## Completion definition
Customer Master is complete only if:
- customer create/edit/view/save/reopen works;
- sites, bill-to, ship-to, contacts, contact points, credit, terms, price list, discount, tax, currency, salesperson, dispatch preferences, documents, and audit are represented truthfully;
- dealer/distributor hierarchy is supported or disabled with reason;
- all governed fields use lookup/selects;
- monetary/numeric fields use governed numeric/money controls;
- upload/document actions are working or disabled with reason;
- all visible actions are working, disabled with reason, or hidden.

## Critical invalid states
- Customer type/group/payment terms/currency/tax/price list/discount/salesperson are free text.
- Credit limit or credit days are unrestricted text.
- New Customer opens nothing.
- Save Customer does not persist and reload sites/contacts/commercial profile.
- Add Site or Add Contact is dead.
- Upload document looks active without attachment storage.
- Open related quotes/orders navigates to blank/unfiltered page.
- On-hold/credit status has no reason or no transaction impact.

## Evidence required
- New customer draft screenshot.
- Existing customer edit screenshot.
- Sites tab screenshot.
- Contacts tab screenshot.
- Commercial/Credit tab screenshot.
- Documents/Audit screenshot.
- Save/reopen test.
- Field/action matrix updates.
