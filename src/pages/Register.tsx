// src/pages/Register.tsx
import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { usuariosService, type RegisterData } from '../services/usuarios_y_compras/usuariosAPI'
import { useAuth } from '../hooks/AuthContext'

function Register() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [formData, setFormData] = useState<RegisterData>({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    dni: '',
    distrito: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await usuariosService.register(formData)

      if (response.data.token) {
        localStorage.setItem('token', response.data.token)

        const userInfoResponse = await usuariosService.getMyInfo()
        const userData = {
          id: userInfoResponse.data.id,
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
      let msg = 'Error al registrarse'
      if (err.response?.status === 401) msg = 'El email o DNI ya están registrados'
      else if (err.response?.data?.message) msg = err.response.data.message
      else if (err.response?.data?.error) msg = err.response.data.error
      else if (err.message) msg = err.message
      setError(msg)
    } finally {
      setLoading(false)
    }
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
        {/* Título con barra verde */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ width: 4, height: 24, background: '#4caf50', marginRight: 12 }} />
          <h1 style={{ fontSize: '1.25rem', margin: 0, color: '#333', fontWeight: 600 }}>
            Registro
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Nombre */}
          <div style={{ marginBottom: '1.2rem' }}>
            <label
              htmlFor="nombre"
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                color: '#666',
              }}
            >
              Nombre
            </label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              value={formData.nombre}
              onChange={handleChange}
              required
              minLength={2}
              maxLength={50}
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

          {/* Apellido */}
          <div style={{ marginBottom: '1.2rem' }}>
            <label
              htmlFor="apellido"
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                color: '#666',
              }}
            >
              Apellido
            </label>
            <input
              id="apellido"
              name="apellido"
              type="text"
              value={formData.apellido}
              onChange={handleChange}
              required
              minLength={2}
              maxLength={50}
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

          {/* Email */}
          <div style={{ marginBottom: '1.2rem' }}>
            <label
              htmlFor="email"
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                color: '#666',
              }}
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
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
          </div>

          {/* Contraseña */}
          <div style={{ marginBottom: '1.2rem' }}>
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
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              maxLength={50}
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

          {/* DNI */}
          <div style={{ marginBottom: '1.2rem' }}>
            <label
              htmlFor="dni"
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                color: '#666',
              }}
            >
              DNI
            </label>
            <input
              id="dni"
              name="dni"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{8,12}"
              minLength={8}
              maxLength={12}
              value={formData.dni}
              onChange={handleChange}
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
          </div>

          {/* Distrito */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label
              htmlFor="distrito"
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                color: '#666',
              }}
            >
              Distrito
            </label>
            <input
              id="distrito"
              name="distrito"
              type="text"
              value={formData.distrito}
              onChange={handleChange}
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

          {/* Botón Registrar */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.85rem',
              background: loading ? '#ff8c42aa' : '#ff8c42',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              fontSize: '1rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Registrando...' : 'Registrar'}
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
            to="/login"
            style={{
              color: '#4caf50',
              textDecoration: 'none',
            }}
          >
            ¿Ya tienes cuenta? Inicia sesión
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Register