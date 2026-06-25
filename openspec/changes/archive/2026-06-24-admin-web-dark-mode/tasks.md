# Tasks: Admin Web Dark Mode

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 280-380 |
| 400-line budget risk | Medium |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Theme foundation and provider | PR 1 | Single PR; includes resolver tests. |
| 2 | Layout toggle and themed CSS | PR 1 | Depends on Unit 1; includes component/style tests. |

## Phase 1: Theme Foundation

- [x] 1.1 Create `apps/admin-web/src/lib/theme.ts` with `Theme = 'light' | 'dark'`, storage key, safe storage helpers, system preference fallback, and root `data-theme` application.
- [x] 1.2 Update `apps/admin-web/src/main.tsx` to apply the initial theme before `createRoot(...)`.
- [x] 1.3 Create `apps/admin-web/src/providers/ThemeProvider.tsx` with binary resolved state, `setTheme`, and `toggleTheme` that persist manual selections.
- [x] 1.4 Create `apps/admin-web/src/hooks/useTheme.ts` as the typed consumer hook.
- [x] 1.5 Update `apps/admin-web/src/providers/AppProviders.tsx` to wrap the app with `ThemeProvider` without changing auth/query behavior.

## Phase 2: UI Integration

- [x] 2.1 Update `apps/admin-web/src/components/Layout.tsx` to render an always-visible light/dark toggle in the main layout and expose only two states.
- [x] 2.2 Update `apps/admin-web/src/components/Layout.css` with theme-token-based toggle styles, focus state, and sidebar/header surface handling.
- [x] 2.3 Update `apps/admin-web/src/index.css` with light and dark semantic tokens for background, surface, text, border, focus, badges, errors, shadows, and button text.
- [x] 2.4 Replace hardcoded light-only palettes in `apps/admin-web/src/pages/Dashboard.css`, `Users.css`, `TrackOrder.css`, `CreateOrder.css`, `Order.css`, and `Login.css` with semantic tokens.

## Phase 3: Testing

- [x] 3.1 Add `apps/admin-web/src/lib/theme.test.ts` covering first-use system resolution, invalid storage, unavailable storage, unavailable `matchMedia`, and root attribute application.
- [x] 3.2 Add provider tests for manual persistence, reload initialization, and manual override when system preference changes later.
- [x] 3.3 Add `Layout` component tests proving the toggle is visible, binary only, switches immediately, persists the new theme, and updates `html[data-theme]`.

## Phase 4: Verification

- [x] 4.1 Run `pnpm --filter admin-web test` and fix failures.
- [x] 4.2 Run `pnpm --filter admin-web lint` and fix lint issues.
- [x] 4.3 Manually inspect core admin pages in both themes for readable text, badges, errors, surfaces, borders, and shadows.
