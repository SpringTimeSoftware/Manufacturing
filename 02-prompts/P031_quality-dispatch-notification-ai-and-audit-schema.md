# P031 — Quality, dispatch, notification, AI, and audit schema

## Phase
Phase 1 - Database

## Objective
Complete remaining transactional structures.

## Read first
- `/00-blueprint/STS_Manufacturing_ERP_Blueprint.md`
- `/00-blueprint/screen_inventory.csv`
- `/00-blueprint/api_inventory.csv`
- `/00-blueprint/db_entities.csv`
- `/00-blueprint/stored_procedure_inventory.csv`
- `/reference-ui/README.md`
- `/docs/database/P030-production-execution.md`
- `/docs/security/audit-strategy.md`

## Work to do
- Design InspectionPlans, InspectionRecords, InspectionResults, NonConformances, PackLists, PackListLines, Shipments, ShipmentLines, NotificationTemplates, Notifications, AiProviders, AiModels, AiPromptTemplates, AiRuns, AuditLogs, and Attachments.
- Document linkage points to work orders, lots, and sales orders.
## Deliverables for this prompt
- `/docs/database/P031-quality-dispatch-ai.md`

## Definition of done
- Keys, constraints, and relationships are documented.
- The design supports multi-company, branch, warehouse, bin, and role scoping.

## Handoff notes
- Update the running progress notes in `/docs/codex-progress/`.
- Record open issues, shortcuts taken, and unresolved dependencies explicitly.
- Next prompt: `/02-prompts/P032_master-data-validation-views-and-helper-functions.md`
