import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  type InitiateAuthCommandInput,
} from '@aws-sdk/client-cognito-identity-provider'

const COGNITO_REGION = import.meta.env.VITE_COGNITO_REGION
const COGNITO_CLIENT_ID = import.meta.env.VITE_COGNITO_CLIENT_ID
const STORAGE_KEY = import.meta.env.VITE_STORAGE_KEY ?? 'auth_tokens'
const AUTH_MODE = import.meta.env.VITE_AUTH_MODE
const MOCK_AUTH_PASSWORD = import.meta.env.VITE_MOCK_AUTH_PASSWORD

const client = new CognitoIdentityProviderClient({ region: COGNITO_REGION })

export type AuthMode = 'cognito' | 'mock'
export type MockRole = 'admin' | 'operator' | 'viewer'

export interface AuthTokens {
  accessToken: string
  idToken: string
  refreshToken: string
  expiresIn: number
}

export interface TokenUser {
  email?: string
  sub?: string
  role?: MockRole
  groups?: string[]
}

interface MockUser {
  email: string
  sub: string
  role: MockRole
}

const MOCK_TOKEN_EXPIRES_IN_SECONDS = 3600
const MOCK_USERS: Record<MockRole, MockUser> = {
  admin: {
    email: 'admin@example.local',
    sub: 'mock-admin-user',
    role: 'admin',
  },
  operator: {
    email: 'operator@example.local',
    sub: 'mock-operator-user',
    role: 'operator',
  },
  viewer: {
    email: 'viewer@example.local',
    sub: 'mock-viewer-user',
    role: 'viewer',
  },
}

function getAuthMode(): AuthMode {
  return AUTH_MODE === 'mock' ? 'mock' : 'cognito'
}

function decodeJWT(token: string): Record<string, unknown> {
  try {
    const payload = token.split('.')[1]
    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(normalizedPayload))
  } catch {
    return {}
  }
}

function encodeJWTPart(value: Record<string, unknown>): string {
  const json = JSON.stringify(value)
  const base64 = btoa(json)
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function createUnsignedJWT(payload: Record<string, unknown>): string {
  return [encodeJWTPart({ alg: 'none', typ: 'JWT' }), encodeJWTPart(payload), ''].join('.')
}

function persistTokens(tokens: AuthTokens): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens))
}

function loadTokens(): AuthTokens | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const tokens = JSON.parse(raw) as AuthTokens
    if (getAuthMode() !== 'mock' && isMockTokenSet(tokens)) {
      return null
    }

    return tokens
  } catch {
    return null
  }
}

function isMockTokenSet(tokens: AuthTokens): boolean {
  const payload = decodeJWT(tokens.idToken)
  const email = typeof payload.email === 'string' ? payload.email : ''
  const sub = typeof payload.sub === 'string' ? payload.sub : ''
  const groups = Array.isArray(payload['cognito:groups']) ? payload['cognito:groups'] : []

  return Object.values(MOCK_USERS).some((user) => {
    return email === user.email && sub === user.sub && groups.includes(user.role)
  })
}

function getRefreshToken() {
  return loadTokens()?.refreshToken ?? null
}

function getMockUser(email: string): MockUser | null {
  const normalizedEmail = email.trim().toLowerCase()
  return Object.values(MOCK_USERS).find((user) => user.email === normalizedEmail) ?? null
}

function createMockTokens(user: MockUser): AuthTokens {
  const issuedAt = Math.floor(Date.now() / 1000)
  const expiresAt = issuedAt + MOCK_TOKEN_EXPIRES_IN_SECONDS
  const commonClaims = {
    sub: user.sub,
    email: user.email,
    iat: issuedAt,
    exp: expiresAt,
    'cognito:groups': [user.role],
  }

  return {
    accessToken: createUnsignedJWT({ ...commonClaims, token_use: 'access' }),
    idToken: createUnsignedJWT({ ...commonClaims, token_use: 'id' }),
    refreshToken: createUnsignedJWT({ ...commonClaims, token_use: 'refresh' }),
    expiresIn: MOCK_TOKEN_EXPIRES_IN_SECONDS,
  }
}

function mockLogin(email: string, password: string): AuthTokens {
  if (!MOCK_AUTH_PASSWORD || password !== MOCK_AUTH_PASSWORD) {
    throw new Error('Authentication failed')
  }

  const user = getMockUser(email)
  if (!user) {
    throw new Error('Authentication failed')
  }

  const tokens = createMockTokens(user)
  persistTokens(tokens)
  return tokens
}

function refreshMockSession(): AuthTokens | null {
  const tokens = loadTokens()
  if (!tokens?.refreshToken) return null

  const payload = decodeJWT(tokens.refreshToken)
  const email = typeof payload.email === 'string' ? payload.email : ''
  const user = getMockUser(email)
  if (!user) return null

  const refreshedTokens = createMockTokens(user)
  persistTokens(refreshedTokens)
  return refreshedTokens
}

async function cognitoProviderLogin(email: string, password: string): Promise<AuthTokens> {
  const input: InitiateAuthCommandInput = {
    AuthFlow: 'USER_PASSWORD_AUTH',
    ClientId: COGNITO_CLIENT_ID,
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password,
    },
  }

  const command = new InitiateAuthCommand(input)
  const response = await client.send(command)
  const result = response.AuthenticationResult

  if (!result?.AccessToken || !result?.IdToken || !result?.RefreshToken) {
    throw new Error('Authentication failed -- missing token')
  }

  const tokens: AuthTokens = {
    accessToken: result.AccessToken,
    idToken: result.IdToken,
    refreshToken: result.RefreshToken,
    expiresIn: result.ExpiresIn ?? 3600,
  }

  persistTokens(tokens)
  return tokens
}

async function refreshCognitoSession(): Promise<AuthTokens | null> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return null
  const input: InitiateAuthCommandInput = {
    AuthFlow: 'REFRESH_TOKEN_AUTH',
    ClientId: COGNITO_CLIENT_ID,
    AuthParameters: {
      REFRESH_TOKEN: refreshToken,
    },
  }

  const command = new InitiateAuthCommand(input)
  const response = await client.send(command)
  const result = response.AuthenticationResult

  if (!result?.AccessToken || !result?.IdToken) {
    return null
  }

  const tokens: AuthTokens = {
    accessToken: result.AccessToken,
    idToken: result.IdToken,
    refreshToken: refreshToken,
    expiresIn: result.ExpiresIn ?? 3600,
  }

  persistTokens(tokens)
  return tokens
}

export async function cognitoLogin(email: string, password: string): Promise<AuthTokens> {
  if (getAuthMode() === 'mock') {
    return mockLogin(email, password)
  }

  return cognitoProviderLogin(email, password)
}

export async function refreshSession(): Promise<AuthTokens | null> {
  if (getAuthMode() === 'mock') {
    return refreshMockSession()
  }

  return refreshCognitoSession()
}

export function cognitoLogout() {
  localStorage.removeItem(STORAGE_KEY)
}

export function getUserFromToken(): TokenUser | null {
  const tokens = loadTokens()
  if (!tokens) return null

  const payload = decodeJWT(tokens.idToken)
  const groups = Array.isArray(payload['cognito:groups'])
    ? payload['cognito:groups'].filter((group): group is string => typeof group === 'string')
    : undefined
  const role = groups?.find((group): group is MockRole =>
    ['admin', 'operator', 'viewer'].includes(group),
  )

  return {
    email: payload.email as string | undefined,
    sub: payload.sub as string | undefined,
    role,
    groups,
  }
}

export function getAccessToken(): string | null {
  return loadTokens()?.accessToken ?? null
}
