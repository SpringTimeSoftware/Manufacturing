# UAT Blocker Register

Purpose: central register for controlled internal UAT blockers. Add one row per observed issue. Do not close a P0/P1 blocker without retest evidence.

Severity:
- P0: blocks UAT continuation.
- P1: blocks workflow acceptance.
- P2: workaround acceptable with written approval.
- P3: cosmetic or later enhancement.

Decision values:
- Fix before UAT continues
- Workaround accepted
- Business decision needed
- Runtime/provider dependency
- Later enhancement

| Blocker ID | Date found | Module | Workflow | Role | Severity | Summary | Reproduction steps | Expected result | Actual result | Screenshot/evidence path | Owner | Status | Fix commit | Retest result | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| UAT-0001 |  |  |  |  |  |  |  |  |  |  |  | Open |  |  |  |

## Initial Register State

No P0/P1 blockers were open at the start of `CONTROLLED-INTERNAL-UAT-RUNTIME-READINESS-13`.

## Triage Rules

1. P0 blockers stop the dependent UAT stream immediately.
2. P1 blockers can allow unrelated scripts to continue, but the affected workflow cannot be accepted.
3. P2 blockers require an approved workaround note before script signoff.
4. P3 items are logged for backlog grooming and do not block controlled internal UAT.
5. Runtime/provider dependency items must include the missing credential, callback URL, device, network, or environment input.
6. Business decision items must name the decision owner and the policy question.
7. Retest must reference the fix commit or the runtime/provider change applied.

## Blocker Summary

| Severity | Open | Closed | Notes |
| --- | ---: | ---: | --- |
| P0 | 0 | 0 | None at readiness-kit creation. |
| P1 | 0 | 0 | None at readiness-kit creation. |
| P2 | 0 | 0 | Runtime/provider/device boundaries will be logged when UAT starts. |
| P3 | 0 | 0 | Cosmetic/enhancement items will be logged separately. |
