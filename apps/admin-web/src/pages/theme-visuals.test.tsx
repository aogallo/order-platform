import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { THEME_STORAGE_KEY } from '../lib/theme'
import { ThemeProvider } from '../providers/ThemeProvider'
import { Layout } from '../components/Layout'
import layoutCss from '../components/Layout.css?raw'
import publicLayoutCss from '../components/PublicLayout.css?raw'
import themeToggleCss from '../components/ThemeToggle.css?raw'
import Dashboard from './Dashboard'
import Orders from './Orders'
import Users from './Users'
import createOrderCss from './CreateOrder.css?raw'
import dashboardCss from './Dashboard.css?raw'
import homeCss from './Home.css?raw'
import loginCss from './Login.css?raw'
import orderCss from './Order.css?raw'
import trackOrderCss from './TrackOrder.css?raw'
import usersCss from './Users.css?raw'

const orders = [
  {
    id: 'ord-001',
    amount: 45.99,
    item: 'Wireless Mouse',
    status: 'PENDING',
    createdAt: '2026-05-20T10:00:00Z',
    updatedAt: '2026-05-20T10:00:00Z',
  },
  {
    id: 'ord-002',
    amount: 129.99,
    item: 'Mechanical Keyboard',
    status: 'CONFIRMED',
    createdAt: '2026-05-19T14:30:00Z',
    updatedAt: '2026-05-19T16:00:00Z',
  },
  {
    id: 'ord-003',
    amount: 799.99,
    item: '27" Monitor',
    status: 'SHIPPED',
    createdAt: '2026-05-18T09:15:00Z',
    updatedAt: '2026-05-19T08:00:00Z',
  },
  {
    id: 'ord-004',
    amount: 39.99,
    item: 'USB-C Hub',
    status: 'DELIVERED',
    createdAt: '2026-05-15T11:00:00Z',
    updatedAt: '2026-05-17T14:00:00Z',
  },
  {
    id: 'ord-005',
    amount: 249.99,
    item: 'Webcam HD',
    status: 'CANCELLED',
    createdAt: '2026-05-14T08:00:00Z',
    updatedAt: '2026-05-14T09:30:00Z',
  },
]

vi.mock('../hooks/useOrders', () => ({
  useOrders: () => ({ data: orders, isLoading: false }),
}))

const renderAdminPages = (theme: 'light' | 'dark') => {
  window.localStorage.setItem(THEME_STORAGE_KEY, theme)

  return render(
    <MemoryRouter initialEntries={['/admin']}>
      <ThemeProvider>
        <Layout>
          <Dashboard />
          <Orders />
          <Users />
        </Layout>
      </ThemeProvider>
    </MemoryRouter>,
  )
}

const themedCssFiles: Array<[string, string]> = [
  ['src/components/Layout.css', layoutCss],
  ['src/components/PublicLayout.css', publicLayoutCss],
  ['src/components/ThemeToggle.css', themeToggleCss],
  ['src/pages/CreateOrder.css', createOrderCss],
  ['src/pages/Dashboard.css', dashboardCss],
  ['src/pages/Home.css', homeCss],
  ['src/pages/Login.css', loginCss],
  ['src/pages/Order.css', orderCss],
  ['src/pages/TrackOrder.css', trackOrderCss],
  ['src/pages/Users.css', usersCss],
]

const expectVisibleText = (text: string) => {
  expect(screen.getAllByText(text)[0]).toBeVisible()
}

describe('themed admin visuals', () => {
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

  it.each(['light', 'dark'] as const)('renders representative admin surfaces and badges in %s theme', (theme) => {
    renderAdminPages(theme)

    expect(document.documentElement).toHaveAttribute('data-theme', theme)
    expect(screen.getByRole('heading', { name: /dashboard/i })).toBeVisible()
    expect(screen.getByText('Total Orders')).toBeVisible()
    expect(screen.getAllByRole('table')).toHaveLength(2)
    expectVisibleText('Pending')
    expectVisibleText('Confirmed')
    expectVisibleText('Shipped')
    expectVisibleText('Delivered')
    expectVisibleText('Cancelled')
    expectVisibleText('Admin')
    expect(screen.getAllByText('Operator')).toHaveLength(2)
    expectVisibleText('Viewer')
  })

  it('keeps page and component CSS on semantic theme tokens instead of fixed visual colors', () => {
    const fixedColorPattern = /#[0-9a-fA-F]{3,8}\b|rgba?\(/

    for (const [cssFile, css] of themedCssFiles) {
      expect(cssFile, css).not.toMatch(fixedColorPattern)
    }
  })
})
