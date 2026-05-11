import { useState } from 'react'
import './App.css'
import Home from './home/Home'
import Dashboard from './dashboard/Dashboard'
import Login from './auth/Login'

const SESSION_KEY = 'alojamiento_user_session'
const DASHBOARD_ROLES = ['super-admin', 'gerente']

function canAccessDashboard(user) {
  return DASHBOARD_ROLES.includes(user?.roleId)
}

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY))
  } catch {
    return null
  }
}

function App() {
  const [currentUser, setCurrentUser] = useState(readStoredUser)
  const [currentPage, setCurrentPage] = useState(currentUser ? 'dashboard' : 'home')

  const handleLogin = (user) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user))
    setCurrentUser(user)
    setCurrentPage(canAccessDashboard(user) ? 'dashboard' : 'home')
  }

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY)
    setCurrentUser(null)
    setCurrentPage('home')
  }

  const handleDashboardNavigation = () => {
    setCurrentPage(currentUser && canAccessDashboard(currentUser) ? 'dashboard' : 'login')
  }

  return (
    <div className="app">
      {currentPage === 'home' && (
        <Home
          currentUser={currentUser}
          onNavigateToDashboard={handleDashboardNavigation}
          onLogout={handleLogout}
        />
      )}

      {currentPage === 'login' && (
        <Login onLogin={handleLogin} onBack={() => setCurrentPage('home')} />
      )}

      {currentPage === 'dashboard' && (
        currentUser && canAccessDashboard(currentUser) ? (
          <Dashboard
            currentUser={currentUser}
            onNavigateToHome={() => setCurrentPage('home')}
            onLogout={handleLogout}
          />
        ) : (
          <Login onLogin={handleLogin} onBack={() => setCurrentPage('home')} />
        )
      )}
    </div>
  )
}

export default App
