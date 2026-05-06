# Sidebar Reference Match Checklist

Reference: `/reference-ui/desired-sidebar-dashboard-9001.png`

Date: 2026-04-22

| Check | Result | Notes |
| --- | --- | --- |
| Brand card matches target style | PASS | Sidebar uses a compact white card, subtle border/shadow, product name, required subtitle, and a small blue accent dot. |
| Section headers match target style | PASS | Headers are small, uppercase, muted labels with only a subtle chevron for collapsible groups. |
| Icons match target style | PASS | Menu icons are consistent inline SVG line icons with shared size, stroke, spacing, and active color treatment. |
| Active state matches target style | PASS | Active menu row uses a soft blue background, subtle border, stronger text, and highlighted icon color. |
| No generated-looking count badges | PASS | Numeric section count chips were removed from group headers; no `LESS` or `+N` labels are rendered. |
| Header controls not clipped | PASS | Company and branch controls use wider responsive grid tracks, nowrap select text, and compact aligned action buttons. |

## Remaining Visual Gaps

- No checklist item is marked PARTIAL or FAIL.
- No automated pixel-diff exists for the 9001 reference; future visual QA can add screenshot comparison if the project wants stricter image-level regression checks.
