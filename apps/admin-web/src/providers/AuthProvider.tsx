import { useCallback, useState, type PropsWithChildren } from 'react'
import { getUserFromToken, cognitoLogout, cognitoLogin } from '../lib/cognito'
import { AuthContext, type User } from '../context/auth'

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(() => {
    const info = getUserFromToken()

    if (info?.email && info?.sub) {
      return { email: info.email, sub: info.sub }
    }
    return null
  })

  const [loading] = useState(false)

  const login = useCallback(async (email: string, password: string) => {
    await cognitoLogin(email, password)
    const info = getUserFromToken()
    if (info?.email && info?.sub) {
      setUser({ email: info.email, sub: info.sub })
    }
  }, [])

  const logout = useCallback(() => {
    cognitoLogout()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>
  )
}
