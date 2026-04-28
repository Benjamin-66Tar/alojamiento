import './CategoryIcons.css'

const categories = [
  { id: 1, icon: '🏖️', name: 'Playa', description: 'Resorts en la playa' },
  { id: 2, icon: '🏔️', name: 'Montaña', description: 'Escapadas alpinas' },
  { id: 3, icon: '🏙️', name: 'Ciudad', description: 'Hoteles urbanos' },
  { id: 4, icon: '🌳', name: 'Naturaleza', description: 'Eco-turismo' },
  { id: 5, icon: '🏰', name: 'Histórico', description: 'Palacios y castillos' },
  { id: 6, icon: '✨', name: 'Lujo', description: '5 estrellas' },
]

export default function CategoryIcons() {
  return (
    <div className="categories-container">
      <h2 className="categories-title">Explora por categoría</h2>
      <div className="categories-grid">
        {categories.map((category) => (
          <div key={category.id} className="category-card">
            <div className="category-icon">{category.icon}</div>
            <h3 className="category-name">{category.name}</h3>
            <p className="category-description">{category.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
