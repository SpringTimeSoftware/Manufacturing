# MERGE main eng-plan prod-exec Output

Date: 2026-05-08
Branch: `main`

## Remote Verification

- Fetched latest remote state from `origin`.
- Verified `origin/lane/eng-plan`.
- Verified `origin/lane/prod-exec`.
- Confirmed local `main` was up to date with `origin/main` before merging.

## Merge Results

- Merged `origin/lane/eng-plan` into `main` with no conflicts.
- Ran full validation after `lane/eng-plan`; all checks passed.
- Merged `origin/lane/prod-exec` into `main`.
- Resolved one generated host asset conflict in `src/server/STS.Mfg.Host/wwwroot/index.html`.
- Rebuilt host web assets from merged source, producing `src/server/STS.Mfg.Host/wwwroot/assets/index-KFBGDQau.js`.

## Validation

After `lane/eng-plan` merge:

- `npm run typecheck`: PASS
- `npm test`: PASS, 34 files / 136 tests
- `npm run build`: PASS
- `npm run build:host`: PASS
- `dotnet build src/server/STS.Mfg.sln`: PASS
- `dotnet test src/server/STS.Mfg.sln --no-build`: PASS, 12 tests
- `dotnet publish src/server/STS.Mfg.Host/STS.Mfg.Host.csproj -c Release`: PASS

After `lane/prod-exec` merge:

- `npm run typecheck`: PASS
- `npm test`: PASS, 34 files / 136 tests
- `npm run build`: PASS
- `npm run build:host`: PASS
- `dotnet build src/server/STS.Mfg.sln`: PASS
- `dotnet test src/server/STS.Mfg.sln --no-build`: PASS, 12 tests
- `dotnet publish src/server/STS.Mfg.Host/STS.Mfg.Host.csproj -c Release`: PASS

## Notes

- Existing uncommitted LONG-RUN work was preserved before the merge in `stash@{0}` as `pre-merge-long-run-01-work` and was not mixed into this merge task.
- Screenshot and lane output artifacts from both lane branches were retained.
