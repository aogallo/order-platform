import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { THEME_STORAGE_KEY } from '../lib/theme'
import { ThemeProvider } from '../providers/ThemeProvider'
import { Layout } from './Layout'

const renderLayout = () => {
  return render(
    <MemoryRouter initialEntries={['/admin']}>
      <ThemeProvider>
        <Layout>
          <p>Admin content</p>
        </Layout>
      </ThemeProvider>
    </MemoryRouter>,
  )
}

describe('Layout', () => {
  beforeEach(() => {
    window.localStorage.clear()
    delete document.documentElement.dataset.theme
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  it('renders without a duplicate local theme toggle', () => {
    renderLayout()

    expect(screen.getAllByRole('button', { name: /toggle theme/i })).toHaveLength(1)
    expect(screen.queryByText(/system/i)).not.toBeInTheDocument()
  })

  it('switches immediately, persists the new theme, and updates the root attribute', async () => {
    renderLayout()

    await userEvent.click(screen.getByRole('button', { name: /toggle theme/i }))

    expect(screen.getByRole('button', { name: /toggle theme/i })).toHaveAttribute('aria-pressed', 'true')
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
  })
})
