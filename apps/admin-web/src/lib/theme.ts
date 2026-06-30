export type Theme = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'admin-web-theme'
export const THEME_ATTRIBUTE = 'theme'

const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)'

export const isTheme = (value: unknown): value is Theme => value === 'light' || value === 'dark'

export const readStoredTheme = (): Theme | null => {
  try {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)

    return isTheme(storedTheme) ? storedTheme : null
  } catch {
    return null
  }
}

export const writeStoredTheme = (theme: Theme) => {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // Storage can be unavailable in private browsing or restricted environments.
  }
}

export const resolveSystemTheme = (): Theme => {
  if (typeof window.matchMedia !== 'function') {
    return 'light'
  }

  return window.matchMedia(DARK_SCHEME_QUERY).matches ? 'dark' : 'light'
}

export const resolveInitialTheme = (): Theme => readStoredTheme() ?? resolveSystemTheme()

export const applyTheme = (theme: Theme) => {
  document.documentElement.dataset[THEME_ATTRIBUTE] = theme
}

export const getAppliedTheme = (): Theme | null => {
  const appliedTheme = document.documentElement.dataset[THEME_ATTRIBUTE]

  return isTheme(appliedTheme) ? appliedTheme : null
}

export const applyInitialTheme = (): Theme => {
  const theme = resolveInitialTheme()
  applyTheme(theme)

  return theme
}
