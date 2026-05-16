# Single-Pack Codex Run Template

Use this when running one completion pack at a time. This is the recommended implementation style.

```text
You are working in the ERP repository. Execute exactly one completion pack from the attached folder.

Pack to execute: <PASTE PACK NAME>
Folder/spec file: <PASTE FILE PATH>

Mandatory rules:
- First inspect the repository structure, existing models, routes, services, components, tests, migrations, and audit scripts.
- Reuse existing architecture and naming conventions.
- Do not create fake actions, dummy success, local-only persistence, static sample tables, or seeded-live fallbacks.
- Every visible P0 action must be real, persisted, validated, audited, and tested; otherwise it must be outside P0 and disabled with a precise reason.
- Preserve quote/SO commercial truth: salesperson, remarks, price, discount, tax, charges, revisions, and totals.
- Preserve warehouse truth: branch/warehouse/location/bin/lot/serial/PCID selection where required.
- Preserve revision truth: downstream documents must store exact source revision references.
- Add migrations/API/service/UI/tests/audit updates as needed.
- Run available tests and audits; if a test cannot run, state exact reason.

Execution sequence:
1. Read `README.md`, `completion_pack.md`, `acceptance_gates_and_tests.md`, and `business_decisions_needed.md` for the pack.
2. Create an implementation plan based on actual repo inspection.
3. Implement P0 completely.
4. Add or update automated tests/audit commands.
5. Run tests/audits.
6. Produce the pack output report using `codex_output_report_template.md`.

Final answer must include:
- completed scope;
- files changed;
- migrations/schema changes;
- APIs/routes/services added;
- UI/screens changed;
- tests run and result;
- remaining gaps, if any, with exact reason and next action;
- explicit confirmation of salesperson/remarks, bin selection, revisions, price/discount/tax where touched.
```