# P003 Output

## Objective Status

- Defined the build chain for web, server, and mobile.
- Locked the IIS publish-folder deployment model around a single ASP.NET Core host.
- Documented how compiled web assets move into `wwwroot` and why raw web source is not required on the live server.

## Deliverables Completed

- Created `/docs/architecture/deployment-model.md`
- Created `/docs/codex-progress/P003-output.md`

## Assumptions Captured

- Final publish commands will be added once project manifests exist.
- Environment-specific client configuration may use build-time injection or server-served bootstrap config, but still must not require raw source on IIS.

## Work Log

- Re-read repository layout and blueprint deployment guidance.
- Defined web build, host publish, IIS hosting, SPA fallback, configuration, and mobile separation rules.

## Open Issues / Blockers

- None for `P003`.

## Build / Test / Lint

- Not run. No solution or package manifests exist yet.

## Next Prompt

- `/02-prompts/P004_design-language-extraction-from-reference-ui.md`
