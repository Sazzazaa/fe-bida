import { Outlet } from 'react-router-dom'

/**
 * FE-1: Thay bang kiem tra AuthContext + role === 'admin'.
 * Hien tai cho phep vao admin de phat trien FE-3.
 */
export function AdminRoute() {
  return <Outlet />
}
