# Design: Admin Web Dark Mode

## Technical Approach

Add an `admin-web` theme layer that resolves a binary `light` or `dark` theme before React renders, then keeps React state, `localStorage`, and the document theme attribute in sync. CSS remains the styling boundary: `index.css` owns semantic tokens, page CSS consumes tokens, and hardcoded badge/error/shadow palettes are replaced with theme-aware variables.

## Architecture Decisions

| Decision | Choice | Alternatives considered | Rationale |
|---|---|---|---|
| Theme marker | Use `document.documentElement.dataset.theme = "light" | "dark"` | Body class, React-only state | `html[data-theme]` lets global CSS variables apply before React mounts and keeps the selector explicit. |
| First paint | Add a tiny pre-render resolver in `main.tsx` or adjacent theme module and call it before `createRoot(...)` | Wait for provider effect | A React effect is too late for the initial paint stability requirement. The resolver can read storage, fallback to `matchMedia`, then set the root attribute immediately. |
| Runtime state | Create `src/providers/ThemeProvider.tsx` and `src/hooks/useTheme.ts` | Store theme directly in `Layout` | Provider follows existing `AppProviders` pattern and keeps layout focused on UI composition. |
| Visible modes | Expose only `theme` and `toggleTheme()` where `theme` is resolved `light`/`dark` | Expose `system` state | Product requires no visible third state. Absence of storage means “system fallback”, but UI still renders as light or dark. |
| Tokens | Expand semantic variables in `index.css` under `:root` and `html[data-theme='dark']` | Duplicate page styles per theme | Token switching minimizes CSS churn and centralizes contrast decisions. |

## Data Flow

```text
main.tsx pre-render resolver
  ├─ read localStorage("admin-web-theme") if valid
  ├─ else read matchMedia("(prefers-color-scheme: dark)")
  └─ set html[data-theme]

ThemeProvider initial state ← current html[data-theme]
Layout toggle → setTheme(next) → localStorage + html[data-theme] + React state
```

System preference changes are only relevant before a manual selection exists. After the user toggles, persisted `light` or `dark` wins over future OS changes.

## File Changes

| File | Action | Description |
|---|---|---|
| `apps/admin-web/src/lib/theme.ts` | Create | Browser-safe theme resolution, storage read/write, root attribute application, and constants. |
| `apps/admin-web/src/providers/ThemeProvider.tsx` | Create | Holds resolved theme state and exposes binary toggle behavior. |
| `apps/admin-web/src/hooks/useTheme.ts` | Create | Typed hook for layout/components. |
| `apps/admin-web/src/providers/AppProviders.tsx` | Modify | Wrap app with `ThemeProvider` inside router/auth provider stack. |
| `apps/admin-web/src/main.tsx` | Modify | Apply the initial theme before `createRoot`. |
| `apps/admin-web/src/index.css` | Modify | Add light/dark semantic tokens for background, surface, text, border, focus, badges, errors, shadows, and button text. |
| `apps/admin-web/src/components/Layout.tsx` | Modify | Add always-visible theme toggle in the fixed sidebar. |
| `apps/admin-web/src/components/Layout.css` | Modify | Style toggle with existing BEM-like classes and theme tokens. |
| `apps/admin-web/src/pages/*.css` | Modify | Replace hardcoded status badge, error, button text, and shadow colors with tokens. |
| `apps/admin-web/src/**/*.test.tsx` | Create | Add focused tests for resolution, persistence, and toggle behavior. |

## Interfaces / Contracts

Theme values are limited to `type Theme = 'light' | 'dark'`. Storage key: `admin-web-theme`. Invalid or inaccessible storage values are ignored. Missing `matchMedia` falls back to `light`.

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Unit | `resolveInitialTheme`, storage guards, invalid values, missing `matchMedia` | Vitest with mocked `localStorage` and `window.matchMedia`. |
| Component | `Layout` toggle visibility and immediate switch | React Testing Library render under `ThemeProvider`; assert button state and `html[data-theme]`. |
| Integration | Manual selection persists and overrides system changes | Simulate toggle, rerender/reload setup, change mocked media query, assert persisted theme remains. |

## Migration / Rollout

No migration required. Existing browsers have no stored preference, so first visit resolves from OS preference.

## Open Questions

- None.
