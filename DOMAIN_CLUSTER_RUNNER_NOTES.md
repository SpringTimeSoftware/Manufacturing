# Domain Cluster Runner Prompt

Use this with the extracted screen prompt pack already added to the repo.

## Recommended repo placement
- `MASTER_COMPLETION_SPEC.md`
- `MASTER_ACTION_REGISTRY.csv`
- `MASTER_FIELD_REGISTRY.csv`
- `SCREEN_COMPLETION_MATRIX.csv`
- `DOMAIN_WAVE_EXECUTION_PLAN.md`
- `000_README.md`
- `001_EXECUTION_MANIFEST.csv`
- `002_GLOBAL_RUNNER_NOTES.md`
- `screen-prompts/`

## Purpose
This runner tells Codex to execute the pack by domain cluster, not one screen at a time.

## Cluster order
1. Platform/Admin/Auth/Shared
2. Organization/Setup/Resource Basics
3. Master Data/Commercial Foundation
4. Engineering/Planning
5. Production/Inventory/Quality/Dispatch
6. Mobile/Device/Sync
7. Integrations/AI/Reporting/Import-Export

## Important
- Each cluster must hit zero critical violations before moving on.
- No dead actions.
- No free-text governed fields where source exists.
- No numeric-as-text fields.
- No fake upload.
- Screenshots and review pack are mandatory.
