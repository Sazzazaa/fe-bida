import { useState } from 'react'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState<'login' | 'register' | 'dashboard'>('login')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userName, setUserName] = useState('')

  const handleLogin = (loggedInName: string) => {
    setUserName(loggedInName)
    setIsAuthenticated(true)
    setCurrentPage('dashboard')
  }

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:8080/api/v1/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
      })
    } catch (err) {
      console.warn('Logout error (ignore if backend not running yet)', err)
    }

    localStorage.removeItem('accessToken')
    setIsAuthenticated(false)
    setUserName('')
    setCurrentPage('login')
  }

  return (
    <div className="app-container">
      {/* Auth Pages */}
      {!isAuthenticated && currentPage === 'login' && (
        <Login
          onLogin={handleLogin}
          onSwitchToRegister={() => setCurrentPage('register')}
        />
      )}
      {!isAuthenticated && currentPage === 'register' && (
        <Register
          onRegistered={() => setCurrentPage('login')}
          onSwitchToLogin={() => setCurrentPage('login')}
        />
      )}

      {/* Dashboard */}
      {isAuthenticated && (
        <Dashboard
          onLogout={handleLogout}
          userName={userName || 'User'}
          userRole="Staff"
        />
      )}

      {/* Navigation for Auth Pages */}
      {!isAuthenticated && (
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
          <button
            onClick={() => {
              setIsAuthenticated(true)
              setCurrentPage('dashboard')
            }}
            style={{
              padding: '8px 16px',
              background: 'var(--success)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.2s ease',
            }}
          >
            Demo Login
          </button>
        </nav>
      )}
    </div>
  )
}

export default App
