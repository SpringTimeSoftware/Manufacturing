# PROCESS-01 Delivery Workflow Hardening

Completed on 2026-04-24.

## Scope handled

- Added repo-local wave governance documents for validation, action truth, screenshot evidence, stop gates, and review-pack assembly.
- Added editable `docs/governance/CURRENT_WAVE.yaml` so future waves can be driven from one config file.
- Added PowerShell automation entrypoints to validate, capture screenshots, build the review pack, and orchestrate a full wave run.
- Added a small local browser helper package under `scripts/wave-automation/` to capture proof screenshots without manual browser work.

## Files created

- `docs/governance/WAVE_GOVERNOR.md`
- `docs/governance/CURRENT_WAVE.yaml`
- `docs/governance/REVIEW_PACK_CONTENTS.md`
- `scripts/wave-common.ps1`
- `scripts/validate-wave.ps1`
- `scripts/capture-wave-screens.ps1`
- `scripts/build-review-pack.ps1`
- `scripts/run-wave.ps1`
- `scripts/wave-automation/package.json`
- `scripts/wave-automation/package-lock.json`
- `scripts/wave-automation/capture-wave-screens.mjs`

## Dry-run proof

Used a small Wave 5C proof config:

- routes:
  - `/engineering/boms`
  - `/planning/mrp`
- modal captures:
  - `New BOM draft`
  - `Run MRP draft`

Proof results:

- validation: PASS
- screenshot capture: PASS
- review-pack zip: PASS
- orchestrated `run-wave.ps1`: PASS

Automation output:

- `docs/codex-progress/WAVE05C-PROOF-AUTOMATION-output.md`

Generated proof artifacts:

- screenshots: `docs/codex-review-screens/WAVE05C-PROOF/`
- review pack: `artifacts/review-packs/WAVE05C-PROOF-review-pack.zip`
- validation logs: `artifacts/wave-logs/WAVE05C-PROOF/`

## Screenshot guard result

- The capture helper enforces:
  - max 3 screenshots per route in `top_mid_bottom` mode
  - max 2 screenshots per modal (`overview`, `lower`)
- The proof run created 4 screenshots total because the selected proof screens did not need middle or bottom capture.
- The capture summary is recorded in:
  - `docs/codex-review-screens/WAVE05C-PROOF/capture-summary.json`

## Notes

- `CURRENT_WAVE.yaml` is stored as JSON-compatible YAML so PowerShell can parse it without external YAML dependencies.
- The script helper was adjusted for Windows PowerShell compatibility and repo-relative `/docs/...` style paths.
- Backend, web, and mobile runtime ports remained available after the proof run:
  - web `5173`
  - backend `5102` and `7042`
  - mobile `8081`

## Next use

1. Update `docs/governance/CURRENT_WAVE.yaml` for the next wave.
2. Run:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File C:\StsPackages\Manufacturing_ERP\scripts\run-wave.ps1
```
