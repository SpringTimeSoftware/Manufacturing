# Localhost Smoke Test Report

## Scope

This report records the smoke rerun after the company and branch API runtime fix. It covers only the current localhost deployment at `http://127.0.0.1:5088` and does not execute full role-wise UAT.

## Environment

| Item | Value |
| --- | --- |
| Host URL | `http://127.0.0.1:5088` |
| Publish folder | `C:\StsPackages\Manufacturing_ERP\artifacts\iis-publish` |
| Host executable | `STS.Mfg.Host.exe` |
| Database target | `Manufacturing_ERP` on `120.138.10.194` |
| Login used | Seeded `platform.admin` context for company `1`, branch `11` |

## Smoke Checklist

| Checkpoint | Result | Evidence |
| --- | --- | --- |
| Application opens on localhost | PASS | Root page returned HTTP `200` and the web shell loaded. |
| Login page loads | PASS | Login route loaded with production login copy and no internal prompt/framework text. |
| Login works | PASS | Seeded `platform.admin` login succeeded and `/api/auth/me` returned HTTP `200`. |
| Home/dashboard shell loads | PASS | Home route opened after authenticated session bootstrap. |
| `/api/health/live` | PASS | Returned `Healthy`. |
| `/api/health/ready` | PASS | Returned `Healthy`. |
| Company page and `/api/companies` | PASS | Company route opened; API returned HTTP `200` with `ACME`. |
| Branch page and `/api/branches` | PASS | Branch route opened; API returned HTTP `200` with `ACME-N`. |
| Department page | PASS | Department route opened; `/api/departments` returned HTTP `200`. |
| Notifications | PASS | Notification route opened; `/api/notifications` returned HTTP `200`. |
| Approvals | PASS | Approval route opened; `/api/approvals` returned HTTP `200`. |
| Admin/settings pages | PASS | User, role, language, workflow/numbering, and tenant settings routes opened. |
| Planning/manufacturing page | PASS | BOQ requirements and work-order routes opened; `/api/work-orders` returned HTTP `200`. |
| Fatal startup/runtime exception check | PASS | No fatal startup exception blocked login or normal smoke navigation. |

## Direct API Results

| Endpoint | Result |
| --- | --- |
| `/api/health/live` | HTTP `200` |
| `/api/health/ready` | HTTP `200` |
| `/api/auth/login` | HTTP `200` |
| `/api/auth/me` | HTTP `200` |
| `/api/companies?page=1&pageSize=20` | HTTP `200` |
| `/api/branches?page=1&pageSize=20` | HTTP `200` |
| `/api/departments?page=1&pageSize=20` | HTTP `200` |
| `/api/notifications?page=1&pageSize=20` | HTTP `200` |
| `/api/approvals?page=1&pageSize=20` | HTTP `200` |
| `/api/work-orders?page=1&pageSize=20` | HTTP `200` |

## Browser Route Results

| Route | Expected surface | Result |
| --- | --- | --- |
| `/` | Home | PASS |
| `/organization/companies` | Company Master | PASS |
| `/organization/branches` | Branch Master | PASS |
| `/organization/departments` | Department Master | PASS |
| `/platform/notifications` | Notification Center | PASS |
| `/platform/approvals` | Approval Workbench | PASS |
| `/platform/users` | User Management | PASS |
| `/platform/roles` | Role & Permission Matrix | PASS |
| `/platform/translations` | Language Setup | PASS |
| `/platform/workflow-numbering` | Workflow & Numbering Setup | PASS |
| `/platform/tenant-settings` | Tenant Settings | PASS |
| `/planning/boq-requirements` | BOQ / Requirements | PASS |
| `/production/work-orders` | Work Orders | PASS |

## Current Smoke Status

Smoke result: PASS for the requested localhost smoke checklist.

The company and branch API failures from the previous smoke report are resolved. Remaining role-wise UAT gaps are documented separately in `/docs/uat/LOCALHOST_ROLE_WISE_UAT_RESULTS.md`.

