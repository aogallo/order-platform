# Tasks: Local Mock Authentication

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 300-420 |
| 400-line budget risk | Medium |
| Chained PRs recommended | No |
| Suggested split | Single PR with work-unit commits; monitor diff size before PR creation |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Add mock provider boundary and token behavior | PR 1 | Include unit tests for provider selection, credentials, tokens, refresh, logout |
| 2 | Expose role/group claims to auth context and document local env | PR 1 | Keep with auth behavior unless the diff exceeds the review budget |

## Phase 1: Auth Provider Foundation

- [x] 1.1 In `apps/admin-web/src/lib/cognito.ts`, introduce `AuthMode`, `MockRole`, `AuthTokens`, and token user types without changing exported function names.
- [x] 1.2 In `apps/admin-web/src/lib/cognito.ts`, add provider selection that uses mock auth only for `VITE_AUTH_MODE=mock` and keeps Cognito as the default.
- [x] 1.3 In `apps/admin-web/src/lib/cognito.ts`, define fixed mock users for `admin`, `operator`, and `viewer` without hardcoding password values.

## Phase 2: Mock Auth Behavior

- [x] 2.1 In `apps/admin-web/src/lib/cognito.ts`, validate predefined mock users against `VITE_MOCK_AUTH_PASSWORD` and reject unknown identities or missing/mismatched passwords.
- [x] 2.2 In `apps/admin-web/src/lib/cognito.ts`, generate unsigned JWT-like access/id/refresh tokens with `sub`, `email`, `iat`, `exp`, and `cognito:groups` claims.
- [x] 2.3 In `apps/admin-web/src/lib/cognito.ts`, make mock login, refresh, logout, token persistence, `getUserFromToken`, and `getAccessToken` use the existing storage key.

## Phase 3: UI Auth Context Integration

- [x] 3.1 In `apps/admin-web/src/context/auth.ts`, extend `User` with optional `role` and `groups` fields for decoded token claims.
- [x] 3.2 In `apps/admin-web/src/providers/AuthProvider.tsx`, preserve existing initialization/login flow while copying decoded role/group claims into context when present.

## Phase 4: Verification

- [x] 4.1 Create `apps/admin-web/src/lib/cognito.test.ts` covering mock mode selection, valid role login, unknown identity rejection, missing/invalid password rejection, token claims for all roles, refresh, logout, and Cognito-default safety.
- [x] 4.2 Add or update focused AuthProvider tests if needed to verify stored mock tokens initialize user context and logout clears state.
- [x] 4.3 Run `pnpm --filter admin-web test` and `pnpm --filter admin-web lint`.

## Phase 5: Documentation / Local Config

- [x] 5.1 Update `apps/admin-web/.env` comments or related env documentation to explain `VITE_AUTH_MODE=mock` and that `VITE_MOCK_AUTH_PASSWORD` is a local client-side fixture, not a secret.

## Phase 6: Verification Fix

- [x] 6.1 Ignore previously stored mock tokens when `VITE_AUTH_MODE` is not `mock`, while preserving stored real Cognito access token behavior.
- [x] 6.2 Add regression tests for switching from stored mock tokens back to Cognito mode in the auth facade and AuthProvider initialization.

## Phase 7: OpenSpec Validation Fix

- [x] 7.1 Convert `openspec/changes/local-mock-auth/specs/admin-web-local-auth/spec.md` to OpenSpec delta format without weakening the intended requirements or scenarios.

## Phase 8: Cognito Refresh Coverage Fix

- [x] 8.1 Add a focused runtime regression test proving Cognito-mode refresh uses and preserves the stored real refresh token when mock auth mode is not selected.
