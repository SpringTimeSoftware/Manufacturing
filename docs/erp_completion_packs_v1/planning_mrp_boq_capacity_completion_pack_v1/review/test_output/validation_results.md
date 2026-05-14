# Planning Pack Validation Results

Date: 2026-05-14

## Passed Gates

- `cmd /c npm run typecheck`
- `cmd /c npm test` - 66 test files, 235 tests passed
- `cmd /c npm run audit:erp-completion`
- `cmd /c npm run build`
- `cmd /c npm run build:host`
- `dotnet build src/server/STS.Mfg.sln`
- `dotnet test src/server/STS.Mfg.sln --no-build` - 37 tests passed
- `dotnet publish src/server/STS.Mfg.Host/STS.Mfg.Host.csproj -c Release`

## Notes

- `npm test` and `npm run audit:erp-completion` were executed through `cmd /c` on Windows to avoid the PowerShell npm shim hanging without output.
- Vite emitted the existing large-chunk warning during production build; it did not fail the build.
- Planning scheduler, transfer conversion, and planning document upload are disabled with business-safe reasons where the supporting service/posting/document authorization contract is not present.
