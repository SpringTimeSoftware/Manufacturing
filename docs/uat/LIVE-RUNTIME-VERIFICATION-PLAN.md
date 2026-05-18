# Live Runtime Verification Plan

Purpose: verify runtime dependencies that cannot be proven by code-only validation. Run this after business master data setup and before any production pilot.

Status values:
- Not started
- Pass
- Fail
- Blocked by credentials
- Blocked by device/runtime
- Business decision needed

## 1. Email Provider

| Check | Required evidence | Expected result | Status |
| --- | --- | --- | --- |
| Credential reference present | Provider detail screenshot showing credential reference only, not secret | Raw secret is not exposed | Not started |
| Sender identity | Sender email/domain ownership or sandbox identity | Sender is configured and active | Not started |
| Sandbox/live mode | Provider environment field | UAT uses Sandbox unless business approves live | Not started |
| Send test | Outbound message id, provider response, recipient inbox evidence | Status moves Queued/Sending/Sent or Failed with reason | Not started |
| Provider message id captured | Outbound message ledger | Provider message id stored when provider returns it | Not started |
| Failure reason captured | Forced invalid recipient or invalid credential test | Failure reason visible in ledger/UI | Not started |
| Retry captured | Retry attempt after a failed message | Attempt count and status update without duplicate source send | Not started |

## 2. WhatsApp Provider

| Check | Required evidence | Expected result | Status |
| --- | --- | --- | --- |
| BSP credentials | Provider registry credential reference | Missing credentials block live send | Not started |
| Business number | Provider detail screenshot | Business number/reference present | Not started |
| Approved template | Template registry/reference | Free-form message blocked; approved template allowed | Not started |
| Callback URL | Provider callback URL and public reachability result | Callback URL reachable from provider sandbox | Not started |
| Send test | Outbound ledger and recipient device evidence | Status and provider message id captured | Not started |
| Delivery receipt test | Inbound callback event | Delivery receipt updates message status | Not started |
| Missing-template block test | Attempt send without template | Clear missing-template reason, no fake success | Not started |

## 3. SMS Provider

| Check | Required evidence | Expected result | Status |
| --- | --- | --- | --- |
| Sender ID | Provider detail | Sender ID configured or send blocked | Not started |
| Gateway credential | Credential reference | Raw secret not stored in normal table | Not started |
| Send test | Outbound ledger, phone receipt evidence | Status and provider id captured or failure shown | Not started |
| Delivery status test | Delivery callback/query response | Delivery status persisted | Not started |

## 4. CRM

| Check | Required evidence | Expected result | Status |
| --- | --- | --- | --- |
| Tenant/org | CRM provider detail | Tenant/org reference configured | Not started |
| Object mapping | CRM mapping screen | Customer/account, contact, quote/opportunity mappings are governed | Not started |
| External ID mapping | Mapping table screenshot/API response | External id persists per ERP object | Not started |
| Sync test | CRM sync job and external CRM evidence | Sync creates/updates intended mapped object only | Not started |
| Conflict test | Deliberate missing/stale mapping | Conflict visible and not silently overwritten | Not started |

## 5. Webhooks

| Check | Required evidence | Expected result | Status |
| --- | --- | --- | --- |
| Callback URL | Public URL and route health evidence | Callback route reachable | Not started |
| Signature verification | Signed callback test result | Valid signature accepted; invalid signature rejected if configured | Not started |
| Outbound delivery | Webhook event ledger | Payload snapshot, response code, status persisted | Not started |
| Inbound callback | Inbound event ledger | Raw payload hash and parsed event persisted | Not started |
| Retry/failure queue | Forced endpoint failure | Attempt count, next retry, failure reason visible | Not started |

## 6. AI

| Check | Required evidence | Expected result | Status |
| --- | --- | --- | --- |
| Provider/model credential | AI provider/model config | Missing credential blocks draft generation | Not started |
| Draft creation | AI draft run record | Draft output stored with source context | Not started |
| Review required | Review status screenshot | Draft cannot apply/send before review | Not started |
| No auto-send/no auto-post | Attempt operational apply/send without review | Action blocked; no transaction/post/send created | Not started |

## 7. Barcode / Scanner

| Check | Required evidence | Expected result | Status |
| --- | --- | --- | --- |
| Hardware scanner keyboard-wedge | Device scan log | Scan source recorded as hardware or scanner input path | Not started |
| Camera scan | Browser/native camera test screenshot | Scan source recorded as camera where runtime permits | Not started |
| Manual fallback labelled | Mobile/web scan screen screenshot | Manual entry clearly labelled manual | Not started |
| Invalid barcode | Scan event and UI error | Clear reason; no first-result fallback | Not started |
| Item/bin/lot/serial/PCID resolution | Scan event and resolved entity evidence | Unique entity resolved or explicit ambiguity shown | Not started |

## 8. Camera / Photo Evidence

| Check | Required evidence | Expected result | Status |
| --- | --- | --- | --- |
| Photo capture runtime | Device/browser permission and captured photo metadata | Capture works or is blocked with permission/runtime reason | Not started |
| Metadata persistence | Evidence metadata record | Captured by, captured at, device id, source document stored | Not started |
| Upload/storage path | Attachment/output metadata | Binary upload stores path/checksum when adapter exists | Not started |
| Disabled reason when adapter absent | UI screenshot | Action disabled with clear reason; no fake upload success | Not started |

## 9. Offline / Network Loss

| Check | Required evidence | Expected result | Status |
| --- | --- | --- | --- |
| Queue operation offline | Offline operation record/screenshot | Operation has idempotency key and Queued status | Not started |
| Restore network | Sync log | Operation moves Synced or Failed/Conflict with reason | Not started |
| Duplicate sync/idempotency | Retry same operation | No duplicate stock movement, POD, inspection, or service visit | Not started |
| Conflict scenario | Change stock/status/document before sync | Conflict status visible and resolvable | Not started |
| Revoked device sync block | Revoke device then sync | Sync/post blocked or requires review per policy | Not started |

## 10. Deployment / Runtime

| Check | Required evidence | Expected result | Status |
| --- | --- | --- | --- |
| IIS publish folder | Publish directory path and timestamp | `src/server/STS.Mfg.Host/bin/Release/net9.0/publish/` or live IIS path has current files | Not started |
| API health | Health endpoint response | 200/healthy with expected environment | Not started |
| DB connectivity | API/database smoke log | App connects to configured SQL Server | Not started |
| Auth/login | Role-wise sign-in screenshots | Admin and domain users can sign in | Not started |
| Static assets | Browser asset hash/network evidence | Current JS/CSS assets load, no stale bundle | Not started |
| Mobile runtime | Device app/PWA launch evidence | Mobile shell loads assigned tasks | Not started |
| Logs | Log folder and sample error/info log | Logs writable and accessible to support | Not started |
| Error handling | Forced validation/API error | User-facing message clear; server logs traceable | Not started |
| Backup drill | Backup file path and timestamp | Database backup succeeds | Not started |
| Restore verification | Restored database smoke evidence | Restore succeeds and app can read restored copy | Not started |
| Performance smoke | Route timing report | High-risk routes load within agreed UAT threshold | Not started |

## Runtime Signoff

| Runtime owner | Name | Date | Status | Notes |
| --- | --- | --- | --- | --- |
| IT / Infrastructure |  |  | Pending |  |
| Integration owner |  |  | Pending |  |
| Mobile/device owner |  |  | Pending |  |
| Finance systems owner |  |  | Pending |  |
| Business UAT lead |  |  | Pending |  |
