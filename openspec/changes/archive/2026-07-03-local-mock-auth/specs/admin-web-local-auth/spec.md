# Admin Web Local Auth Delta Specification

## ADDED Requirements

### Requirement: Explicit Mock Auth Mode

The system MUST enable mock authentication only when local configuration explicitly selects mock auth mode. The system MUST default to real Cognito behavior when mock mode is not selected.

#### Scenario: Mock mode enabled locally

- GIVEN `admin-web` is running with mock auth mode explicitly enabled
- WHEN a developer opens the login experience
- THEN the system SHALL use local mock authentication behavior
- AND real Cognito authentication SHALL NOT be required

#### Scenario: Mock mode not enabled

- GIVEN `admin-web` is running without mock auth mode explicitly enabled
- WHEN a user authenticates
- THEN the system MUST preserve the existing real Cognito login, refresh, logout, and token storage behavior

### Requirement: Predefined Role Users

The system MUST provide predefined mock users for the `admin`, `operator`, and `viewer` roles. The system MUST NOT allow arbitrary registration or unmanaged mock identities.

#### Scenario: Login as a predefined role

- GIVEN mock auth mode is enabled
- AND a predefined mock user exists for the selected role
- WHEN a developer signs in with valid mock credentials
- THEN the system SHALL authenticate as that mock user's role

#### Scenario: Unknown mock identity rejected

- GIVEN mock auth mode is enabled
- WHEN a developer signs in with an identity outside the predefined mock users
- THEN the system MUST reject authentication

### Requirement: Shared Environment-Configured Fixture Password

The system MUST validate mock user login with one shared password provided by environment configuration. Mock passwords, users, and secret-like fixture values MUST NOT be hardcoded in application source code.

#### Scenario: Valid shared password

- GIVEN mock auth mode is enabled
- AND the shared mock password is configured
- WHEN a developer signs in as a predefined mock user with that password
- THEN authentication SHALL succeed

#### Scenario: Missing or invalid password

- GIVEN mock auth mode is enabled
- WHEN the shared mock password is missing or the submitted password does not match
- THEN authentication MUST fail without issuing tokens

### Requirement: Cognito-Style Fake Tokens

The system MUST issue fake token values for mock sessions that include realistic role and permission claims aligned with current Cognito group semantics. These tokens MUST support admin UX authorization checks for `admin`, `operator`, and `viewer`.

#### Scenario: Role-aware token issued

- GIVEN a developer signs in successfully as a predefined mock user
- WHEN the mock session is created
- THEN the issued fake tokens SHALL include role/group claims for that user's role
- AND the claims SHALL be sufficient for protected admin UI checks

#### Scenario: Role switching coverage

- GIVEN mock auth mode is enabled
- WHEN a developer signs in separately as `admin`, `operator`, and `viewer`
- THEN each session MUST expose claims matching the selected role's current Cognito group semantics

### Requirement: Isolation from Real Auth

The system MUST NOT pollute deployed, staging, production, or real Cognito behavior with mock authentication state, credentials, users, or token semantics.

#### Scenario: Switching back to real Cognito

- GIVEN a developer disables mock auth mode
- WHEN `admin-web` authenticates again
- THEN the system SHALL use real Cognito behavior only
- AND mock users and fake tokens SHALL NOT participate in authentication

#### Scenario: Non-local deployment safety

- GIVEN `admin-web` is built or configured for non-local real Cognito usage
- WHEN authentication configuration is evaluated
- THEN mock authentication MUST remain inactive unless explicitly selected
