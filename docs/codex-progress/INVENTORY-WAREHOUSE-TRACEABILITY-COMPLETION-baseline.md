# Inventory / Warehouse / Traceability Completion Baseline

Prompt: `INVENTORY-WAREHOUSE-TRACEABILITY-COMPLETION-01`

Pack folder: `docs/erp_completion_packs_v1/inventory_warehouse_traceability_completion_pack_v1/`

## Baseline Scan

- Branch: `main`
- Existing routes: `/inventory/balances`, `/inventory/traceability`, `/inventory/material-issue`, `/inventory/material-return`, `/inventory/stock-transfer`, `/inventory/cycle-counts`, `/organization/warehouses`, `/organization/bins`
- Existing APIs: `/api/inventory`, `/api/inventory/transactions`, `/api/stock-reservations`, `/api/stock-issues`, `/api/stock-returns`, `/api/stock-transfers`, `/api/cycle-counts`, `/api/traceability/lots/{lotNo}`, `/api/traceability/serials/{serialNo}`
- Existing DB tables: `inventory.StockBalances`, `inventory.StockTransactions`, `inventory.StockReservations`, `inventory.Lots`, `inventory.Serials`, `inventory.CycleCounts`, `inventory.CycleCountLines`
- Existing live-data behavior: inventory adapters throw `liveDataUnavailable(...)` for live authenticated API failures and only use reference rows when no live session exists.

## P0 Gaps Found Before Implementation

- Traceability route accepted `?trace=` links from balance actions, but the page did not initialize search from the route context.
- Cycle-count detail rendered count-line editing as repeated per-line forms after the grid, which violated the compact desktop line-entry standard.
- Stock movement draft models carried lot and serial IDs, but the line grid did not expose governed lot/serial controls.
- License plate / PCID containment does not currently have a DB/API foundation; visible LP entry must be disabled with a clear reason until the containment ledger is added.

## Baseline Evidence

- Workbook `Current_Mapping` and `Gap_Template` were populated before code changes.
- Baseline scan logs were created under `artifacts/scan-logs/INVENTORY-WAREHOUSE-TRACEABILITY-COMPLETION-01/`.
