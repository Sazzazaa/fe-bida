import { NavLink, Outlet } from 'react-router-dom'
import './AdminLayout.css'

const nav = [
  { to: '/admin/tables', label: 'Quan ly ban' },
  { to: '/admin/fnb', label: 'Quan ly F&B' },
  { to: '/admin/revenue', label: 'Doanh thu' },
]

export function AdminLayout() {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">Bida Admin</div>
        <nav className="admin-nav">
          {nav.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `admin-nav-link${isActive ? ' admin-nav-link--active' : ''}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <NavLink to="/" className="admin-back">
          Ve trang chu
        </NavLink>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  )
}
