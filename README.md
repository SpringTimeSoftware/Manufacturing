# STS Manufacturing ERP Codex Pack

This pack is a self-contained implementation guide for a manufacturing ERP / production visibility product built on:

- ASP.NET Core
- SQL Server
- React web
- React Native mobile
- IIS publish-folder deployment

## What is included

- `00-blueprint/STS_Manufacturing_ERP_Blueprint.md` — full product blueprint
- `00-blueprint/screen_inventory.csv` — 95 web + 24 mobile screens
- `00-blueprint/db_entities.csv` — SQL entity inventory
- `00-blueprint/api_inventory.csv` — API group inventory
- `00-blueprint/stored_procedure_inventory.csv` — SQL procedure inventory
- `00-blueprint/role_matrix.csv` — role model
- `00-blueprint/dashboard_inventory.csv` — dashboard expectations
- `reference-ui/` — copied HTML reference screens from the user
- `02-prompts/` — 150 connected prompts for Codex
- `03-manifests/prompt_index.csv` — ordered prompt sequence

## How to use

1. Start with `00-blueprint/STS_Manufacturing_ERP_Blueprint.md`.
2. Read `reference-ui/README.md`.
3. Execute prompts in order starting from `02-prompts/P000_start-here-operating-rules-artifact-map-and-codex-workflow.md`.
4. After each prompt, update `/docs/codex-progress/`.
5. Do not skip foundational prompts even if some screens look easy.

## Guardrails

- Do not add HR, payroll, or full accounting into v1.
- Preserve the visual language of the supplied manufacturing HTML screens.
- Keep mobile action-centric.
- Keep AI draft/summarize/explain only unless explicitly approved otherwise.
- Keep deployment compatible with IIS publish folders.
