# Design: Local Mock Authentication

## Technical Approach

Add an explicit auth-provider boundary inside `apps/admin-web/src/lib/cognito.ts` while preserving the current exported API: `cognitoLogin`, `refreshSession`, `cognitoLogout`, `getUserFromToken`, and `getAccessToken`. `VITE_AUTH_MODE=mock` selects the local mock provider; every other value keeps the existing Cognito SDK flow. Mock mode will validate predefined role users with `VITE_MOCK_AUTH_PASSWORD`, persist tokens using the existing storage key, and issue JWT-shaped tokens with Cognito-style role claims.

## Architecture Decisions

| Decision | Choice | Alternatives considered | Rationale |
|---|---|---|---|
| Provider boundary location | Keep selection in `src/lib/cognito.ts` behind the existing exports. | Add a new auth service and update all imports. | Existing consumers already depend on this module; keeping the public surface stable minimizes UI churn and protects real Cognito behavior. |
| Mock identity model | Use three predefined mock users: `admin`, `operator`, and `viewer`, represented by email addresses and group claims. | Allow arbitrary emails or role text input. | The spec requires managed identities only; fixed users make role testing repeatable and safe. |
| Token shape | Generate unsigned JWT-like strings with `sub`, `email`, `iat`, `exp`, and `cognito:groups`. | Store user metadata separately without JWT shape. | Existing code decodes `idToken`; API requests use `accessToken`. JWT-shaped values exercise the same local storage and decoding path. |
| Password source | Read one shared fixture from `VITE_MOCK_AUTH_PASSWORD`; fail login if missing or mismatched. | Hardcode a fixture password in source. | The spec forbids hardcoded secret-like values, and Vite env makes the local-only nature explicit. |

## Data Flow

```text
Login form ──→ AuthProvider.login ──→ cognitoLogin facade
                                      │
                                      ├─ VITE_AUTH_MODE=mock ──→ mock provider
                                      │                         ├─ validate user/password
                                      │                         ├─ create JWT-like tokens
                                      │                         └─ persist to localStorage
                                      │
                                      └─ otherwise ────────────→ existing Cognito SDK provider

ProtectedRoute/AuthProvider ──→ getUserFromToken ──→ decode idToken claims
axiosClient ──────────────────→ getAccessToken ───→ Authorization: Bearer <token>
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `apps/admin-web/src/lib/cognito.ts` | Modify | Introduce provider selection, mock user fixtures, fake token generation, and role-aware user extraction while preserving exported functions. |
| `apps/admin-web/src/context/auth.ts` | Modify | Extend `User` with optional role/groups if UI authorization needs direct context access. |
| `apps/admin-web/src/providers/AuthProvider.tsx` | Modify | Map decoded token role/group claims into the context user when present. |
| `apps/admin-web/src/lib/cognito.test.ts` | Create | Cover provider selection, mock credential validation, token claims, refresh behavior, logout, and Cognito-default safety. |
| `apps/admin-web/.env` | Modify | Keep/document local mock defaults and clarify that the password is a local client-side fixture, not a secret. |

## Interfaces / Contracts

```ts
type AuthMode = 'cognito' | 'mock'
type MockRole = 'admin' | 'operator' | 'viewer'

interface AuthTokens {
  accessToken: string
  idToken: string
  refreshToken: string
  expiresIn: number
}

interface TokenUser {
  email?: string
  sub?: string
  role?: MockRole
  groups?: string[]
}
```

Mock token claims MUST include at least:

```json
{
  "sub": "mock-admin-user",
  "email": "admin@example.local",
  "cognito:groups": ["admin"],
  "iat": 0,
  "exp": 0
}
```

The timestamp values are generated at runtime. Tokens are local test fixtures and MUST NOT be treated as cryptographically valid JWTs.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Mock login accepts only predefined users and matching shared password. | Vitest tests for `cognitoLogin` with mocked Vite env and isolated localStorage. |
| Unit | Mock token claims expose email, sub, and `cognito:groups` for all roles. | Decode stored/generated token payloads and assert role-specific claims. |
| Unit | Non-mock mode keeps Cognito as default. | Mock AWS SDK client and assert `InitiateAuthCommand` flow remains selected when `VITE_AUTH_MODE` is absent or not `mock`. |
| Integration | AuthProvider initializes user from stored mock tokens and logout clears state. | React Testing Library provider tests or focused component harness. |

## Migration / Rollout

No migration required. Rollout is local-config only: mock behavior activates only with `VITE_AUTH_MODE=mock`; deployed environments continue using Cognito by default.

## Open Questions

None.
