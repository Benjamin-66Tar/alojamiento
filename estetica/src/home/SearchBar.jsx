import { useState } from 'react'
import './SearchBar.css'

export default function SearchBar({ onSearch }) {
  const [location, setLocation] = useState('')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState('2')

  const handleSearch = (e) => {
    e.preventDefault()
    if (onSearch) {
      onSearch({ location, checkIn, checkOut, guests })
    }
  }

  return (
    <div className="search-bar-container">
      <form className="search-bar" onSubmit={handleSearch}>
        <div className="search-field">
          <label htmlFor="location">📍 Destino</label>
          <input
            id="location"
            type="text"
            placeholder="¿A dónde viajas?"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <div className="search-field">
          <label htmlFor="checkIn">📅 Check-in</label>
          <input
            id="checkIn"
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
          />
        </div>

        <div className="search-field">
          <label htmlFor="checkOut">📅 Check-out</label>
          <input
            id="checkOut"
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
          />
        </div>

        <div className="search-field">
          <label htmlFor="guests">👥 Huéspedes</label>
          <select
            id="guests"
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
          >
            <option value="1">1 huésped</option>
            <option value="2">2 huéspedes</option>
            <option value="3">3 huéspedes</option>
            <option value="4">4 huéspedes</option>
            <option value="5">5+ huéspedes</option>
          </select>
        </div>

        <button type="submit" className="btn-search">
          🔍 Buscar
        </button>
      </form>
    </div>
  )
}
