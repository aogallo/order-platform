import './Layout.css'
import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'

interface LayoutProps {
  children: ReactNode
}
export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="layout">
      <aside className="sidebar">
        <h1 className="sidebar__title">Admin Panel</h1>
        <nav className="sidebar__nav">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) => `sidebar__link${isActive ? ' sidebar__link--active' : ''}`}
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/admin/orders"
            className={({ isActive }) => `sidebar__link${isActive ? ' sidebar__link--active' : ''}`}
          >
            Orders
          </NavLink>
          <NavLink
            to="/admin/users"
            className={({ isActive }) => `sidebar__link${isActive ? ' sidebar__link--active' : ''}`}
          >
            Users
          </NavLink>
        </nav>
      </aside>
      <main className="main">{children}</main>
    </div>
  )
}
