# P015 Language, Translation, Settings, Numbering, and Workflow Schema

All tables inherit common columns from `/docs/database/conventions.md` unless noted otherwise.

## Tables

### `platform.Languages`

Purpose: supported UI and message languages.

| Column | Notes |
| --- | --- |
| `LanguageCode` | ISO-like code such as `en-IN` |
| `LanguageName` | display name |
| `NativeName` | native-script name |
| `IsDefault` | deployment default |
| `IsEnabled` | bit |

Unique constraints:

- `UX_Languages_LanguageCode`

### `platform.Translations`

Purpose: key/value translations for UI labels, messages, and templates.

| Column | Notes |
| --- | --- |
| `LanguageId` | FK to `platform.Languages` |
| `TranslationKey` | stable key |
| `TranslationValue` | localized text |
| `Module` | optional domain scope |
| `CompanyId` | nullable override scope |
| `BranchId` | nullable override scope |

Unique constraints:

- `UX_Translations_LanguageId_CompanyId_BranchId_TranslationKey`

### `platform.AppSettings`

Purpose: feature and tenant setting persistence.

| Column | Notes |
| --- | --- |
| `SettingKey` | stable name |
| `SettingValue` | nvarchar/json payload |
| `ValueType` | `String`, `Number`, `Boolean`, `Json` |
| `CompanyId` | nullable override scope |
| `BranchId` | nullable override scope |
| `IsFeatureFlag` | bit |
| `IsSensitive` | bit |

Unique constraints:

- `UX_AppSettings_CompanyId_BranchId_SettingKey`

### `platform.DocumentSeries`

Purpose: document numbering rules with override support.

| Column | Notes |
| --- | --- |
| `DocumentType` | e.g. `SalesOrder`, `WorkOrder`, `JobCard` |
| `SeriesCode` | unique within scope |
| `PrefixPattern` | for example `SO-{YY}-{BR}` |
| `NextNumber` | current counter |
| `PaddingLength` | numeric padding |
| `ResetPolicy` | `Never`, `Yearly`, `Monthly` |
| `CompanyId` | nullable scope |
| `BranchId` | nullable scope |
| `IsDefault` | bit |
| `Status` | `Active`, `Inactive` |

Unique constraints:

- `UX_DocumentSeries_DocumentType_CompanyId_BranchId_SeriesCode`

### `platform.WorkflowDefinitions`

Purpose: workflow header per document type and scope.

| Column | Notes |
| --- | --- |
| `WorkflowCode` | unique code |
| `DocumentType` | target document |
| `CompanyId` | nullable scope |
| `BranchId` | nullable scope |
| `Description` | optional |
| `IsDefault` | bit |
| `Status` | `Draft`, `Active`, `Inactive` |

Unique constraints:

- `UX_WorkflowDefinitions_DocumentType_CompanyId_BranchId_WorkflowCode`

### `platform.WorkflowSteps`

Purpose: ordered workflow stages and approver requirements.

| Column | Notes |
| --- | --- |
| `WorkflowDefinitionId` | FK |
| `StepCode` | unique within workflow |
| `StepName` | display name |
| `SequenceNo` | order |
| `RequiredRoleCode` | role or approver group |
| `CanEditBeforeApproval` | bit |
| `CanReject` | bit |
| `CanReturn` | bit |

Unique constraints:

- `UX_WorkflowSteps_WorkflowDefinitionId_StepCode`
- `UX_WorkflowSteps_WorkflowDefinitionId_SequenceNo`

### `platform.WorkflowTransitions`

Purpose: allowed state changes and action semantics.

| Column | Notes |
| --- | --- |
| `WorkflowDefinitionId` | FK |
| `FromStatus` | canonical status |
| `ToStatus` | canonical status |
| `ActionCode` | e.g. `Approve`, `Reject`, `Release` |
| `RequiresComment` | bit |
| `RequiresReasonCode` | bit |
| `IsOverrideTransition` | bit |

Unique constraints:

- `UX_WorkflowTransitions_WorkflowDefinitionId_FromStatus_ToStatus_ActionCode`

## Scope Rules

- `Languages` are deployment-wide.
- `Translations`, `AppSettings`, `DocumentSeries`, and workflow definitions support company and branch override.
- Branch override wins over company default; company override wins over deployment default.

## Relationship Summary

- `Languages` 1:n `Translations`
- `WorkflowDefinitions` 1:n `WorkflowSteps`
- `WorkflowDefinitions` 1:n `WorkflowTransitions`

## Notes

- `platform.AppSettings` is an intentional addition beyond the base entity inventory to support feature flags and tenant settings screens.
