import { useState } from 'react'
import './Login.css'
import { authenticateUser, demoUsers } from './users'

export default function Login({ onLogin, onBack }) {
  const [email, setEmail] = useState('admin@hotel.com')
  const [password, setPassword] = useState('admin123')
  const [error, setError] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()

    const user = authenticateUser(email, password)
    if (!user) {
      setError('Correo o contrasena incorrectos.')
      return
    }

    setError('')
    onLogin(user)
  }

  return (
    <main className="login-page">
      <section className="login-shell">
        <div className="login-copy">
          <button type="button" className="login-back" onClick={onBack}>
            Volver al inicio
          </button>
          <p className="login-eyebrow">Acceso seguro</p>
          <h1>Inicia sesion para entrar al panel</h1>
          <p>
            Cada usuario entra con su rol y permisos. El super admin puede revisar
            todas las vistas; los demas usuarios quedan en su rol operativo.
          </p>
        </div>

        <form className="login-card" onSubmit={handleSubmit}>
          <div>
            <h2>Login de usuarios</h2>
            <p>Usa una cuenta demo para probar el flujo completo.</p>
          </div>

          <label className="field-group">
            <span>Correo</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </label>

          <label className="field-group">
            <span>Contrasena</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="login-submit">
            Entrar al dashboard
          </button>

          <div className="demo-users">
            <span>Cuentas demo</span>
            {demoUsers.map((user) => (
              <button
                type="button"
                key={user.id}
                onClick={() => {
                  setEmail(user.email)
                  setPassword(user.password)
                  setError('')
                }}
              >
                {user.roleName}
              </button>
            ))}
          </div>
        </form>
      </section>
    </main>
  )
}
