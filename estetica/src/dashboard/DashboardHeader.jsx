import './DashboardHeader.css'

export default function DashboardHeader({ onNavigateToHome, roleName = 'Administrador' }) {
  return (
    <header className="dashboard-header">
      <div className="header-container">
        <div className="header-brand">
          <span className="brand-icon">📊</span>
          <span className="brand-text">Panel de alojamiento</span>
        </div>
        
        <nav className="header-nav">
          <button className="nav-item" onClick={onNavigateToHome}>← Volver a Inicio</button>
          <div className="user-menu">
            <div className="user-avatar">👤</div>
            <span className="user-name">{roleName}</span>
          </div>
        </nav>
      </div>
    </header>
  )
}
