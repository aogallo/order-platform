import {
  applyInitialTheme,
  applyTheme,
  resolveInitialTheme,
  THEME_STORAGE_KEY,
} from './theme'

const setSystemTheme = (theme: 'light' | 'dark') => {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: theme === 'dark' && query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

describe('theme utilities', () => {
  const originalMatchMedia = window.matchMedia
  const originalLocalStorage = window.localStorage

  beforeEach(() => {
    window.localStorage.clear()
    delete document.documentElement.dataset.theme
    setSystemTheme('light')
  })

  afterEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: originalMatchMedia,
    })
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: originalLocalStorage,
    })
  })

  it('resolves dark on first use when the system prefers dark', () => {
    setSystemTheme('dark')

    expect(resolveInitialTheme()).toBe('dark')
  })

  it('resolves light on first use when the system prefers light', () => {
    setSystemTheme('light')

    expect(resolveInitialTheme()).toBe('light')
  })

  it('ignores invalid stored values and falls back to the system theme', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'system')
    setSystemTheme('dark')

    expect(resolveInitialTheme()).toBe('dark')
  })

  it('falls back to a valid theme when storage is unavailable', () => {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: {
        getItem: vi.fn(() => {
          throw new Error('Storage unavailable')
        }),
        setItem: vi.fn(),
      },
    })
    setSystemTheme('dark')

    expect(resolveInitialTheme()).toBe('dark')
  })

  it('falls back to light when matchMedia is unavailable', () => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: undefined,
    })

    expect(resolveInitialTheme()).toBe('light')
  })

  it('applies the theme to the root data attribute', () => {
    applyTheme('dark')

    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
  })

  it('applies the initial theme before React render can mount content', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'dark')

    expect(applyInitialTheme()).toBe('dark')
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
  })
})
