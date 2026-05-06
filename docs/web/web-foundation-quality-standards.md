# Web Foundation Quality Standards

## Scope

This note records the shared rules introduced in `P076` and consumed in `P077` without changing the IIS publish-folder deployment model.

## Accessibility and Interaction

- Every primary page now exposes a skip link targeting `#main-content`.
- Shared action rows in `DataGrid` support keyboard activation with `Enter` and `Space`.
- Shared drawers render as modal dialogs, restore focus on close, trap focus while open, and close on `Escape`.
- Shared loading and empty states are reusable primitives instead of one-off screen messages.

## Performance and Layout

- Dense grids can switch into a windowed row mode through the feature-flag layer.
- Drawers render only while open and use `contain` / `will-change` hints to reduce off-screen layout work.
- Reduced-motion preferences are respected globally.
- Sticky list shells preserve the existing planning/admin visual direction while reducing overflow churn on narrow screens.

## Demo and Feature Flags

- Demo badges, seeded navigation, print/export actions, dense-grid virtualization, empty-state hints, and notifications are all controlled through the front-end feature-flag provider.
- Platform Settings is the admin-owned place where those toggles are exercised.
- Seeded demo scenarios remain intact; no demo/mock adapter was removed in this wave.

## Regression Baseline

- `jsdom` plus Testing Library now covers the shared shell, data grid, and drawer behaviors.
- The baseline focuses on keyboard access, feature-flag consumption, empty states, and virtualization behavior.
