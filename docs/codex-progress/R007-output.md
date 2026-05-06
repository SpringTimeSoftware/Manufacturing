# R007 Output

## Objective Status

- Completed the V2 pricing, discount, tax, and currency schema plan.
- Created the durable `R007` prompt file and the commercial-foundation schema document.
- Updated `/docs/codex-progress/README.md`.
- Did not modify runtime code.

## Files Created or Changed

- `/04-remediation/prompts/R007_pricing-discount-tax-currency-v2-schema.md`
- `/04-remediation/R007_Pricing_Discount_Tax_and_Currency_V2_Schema.md`
- `/docs/codex-progress/R007-output.md`
- `/docs/codex-progress/README.md`

## Key Decisions

- Separated pricing and discount ownership from the quote and sales-order document shells.
- Preserved current document numbering and flow semantics while replacing embedded commercial assumptions.
- Kept tax and currency in the commercial-calculation layer without expanding into accounting scope.

## Blockers

- None.

## Runtime Code Change Status

- No runtime code, migrations, EF entities, controllers, services, DTOs, SQL scripts, tests, or app configuration were modified.

## Build / Test / Lint

- Not run. Documentation-only remediation planning step.

## Next Prompt

- `/04-remediation/prompts/R008_replenishment-and-planning-input-v2-schema.md`
