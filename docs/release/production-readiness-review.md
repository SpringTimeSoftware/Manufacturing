# Production Readiness Review

## Decision

STS Manufacturing ERP is ready for controlled demo/UAT packaging after P149, with pilot blockers tracked below. The repository preserves the manufacturing execution backbone, IIS publish-folder deployment, reference UI visual language, and remediation-era compatibility rules.

## Validation Gates

| Gate | Expected Result |
| --- | --- |
| Backend build | `dotnet build src/server/STS.Mfg.sln` passes. |
| Backend tests | `dotnet test src/server/STS.Mfg.sln --no-build` passes. |
| Host publish | `dotnet publish src/server/STS.Mfg.Host/STS.Mfg.Host.csproj -c Release` produces one IIS-ready folder. |
| Web typecheck/test/build/host build | `npm run typecheck`, `npm test`, `npm run build`, and `npm run build:host` pass in `/src/web`. |
| Mobile supported validation | `/src/mobile` coverage-plan validation passes; full RN component/device harness is not yet installed. |

## Design QA Against Reference UI

| Area | Status | Notes |
| --- | --- | --- |
| Palette and surfaces | Pass | Web keeps the sky-blue/white, rounded-card, soft-gradient visual language. |
| Dense data hierarchy | Pass | BOM, BOQ, WO, JC, machine board, and dashboards preserve tables, KPI strips, filters, and drawers. |
| Status semantics | Pass | Badges and pills preserve warning/success/danger/neutral meanings across modules. |
| Mobile split | Pass | Mobile remains action/execution focused: job cards, quantities, downtime, QC, dispatch proof, sync status. |
| Deployment model | Pass | IIS publish-folder model remains the only web/host deployment path. |

## Production Blockers Before Customer Pilot

| Blocker | Owner Area | Required Closure |
| --- | --- | --- |
| Rate limiting | Backend/API | Closed for Wave 2 baseline; monitor and tune bucket thresholds during UAT. |
| Real provider adapters | Integrations | Bind Email/Sms/WhatsApp and AI providers to approved production secret store. |
| Attachment authorization tests | Security | Closed for Wave 2 baseline attachment list/read scoping; add new tests as preview/download surfaces expand. |
| Mobile RN test harness | Mobile | Install real mobile dependencies and component/device test stack before app-store style release. |
| Row-level import repair | Integrations | Add failed-row persistence if pilot users need row-by-row import correction. |
| Demo data breadth | UAT | Promote full scenario records into executable guarded seed/reset scripts. |

## Final Backlog

- Tune security rate limiting and expand audit viewer boundary tests during UAT hardening.
- Add real provider delivery adapters behind the P138 abstraction.
- Expand AI assistant execution from safe plan generation to controlled stored-procedure execution only after approval and telemetry are in place.
- Add React Native Testing Library or equivalent when the mobile dependency tree is installed.
- Expand UAT seed data for make-to-order, mixed UOM, outside processing, and delayed-order scenarios.

## Stop Boundary

- P149 is the final prompt in `/03-manifests/prompt_index.csv`.
- No P150 prompt exists in the repo sequence and none was executed.
