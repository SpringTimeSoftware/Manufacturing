# Component Design Contract

This pack should be implemented through shared components/classes where possible.

## 1. LargeWorkModal / WorkModal

### Props Concept
Use actual project conventions. The component may expose similar behavior:

```ts
type WorkModalProps = {
  open: boolean;
  title: string;
  subtitle?: string;
  statusBadges?: React.ReactNode;
  quickActions?: React.ReactNode;
  validationSummary?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  onClose: () => void;
  size?: 'standard' | 'large' | 'work';
};
```

### Contract
- `size='work'` is for enterprise work modals.
- Header/footer sticky inside modal.
- Body scrolls.
- Header must support title, subtitle, status badges, quick actions, Help, Close.

---

## 2. CompactValidationSummary

### Props Concept

```ts
type ValidationIssue = {
  id?: string;
  message: string;
  field?: string;
  severity?: 'error' | 'warning' | 'info';
};

type CompactValidationSummaryProps = {
  title?: string;
  issues: ValidationIssue[];
  defaultExpanded?: boolean;
  maxInlineItems?: number;
};
```

### Contract
- Collapsed state shows issue count and first few field/message hints.
- Expanded state shows full list.
- Preserve semantic accessibility with `aria-expanded`.
- Should not consume large height by default.

---

## 3. ResponsiveFormGrid

### Props Concept

```ts
type FieldSpan = 2 | 3 | 4 | 5 | 6 | 8 | 9 | 12;

type FormGridItemProps = {
  span?: FieldSpan;
  tabletSpan?: 6 | 12;
  mobileSpan?: 12;
  children: React.ReactNode;
};
```

### Contract
- Use CSS grid with 12 columns on desktop.
- Support span utility classes or prop-driven class names.
- Default field span should not be 12 on desktop unless explicitly required.
- Preserve existing labels/help/error rendering.

---

## 4. TransactionLineGrid

### Contract
- Desktop: table/grid layout with one header row.
- Rows contain controls only, no repeated labels.
- Mobile: stacked labeled card mode allowed.
- Existing validation messages must remain available but compact.
- Keyboard entry should not become worse.
- Horizontal scroll allowed.

---

## 5. TransactionActionToolbar

### Contract
- Supports enabled and disabled actions.
- Disabled actions must have tooltip/title explaining dependency.
- No fake backend calls.
- Use existing icon/button styles.

Example actions:

```ts
[
  { key: 'email', label: 'Email', disabled: true, reason: 'Pending communication API' },
  { key: 'whatsapp', label: 'WhatsApp', disabled: true, reason: 'Pending WhatsApp integration' },
  { key: 'attachments', label: 'Attachments', disabled: false },
  { key: 'notes', label: 'Notes', disabled: false },
  { key: 'audit', label: 'Audit', disabled: false },
  { key: 'print', label: 'Print', disabled: true, reason: 'Pending print template' }
]
```

