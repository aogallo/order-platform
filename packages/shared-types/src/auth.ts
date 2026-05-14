export type UserGroup = 'admin' | 'operator' | 'viewer'

export interface AuthClaims {
  sub: string
  email_verified: boolean
  email: string
  groups: UserGroup[]
}
