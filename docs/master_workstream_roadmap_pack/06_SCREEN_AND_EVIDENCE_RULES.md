# Screen and Evidence Rules

## Screenshot rules

For every touched screen:
- capture list/dashboard top
- capture create/edit modal or full-page workspace
- if scroll exists, capture max three positions: top, middle, bottom
- do not loop

## Review-pack rules

Every workstream review pack must include:
- workstream output markdown
- screenshots
- updated field/action matrices
- changed DB README/DDL/seed files if any
- validation output summary
- unresolved blocker list

## UAT evidence rules

Every workstream must define:
- role-wise UAT scenarios
- seed data required
- expected pass/fail criteria
- exact screens and actions to test

## Blocking evidence

If a feature is blocked, record:
- blocker type: backend/API/DB/provider/hardware/business decision
- exact missing artifact
- user-facing disabled reason
- next workstream to resolve
