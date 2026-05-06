# Review Pack Contents

Every wave review pack zip must include exactly these artifacts when present for the current wave:

## Required

1. Current wave output markdown
   - path from `CURRENT_WAVE.yaml -> expected_outputs.wave_output_markdown`
2. Updated action-truth matrix
   - `/07-ux-governance/action_truth_matrix.csv`
3. Updated relevant governance matrices
   - paths from `CURRENT_WAVE.yaml -> expected_outputs.governance_matrices`
4. Screenshot folder
   - `/docs/codex-review-screens/<wave_id>/`

## Conditional

5. Changed DB and deployment artifacts
   - `database/README.md` when relevant
   - any DDL file names listed in `CURRENT_WAVE.yaml -> expected_outputs.db_artifacts`
6. Changed seed artifacts
   - any seed file names listed in `CURRENT_WAVE.yaml -> expected_outputs.seed_artifacts`

## Optional

7. Build and test logs when present
   - `/artifacts/wave-logs/<wave_id>/`
   - additional paths listed in `CURRENT_WAVE.yaml -> expected_outputs.optional_logs`
   - runtime logs under `/docs/codex-review-screens/<wave_id>/runtime-logs/`

## Output Zip

- final zip path:
  - `/artifacts/review-packs/<wave_id>-review-pack.zip`

## Notes

- Missing required files are a review-pack FAIL.
- Optional logs are included only when they exist.
- The user must not need to manually assemble the pack.
