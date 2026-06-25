import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from '../providers/ThemeProvider'
import { PublicLayout } from './PublicLayout'

const renderPublicLayout = () => {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <ThemeProvider>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<p>Public content</p>} />
          </Route>
        </Routes>
      </ThemeProvider>
    </MemoryRouter>,
  )
}

describe('PublicLayout', () => {
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

  it('renders the theme toggle in the public navbar', () => {
    renderPublicLayout()

    expect(screen.getByRole('button', { name: /toggle theme/i })).toBeVisible()
    expect(screen.getByText('light')).toBeVisible()
  })
})
