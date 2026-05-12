import { useState } from 'react'
import './Login.css'
import { loginUser, registerUser } from '../api/client'

export default function Login({ onLogin, onBack }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
  })
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  const isRegister = mode === 'register'

  const updateField = (field, value) => {
    setForm((currentForm) => ({ ...currentForm, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setStatus('loading')
    setError('')

    try {
      const user = isRegister
        ? await registerUser(form)
        : await loginUser({ email: form.email, password: form.password })

      onLogin(user)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setStatus('idle')
    }
  }

  return (
    <main className="login-page">
      <section className="login-shell">
        <div className="login-copy">
          <button type="button" className="login-back" onClick={onBack}>
            Volver al inicio
          </button>
          <p className="login-eyebrow">Cuenta de usuario</p>
          <h1>{isRegister ? 'Crea tu cuenta de huesped' : 'Inicia sesion'}</h1>
          <p>
            El registro se guarda en PostgreSQL. Los huespedes ven su perfil; los
            gerentes y administradores tambien ven el acceso al dashboard.
          </p>
        </div>

        <form className="login-card" onSubmit={handleSubmit}>
          <div>
            <h2>{isRegister ? 'Registro' : 'Inicio de sesion'}</h2>
            <p>
              {isRegister
                ? 'Crea una cuenta nueva como huesped.'
                : 'Entra con un usuario registrado en la base de datos.'}
            </p>
          </div>

          <div className="login-tabs" aria-label="Seleccionar accion">
            <button
              type="button"
              className={mode === 'login' ? 'active' : ''}
              onClick={() => {
                setMode('login')
                setError('')
              }}
            >
              Iniciar sesion
            </button>
            <button
              type="button"
              className={mode === 'register' ? 'active' : ''}
              onClick={() => {
                setMode('register')
                setError('')
              }}
            >
              Registro
            </button>
          </div>

          {isRegister && (
            <>
              <label className="field-group">
                <span>Nombre completo</span>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(event) => updateField('fullName', event.target.value)}
                  autoComplete="name"
                  required
                />
              </label>

              <label className="field-group">
                <span>Telefono</span>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(event) => updateField('phone', event.target.value)}
                  autoComplete="tel"
                />
              </label>
            </>
          )}

          <label className="field-group">
            <span>Correo</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => updateField('email', event.target.value)}
              autoComplete="email"
              required
            />
          </label>

          <label className="field-group">
            <span>Contrasena</span>
            <input
              type="password"
              value={form.password}
              onChange={(event) => updateField('password', event.target.value)}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              minLength={isRegister ? 6 : undefined}
              required
            />
          </label>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="login-submit" disabled={status === 'loading'}>
            {status === 'loading'
              ? 'Procesando...'
              : isRegister
                ? 'Crear cuenta'
                : 'Entrar'}
          </button>
        </form>
      </section>
    </main>
  )
}
