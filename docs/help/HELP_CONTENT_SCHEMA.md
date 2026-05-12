# Help Content Schema

Run: HELP-SYSTEM-AND-ACTION-COMPLETION-01

## HelpScreenRecord

| Field | Meaning |
| --- | --- |
| `id` | Stable topic id used in Help Center routes. |
| `route` | Web route where the help applies. |
| `title` | Business-facing screen title. |
| `domain` | ERP domain such as Master Data, Planning, Quality, or Platform. |
| `purpose` | What the screen is for. |
| `targetRoles` | Roles that normally use the screen. |
| `prerequisites` | Setup or context that should exist first. |
| `keyActions` | Main user actions. |
| `statuses` | Status values users may see. |
| `commonMistakes` | Business mistakes to avoid. |
| `relatedScreens` | Where this screen connects later. |
| `tabs` | Optional selected-tab help records. |
| `fields` | Important field help records. |
| `actions` | Action help and disabled-reason records. |

## TabHelpRecord

| Field | Meaning |
| --- | --- |
| `tab` | Visible tab label. |
| `purpose` | What the tab controls or explains. |
| `actions` | Common actions on that tab. |
| `commonMistakes` | Mistakes to avoid on that tab. |

## FieldHelpRecord

| Field | Meaning |
| --- | --- |
| `fieldId` | Stable field id. |
| `label` | Visible field label. |
| `screenOrTab` | Screen or tab where the field appears. |
| `controlType` | Text, lookup, number, decimal, money, file action, or status. |
| `lookupSource` | Governing master or setup source, if any. |
| `validation` | Business validation rule. |
| `examples` | Example values. |
| `meaning` | Business meaning. |

## ActionHelpRecord

| Field | Meaning |
| --- | --- |
| `action` | Visible action label or action family. |
| `purpose` | What the action does. |
| `allowedWhen` | When the action may run. |
| `disabledReason` | Business-safe reason shown or explained when unavailable. |
| `dependencies` | Required records, workflow state, or permissions. |

## Quick Help Rules

- Current screen route is used first.
- Selected tab is used when available.
- Questions about disabled actions resolve to action help.
- Questions about status resolve to screen statuses and glossary definitions.
- Questions about prerequisites resolve to `prerequisites`.
- Questions about downstream use resolve to `relatedScreens`.
- Unknown topics return a bounded "not available" answer.
