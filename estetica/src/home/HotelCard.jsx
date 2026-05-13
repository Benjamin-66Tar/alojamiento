import './HotelCard.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export default function HotelCard({ hotel, onBook }) {
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
    images,
    roomNumber,
  } = hotel

  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0
  const imageUrl = images?.[0] ? `${API_URL}${images[0]}` : ''

  return (
    <div className={`hotel-card ${featured ? 'featured' : ''}`}>
      <div className="hotel-image-container" style={{ background: gradient }}>
        {imageUrl && <img className="hotel-room-image" src={imageUrl} alt={name} />}
        {discount > 0 && <div className="discount-badge">{discount}% OFF</div>}
        {featured && <div className="featured-badge">Destacado</div>}
        {roomNumber && <div className="room-number-badge">Hab. {roomNumber}</div>}
      </div>

      <div className="hotel-content">
        <div className="hotel-header">
          <h3 className="hotel-name">{name}</h3>
          <div className="rating">
            <span className="stars">*****</span>
            <span className="rating-value">{rating}</span>
          </div>
        </div>

        <p className="hotel-location">{location}</p>

        <div className="hotel-amenities">
          {amenities?.slice(0, 3).map((amenity) => (
            <span key={amenity} className="amenity-tag">
              {amenity}
            </span>
          ))}
        </div>

        <div className="hotel-reviews">
          <span className="review-count">({reviews} resenas)</span>
        </div>

        <div className="hotel-footer">
          <div className="price-section">
            {originalPrice && (
              <span className="original-price">${originalPrice.toLocaleString()}</span>
            )}
            <span className="price">${price.toLocaleString()}</span>
            <span className="per-night">/noche</span>
          </div>
          <button className="btn-book" onClick={() => onBook?.(hotel)}>
            Reservar
          </button>
        </div>
      </div>
    </div>
  )
}
