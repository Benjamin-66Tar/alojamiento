import { useState } from 'react'
import './Home.css'
import SearchBar from './SearchBar'
import CategoryIcons from './CategoryIcons'
import OfferSection from './OfferSection'
import HotelCard from './HotelCard'
import { generateGuestReservationPdf } from '../utils/pdfReport'

// Datos de ejemplo de hoteles
const hotelData = [
  {
    id: 1,
    name: 'Grand Plaza Hotel',
    location: 'Madrid, España',
    rating: 4.8,
    reviews: 324,
    price: 120,
    originalPrice: 180,
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    amenities: ['WiFi', 'Gimnasio', 'Desayuno'],
    featured: true,
  },
  {
    id: 2,
    name: 'Costa Azul Resort',
    location: 'Barcelona, España',
    rating: 4.7,
    reviews: 512,
    price: 95,
    originalPrice: 150,
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    amenities: ['Piscina', 'Playa', 'Spa'],
    featured: false,
  },
  {
    id: 3,
    name: 'Mountain View Lodge',
    location: 'Asturias, España',
    rating: 4.9,
    reviews: 287,
    price: 110,
    originalPrice: null,
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    amenities: ['Senderismo', 'Restaurante', 'Chimenea'],
    featured: true,
  },
  {
    id: 4,
    name: 'Urban Luxury Suites',
    location: 'Valencia, España',
    rating: 4.6,
    reviews: 198,
    price: 140,
    originalPrice: 200,
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    amenities: ['Rooftop Bar', 'Concierge', '5 Estrellas'],
    featured: false,
  },
  {
    id: 5,
    name: 'Tropical Paradise Resort',
    location: 'Islas Canarias, España',
    rating: 4.8,
    reviews: 456,
    price: 130,
    originalPrice: 195,
    gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    amenities: ['Playa Privada', 'All-Inclusive', 'Entretenimiento'],
    featured: false,
  },
  {
    id: 6,
    name: 'Historic City Palace',
    location: 'Sevilla, España',
    rating: 4.7,
    reviews: 323,
    price: 105,
    originalPrice: 160,
    gradient: 'linear-gradient(135deg, #ff9a56 0%, #ff6a88 100%)',
    amenities: ['Patrimonio', 'Tour', 'Gastronomía'],
    featured: false,
  },
  {
    id: 7,
    name: 'Countryside Retreat',
    location: 'Toledo, España',
    rating: 4.5,
    reviews: 167,
    price: 85,
    originalPrice: 120,
    gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    amenities: ['Paisajes', 'Tranquilidad', 'Spa'],
    featured: false,
  },
  {
    id: 8,
    name: 'Modern City Center Hotel',
    location: 'Bilbao, España',
    rating: 4.6,
    reviews: 289,
    price: 125,
    originalPrice: 175,
    gradient: 'linear-gradient(135deg, #a6c0fe 0%, #f68084 100%)',
    amenities: ['Centro Urbano', 'Negocios', 'Arte'],
    featured: false,
  },
]

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

function createReservationNumber() {
  return `RSV-${Date.now().toString().slice(-6)}`
}

export default function Home({ currentUser, onNavigateToDashboard, onLogout }) {
  const [searchParams, setSearchParams] = useState({})
  const [selectedHotel, setSelectedHotel] = useState(null)
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

  const handleSearch = (params) => {
    setSearchParams(params)
    setReservation((currentReservation) => ({
      ...currentReservation,
      checkIn: params.checkIn || currentReservation.checkIn,
      checkOut: params.checkOut || currentReservation.checkOut,
    }))
    console.log('Búsqueda realizada:', params)
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

  const handleConfirmReservation = (event) => {
    event.preventDefault()

    if (!selectedHotel) return

    const nights = calculateNights(reservation.checkIn, reservation.checkOut)
    const amountPaid = nights * selectedHotel.price
    const reservationNumber = createReservationNumber()

    generateGuestReservationPdf({
      guestName: reservation.guestName,
      reservationNumber,
      checkIn: reservation.checkIn,
      checkOut: reservation.checkOut,
      amountPaid,
      reservationType: reservation.reservationType,
      hotelName: selectedHotel.name,
      nights,
    })

    setSelectedHotel(null)
  }

  return (
    <div className="home">
      {/* Header con navegación */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">🏨</span>
            <span className="logo-text">Estética Hoteles</span>
          </div>
          <nav className="nav">
            <a href="#" className="nav-link">Inicio</a>
            <a href="#" className="nav-link">Hoteles</a>
            <a href="#" className="nav-link">Ofertas</a>
            <a href="#" className="nav-link">Contacto</a>
            {currentUser && (
              <span className="nav-user">{currentUser.name}</span>
            )}
            {(!currentUser || canSeeDashboard) && (
              <button className="nav-button" onClick={onNavigateToDashboard}>
                {currentUser ? 'Dashboard' : 'Iniciar sesion'}
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

      {/* Sección de búsqueda */}
      <SearchBar onSearch={handleSearch} />

      {/* Sección de categorías */}
      <CategoryIcons />

      {/* Sección de ofertas especiales */}
      <OfferSection />

      {/* Sección de hoteles disponibles */}
      <section className="hotels-section">
        <div className="hotels-container">
          <div className="section-header">
            <h2 className="section-title">Hoteles Disponibles</h2>
            <p className="section-subtitle">Descubre nuestras mejores opciones</p>
          </div>

          <div className="hotels-grid">
            {hotelData
              .filter((hotel) =>
                !searchParams.location ||
                hotel.location.toLowerCase().includes(searchParams.location.toLowerCase()) ||
                hotel.name.toLowerCase().includes(searchParams.location.toLowerCase())
              )
              .map((hotel) => (
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

            <button type="submit" className="reservation-submit">
              Confirmar y generar PDF
            </button>
          </form>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Sobre Nosotros</h4>
            <p>Tu plataforma de confianza para reservar los mejores hoteles al mejor precio.</p>
          </div>
          <div className="footer-section">
            <h4>Información</h4>
            <ul>
              <li><a href="#">Preguntas Frecuentes</a></li>
              <li><a href="#">Política de Privacidad</a></li>
              <li><a href="#">Términos de Servicio</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Contacto</h4>
            <p>📧 info@esteticahoteles.com</p>
            <p>📞 +34 900 123 456</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Estética Hoteles. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
