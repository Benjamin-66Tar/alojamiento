import './RecentBookings.css'

const bookings = [
  { id: 1, guest: 'Juan García', hotel: 'Grand Plaza Hotel', checkIn: '2024-05-10', checkOut: '2024-05-13', status: 'confirmada', amount: '$360' },
  { id: 2, guest: 'María López', hotel: 'Costa Azul Resort', checkIn: '2024-05-12', checkOut: '2024-05-16', status: 'confirmada', amount: '$380' },
  { id: 3, guest: 'Carlos Rodríguez', hotel: 'Mountain View Lodge', checkIn: '2024-05-15', checkOut: '2024-05-18', status: 'pendiente', amount: '$330' },
  { id: 4, guest: 'Ana Martínez', hotel: 'Urban Luxury Suites', checkIn: '2024-05-18', checkOut: '2024-05-21', status: 'confirmada', amount: '$420' },
  { id: 5, guest: 'Pedro Sánchez', hotel: 'Tropical Paradise', checkIn: '2024-05-20', checkOut: '2024-05-25', status: 'pendiente', amount: '$650' },
]

export default function RecentBookings() {
  return (
    <div className="bookings-card">
      <div className="bookings-header">
        <h3 className="bookings-title">Reservas Recientes</h3>
        <button type="button" className="view-all">Ver todas →</button>
      </div>

      <div className="bookings-table">
        <div className="table-header">
          <div className="table-col-guest">Huésped</div>
          <div className="table-col-hotel">Hotel</div>
          <div className="table-col-dates">Fechas</div>
          <div className="table-col-status">Estado</div>
          <div className="table-col-amount">Monto</div>
        </div>

        <div className="table-body">
          {bookings.map((booking) => (
            <div key={booking.id} className="table-row">
              <div className="table-col-guest" data-label="Huésped">
                <p className="guest-name">{booking.guest}</p>
              </div>
              <div className="table-col-hotel" data-label="Hotel">
                <p className="hotel-name-table">{booking.hotel}</p>
              </div>
              <div className="table-col-dates" data-label="Fechas">
                <p className="dates-range">{booking.checkIn} a {booking.checkOut}</p>
              </div>
              <div className="table-col-status" data-label="Estado">
                <span className={`status-badge ${booking.status}`}>
                  {booking.status === 'confirmada' ? '✓ Confirmada' : '⏳ Pendiente'}
                </span>
              </div>
              <div className="table-col-amount" data-label="Monto">
                <p className="amount">{booking.amount}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
