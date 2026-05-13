import { useEffect, useState } from 'react'
import './RecentBookings.css'
import { getReservations } from '../api/client'

function formatDate(value) {
  return new Date(value).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

export default function RecentBookings({ currentUser }) {
  const [bookings, setBookings] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    getReservations(currentUser.id)
      .then((data) => {
        if (!active) return
        setBookings(data)
        setStatus('ready')
      })
      .catch((requestError) => {
        if (!active) return
        setError(requestError.message)
        setStatus('error')
      })

    return () => {
      active = false
    }
  }, [currentUser.id])

  return (
    <div className="bookings-card">
      <div className="bookings-header">
        <h3 className="bookings-title">Reservas Recientes</h3>
        <button type="button" className="view-all">Base de datos</button>
      </div>

      {status === 'loading' && <div className="booking-state">Cargando reservaciones...</div>}
      {status === 'error' && <div className="booking-state error">{error}</div>}
      {status === 'ready' && bookings.length === 0 && (
        <div className="booking-state">No hay reservaciones registradas.</div>
      )}

      {status === 'ready' && bookings.length > 0 && (
        <div className="bookings-table">
          <div className="table-header">
            <div className="table-col-guest">Huesped</div>
            <div className="table-col-hotel">Hotel</div>
            <div className="table-col-dates">Fechas</div>
            <div className="table-col-status">Estado</div>
            <div className="table-col-amount">Monto</div>
          </div>

          <div className="table-body">
            {bookings.map((booking) => (
              <div key={booking.id} className="table-row">
                <div className="table-col-guest" data-label="Huesped">
                  <p className="guest-name">{booking.guest_name}</p>
                </div>
                <div className="table-col-hotel" data-label="Hotel">
                  <p className="hotel-name-table">{booking.hotel_name} - {booking.room_type}</p>
                </div>
                <div className="table-col-dates" data-label="Fechas">
                  <p className="dates-range">{formatDate(booking.check_in)} a {formatDate(booking.check_out)}</p>
                </div>
                <div className="table-col-status" data-label="Estado">
                  <span className={`status-badge ${booking.status}`}>
                    {booking.status}
                  </span>
                </div>
                <div className="table-col-amount" data-label="Monto">
                  <p className="amount">${Number(booking.paid_amount || booking.total_amount).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
