# Wave 2 Prompt — Packs 08 to 11

Use this prompt only for planning, sequencing, or a tightly managed sequential implementation run. Best practice remains one pack at a time.

```text
You are working in the ERP repository. Review and sequence Wave 2 completion packs:

08_integrations_email_whatsapp_crm_ai_completion_pack_v1
09_mobile_barcode_camera_offline_completion_pack_v1
10_udf_customization_completion_pack_v1
11_service_warranty_amc_completion_pack_v1

Important: Do not blur these packs together. Execute sequentially and produce a separate report after each pack.

Before implementation:
- Read 01_SHARED_NON_NEGOTIABLES.md.
- Read 02_CROSS_PACK_RESIDUAL_GAP_CLOSURE_AUDIT.md.
- Read each pack's README, completion_pack, acceptance gates, business decisions, and report template.
- Inspect repo structure and identify shared dependencies.

Wave 2 goals:
1. Close provider/integration runtime truth for email, WhatsApp/SMS, CRM, webhooks, import/export, and AI approval/audit.
2. Close mobile barcode/camera/offline/device-trust truth for warehouse, production, QC, dispatch, and service flows.
3. Close UDF/customization truth across forms, line grids, validations, reports, import/export, and APIs.
4. If service/AMC is in scope, close service/warranty/AMC; if later, create truthful skeleton and disabled reasons without fake actions.

Non-negotiable cross checks after every pack:
- provider/mobile success is never faked;
- offline queues are idempotent and conflict-aware;
- UDF values persist, reopen, report/export safely, and do not corrupt old transactions;
- service spare movements enforce inventory/bin/lot/serial rules;
- quote/SO/service billing commercial values remain correct where touched;
- revision references remain explicit.

Execution mode:
- Prefer one pack per commit/report.
- If you cannot complete all four deeply, stop after the last fully completed pack and report the rest as not executed.
- Do not claim Wave 2 complete until all four individual pack P0 gates pass or Pack 11 is formally marked later-scope with truthful skeleton only.

Final answer must include four separate pack reports, not one blended summary.
```