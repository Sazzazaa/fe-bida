import { useState } from 'react'
import Login from './pages/Login'
import Register from './pages/Register'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState<'login' | 'register'>('login')

  return (
    <div className="app-container">
      {currentPage === 'login' && (
        <Login />
      )}
      {currentPage === 'register' && (
        <Register />
      )}

      {/* Simple Navigation */}
      <nav className="page-nav" style={{ position: 'fixed', top: 10, right: 20, zIndex: 100 }}>
        <button
          onClick={() => setCurrentPage('login')}
          style={{
            padding: '8px 16px',
            marginRight: '8px',
            background: currentPage === 'login' ? 'var(--accent)' : 'var(--bg-secondary)',
            color: currentPage === 'login' ? 'white' : 'var(--text)',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'all 0.2s ease',
          }}
        >
          Login
        </button>
        <button
          onClick={() => setCurrentPage('register')}
          style={{
            padding: '8px 16px',
            background: currentPage === 'register' ? 'var(--accent)' : 'var(--bg-secondary)',
            color: currentPage === 'register' ? 'white' : 'var(--text)',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'all 0.2s ease',
          }}
        >
          Register
        </button>
      </nav>
    </div>
  )
}

export default App
