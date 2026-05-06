# R005 - Customer, contact, credit, and terms V2 schema

## Phase
Remediation - Pre-P064

## Objective
Define the V2 customer account, site, contact, credit, commercial-profile, and dispatch-preference schema without breaking preserved demand and execution flows.

## Read first
- `/AGENTS.md`
- `/04-remediation/Cutover_Guardrails.md`
- `/04-remediation/Preservation_and_Compatibility_Rules.md`
- `/04-remediation/Pre_P064_Stoplist.md`
- `/04-remediation/R002_Master_Data_V2_Canonical_Domain_Map.md`
- `/04-remediation/Architecture_V2_Delta_Matrix.md`
- `/docs/codex-progress/R004-output.md`

## Constraints
- Documentation-only. Do not modify runtime code or SQL assets.
- Preserve quote, sales-order, work-order, and job-card continuity through compatibility-led cutover.

## Work to do
- Write `/04-remediation/R005_Customer_Contact_Credit_and_Terms_V2_Schema.md`.
- Define customer-account, site, address, contact, contact-point, credit, terms, and dispatch-preference structures.
- Classify affected repo surfaces and define bridge and cutover rules.

## Definition of done
- The schema document names owned entities, preserved surfaces, bridge rules, and the exact next prompt path.

## Handoff notes
- Update `/docs/codex-progress/R005-output.md` and `/docs/codex-progress/README.md`.
- Next prompt path: `/04-remediation/prompts/R006_supplier-compliance-and-reference-v2-schema.md`
