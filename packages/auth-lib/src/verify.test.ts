import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockVerify = vi.fn()

vi.mock('aws-jwt-verify', () => ({
  CognitoJwtVerifier: {
    create: () => ({ verify: mockVerify }),
  },
}))

import { verifyToken } from './verify'

describe('verifyToken', () => {
  const validPayload = {
    sub: 'usr_abc123',
    email_verified: true,
    email: 'admin@example.com',
    'cognito:groups': ['admin'],
  }

  beforeEach(() => {
    mockVerify.mockReset()
  })

  it('returns AuthClaims for a valid token', async () => {
    mockVerify.mockResolvedValue(validPayload)
    const result = await verifyToken('valid-token')
    expect(result).toEqual({
      sub: 'usr_abc123',
      email_verified: true,
      email: 'admin@example.com',
      groups: ['admin'],
    })
  })

  it('throws when token is invalid', async () => {
    mockVerify.mockRejectedValue(new Error('Invalid token'))
    await expect(verifyToken('bad-token')).rejects.toThrow('Invalid token')
  })

  it('handles missing groups gracefully', async () => {
    mockVerify.mockResolvedValue({
      sub: 'usr_abc',
      email_verified: false,
      email: 'user@test.com',
    })
    const result = await verifyToken('token-no-groups')
    expect(result.groups).toEqual([])
  })
})
