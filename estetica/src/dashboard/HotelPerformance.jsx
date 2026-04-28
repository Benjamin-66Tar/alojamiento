import './HotelPerformance.css'

const hotels = [
  { id: 1, name: 'Grand Plaza Hotel', bookings: 42, rating: 4.8, occupancy: 92 },
  { id: 2, name: 'Costa Azul Resort', bookings: 38, rating: 4.7, occupancy: 88 },
  { id: 3, name: 'Mountain View Lodge', bookings: 35, rating: 4.9, occupancy: 85 },
  { id: 4, name: 'Urban Luxury Suites', bookings: 28, rating: 4.6, occupancy: 76 },
  { id: 5, name: 'Tropical Paradise', bookings: 32, rating: 4.8, occupancy: 82 },
]

export default function HotelPerformance() {
  return (
    <div className="performance-card">
      <h3 className="performance-title">Desempeño de Hoteles</h3>
      
      <div className="hotel-list">
        {hotels.map((hotel) => (
          <div key={hotel.id} className="hotel-item">
            <div className="hotel-info">
              <p className="hotel-name">{hotel.name}</p>
              <div className="hotel-stats">
                <span className="stat">📅 {hotel.bookings}</span>
                <span className="stat">⭐ {hotel.rating}</span>
                <span className="stat">📊 {hotel.occupancy}%</span>
              </div>
            </div>
            <div className="occupancy-bar">
              <div 
                className="occupancy-fill"
                style={{ width: `${hotel.occupancy}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
