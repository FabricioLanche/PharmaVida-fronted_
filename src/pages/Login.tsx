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
    useEmail: false, // Comenzamos con DNI como en la imagen
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
      emailOrDni: '',
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
        background: '#f5f5f5',
        padding: '1rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 380,
          background: '#fff',
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          padding: '2rem 1.5rem',
        }}
      >
        {/* Título con barra naranja */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ width: 4, height: 24, background: '#ff8c42', marginRight: 12 }} />
          <h1 style={{ fontSize: '1.25rem', margin: 0, color: '#333', fontWeight: 600 }}>
            Iniciar sesión
          </h1>
        </div>

        {/* Pestañas Email / DNI */}
        <div
          style={{
            display: 'inline-flex',
            border: '1px solid #ddd',
            borderRadius: 4,
            overflow: 'hidden',
            marginBottom: '1.5rem',
          }}
        >
          <button
            type="button"
            onClick={() => toggleMode(true)}
            style={{
              padding: '0.4rem 1.2rem',
              background: formData.useEmail ? '#fff' : '#f5f5f5',
              border: 'none',
              borderRight: '1px solid #ddd',
              color: '#333',
              fontSize: '0.9rem',
              fontWeight: formData.useEmail ? 600 : 400,
              cursor: 'pointer',
            }}
          >
            Email
          </button>
          <button
            type="button"
            onClick={() => toggleMode(false)}
            style={{
              padding: '0.4rem 1.2rem',
              background: !formData.useEmail ? '#fff' : '#f5f5f5',
              border: 'none',
              color: '#333',
              fontSize: '0.9rem',
              fontWeight: !formData.useEmail ? 600 : 400,
              cursor: 'pointer',
            }}
          >
            DNI
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Campo DNI/Email */}
          <div style={{ marginBottom: '1.2rem' }}>
            <label
              htmlFor="emailOrDni"
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                color: '#666',
              }}
            >
              {formData.useEmail ? 'Email' : 'DNI'}
            </label>
            {formData.useEmail ? (
              <input
                id="emailOrDni"
                type="email"
                value={formData.emailOrDni}
                onChange={(e) => setFormData({ ...formData, emailOrDni: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e0e0e0',
                  borderRadius: 4,
                  fontSize: '0.95rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            ) : (
              <input
                id="emailOrDni"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{8,12}"
                minLength={8}
                maxLength={12}
                value={formData.emailOrDni}
                onChange={(e) => setFormData({ ...formData, emailOrDni: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e0e0e0',
                  borderRadius: 4,
                  fontSize: '0.95rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            )}
          </div>

          {/* Campo Contraseña */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label
              htmlFor="password"
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                color: '#666',
              }}
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={6}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e0e0e0',
                borderRadius: 4,
                fontSize: '0.95rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
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
                borderRadius: 4,
                padding: '0.75rem',
                marginBottom: '1rem',
                fontSize: '0.875rem',
              }}
            >
              {error}
            </div>
          )}

          {/* Botón Ingresar */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.85rem',
              background: loading ? '#4caf50aa' : '#4caf50',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              fontSize: '1rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Iniciando...' : 'Ingresar'}
          </button>
        </form>

        {/* Footer */}
        <div
          style={{
            marginTop: '1.5rem',
            textAlign: 'center',
            fontSize: '0.875rem',
          }}
        >
          <Link
            to="/register"
            style={{
              color: '#ff8c42',
              textDecoration: 'none',
              marginRight: '0.5rem',
            }}
          >
            Crear cuenta
          </Link>
          <span style={{ color: '#999' }}>•</span>
          <Link
            to="/"
            style={{
              color: '#4caf50',
              textDecoration: 'none',
              marginLeft: '0.5rem',
            }}
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Login