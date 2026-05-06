# STS Manufacturing ERP — Codex Rebaseline / Gap Remediation Plan

## Goal

Pause downstream implementation at `P063` and insert an Architecture V2 remediation pass for Master Data, Commercial, and Setup before continuing any more prompts.

## Current State

- Codex has reached `P063_job-card-and-downtime-apis.md`
- This means the repo already contains substantial downstream backend work
- The manufacturing execution path is partially implemented
- The missing areas are upstream ERP foundations that will contaminate later work if not corrected now

## Do Not

- do **not** continue to `P064`
- do **not** ask Codex to "fill gaps while continuing"
- do **not** rewrite the whole repository blindly

## Freeze Strategy

1. Commit current branch as-is
2. Create a new branch: `rebaseline/master-data-commercial-v2`
3. Copy the gap reports into the repo under `/01-analysis/gap-scan/`
4. Run the rebaseline prompt below
5. Let Codex produce a delta plan first
6. Only after approval should Codex touch schema/API/UI

## Files to place in repo before running the rebaseline prompt

Copy these files into the repo:

- `/01-analysis/gap-scan/STS_Manufacturing_Gap_Scan_Report.md`
- `/01-analysis/gap-scan/STS_Manufacturing_Gap_Scan_Report.csv`
- `/00-blueprint/STS_Manufacturing_ERP_Blueprint.md`
- `/00-blueprint/db_entities.csv`
- `/00-blueprint/api_inventory.csv`
- `/00-blueprint/screen_inventory.csv`
- `/00-blueprint/stored_procedure_inventory.csv`
- `/03-manifests/prompt_index.csv`
- `/AGENTS.md`
- `/docs/codex-progress/*`

## Exact Codex prompt to run now

```text
You are working in the STS Manufacturing ERP repository.

STOP the original prompt chain at P063. Do not execute P064 or later yet.

Read these first:
- /AGENTS.md
- /00-blueprint/STS_Manufacturing_ERP_Blueprint.md
- /00-blueprint/db_entities.csv
- /00-blueprint/api_inventory.csv
- /00-blueprint/screen_inventory.csv
- /00-blueprint/stored_procedure_inventory.csv
- /03-manifests/prompt_index.csv
- /docs/codex-progress/README.md
- all files under /docs/codex-progress/
- /01-analysis/gap-scan/STS_Manufacturing_Gap_Scan_Report.md
- /01-analysis/gap-scan/STS_Manufacturing_Gap_Scan_Report.csv

Your task is NOT to continue implementation.
Your task is to perform a design rebaseline and delta-impact analysis.

Produce these artifacts only:
1. /docs/codex-progress/R000-rebaseline-audit.md
2. /docs/codex-progress/R001-master-data-commercial-setup-v2-scope.md
3. /docs/codex-progress/R002-impact-on-existing-p000-p063.md
4. /docs/codex-progress/R003-gap-to-entity-api-screen-matrix.md
5. /docs/codex-progress/R004-new-prompt-sequence.md

Required outputs:
- classify every critical gap as KEEP / EXTEND / REFACTOR / NEW
- map each gap to DB entities, APIs, screens, jobs, reports, and permissions
- identify which completed prompts P000-P063 remain valid, which must be revised, and which must be superseded
- propose a new prompt sequence called R-series without deleting original prompts
- explicitly cover these missing areas:
  - item media, item documents, media assets
  - product catalogs and catalog visibility
  - pricing engine and price lists
  - discount / scheme engine
  - customer credit, payment, commercial controls
  - contacts, contact points, communication preferences, consent
  - packaging hierarchy, barcode mapping, dispatch packaging
  - replenishment policies and MTS support
  - landed cost, vendor return, sales return, backorder, drop-ship
  - UDF / metadata extensibility
  - tax / currency / trade terms
  - CRM-lite continuity where needed
  - job costing and cost rollup

Rules:
- do not change code yet unless absolutely required to generate the audit
- do not delete existing work
- preserve manufacturing execution work where possible
- preserve IIS publish-folder deployment model
- preserve React web + React Native mobile + ASP.NET Core + SQL Server stack
- end with exact next file path to execute after review

At the end, return:
- files created
- what is safe to keep from P000-P063
- what must be refactored before continuing
- exact recommended next prompt path
```

## Expected Outcome

Codex should return with a rebaseline package, not code.

After review, the next phase should be an `R-series` implementation flow similar to:

- `R010` Setup/meta/extensibility base
- `R011` Product master v2
- `R012` Catalog/media/documents
- `R013` Customer/contact/commercial control
- `R014` Supplier/compliance/returns/landed cost
- `R015` Pricing/discount/promotion/tax/currency
- `R016` Replenishment/packaging/barcode logistics
- `R017` CRM-lite + document templates + communication center
- `R018` Costing/job-costing rollup
- `R019` Migration strategy for existing P000-P063 work

## Practical judgement on current work

Likely safe to keep with limited refactor:
- work-order execution service patterns
- job-card execution service patterns
- downtime APIs
- dashboard/service shell patterns
- auth / audit / notification base layers

Likely needs refactor once V2 lands:
- item APIs and item screens
- customer/supplier APIs and screens
- quote / sales order commercial rules
- purchase commercial rules
- stock replenishment logic
- dispatch/commercial fulfillment rules

Likely new build areas:
- pricing engine
- discount engine
- catalog domain
- media/document domain
- contact + communication preference model
- credit and commercial control model
- UDF/extensibility model

## What to collect if you want human review before re-running Codex

Zip these and upload together:
- `/docs/codex-progress/`
- `/00-blueprint/`
- `/03-manifests/prompt_index.csv`
- `/AGENTS.md`
- changed backend code files from P044-P063
- any SQL migration folder or database project folder
