import { useState } from 'react'
import './Home.css'
import SearchBar from './SearchBar'
import CategoryIcons from './CategoryIcons'
import OfferSection from './OfferSection'
import HotelCard from './HotelCard'

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

export default function Home({ onNavigateToDashboard }) {
  const [searchParams, setSearchParams] = useState({})

  const handleSearch = (params) => {
    setSearchParams(params)
    console.log('Búsqueda realizada:', params)
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
            <button className="nav-button" onClick={onNavigateToDashboard}>📊 Dashboard</button>
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
                <HotelCard key={hotel.id} hotel={hotel} />
              ))}
          </div>
        </div>
      </section>

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
