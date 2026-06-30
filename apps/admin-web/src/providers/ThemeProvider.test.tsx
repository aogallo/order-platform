import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useTheme } from '../hooks/useTheme'
import { THEME_STORAGE_KEY } from '../lib/theme'
import { ThemeProvider } from './ThemeProvider'

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

const ThemeConsumer = () => {
  const { theme, toggleTheme } = useTheme()

  return (
    <button type="button" onClick={toggleTheme}>
      Current theme: {theme}
    </button>
  )
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    window.localStorage.clear()
    delete document.documentElement.dataset.theme
    setSystemTheme('light')
  })

  it('persists manual theme selections', async () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    )

    await userEvent.click(screen.getByRole('button', { name: /current theme: light/i }))

    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
    expect(screen.getByRole('button', { name: /current theme: dark/i })).toBeInTheDocument()
  })

  it('initializes from a persisted theme after reload', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'dark')

    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    )

    expect(screen.getByRole('button', { name: /current theme: dark/i })).toBeInTheDocument()
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
  })

  it('keeps a manual selection when the system preference later changes', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'light')
    setSystemTheme('dark')

    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    )

    expect(screen.getByRole('button', { name: /current theme: light/i })).toBeInTheDocument()
    expect(document.documentElement).toHaveAttribute('data-theme', 'light')
  })
})
