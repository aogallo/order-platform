# Proposal: Admin Web Dark Mode

## Intent

Add dark mode to `admin-web` so users get a comfortable visual theme by default from their operating system, while retaining quick manual control from the main layout.

## Scope

### In Scope
- Theme resolution for `light` and `dark` visible states only.
- First-use default from `prefers-color-scheme`.
- Manual light/dark selection persisted in `localStorage` for the current browser.
- Always-visible theme toggle in the authenticated main layout.
- CSS token updates for core colors plus hardcoded badges, errors, and shadows in `apps/admin-web`.

### Out of Scope
- A visible `system` mode or three-state selector.
- Backend, API, auth, notification, reporting, or shared package changes.
- Cross-device or server-persisted theme preferences.

## Capabilities

### New Capabilities
- `admin-web-theme-preference`: Defines theme selection, first-use system fallback, manual override persistence, and main-layout toggle behavior.

### Modified Capabilities
- None.

## Approach

Use a small admin-web theme layer that resolves the active theme on startup: read a persisted manual value first, otherwise use `matchMedia('(prefers-color-scheme: dark)')`. Apply the resolved theme through a root attribute or class so CSS variables can switch palettes. Keep the UI binary: the toggle writes either `light` or `dark`, and persisted manual choices ignore later system preference changes. Refactor remaining hardcoded visual palettes into theme-aware tokens.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `apps/admin-web/src/index.css` | Modified | Add light/dark token definitions and theme application. |
| `apps/admin-web/src/components/Layout.tsx` | Modified | Add always-visible theme toggle in the main layout. |
| `apps/admin-web/src/components/Layout.css` | Modified | Style toggle and theme-aware layout details. |
| `apps/admin-web/src/pages/*.css` | Modified | Replace hardcoded badge, error, and shadow palettes with tokens. |
| `apps/admin-web/src` theme utility/provider files | New | Encapsulate theme resolution, persistence, and browser APIs. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Flash of wrong theme on initial paint | Med | Apply stored/system theme as early as possible before React render. |
| Incomplete contrast in hardcoded page styles | Med | Convert badges, errors, and shadows to semantic tokens and test both themes. |
| Browser API issues in tests | Low | Guard `localStorage` and `matchMedia`, with jsdom mocks. |

## Rollback Plan

Revert the admin-web theme utility/provider, toggle UI, and CSS token changes. Remove any new tests. Existing users fall back to the current light styles; leftover `localStorage` values become inert.

## Dependencies

- Browser support for `localStorage` and `prefers-color-scheme`.
- No new runtime package dependency expected.

## Success Criteria

- [ ] First visit follows the operating system light/dark preference.
- [ ] Manual light or dark selection persists in the current browser.
- [ ] Manual selection overrides later operating system preference changes.
- [ ] Main authenticated layout always exposes a quick light/dark toggle.
- [ ] Admin pages remain readable in both themes, including badges, errors, and shadows.
