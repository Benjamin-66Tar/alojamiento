import { useState } from 'react'
import './App.css'
import Home from './home/Home'
import Dashboard from './dashboard/Dashboard'

function App() {
  const [currentPage, setCurrentPage] = useState('home')

  return (
    <div className="app">
      {currentPage === 'home' ? (
        <Home onNavigateToDashboard={() => setCurrentPage('dashboard')} />
      ) : (
        <Dashboard onNavigateToHome={() => setCurrentPage('home')} />
      )}
    </div>
  )
}

export default App
