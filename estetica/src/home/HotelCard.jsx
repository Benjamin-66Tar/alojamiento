import './HotelCard.css'

export default function HotelCard({ hotel }) {
  const {
    gradient,
    name,
    location,
    rating,
    reviews,
    price,
    originalPrice,
    amenities,
    featured,
  } = hotel

  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0

  return (
    <div className={`hotel-card ${featured ? 'featured' : ''}`}>
      <div className="hotel-image-container" style={{ background: gradient }}>
        {discount > 0 && <div className="discount-badge">{discount}% OFF</div>}
        {featured && <div className="featured-badge">⭐ Destacado</div>}
      </div>

      <div className="hotel-content">
        <div className="hotel-header">
          <h3 className="hotel-name">{name}</h3>
          <div className="rating">
            <span className="stars">★★★★★</span>
            <span className="rating-value">{rating}</span>
          </div>
        </div>

        <p className="hotel-location">📍 {location}</p>

        <div className="hotel-amenities">
          {amenities?.slice(0, 3).map((amenity, idx) => (
            <span key={idx} className="amenity-tag">
              {amenity}
            </span>
          ))}
        </div>

        <div className="hotel-reviews">
          <span className="review-count">({reviews} reseñas)</span>
        </div>

        <div className="hotel-footer">
          <div className="price-section">
            {originalPrice && (
              <span className="original-price">${originalPrice.toLocaleString()}</span>
            )}
            <span className="price">${price.toLocaleString()}</span>
            <span className="per-night">/noche</span>
          </div>
          <button className="btn-book">Ver Disponibilidad</button>
        </div>
      </div>
    </div>
  )
}
