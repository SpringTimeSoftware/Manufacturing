# API Envelope

## Objective

All HTTP APIs must return predictable envelopes for success, validation failure, domain rejection, paging, and action results.

## Success Envelope

```json
{
  "success": true,
  "message": null,
  "data": {},
  "errors": [],
  "meta": {
    "correlationId": "01HZX...",
    "timestampUtc": "2026-04-17T00:00:00Z"
  }
}
```

## Validation Failure Envelope

```json
{
  "success": false,
  "message": "Validation failed.",
  "data": null,
  "errors": [
    {
      "code": "validation.required",
      "field": "salesOrderId",
      "message": "Sales order is required."
    }
  ],
  "meta": {
    "correlationId": "01HZX...",
    "timestampUtc": "2026-04-17T00:00:00Z"
  }
}
```

## Domain Rejection Envelope

```json
{
  "success": false,
  "message": "Work order cannot be released.",
  "data": null,
  "errors": [
    {
      "code": "work_order.material_shortage",
      "field": null,
      "message": "Material shortage exists for one or more required lines."
    }
  ],
  "meta": {
    "correlationId": "01HZX...",
    "timestampUtc": "2026-04-17T00:00:00Z"
  }
}
```

## Paging Contract

```json
{
  "success": true,
  "message": null,
  "data": {
    "items": [],
    "page": 1,
    "pageSize": 25,
    "totalCount": 240,
    "totalPages": 10
  },
  "errors": [],
  "meta": {
    "correlationId": "01HZX...",
    "timestampUtc": "2026-04-17T00:00:00Z"
  }
}
```

## Filter Contract

Standard list filters should support:

- `page`
- `pageSize`
- `search`
- `status`
- `dateFrom`
- `dateTo`
- module-specific fields such as `branchId`, `warehouseId`, `customerId`, `machineId`

Filters should be typed and documented per endpoint group.

## Action Result Contract

State-changing actions should return a compact action result:

```json
{
  "success": true,
  "message": "Work order released.",
  "data": {
    "id": "WO-1001",
    "status": "Released",
    "referenceNo": "WO-1001",
    "warnings": []
  },
  "errors": [],
  "meta": {
    "correlationId": "01HZX...",
    "timestampUtc": "2026-04-17T00:00:00Z"
  }
}
```

## Error Shape Rules

- `code` is machine-readable and stable.
- `field` is used only for field-level validation or mapping to UI controls.
- `message` is user-readable and safe to display or log.
- Internal stack traces never return to the client.

## HTTP Status Guidance

- `200` for successful reads and state changes that complete normally
- `201` for creation where a new resource is created
- `400` for validation errors
- `401` for unauthenticated requests
- `403` for permission or scope denial
- `404` for missing resources
- `409` for business state conflicts or idempotency collisions
- `500` for unhandled server failures with redacted client-safe response
