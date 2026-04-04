import { Link } from 'react-router-dom'

export function HomePlaceholder() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center', maxWidth: 560, margin: '0 auto' }}>
      <h1 style={{ marginTop: 0 }}>Bida Management</h1>
      <p style={{ opacity: 0.8 }}>
        Trang chu / so do ban: FE-2. Tam thoi vao admin de phat trien FE-3.
      </p>
      <p>
        <Link to="/admin/tables">Vao Admin</Link>
      </p>
    </div>
  )
}
