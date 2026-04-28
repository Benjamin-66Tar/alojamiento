import './RevenueChart.css'

export default function RevenueChart({ period = 'month' }) {
  const data = {
    week: [40, 55, 48, 72, 65, 78, 82],
    month: [12, 19, 15, 25, 22, 30, 28, 35, 40, 38, 42, 48, 52, 58],
    year: [45, 52, 48, 65, 72, 68, 75, 82, 88, 85, 92, 98],
  }

  const chartData = data[period] || data.month
  const maxValue = Math.max(...chartData)
  const labels = 
    period === 'week' ? ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab', 'Dom'] :
    period === 'month' ? ['1', '5', '8', '12', '15', '18', '22', '25', '28', '30', '31', '...', '...', '...'] :
    ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3 className="chart-title">Ingresos por Período</h3>
        <span className="chart-subtitle">En miles de dólares</span>
      </div>

      <div className="chart-container">
        <div className="chart-y-axis">
          <span>${maxValue}k</span>
          <span>${Math.round(maxValue * 0.75)}k</span>
          <span>${Math.round(maxValue * 0.5)}k</span>
          <span>${Math.round(maxValue * 0.25)}k</span>
          <span>$0</span>
        </div>

        <div className="chart-bars-container">
          <div className="chart-grid">
            {chartData.map((value, idx) => (
              <div key={idx} className="chart-bar-wrapper">
                <div 
                  className="chart-bar"
                  style={{ 
                    height: `${(value / maxValue) * 100}%`,
                    background: `linear-gradient(180deg, var(--primary-color) 0%, var(--primary-light) 100%)`
                  }}
                >
                  <span className="bar-value">${value}k</span>
                </div>
              </div>
            ))}
          </div>

          <div className="chart-x-axis">
            {labels.map((label, idx) => (
              <span key={idx} className="x-label">{label}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
