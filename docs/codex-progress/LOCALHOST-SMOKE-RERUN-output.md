# Localhost Smoke Rerun Output

## Scope Completed

- Reran the focused localhost smoke test after the company/branch API fix.
- Kept the run bounded to smoke verification and did not execute any P-series prompt.
- Used the existing IIS publish-folder localhost path.

## Smoke Result

Overall result: PASS for the requested smoke checklist.

| Area | Result |
| --- | --- |
| Localhost root page | PASS |
| Login page | PASS |
| Seeded login | PASS |
| Home/dashboard shell | PASS |
| Health live/ready | PASS |
| Company API/page | PASS |
| Branch API/page | PASS |
| Department page/API | PASS |
| Notifications | PASS |
| Approvals | PASS |
| Admin/settings pages | PASS |
| Planning/manufacturing page | PASS |

## Key Evidence

- `/api/companies?page=1&pageSize=20` returned HTTP `200`.
- `/api/branches?page=1&pageSize=20` returned HTTP `200`.
- `/api/health/live` returned `Healthy`.
- `/api/health/ready` returned `Healthy`.
- Authenticated smoke navigation opened company, branch, department, notification, approval, admin/settings, BOQ, and work-order surfaces.

## Files Updated

- `/docs/uat/LOCALHOST_SMOKE_TEST_REPORT.md`
- `/docs/codex-progress/LOCALHOST-SMOKE-RERUN-output.md`

## Remaining Non-Smoke Gaps

- Role-wise UAT still has partial results due missing role seeds, unrelated endpoint failures, and limited transactional UAT data.

