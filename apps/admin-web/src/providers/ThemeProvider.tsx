import { useState } from 'react'
import type { PropsWithChildren } from 'react'
import { ThemeContext } from '../context/theme'
import { applyTheme, getAppliedTheme, resolveInitialTheme, writeStoredTheme } from '../lib/theme'
import type { Theme } from '../lib/theme'

const getInitialTheme = () => {
  const theme = getAppliedTheme() ?? resolveInitialTheme()
  applyTheme(theme)

  return theme
}

export const ThemeProvider = ({ children }: PropsWithChildren) => {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme)

  const setTheme = (nextTheme: Theme) => {
    applyTheme(nextTheme)
    writeStoredTheme(nextTheme)
    setThemeState(nextTheme)
  }

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  const value = {
    theme,
    setTheme,
    toggleTheme,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
