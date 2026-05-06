# P010 — Offline/mobile sync strategy

## Phase
Phase 0 - Offline

## Objective
Document what mobile can do offline and how conflicts are resolved.

## Read first
- `/00-blueprint/STS_Manufacturing_ERP_Blueprint.md`
- `/00-blueprint/screen_inventory.csv`
- `/00-blueprint/api_inventory.csv`
- `/00-blueprint/db_entities.csv`
- `/00-blueprint/stored_procedure_inventory.csv`
- `/reference-ui/README.md`
- `/docs/ops/observability.md`

## Work to do
- List mobile actions that must work offline: start/pause/resume, qty entry, downtime, QC capture, photos, shift handover.
- Define local queue design, idempotency tokens, retries, and conflict detection.
- Define precedence rules when server state changes while device is offline.
## Deliverables for this prompt
- `/docs/mobile/offline-sync-strategy.md`

## Definition of done
- Offline strategy covers queueing, retries, conflict visibility, and user recovery.

## Handoff notes
- Update the running progress notes in `/docs/codex-progress/`.
- Record open issues, shortcuts taken, and unresolved dependencies explicitly.
- Next prompt: `/02-prompts/P011_architecture-baseline-sign-off.md`
