import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AdminLayout } from './components/admin/AdminLayout'
import { AdminRoute } from './components/AdminRoute'
import { FnbManage } from './pages/admin/FnbManage'
import { Revenue } from './pages/admin/Revenue'
import { TableManage } from './pages/admin/TableManage'
import { HomePlaceholder } from './pages/HomePlaceholder'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePlaceholder />} />
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="tables" replace />} />
            <Route path="tables" element={<TableManage />} />
            <Route path="fnb" element={<FnbManage />} />
            <Route path="revenue" element={<Revenue />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
