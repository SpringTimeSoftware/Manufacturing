# Screen To API Runtime Matrix

| Screen range | Screens | Primary runtime path | Runtime state | Notes |
| --- | --- | --- | --- | --- |
| `W001` | Login | `/api/auth/login`, `/api/auth/me`, `/api/auth/refresh` | `PARTIAL` | Live bootstrap auth works; database-backed user administration is not implemented. |
| `W002` | Forgot password/reset | `/api/auth/forgot-password` live-first with seeded fallback | `PARTIAL` | Request capture is SQL-backed; signed reset completion and external delivery remain future work. |
| `W003` | Company/branch/warehouse switch | `/api/auth/switch-context` plus local warehouse preference | `PARTIAL` | Company/branch switch is live; preferred warehouse persistence remains local. |
| `W004`, `W114` | Role home and executive cockpit | `/api/dashboards/order-delivery`, `/stage-wise`, `/executive-cockpit` with fallback | `PARTIAL` | Dashboard endpoints exist; role home composition remains client-side. |
| `W006`, `W007` | Notification center and approvals | `/api/notifications` and `/api/approvals` live-first with seeded fallback | `PARTIAL` | Inbox read/acknowledgment and approval decision capture are SQL-backed; full workflow routing remains future work. |
| `W008`, `W009` | Users, roles, permissions | `/api/users` and `/api/roles` live-first with seeded fallback | `PARTIAL` | SQL user/role rows mirror bootstrap identity for read visibility; write administration remains future work. |
| `W010` | Language setup | `/api/localization/resources` with fallback | `PARTIAL` | Read path is live; mutation workflow remains deferred. |
| `W011`, `W012` | Workflow/numbering/tenant settings | `/api/settings/workflow-rules` and `/api/settings/tenant-settings` live-first with seeded fallback | `PARTIAL` | Read visibility is SQL-backed; save/mutation flows remain future work. |
| `W020` | Company Master | `/api/companies` live-first with seeded fallback | `RUNNABLE` | P082 screen now has DDL and seed coverage. |
| `W021` | Branch Master | `/api/branches` live-first with seeded fallback | `RUNNABLE` | P082 screen now has DDL and seed coverage. |
| `W022` | Department Master | `/api/departments` live-first with seeded fallback | `RUNNABLE` | P082 screen now has DDL and seed coverage. |
| `W023` | Warehouse Master | `/api/warehouses` live-first with seeded fallback | `RUNNABLE` | P083 is completed; API, DDL, seed, and web coverage exist. |
| `W024` | Bin Master | `/api/bins` live-first with seeded fallback | `RUNNABLE` | P083 is completed; API, DDL, seed, and web coverage exist. |
| `W025` | Shift Calendar | `/api/shifts` live-first with seeded fallback | `RUNNABLE` | P083 is completed; the duplicate-label test assertion remains fixed. |
| `W029`, `W030` | UOM class/conversion | Backend APIs exist, web prompt not executed | `BLOCKED` web | Do not execute P084 in this run. |
| `W031` | Measurement profile/formula | Backend APIs exist, web prompt not executed | `BLOCKED` web | Do not execute P085 in this run. |
| `W040-W049` | Item/customer/supplier/detail/attachment setup | Backend master APIs partially exist; web prompts later | `BLOCKED` web | Keep compatibility adapters and do not invent screens now. |
| `W050-W075` | Sales, planning, procurement | Backend APIs and DDL exist for completed scope; web prompts later | `PARTIAL` | Web remains framework/placeholder until prompt chain reaches those screens. |
| `W080-W097` | Work orders, job cards, machine board, inventory and production execution | Backend APIs exist and DDL now covers base execution plus P064 outputs | `PARTIAL` | Web execution screens are later prompts; mobile remains intended action/execution channel. |
| `W100-W107` | Quality and dispatch | Backend APIs exist; web prompts later | `PARTIAL` | Screen implementation remains blocked by prompt chain sequencing. |
| `W108`, `W057`, `W109` | Stage-wise dashboard, order delivery dashboard, print pack | Dashboard/report APIs exist with client fallback | `PARTIAL` | Existing reference UI direction is preserved. |
| `W110-W113` | AI setup and review | Backend AI draft APIs exist; web prompts later | `BLOCKED` web | AI remains draft-only; no autonomous posting. |
| `W115` | Audit trail viewer | Audit writes exist; screen prompt later | `BLOCKED` web | No audit viewer screen is completed. |
