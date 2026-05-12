import { useEffect, useState } from 'react'
import './Profile.css'
import { getUserProfile } from '../api/client'

export default function Profile({ currentUser, onBack, onLogout, onUserUpdate }) {
  const [profile, setProfile] = useState(currentUser)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadProfile() {
      try {
        const updatedProfile = await getUserProfile(currentUser.id)
        if (!active) return
        setProfile(updatedProfile)
        onUserUpdate(updatedProfile)
        setStatus('ready')
      } catch (requestError) {
        if (!active) return
        setError(requestError.message)
        setStatus('error')
      }
    }

    loadProfile()

    return () => {
      active = false
    }
  }, [currentUser.id, onUserUpdate])

  return (
    <main className="profile-page">
      <section className="profile-shell">
        <div className="profile-header">
          <div>
            <p className="profile-eyebrow">Perfil</p>
            <h1>{profile.name}</h1>
            <p>Informacion cargada desde la base de datos PostgreSQL.</p>
          </div>
          <div className="profile-actions">
            <button type="button" onClick={onBack}>Inicio</button>
            <button type="button" onClick={onLogout}>Salir</button>
          </div>
        </div>

        {status === 'error' && <div className="profile-state error">{error}</div>}
        {status === 'loading' && <div className="profile-state">Cargando perfil...</div>}

        <div className="profile-grid">
          <article>
            <span>Nombre</span>
            <strong>{profile.name}</strong>
          </article>
          <article>
            <span>Correo</span>
            <strong>{profile.email}</strong>
          </article>
          <article>
            <span>Telefono</span>
            <strong>{profile.phone || 'Sin telefono'}</strong>
          </article>
          <article>
            <span>Rol</span>
            <strong>{profile.roleName}</strong>
          </article>
        </div>

        {profile.canAccessDashboard ? (
          <p className="profile-note success">Tu cuenta tiene acceso al dashboard administrativo.</p>
        ) : (
          <p className="profile-note">Tu cuenta esta registrada como huesped.</p>
        )}
      </section>
    </main>
  )
}
