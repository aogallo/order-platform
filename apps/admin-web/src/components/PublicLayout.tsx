import './PublicLayout.css'
import { Link, Outlet } from 'react-router-dom'
import { ThemeToggle } from './ThemeToggle'

export const PublicLayout = () => {
  return (
    <div className="public">
      <header className="public__header">
        <Link to="/" className="public__logo">Order Platform</Link>
        <nav className="public__nav">
          <Link to="/orders/new" className="public__link">Create Order</Link>
          <Link to="/tracking" className="public__link">Track Order</Link>
          <Link to="/admin" className="public__link">Admin</Link>
          <ThemeToggle className="public__theme-toggle" />
        </nav>
      </header>
      <main className="public__main">
        <Outlet />
      </main>
    </div>
  )
}
