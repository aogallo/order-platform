import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  type InitiateAuthCommandInput,
} from '@aws-sdk/client-cognito-identity-provider'

const COGNITO_REGION = import.meta.env.VITE_COGNITO_REGION
const COGNITO_CLIENT_ID = import.meta.env.VITE_COGNITO_CLIENT_ID
const STORAGE_KEY = import.meta.env.VITE_STORAGE_KEY ?? 'auth_tokens'

const client = new CognitoIdentityProviderClient({ region: COGNITO_REGION })

interface AuthTokens {
  accessToken: string
  idToken: string
  refreshToken: string
  expiresIn: number
}

function decodeJWT(token: string): Record<string, unknown> {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(atob(payload))
  } catch {
    return {}
  }
}

function persistTokens(tokens: AuthTokens): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens))
}

function loadTokens(): AuthTokens | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function getRefreshToken() {
  return loadTokens()?.refreshToken ?? null
}

export async function cognitoLogin(email: string, password: string): Promise<AuthTokens> {
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

export async function refreshSession(): Promise<AuthTokens | null> {
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

export function cognitoLogout() {
  localStorage.removeItem(STORAGE_KEY)
}

export function getUserFromToken(): { email?: string; sub?: string } | null {
  const tokens = loadTokens()
  if (!tokens) return null

  const payload = decodeJWT(tokens.idToken)

  return {
    email: payload.email as string | undefined,
    sub: payload.sub as string | undefined,
  }
}

export function getAccessToken(): string | null {
  return loadTokens()?.accessToken ?? null
}
