# R006 - Supplier compliance and reference V2 schema

## Phase
Remediation - Pre-P064

## Objective
Define the V2 supplier account, site, compliance, preferred-item, and reference schema while preserving the procurement document skeleton.

## Read first
- `/AGENTS.md`
- `/04-remediation/Cutover_Guardrails.md`
- `/04-remediation/Preservation_and_Compatibility_Rules.md`
- `/04-remediation/Pre_P064_Stoplist.md`
- `/04-remediation/R002_Master_Data_V2_Canonical_Domain_Map.md`
- `/04-remediation/R005_Customer_Contact_Credit_and_Terms_V2_Schema.md`
- `/04-remediation/Architecture_V2_Delta_Matrix.md`
- `/docs/codex-progress/R005-output.md`

## Constraints
- Documentation-only. Do not modify runtime code or SQL assets.
- Preserve PR, PO, and subcontract document continuity through additive and bridge-led cutover.

## Work to do
- Write `/04-remediation/R006_Supplier_Compliance_and_Reference_V2_Schema.md`.
- Define supplier-account, site, contact, compliance, scorecard, term, and preferred-item structures.
- Classify affected repo surfaces and define bridge and cutover rules.

## Definition of done
- The schema document names owned entities, preserved procurement surfaces, compatibility rules, and the exact next prompt path.

## Handoff notes
- Update `/docs/codex-progress/R006-output.md` and `/docs/codex-progress/README.md`.
- Next prompt path: `/04-remediation/prompts/R007_pricing-discount-tax-currency-v2-schema.md`
