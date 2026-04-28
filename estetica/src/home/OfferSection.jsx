import './OfferSection.css'

const featuredOffers = [
  {
    id: 1,
    title: 'Semana de Lujo',
    description: 'Disfruta de 7 noches en los mejores hoteles con descuento de hasta 40%',
    image: '🏨',
    promo: '-40%',
    color: '#ec4899',
  },
  {
    id: 2,
    title: 'Escapada Romántica',
    description: 'Paquetes especiales para parejas con cena y spa incluidos',
    image: '💑',
    promo: 'ESPECIAL',
    color: '#f59e0b',
  },
  {
    id: 3,
    title: 'Viajes en Familia',
    description: 'Los niños menores de 12 años se hospedan gratis',
    image: '👨‍👩‍👧‍👦',
    promo: 'GRATIS',
    color: '#10b981',
  },
]

export default function OfferSection() {
  return (
    <div className="offer-section">
      <div className="offer-container">
        <h2 className="offer-title">🎉 Ofertas Especiales</h2>
        <div className="offers-grid">
          {featuredOffers.map((offer) => (
            <div
              key={offer.id}
              className="offer-card"
              style={{ borderTopColor: offer.color }}
            >
              <div className="offer-image">{offer.image}</div>
              <div className="offer-content">
                <span className="offer-badge" style={{ backgroundColor: offer.color }}>
                  {offer.promo}
                </span>
                <h3 className="offer-title-text">{offer.title}</h3>
                <p className="offer-description">{offer.description}</p>
              </div>
              <button className="btn-offer">Explorar →</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
