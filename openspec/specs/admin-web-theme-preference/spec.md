# Admin Web Theme Preference Specification

## Purpose

Define binary light/dark theme behavior for `admin-web`.

## Requirements

### Requirement: First-Use Theme Resolution

The system MUST use the operating system color-scheme preference when no manual selection exists.

#### Scenario: First visit follows dark system preference

- GIVEN no manual theme selection exists
- AND the operating system prefers dark
- WHEN the user opens `admin-web`
- THEN the theme MUST be dark

#### Scenario: First visit follows light system preference

- GIVEN no manual theme selection exists
- AND the operating system prefers light
- WHEN the user opens `admin-web`
- THEN the theme MUST be light

### Requirement: Binary Visible Theme States

The system MUST expose only light and dark. It MUST NOT expose a visible `system` mode or three-state selector.

#### Scenario: Theme control offers only two states

- GIVEN the main layout is visible
- WHEN the user reviews available theme choices
- THEN only light and dark SHALL be available

#### Scenario: System fallback is not exposed as a mode

- GIVEN no manual theme selection exists
- WHEN the app follows system preference
- THEN the UI MUST NOT display `system` as a selectable theme state

### Requirement: Manual Theme Override

The system MUST persist a manual light or dark selection in the browser and prefer it over later system changes.

#### Scenario: Manual selection persists after reload

- GIVEN the user manually selects dark theme
- WHEN the user reloads `admin-web`
- THEN the theme MUST remain dark

#### Scenario: Manual selection overrides system changes

- GIVEN the user manually selected light theme
- WHEN system preference changes to dark
- THEN the theme MUST remain light

### Requirement: Always-Visible Main Layout Toggle

The system MUST provide a light/dark toggle whenever the main layout renders.

#### Scenario: Toggle is available in main layout

- GIVEN a user views the main layout
- WHEN any admin page within that layout is rendered
- THEN the toggle SHALL be visible without settings navigation

#### Scenario: Toggle switches immediately

- GIVEN the main layout is visible in light theme
- WHEN the user activates the theme toggle
- THEN the theme MUST change to dark
- AND the manual selection MUST be persisted

### Requirement: Themed Visual Contrast

The system MUST keep admin pages readable in both themes, including badges, errors, surfaces, borders, shadows, and text.

#### Scenario: Core pages remain readable in both themes

- GIVEN a user views admin pages
- WHEN the user switches between light and dark themes
- THEN text, surfaces, badges, errors, and shadows MUST remain readable

#### Scenario: Hardcoded visual colors do not bypass themes

- GIVEN a page includes badges, errors, or elevated surfaces
- WHEN either theme is active
- THEN they SHALL avoid fixed light-only palettes

### Requirement: Browser API Resilience

The system MUST render a valid theme when storage or system preference APIs are unavailable.

#### Scenario: Storage unavailable

- GIVEN browser storage is unavailable
- WHEN the user opens `admin-web`
- THEN the app MUST render a valid light or dark theme

#### Scenario: System preference API unavailable

- GIVEN no manual theme selection exists
- AND system preference detection is unavailable
- WHEN the user opens `admin-web`
- THEN the app MUST render with a valid fallback theme

### Requirement: Initial Theme Paint Stability

The system SHOULD avoid showing protected admin content in the wrong theme during initial load.

#### Scenario: Stored theme is applied before content is visible

- GIVEN the browser has a persisted dark selection
- WHEN the user opens `admin-web`
- THEN protected content SHOULD first appear in dark theme

#### Scenario: First-use system theme is applied before content is visible

- GIVEN no manual theme selection exists
- AND the operating system prefers dark
- WHEN the user opens `admin-web`
- THEN protected content SHOULD first appear in dark theme
