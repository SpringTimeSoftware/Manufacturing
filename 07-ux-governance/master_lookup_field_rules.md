# Master Lookup Field Rules

Controlled master values must use `ErpLookupField` or an equivalent governed select/search control. Free text is allowed only where explicitly noted.

| Field | Source screen/master | Expected UI control | Quick create | Validation rule | Free text |
| --- | --- | --- | --- | --- | --- |
| UOM | UOM Class / Conversion Master | Lookup/select | No | Required for stock, purchase, sales, production, and packaging UOM where used | No |
| Item group/category | Item Group / Category Master | Lookup/select | No | Required before item activation | No |
| Warehouse | Warehouse Master | Lookup/select | No | Required when an inventory policy names a default store | No |
| Bin | Bin Master | Lookup/select filtered by warehouse | No | Must belong to selected warehouse | No |
| Customer | Customer Master | Lookup/search select | Permission-gated only | Required for customer item references and sales context | No |
| Supplier | Supplier Master | Lookup/search select | Permission-gated only | Required for preferred supplier and vendor references | No |
| Contact | Customer/Supplier contact registry | Lookup/search select | Permission-gated only | Must belong to selected customer or supplier | No |
| Currency | Currency setup | Lookup/select | No | Required for price lists and commercial documents | No |
| Tax category | Tax Category Master | Lookup/select | No | Required for taxable sales/purchase items | No |
| Payment terms | Payment Terms Master | Lookup/select | No | Required for customer/supplier commercial profiles | No |
| Price list | Price List Master | Lookup/select | No | Required before price assignment | No |
| Discount scheme | Discount Scheme Master | Lookup/select | No | Required before discount eligibility is activated | No |
| Reason code | Reason Codes & Status Rules | Lookup/select | No | Required for controlled holds, scrap, downtime, deviations, and overrides | No |
| BOM | BOM Library | Lookup/search select | No | Required when an item manufacturing policy references a BOM | No |
| Routing | Routing Library | Lookup/search select | No | Required when an item routing policy is active | No |
| Work center | Work Center Master | Lookup/search select | No | Required for operation standards and routing steps | No |
| Machine | Machine Master | Lookup/search select filtered by work center | No | Must belong to selected work center/branch | No |
| Operator | Authorized operator/user registry | Lookup/search select | No | Must be active and authorized for the operation context | No |
| QC plan | QC Plan Setup | Lookup/search select | No | Required when QC required is active | No |
| Inspection template | Inspection Template / QC Plan Setup | Lookup/search select | No | Required for inspection execution screens | No |
