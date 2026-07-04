import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const cognitoMocks = vi.hoisted(() => ({
  send: vi.fn(),
}))

vi.mock('@aws-sdk/client-cognito-identity-provider', () => ({
  CognitoIdentityProviderClient: vi.fn(function CognitoIdentityProviderClient() {
    return { send: cognitoMocks.send }
  }),
  InitiateAuthCommand: vi.fn(function InitiateAuthCommand(input: unknown) {
    return { input }
  }),
}))

type UseAuth = typeof import('../hooks/useAuth')['useAuth']

function createAuthStatus(useAuthHook: UseAuth) {
  return function AuthStatus() {
    const { user, logout } = useAuthHook()

    return (
      <div>
        <p>{user ? `${user.email}:${user.role ?? 'none'}` : 'No user'}</p>
        <button type="button" onClick={logout}>
          Logout
        </button>
      </div>
    )
  }
}

async function importAuthProvider(env: Record<string, string | undefined> = {}) {
  vi.resetModules()
  vi.unstubAllEnvs()
  Object.entries(env).forEach(([key, value]) => {
    if (value !== undefined) {
      vi.stubEnv(key, value)
    }
  })

  const cognito = await import('../lib/cognito')
  const { AuthProvider } = await import('./AuthProvider')
  const { useAuth } = await import('../hooks/useAuth')
  return { AuthProvider, cognito, AuthStatus: createAuthStatus(useAuth) }
}

describe('AuthProvider', () => {
  beforeEach(() => {
    window.localStorage.clear()
    cognitoMocks.send.mockReset()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('initializes the user context from stored mock token claims', async () => {
    const { AuthProvider, cognito, AuthStatus } = await importAuthProvider({
      VITE_AUTH_MODE: 'mock',
      VITE_MOCK_AUTH_PASSWORD: 'fixture-password',
    })
    await cognito.cognitoLogin('operator@example.local', 'fixture-password')

    render(
      <AuthProvider>
        <AuthStatus />
      </AuthProvider>,
    )

    expect(screen.getByText('operator@example.local:operator')).toBeInTheDocument()
  })

  it('does not initialize the user context from stored mock tokens in Cognito mode', async () => {
    const mockAuth = await importAuthProvider({
      VITE_AUTH_MODE: 'mock',
      VITE_MOCK_AUTH_PASSWORD: 'fixture-password',
    })
    await mockAuth.cognito.cognitoLogin('operator@example.local', 'fixture-password')

    const { AuthProvider, AuthStatus } = await importAuthProvider({
      VITE_AUTH_MODE: 'cognito',
      VITE_COGNITO_CLIENT_ID: 'client-id',
      VITE_COGNITO_REGION: 'us-east-1',
    })

    render(
      <AuthProvider>
        <AuthStatus />
      </AuthProvider>,
    )

    expect(screen.getByText('No user')).toBeInTheDocument()
  })

  it('clears the user context and stored tokens on logout', async () => {
    const { AuthProvider, cognito, AuthStatus } = await importAuthProvider({
      VITE_AUTH_MODE: 'mock',
      VITE_MOCK_AUTH_PASSWORD: 'fixture-password',
    })
    await cognito.cognitoLogin('viewer@example.local', 'fixture-password')

    render(
      <AuthProvider>
        <AuthStatus />
      </AuthProvider>,
    )

    await userEvent.click(screen.getByRole('button', { name: /logout/i }))

    expect(screen.getByText('No user')).toBeInTheDocument()
    expect(window.localStorage.getItem('auth_tokens')).toBeNull()
  })
})
