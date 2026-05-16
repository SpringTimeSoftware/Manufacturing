# Execution Strategy for the Remaining 8 Packs

## Direct answer

Create the 8 folders now, but do not ask Codex to implement all 8 in a single run.

The safer execution strategy is:

1. Use the two wave prompts only for orientation, dependency review, and sequencing.
2. Implement one pack at a time using the individual `codex_prompt.md` inside each folder.
3. After each pack, force Codex to produce the output report using the included report template.
4. Bring that report back for gap review before the next pack.

## Why single-pack runs are better

Large prompts that ask Codex to implement many ERP packs at once tend to fail in exactly the pattern already observed:

- shallow completion claims;
- missed header fields like salesperson/remarks;
- weak price/discount/tax propagation;
- missing bin-level validation;
- disabled-with-reason actions that stay unresolved;
- insufficient tests/audits;
- poor traceability of what changed.

A single-pack run gives better file-level evidence and makes it easier to reject incomplete work.

## 4 + 4 wave grouping

The remaining packs can be grouped into two waves:

### Wave 1: transactional/commercial foundations

04. Quality / NCR / COA  
05. Dispatch / Logistics / POD  
06. Finance / GL / AP / AR / Costing  
07. Reports / Dashboard Builder

This wave closes quality gates, dispatch execution, commercial/accounting truth, and report/export truth.

### Wave 2: runtime/customization/after-sales

08. Integrations / Email / WhatsApp / CRM / AI  
09. Mobile / Barcode / Camera / Offline  
10. UDF / Customization  
11. Service / Warranty / AMC

This wave closes provider runtime, mobile runtime, metadata customization, and later-scope service/AMC.

## Recommended order

1. Run the cross-pack residual gap closure audit first.
2. Run Pack 06 Finance early if quote/SO commercial fields are still missing.
3. Run Pack 05 Dispatch before Pack 09 Mobile if bin/pick/pack rules are not complete.
4. Run Pack 07 Reports after Finance/Quality/Dispatch foundations so reports have real data.
5. Run Pack 08 Integrations before report scheduling or external notifications.
6. Run Pack 09 Mobile after warehouse/dispatch/quality transaction contracts exist.
7. Run Pack 10 UDF after core transaction models are stable.
8. Run Pack 11 Service only if it is in pilot scope; otherwise build truthful skeleton and defer full implementation.

## Practical rule

Use the wave prompts for "read all and sequence". Use individual pack prompts for code changes.