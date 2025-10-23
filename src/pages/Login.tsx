// src/pages/Login.tsx
import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { usuariosService } from '../services/usuarios_y_compras/usuariosAPI'
import { useAuth } from '../hooks/AuthContext'

function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [formData, setFormData] = useState({
    emailOrDni: '',
    password: '',
    useEmail: true,
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const loginData = formData.useEmail
        ? { email: formData.emailOrDni, password: formData.password }
        : { dni: formData.emailOrDni, password: formData.password }

      const response = await usuariosService.login(loginData)

      if (response.data.token) {
        localStorage.setItem('token', response.data.token)

        // Refrescar datos del usuario
        const userInfoResponse = await usuariosService.getMyInfo()
        const userData = {
          nombre: userInfoResponse.data.nombre,
          apellido: userInfoResponse.data.apellido,
          email: userInfoResponse.data.email,
          dni: userInfoResponse.data.dni,
          role: userInfoResponse.data.role,
          distrito: userInfoResponse.data.distrito,
        }

        login(response.data.token, userData)
        navigate('/')
      }
    } catch (err: any) {
      let errorMessage = 'Error al iniciar sesión'
      if (err.response?.status === 401) errorMessage = 'Email/DNI o contraseña incorrectos'
      else if (err.response?.data?.message) errorMessage = err.response.data.message
      else if (err.response?.data?.error) errorMessage = err.response.data.error
      else if (err.message) errorMessage = err.message
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const toggleMode = (useEmail: boolean) => {
    setFormData(prev => ({
      ...prev,
      useEmail,
      emailOrDni: '', // al cambiar modo, limpiamos el campo
    }))
    setError('')
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--pv-bg, #f5faf7)',
        padding: '2rem',
      }}
    >
      <div
        className="pv-card"
        style={{
          width: '100%',
          maxWidth: 520,
          padding: '1.5rem',
          borderRadius: 12,
        }}
      >
        {/* Título con barra lateral */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ width: 6, height: 28, background: '#f59e0b', borderRadius: 4, marginRight: 10 }} />
          <h1 style={{ fontSize: '1.4rem', margin: 0, color: '#1f2937' }}>Iniciar sesión</h1>
        </div>

        {/* Selector Email / DNI como pestañas */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            marginBottom: '1rem',
          }}
          role="tablist"
          aria-label="Modo de autenticación"
        >
          <button
            type="button"
            role="tab"
            aria-selected={formData.useEmail}
            className="btn"
            onClick={() => toggleMode(true)}
            style={{
              background: formData.useEmail ? '#f59e0b' : 'transparent',
              color: formData.useEmail ? '#fff' : '#374151',
              border: formData.useEmail ? 'none' : '1px solid #e5e7eb',
              padding: '.35rem .8rem',
              borderRadius: 8,
              fontWeight: 700,
            }}
          >
            Email
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={!formData.useEmail}
            className="btn"
            onClick={() => toggleMode(false)}
            style={{
              background: !formData.useEmail ? '#f59e0b' : 'transparent',
              color: !formData.useEmail ? '#fff' : '#374151',
              border: !formData.useEmail ? 'none' : '1px solid #e5e7eb',
              padding: '.35rem .8rem',
              borderRadius: 8,
              fontWeight: 700,
            }}
          >
            DNI
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Campo email/dni */}
          <div style={{ marginBottom: '0.85rem' }}>
            <label
              htmlFor="emailOrDni"
              className="form-label"
              style={{ display: 'block', marginBottom: 6 }}
            >
              {formData.useEmail ? 'Email' : 'DNI'}
            </label>

            {formData.useEmail ? (
              <input
                id="emailOrDni"
                type="email"
                className="form-control"
                placeholder="tucorreo@dominio.com"
                value={formData.emailOrDni}
                onChange={(e) => setFormData({ ...formData, emailOrDni: e.target.value })}
                required
                autoFocus
              />
            ) : (
              <input
                id="emailOrDni"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{8,12}"
                minLength={8}
                maxLength={12}
                className="form-control"
                placeholder="Ingresa tu DNI"
                value={formData.emailOrDni}
                onChange={(e) => setFormData({ ...formData, emailOrDni: e.target.value })}
                required
              />
            )}
          </div>

          {/* Password */}
          <div style={{ marginBottom: '0.85rem' }}>
            <label htmlFor="password" className="form-label" style={{ display: 'block', marginBottom: 6 }}>
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={6}
            />
          </div>

          {/* Error */}
          {error && (
            <div
              role="alert"
              style={{
                background: '#fee2e2',
                color: '#991b1b',
                border: '1px solid #fecaca',
                borderRadius: 8,
                padding: '.6rem .8rem',
                marginBottom: '.9rem',
                fontSize: '.95rem',
              }}
            >
              {error}
            </div>
          )}

          {/* Botón ingresar */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', fontWeight: 700 }}
          >
            {loading ? 'Iniciando…' : 'Ingresar'}
          </button>
        </form>

        {/* Footer de la tarjeta */}
        <div
          className="pv-card-footer"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            paddingTop: '1rem',
            borderTop: '1px solid var(--pv-border, #e5e7eb)',
            marginTop: '1rem',
          }}
        >
          <Link to="/register" className="pv-link">
            Crear cuenta
          </Link>
          <Link to="/" className="pv-link">
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Login
