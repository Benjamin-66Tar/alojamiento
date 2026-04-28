import './StatsCards.css'

const statsData = {
  week: [
    { id: 1, icon: '📅', label: 'Reservas', value: '24', change: '+12%', color: '#6366f1' },
    { id: 2, icon: '💰', label: 'Ingresos', value: '$4,820', change: '+8%', color: '#ec4899' },
    { id: 3, icon: '⭐', label: 'Ocupación', value: '78%', change: '+5%', color: '#f59e0b' },
    { id: 4, icon: '😊', label: 'Valoración', value: '4.8', change: '+0.3', color: '#10b981' },
  ],
  month: [
    { id: 1, icon: '📅', label: 'Reservas', value: '142', change: '+22%', color: '#6366f1' },
    { id: 2, icon: '💰', label: 'Ingresos', value: '$28,450', change: '+18%', color: '#ec4899' },
    { id: 3, icon: '⭐', label: 'Ocupación', value: '85%', change: '+12%', color: '#f59e0b' },
    { id: 4, icon: '😊', label: 'Valoración', value: '4.7', change: '+0.2', color: '#10b981' },
  ],
  year: [
    { id: 1, icon: '📅', label: 'Reservas', value: '1,248', change: '+45%', color: '#6366f1' },
    { id: 2, icon: '💰', label: 'Ingresos', value: '$287,640', change: '+65%', color: '#ec4899' },
    { id: 3, icon: '⭐', label: 'Ocupación', value: '82%', change: '+28%', color: '#f59e0b' },
    { id: 4, icon: '😊', label: 'Valoración', value: '4.6', change: '+0.5', color: '#10b981' },
  ],
}

export default function StatsCards({ period = 'month' }) {
  const stats = statsData[period] || statsData.month

  return (
    <div className="stats-grid">
      {stats.map((stat) => (
        <div key={stat.id} className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: `${stat.color}20`, color: stat.color }}>
            {stat.icon}
          </div>
          <div className="stat-content">
            <p className="stat-label">{stat.label}</p>
            <h3 className="stat-value">{stat.value}</h3>
            <p className="stat-change" style={{ color: stat.color }}>
              {stat.change}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
