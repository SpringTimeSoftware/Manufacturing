# Coding Standards

## Objective

These standards keep server, web, mobile, and SQL implementation consistent as prompts move from documentation into code.

## Non-Negotiable Engineering Rules

- Preserve the modular monolith architecture.
- Preserve IIS publish-folder deployment; never design runtime dependencies around raw web source on production.
- Respect the manufacturing vocabulary and status catalog. Do not invent alternate terms casually.
- Update `/docs/codex-progress/` after every prompt or major implementation step.

## Repository and Folder Rules

- Shared source roots:
  - `/src/server`
  - `/src/web`
  - `/src/mobile`
  - `/database`
  - `/contracts`
  - `/tests`
- Do not place production source code under `deploy`, `automation`, or `docs`.
- Do not create generic dumping folders such as `misc`, `helpers`, or `common` without a clear bounded purpose.

## Server Naming Rules

- Use `STS.Mfg.*` project and namespace prefixes.
- Use PascalCase for C# types, enum values, and public members.
- Command/query handlers should be named with explicit business intent, such as `ReleaseWorkOrderCommand`.
- DTOs must be suffixed clearly:
  - `Request`
  - `Response`
  - `Item`
  - `Filter`
  - `Summary`
- Avoid entity leakage across layers. API response DTOs should not directly expose EF entities.

## Web and Mobile Naming Rules

- Use TypeScript with explicit domain-driven naming.
- Components use PascalCase file names such as `WorkOrderListPage.tsx`.
- Hooks use `use` prefixes.
- State stores, API clients, and schema files should use descriptive names rather than generic `utils`.
- Route and folder paths under app code remain lower-case and platform-normalized.

## Module Boundary Rules

- Domain rules live in `Domain`, not in controllers or UI components.
- Application orchestration lives in `Application`.
- Infrastructure adapters live in `Infrastructure`.
- UI surfaces do not own business rules that belong in server workflows.
- Stored procedures own heavy multi-step transactional logic only when atomicity, auditability, or performance needs justify it.

## Test Naming Rules

- Server tests: `<Feature>Tests.cs` or `<Feature>IntegrationTests.cs`
- Web tests: `<feature>.test.tsx` or `<feature>.spec.ts`
- Mobile tests: `<feature>.test.tsx`
- Test names should describe business behavior, not implementation trivia.

## DTO and Contract Rules

- All API responses must use the shared response envelope.
- Filter endpoints should accept typed filter objects, not arbitrary unstructured blobs.
- Paging uses one consistent contract across modules.
- Status values exposed over APIs use canonical codes from the status catalog.

## SQL Naming Standards

- Tables: plural PascalCase, e.g. `WorkOrders`
- Views: `vw_<Area>_<Purpose>`
- Stored procedures: `sp_<Area>_<Action>`
- Seed scripts: `seed_<area>_<purpose>.sql`
- Migrations: ordered and timestamped or versioned consistently once the migration framework is introduced

## File Naming Rules

- Architecture notes: lower-case hyphenated markdown files in `/docs/architecture`
- Prompt outputs: `P###-output.md`
- Deployment scripts: target-specific names under `/deploy/iis` and `/deploy/mobile`

## Code Review Guardrails

- Reject code that changes the stack without prompt approval.
- Reject code that breaks the IIS publish-folder model.
- Reject UI work that ignores the reference design language.
- Reject logic that bypasses audit or workflow rules for sensitive actions.
- Reject APIs that mix unrelated modules into one coarse controller.
- Reject direct arbitrary SQL execution for AI features.
- Reject silent state transitions without audit trail or reason code where required.
- Reject duplicate domain vocabularies across server, UI, and SQL.

## Documentation Guardrails

- Every substantial implementation prompt must leave behind an architecture note, progress note, or equivalent artifact when the prompt requires it.
- Assumptions, shortcuts, blockers, and deferred questions must be written down explicitly.
