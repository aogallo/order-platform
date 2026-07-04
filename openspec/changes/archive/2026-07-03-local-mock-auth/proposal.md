# Proposal: Local Mock Authentication

## Intent

Enable local admin-web development without LocalStack Pro Cognito by adding explicit mock auth that preserves role testing while leaving real Cognito behavior unchanged.

## Proposal Question Round

Assumptions for review:
- Mock users map only to `admin`, `operator`, and `viewer`.
- One shared fixture password is enough because it is not a real secret.
- Fake tokens include role/group claims for protected admin UX testing.

## Scope

### In Scope
- Add `VITE_AUTH_MODE=mock` for admin-web local authentication.
- Provide predefined mock users by role with one env-configured mock password.
- Generate fake JWT-like tokens with realistic claims.
- Preserve Cognito login, refresh, logout, and token storage outside mock mode.

### Out of Scope
- Arbitrary credentials, registration, or password management.
- Backend auth changes or LocalStack Cognito emulation.
- Any change to dev/staging/prod Cognito configuration.

## User Scenarios

- A developer logs in as `admin`, `operator`, or `viewer` without Cognito.
- A developer verifies `/admin` behavior for each role.
- A developer switches back to real Cognito by disabling mock auth mode.

## Capabilities

### New Capabilities
- `admin-web-local-auth`: Local-only mock authentication for admin-web with role-aware fake tokens.

### Modified Capabilities
- None

## Approach

- Route `apps/admin-web/src/lib/cognito.ts` through a provider selected by `VITE_AUTH_MODE`.
- Keep Cognito as the default provider unless `VITE_AUTH_MODE=mock`.
- Define mock users for `admin`, `operator`, and `viewer`; validate `VITE_MOCK_AUTH_PASSWORD`.
- Generate fake access/id/refresh tokens with Cognito-style email, sub, group, issued-at, and expiry claims.
- Document that `VITE_MOCK_AUTH_PASSWORD` is a client-side local fixture, not a secret.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `apps/admin-web/src/lib/cognito.ts` | Modified | Add provider selection while preserving public API. |
| `apps/admin-web/src/context/auth.ts` | Modified | May expose role/group data if needed. |
| `apps/admin-web/.env*` docs | Modified | Document mock auth envs for local development. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Mock mode leaks into deployments | Medium | Default to Cognito and require explicit `VITE_AUTH_MODE=mock`. |
| Fake claims drift from Cognito | Medium | Use Cognito-style claims and test role extraction. |
| Password mistaken for a secret | Low | Document Vite client exposure and local-fixture semantics. |

## Rollback Plan

Remove the mock provider path and env documentation; deployments continue using Cognito defaults because mock mode is opt-in.

## Dependencies

- Existing admin-web auth flow and group names: `admin`, `operator`, `viewer`.

## Success Criteria

- [ ] Local login works for all three predefined roles with the shared mock password.
- [ ] Generated fake tokens support role/permission checks in admin-web.
- [ ] Real Cognito behavior remains unchanged when mock mode is not enabled.
