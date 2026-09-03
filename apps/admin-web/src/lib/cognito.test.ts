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

type CognitoModule = typeof import('./cognito')

async function importCognito(env: Record<string, string | undefined> = {}): Promise<CognitoModule> {
  vi.resetModules()
  vi.unstubAllEnvs()
  Object.entries(env).forEach(([key, value]) => {
    if (value !== undefined) {
      vi.stubEnv(key, value)
    }
  })

  return import('./cognito')
}

function getStoredTokens(): { accessToken: string; idToken: string; refreshToken: string } {
  const rawTokens = window.localStorage.getItem('auth_tokens')
  if (!rawTokens) {
    throw new Error('Expected tokens to be persisted')
  }

  return JSON.parse(rawTokens) as { accessToken: string; idToken: string; refreshToken: string }
}

function decodeTokenPayload(token: string): Record<string, unknown> {
  const payload = token.split('.')[1]
  const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/')
  return JSON.parse(atob(normalizedPayload)) as Record<string, unknown>
}

describe('cognito auth facade', () => {
  beforeEach(() => {
    window.localStorage.clear()
    cognitoMocks.send.mockReset()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('uses Cognito by default when mock auth mode is not selected', async () => {
    cognitoMocks.send.mockResolvedValueOnce({
      AuthenticationResult: {
        AccessToken: 'real-access-token',
        IdToken: 'real-id-token',
        RefreshToken: 'real-refresh-token',
        ExpiresIn: 300,
      },
    })
    const { cognitoLogin } = await importCognito({
      VITE_AUTH_MODE: 'cognito',
      VITE_COGNITO_CLIENT_ID: 'client-id',
      VITE_COGNITO_REGION: 'us-east-1',
    })

    const tokens = await cognitoLogin('user@example.com', 'password')

    expect(cognitoMocks.send).toHaveBeenCalledTimes(1)
    expect(tokens).toEqual({
      accessToken: 'real-access-token',
      idToken: 'real-id-token',
      refreshToken: 'real-refresh-token',
      expiresIn: 300,
    })
  })

  it('ignores stored mock tokens when Cognito mode is selected', async () => {
    const mockModule = await importCognito({
      VITE_AUTH_MODE: 'mock',
      VITE_MOCK_AUTH_PASSWORD: 'fixture-password',
    })
    await mockModule.cognitoLogin('admin@example.local', 'fixture-password')
    expect(mockModule.getAccessToken()).toEqual(expect.any(String))

    const cognitoModule = await importCognito({
      VITE_AUTH_MODE: 'cognito',
      VITE_COGNITO_CLIENT_ID: 'client-id',
      VITE_COGNITO_REGION: 'us-east-1',
    })

    expect(cognitoModule.getUserFromToken()).toBeNull()
    expect(cognitoModule.getAccessToken()).toBeNull()
  })

  it('preserves stored Cognito access tokens when Cognito mode is selected', async () => {
    cognitoMocks.send.mockResolvedValueOnce({
      AuthenticationResult: {
        AccessToken: 'real-access-token',
        IdToken: 'real-id-token',
        RefreshToken: 'real-refresh-token',
        ExpiresIn: 300,
      },
    })
    const { cognitoLogin, getAccessToken } = await importCognito({
      VITE_AUTH_MODE: 'cognito',
      VITE_COGNITO_CLIENT_ID: 'client-id',
      VITE_COGNITO_REGION: 'us-east-1',
    })

    await cognitoLogin('user@example.com', 'password')

    expect(getAccessToken()).toBe('real-access-token')
  })

  it('refreshes Cognito sessions with the stored refresh token when Cognito mode is selected', async () => {
    cognitoMocks.send
      .mockResolvedValueOnce({
        AuthenticationResult: {
          AccessToken: 'real-access-token',
          IdToken: 'real-id-token',
          RefreshToken: 'real-refresh-token',
          ExpiresIn: 300,
        },
      })
      .mockResolvedValueOnce({
        AuthenticationResult: {
          AccessToken: 'refreshed-access-token',
          IdToken: 'refreshed-id-token',
          ExpiresIn: 600,
        },
      })
    const { cognitoLogin, refreshSession } = await importCognito({
      VITE_AUTH_MODE: 'cognito',
      VITE_COGNITO_CLIENT_ID: 'client-id',
      VITE_COGNITO_REGION: 'us-east-1',
    })

    await cognitoLogin('user@example.com', 'password')
    const refreshedTokens = await refreshSession()

    expect(cognitoMocks.send).toHaveBeenCalledTimes(2)
    expect(cognitoMocks.send.mock.calls[1][0].input).toMatchObject({
      AuthFlow: 'REFRESH_TOKEN_AUTH',
      ClientId: 'client-id',
      AuthParameters: {
        REFRESH_TOKEN: 'real-refresh-token',
      },
    })
    expect(refreshedTokens).toEqual({
      accessToken: 'refreshed-access-token',
      idToken: 'refreshed-id-token',
      refreshToken: 'real-refresh-token',
      expiresIn: 600,
    })
    expect(getStoredTokens()).toMatchObject({
      accessToken: 'refreshed-access-token',
      idToken: 'refreshed-id-token',
      refreshToken: 'real-refresh-token',
    })
  })

  it.each([
    ['admin@example.local', 'admin'],
    ['operator@example.local', 'operator'],
    ['viewer@example.local', 'viewer'],
  ])('logs in the predefined %s mock user with role claims', async (email, role) => {
    const { cognitoLogin, getUserFromToken } = await importCognito({
      VITE_AUTH_MODE: 'mock',
      VITE_MOCK_AUTH_PASSWORD: 'fixture-password',
    })

    await cognitoLogin(email, 'fixture-password')
    const tokens = getStoredTokens()
    const idTokenPayload = decodeTokenPayload(tokens.idToken)
    const user = getUserFromToken()

    expect(cognitoMocks.send).not.toHaveBeenCalled()
    expect(idTokenPayload).toMatchObject({
      email,
      'cognito:groups': [role],
      token_use: 'id',
    })
    expect(idTokenPayload.sub).toBe(`mock-${role}-user`)
    expect(idTokenPayload.iat).toEqual(expect.any(Number))
    expect(idTokenPayload.exp).toEqual(expect.any(Number))
    expect(user).toMatchObject({ email, sub: `mock-${role}-user`, role, groups: [role] })
  })

  it('rejects unknown mock identities without issuing tokens', async () => {
    const { cognitoLogin } = await importCognito({
      VITE_AUTH_MODE: 'mock',
      VITE_MOCK_AUTH_PASSWORD: 'fixture-password',
    })

    await expect(cognitoLogin('other@example.local', 'fixture-password')).rejects.toThrow(
      'Authentication failed',
    )

    expect(window.localStorage.getItem('auth_tokens')).toBeNull()
  })

  it('rejects missing and invalid mock passwords without issuing tokens', async () => {
    const missingPasswordModule = await importCognito({ VITE_AUTH_MODE: 'mock' })

    await expect(
      missingPasswordModule.cognitoLogin('admin@example.local', 'fixture-password'),
    ).rejects.toThrow('Authentication failed')

    const invalidPasswordModule = await importCognito({
      VITE_AUTH_MODE: 'mock',
      VITE_MOCK_AUTH_PASSWORD: 'fixture-password',
    })

    await expect(invalidPasswordModule.cognitoLogin('admin@example.local', 'wrong')).rejects.toThrow(
      'Authentication failed',
    )
    expect(window.localStorage.getItem('auth_tokens')).toBeNull()
  })

  it('refreshes mock sessions from the stored refresh token', async () => {
    const { cognitoLogin, refreshSession } = await importCognito({
      VITE_AUTH_MODE: 'mock',
      VITE_MOCK_AUTH_PASSWORD: 'fixture-password',
    })
    await cognitoLogin('admin@example.local', 'fixture-password')

    const refreshedTokens = await refreshSession()

    expect(refreshedTokens?.accessToken).toEqual(expect.any(String))
    expect(decodeTokenPayload(refreshedTokens?.idToken ?? '')).toMatchObject({
      email: 'admin@example.local',
      'cognito:groups': ['admin'],
    })
  })

  it('clears persisted tokens on logout', async () => {
    const { cognitoLogin, cognitoLogout, getAccessToken } = await importCognito({
      VITE_AUTH_MODE: 'mock',
      VITE_MOCK_AUTH_PASSWORD: 'fixture-password',
    })
    await cognitoLogin('admin@example.local', 'fixture-password')

    cognitoLogout()

    expect(getAccessToken()).toBeNull()
    expect(window.localStorage.getItem('auth_tokens')).toBeNull()
  })
})
