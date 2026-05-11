# Master Completion Prompt Pack

This pack contains one detailed Codex prompt per screen from the current screen inventory (119 screens total).

How to use:
1. Put the governance and master completion pack files in the repo root/docs locations referenced by the prompts.
2. Work on `main`.
3. Execute prompts sequentially by `ScreenId`, or group by domain using the manifest.
4. Do **not** allow Codex to call a screen complete if critical violations remain.

Package contents:
- `000_README.md`
- `001_EXECUTION_MANIFEST.csv`
- `002_GLOBAL_RUNNER_NOTES.md`
- `screen-prompts/<ScreenId>_<slug>.md` for all screens

Important pattern:
- each prompt is screen-specific
- each prompt tells Codex exactly what to read
- each prompt enforces field truth, action truth, data truth, and layout truth
- each prompt requires screenshots and validation
- each prompt forbids dead visible actions

Recommended execution order:
- Platform/Auth/Admin
- Organization/Resources/Measurements/Masters
- Items/Partners/Sales/Commercial
- Engineering/Planning/Procurement
- Production/Inventory/Quality/Dispatch
- AI/Reports
- Mobile
