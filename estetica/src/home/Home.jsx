import { useEffect, useState } from 'react'
import './Home.css'
import SearchBar from './SearchBar'
import CategoryIcons from './CategoryIcons'
import OfferSection from './OfferSection'
import HotelCard from './HotelCard'
import ServicesSection from './ServicesSection'
import { createReservation, downloadReservationPdf, getPublicRooms } from '../api/client'

const reservationTypes = ['Flexible', 'No reembolsable', 'Ejecutiva', 'Familiar']

function formatInputDate(date) {
  return date.toISOString().split('T')[0]
}

function addDays(date, days) {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + days)
  return nextDate
}

function calculateNights(startDate, endDate) {
  const start = new Date(`${startDate}T00:00:00`)
  const end = new Date(`${endDate}T00:00:00`)
  const diff = end.getTime() - start.getTime()
  return Math.max(1, Math.ceil(diff / 86400000))
}

export default function Home({
  currentUser,
  onNavigateToDashboard,
  onNavigateToLogin,
  onNavigateToProfile,
  onLogout,
}) {
  const [searchParams, setSearchParams] = useState({})
  const [rooms, setRooms] = useState([])
  const [roomsStatus, setRoomsStatus] = useState('loading')
  const [roomsError, setRoomsError] = useState('')
  const [selectedHotel, setSelectedHotel] = useState(null)
  const [reservationStatus, setReservationStatus] = useState('')
  const [reservation, setReservation] = useState(() => {
    const today = new Date()
    return {
      guestName: '',
      checkIn: formatInputDate(today),
      checkOut: formatInputDate(addDays(today, 2)),
      reservationType: 'Flexible',
    }
  })
  const canSeeDashboard = ['super-admin', 'gerente'].includes(currentUser?.roleId)

  useEffect(() => {
    let active = true

    getPublicRooms()
      .then((data) => {
        if (!active) return
        setRooms(data)
        setRoomsStatus('ready')
      })
      .catch((error) => {
        if (!active) return
        setRoomsError(error.message)
        setRoomsStatus('error')
      })

    return () => {
      active = false
    }
  }, [])

  const handleSearch = (params) => {
    setSearchParams(params)
    setReservation((currentReservation) => ({
      ...currentReservation,
      checkIn: params.checkIn || currentReservation.checkIn,
      checkOut: params.checkOut || currentReservation.checkOut,
    }))
  }

  const handleOpenReservation = (hotel) => {
    setSelectedHotel(hotel)
    setReservation((currentReservation) => ({
      ...currentReservation,
      guestName: currentUser?.roleId === 'huesped' ? currentUser.name : currentReservation.guestName,
      checkIn: searchParams.checkIn || currentReservation.checkIn,
      checkOut: searchParams.checkOut || currentReservation.checkOut,
    }))
  }

  const handleConfirmReservation = async (event) => {
    event.preventDefault()

    if (!selectedHotel) return

    const nights = calculateNights(reservation.checkIn, reservation.checkOut)
    const amountPaid = nights * selectedHotel.price

    try {
      setReservationStatus('Guardando reservacion en la base de datos...')
      const savedReservation = await createReservation({
        guestId: currentUser?.id,
        guestName: reservation.guestName,
        roomId: selectedHotel.roomId || selectedHotel.id,
        checkIn: reservation.checkIn,
        checkOut: reservation.checkOut,
        guestsCount: searchParams.guests || 1,
        reservationType: reservation.reservationType,
        totalAmount: amountPaid,
        paidAmount: amountPaid,
      })

      setReservationStatus('Generando PDF desde la API...')
      await downloadReservationPdf({
        guestName: savedReservation.guestName,
        reservationNumber: savedReservation.reservationNumber,
        checkIn: savedReservation.checkIn,
        checkOut: savedReservation.checkOut,
        amountPaid: savedReservation.amountPaid,
        reservationType: savedReservation.reservationType,
        hotelName: savedReservation.hotelName,
        nights,
      })

      setReservationStatus('')
      setSelectedHotel(null)
    } catch (error) {
      setReservationStatus(error.message)
    }
  }

  const filteredRooms = rooms.filter((hotel) =>
    !searchParams.location ||
    hotel.location.toLowerCase().includes(searchParams.location.toLowerCase()) ||
    hotel.name.toLowerCase().includes(searchParams.location.toLowerCase())
  )

  return (
    <div className="home">
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">Hotel</span>
            <span className="logo-text">Estetica Hoteles</span>
          </div>
          <nav className="nav">
            <a href="#" className="nav-link">Inicio</a>
            <a href="#" className="nav-link">Hoteles</a>
            <a href="#" className="nav-link">Ofertas</a>
            <a href="#" className="nav-link">Contacto</a>
            {currentUser && (
              <span className="nav-user">{currentUser.name}</span>
            )}
            {!currentUser && (
              <button className="nav-button" onClick={onNavigateToLogin}>
                Iniciar sesion
              </button>
            )}
            {currentUser && (
              <button className="nav-ghost-button" onClick={onNavigateToProfile}>
                Perfil
              </button>
            )}
            {canSeeDashboard && (
              <button className="nav-button" onClick={onNavigateToDashboard}>
                Dashboard
              </button>
            )}
            {currentUser && (
              <button className="nav-ghost-button" onClick={onLogout}>
                Salir
              </button>
            )}
          </nav>
        </div>
      </header>

      <SearchBar onSearch={handleSearch} />
      <CategoryIcons />
      <ServicesSection />
      <OfferSection />

      <section className="hotels-section">
        <div className="hotels-container">
          <div className="section-header">
            <h2 className="section-title">Habitaciones Disponibles</h2>
            <p className="section-subtitle">Habitaciones cargadas desde PostgreSQL</p>
          </div>

          <div className="hotels-grid">
            {roomsStatus === 'loading' && (
              <div className="rooms-feedback">Cargando habitaciones desde la base de datos...</div>
            )}
            {roomsStatus === 'error' && (
              <div className="rooms-feedback error">{roomsError}</div>
            )}
            {roomsStatus === 'ready' && rooms.length === 0 && (
              <div className="rooms-feedback">No hay habitaciones registradas todavia.</div>
            )}
            {filteredRooms.map((hotel) => (
              <HotelCard key={hotel.id} hotel={hotel} onBook={handleOpenReservation} />
            ))}
          </div>
        </div>
      </section>

      {selectedHotel && (
        <div className="reservation-modal" role="dialog" aria-modal="true" aria-labelledby="reservation-title">
          <form className="reservation-card" onSubmit={handleConfirmReservation}>
            <div className="reservation-heading">
              <div>
                <p className="reservation-eyebrow">Confirmar reservacion</p>
                <h2 id="reservation-title">{selectedHotel.name}</h2>
              </div>
              <button type="button" className="modal-close" onClick={() => setSelectedHotel(null)}>
                Cerrar
              </button>
            </div>

            <label className="reservation-field">
              <span>Nombre del huesped</span>
              <input
                type="text"
                value={reservation.guestName}
                onChange={(event) => setReservation({ ...reservation, guestName: event.target.value })}
                required
              />
            </label>

            <div className="reservation-dates">
              <label className="reservation-field">
                <span>Inicio de reservacion</span>
                <input
                  type="date"
                  value={reservation.checkIn}
                  onChange={(event) => setReservation({ ...reservation, checkIn: event.target.value })}
                  required
                />
              </label>

              <label className="reservation-field">
                <span>Fin de reservacion</span>
                <input
                  type="date"
                  value={reservation.checkOut}
                  onChange={(event) => setReservation({ ...reservation, checkOut: event.target.value })}
                  required
                />
              </label>
            </div>

            <label className="reservation-field">
              <span>Tipo de reservacion</span>
              <select
                value={reservation.reservationType}
                onChange={(event) => setReservation({ ...reservation, reservationType: event.target.value })}
              >
                {reservationTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </label>

            <div className="reservation-total">
              <span>Monto pagado</span>
              <strong>
                ${(calculateNights(reservation.checkIn, reservation.checkOut) * selectedHotel.price).toLocaleString()}
              </strong>
            </div>

            {reservationStatus && (
              <p className="reservation-message">{reservationStatus}</p>
            )}

            <button type="submit" className="reservation-submit">
              Confirmar y generar PDF
            </button>
          </form>
        </div>
      )}

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Sobre Nosotros</h4>
            <p>Tu plataforma de confianza para reservar los mejores hoteles al mejor precio.</p>
          </div>
          <div className="footer-section">
            <h4>Informacion</h4>
            <ul>
              <li><a href="#">Preguntas Frecuentes</a></li>
              <li><a href="#">Politica de Privacidad</a></li>
              <li><a href="#">Terminos de Servicio</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Contacto</h4>
            <p>info@esteticahoteles.com</p>
            <p>+34 900 123 456</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Estetica Hoteles. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
