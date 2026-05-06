# Wave Governor

This document defines the mandatory delivery workflow for every future STS Manufacturing ERP wave.

## What A Wave Is

A wave is a bounded implementation slice with:

- a declared `wave_id`
- a declared `wave_name`
- a defined route and modal capture scope
- a defined validation scope
- required output files
- explicit stop gates

A wave is complete only when code, validation, screenshot evidence, and review-pack assembly are all complete.

## Required Validation Gates

Every wave must run the validation steps declared by `docs/governance/CURRENT_WAVE.yaml`.

Minimum web validation:

- `npm run typecheck`
- `npm test`
- `npm run build`
- `npm run build:host`

Backend validation when `requires_backend_validation=true`:

- `dotnet build`
- `dotnet test --no-build`
- `dotnet publish -c Release`

Database validation when `requires_db_validation=true`:

- the wave config must declare the DB artifacts or validation commands required for the wave
- missing DB validation instructions are a FAIL

Mobile validation:

- run only when the wave config explicitly enables mobile validation and the repo exposes mobile validation scripts

## Action-Truth Gate

Permanent non-negotiable rule:

1. No touched visible action may remain dead.
2. Every touched action must end as:
   - `WORKING`
   - `DISABLED WITH REASON`
   - `HIDDEN`

If any touched visible action looks enabled but does nothing, the wave is FAIL.

## Screenshot Evidence Gate

Every future wave must produce screenshot evidence.

Rules:

- screenshots are driven from `CURRENT_WAVE.yaml`
- primary page routes are captured first
- modal routes are captured after their parent page is opened
- `top_only` mode captures one screenshot per page route
- `top_mid_bottom` mode captures at most three screenshots per page route:
  - top
  - middle
  - bottom
- modal capture is limited to:
  - overview
  - lower section only if needed
- no route may exceed the configured capture guard
- screenshot output folder:
  - `docs/codex-review-screens/<wave_id>/`

## Stop Conditions

Stop immediately when any of these happen:

- validation command returns non-zero
- required output file is missing
- screenshot capture cannot authenticate or open the target route
- review pack cannot be assembled
- touched action truth cannot be satisfied

## PASS / PARTIAL / FAIL

### PASS

All of the following are true:

- validation gates pass
- touched actions satisfy the action-truth gate
- screenshot evidence exists for the configured routes and modals
- review pack zip is produced
- required output markdown exists

### PARTIAL

Use only when code changes exist but one or more delivery gates fail while the implementation is still recoverable in the same wave.

Typical PARTIAL examples:

- validation passes but screenshots fail
- screenshots pass but review-pack assembly fails
- review pack exists but a required matrix or output markdown is missing

### FAIL

Use when the wave is not shippable for review.

Typical FAIL examples:

- validation fails
- a touched visible action remains dead
- no screenshot evidence exists
- no review pack is produced

## Review-Pack Requirements

Every review pack must include the contents defined by `docs/governance/REVIEW_PACK_CONTENTS.md`.

## CURRENT_WAVE.yaml Rules

`CURRENT_WAVE.yaml` is stored as JSON-compatible YAML so it can be read without external YAML parsers.

Required top-level fields:

- `wave_id`
- `wave_name`
- `routes_to_capture`
- `modal_routes_to_capture`
- `expected_outputs`
- `requires_backend_validation`
- `requires_db_validation`
- `screenshot_mode`
- `stop_after_completion`

Optional extra fields are allowed if they help automation, but they must not replace the required fields.

## Script Contract

- `scripts/validate-wave.ps1` must stop on the first validation failure.
- `scripts/capture-wave-screens.ps1` must honor the capture guard and avoid loops.
- `scripts/build-review-pack.ps1` must create `artifacts/review-packs/<wave_id>-review-pack.zip`.
- `scripts/run-wave.ps1` must orchestrate validate, capture, pack, and automation summary output.

## Permanent Governance Rules

1. No touched visible action may remain dead.
2. Every touched action must end as `WORKING`, `DISABLED WITH REASON`, or `HIDDEN`.
3. Every future wave must produce screenshot evidence.
4. The user must not need to manually assemble the review pack.
