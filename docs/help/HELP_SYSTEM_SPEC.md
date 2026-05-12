# Help System Specification

Run: HELP-SYSTEM-AND-ACTION-COMPLETION-01
Date: 2026-05-12

## Purpose

The ERP help system gives users product guidance inside the live web app. It covers Help Center search, screen help, selected-tab help, important field help, action reasons, process guides, glossary terms, and a read-only quick help assistant grounded to internal product help records.

## Web Surfaces

- `/help` opens the Help Center.
- `/help/topics/:topicId` opens a screen help topic.
- `/help/process/:guideId` opens a process guide.
- `/help/glossary` opens the glossary.
- Every `ListPageShell` page renders a Help button when a help entry exists for the current route.
- Every `ErpModalWorkspace` renders a compact Help button so large create/edit/detail workspaces can show screen and selected-tab help.

## Content Source

The in-app help is defined in `src/web/src/help/helpContent.ts`. It is local product content only:

- screen help records
- tab help records
- field help records
- action help records
- process guide records
- glossary records

Quick Help answers are generated from those records and return a bounded "topic is not available" response when no matching product content exists.

## Action Truth Coverage

The shared action rules remain:

- visible actions must work, be disabled with a business-safe reason, or be hidden
- New / Create opens a workspace when the screen supports an inspectable draft
- Save stays disabled with a visible business reason when the write workflow is not enabled
- upload stays disabled unless the record state and storage policy allow it

This run also makes the item group, item attribute, reason-code, and classification New actions open centered draft workspaces. Their Save actions remain disabled with visible business reasons.

## Selected-Tab Help

Selected-tab help is available through modal workspace Help. The help button reads the active tab from standard tab semantics and known item-master section tabs, then displays tab-specific guidance when a matching record exists.

Implemented tab help covers:

- Item Master
- Customer Master
- Supplier Master
- BOM Library / BOM Editor
- Routing
- Price Lists
- Discount Schemes
- Tax, Currency & Terms
- Work Orders
- Job Cards
- NCR / Deviation

## Boundaries

The quick help assistant is read-only. It does not write data, run transactions, approve records, upload files, or call external services.
