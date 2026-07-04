import { useCallback, useState, type PropsWithChildren } from 'react'
import { getUserFromToken, cognitoLogout, cognitoLogin } from '../lib/cognito'
import { AuthContext, type User } from '../context/auth'

function toContextUser(info: ReturnType<typeof getUserFromToken>): User | null {
  if (info?.email && info?.sub) {
    return {
      email: info.email,
      sub: info.sub,
      role: info.role,
      groups: info.groups,
    }
  }

  return null
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(() => {
    return toContextUser(getUserFromToken())
  })

  const [loading] = useState(false)

  const login = useCallback(async (email: string, password: string) => {
    await cognitoLogin(email, password)
    setUser(toContextUser(getUserFromToken()))
  }, [])

  const logout = useCallback(() => {
    cognitoLogout()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>
  )
}
