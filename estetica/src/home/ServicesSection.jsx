import { useEffect, useState } from 'react'
import './ServicesSection.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export default function ServicesSection() {
  const [services, setServices] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function loadServices() {
      try {
        const response = await fetch(`${API_URL}/api/services`, {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error('No se pudieron cargar los servicios.')
        }

        const data = await response.json()
        setServices(data)
        setStatus('ready')
      } catch (requestError) {
        if (requestError.name === 'AbortError') return
        setError(requestError.message)
        setStatus('error')
      }
    }

    loadServices()

    return () => controller.abort()
  }, [])

  return (
    <section className="services-section">
      <div className="services-container">
        <div className="section-header">
          <h2 className="section-title">Servicios del hotel</h2>
          <p className="section-subtitle">Datos cargados desde PostgreSQL</p>
        </div>

        {status === 'loading' && (
          <div className="services-state">Cargando servicios...</div>
        )}

        {status === 'error' && (
          <div className="services-state error">{error}</div>
        )}

        {status === 'ready' && (
          <div className="services-grid">
            {services.map((service) => (
              <article key={service.id} className="service-card">
                <div>
                  <h3>{service.name}</h3>
                  <p>{service.summary}</p>
                </div>
                <strong>
                  {Number(service.price) === 0 ? 'Incluido' : `$${Number(service.price).toFixed(2)}`}
                </strong>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
