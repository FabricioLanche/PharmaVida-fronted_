// src/pages/Register.tsx
import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { usuariosService, type RegisterData } from '../services/usuarios_y_compras/usuariosAPI'
import { useAuth } from '../hooks/AuthContext'

function Register() {
  const navigate = useNavigate()
  const { login } = useAuth()

  // Nota: dejamos "distrito" en el estado, pero no lo mostramos en el UI.
  // Si lo necesitas visible, descomenta el bloque marcado más abajo.
  const [formData, setFormData] = useState<RegisterData>({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    dni: '',
    distrito: '', // opcional en UI
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
      // Si distrito está vacío, no lo mandamos (algunos backends lo tratan como opcional)
      const payload: any = { ...formData }
      if (!payload.distrito) delete payload.distrito

      const response = await usuariosService.register(payload)

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
        background: 'var(--pv-bg, #f5faf7)',
        padding: '2rem',
      }}
    >
      <div className="pv-card" style={{ width: '100%', maxWidth: 560, padding: '1.5rem', borderRadius: 12 }}>
        {/* Título con barra verde */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ width: 6, height: 28, background: '#16a34a', borderRadius: 4, marginRight: 10 }} />
          <h1 style={{ fontSize: '1.4rem', margin: 0, color: '#1f2937' }}>Registro</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '0.85rem' }}>
            <label htmlFor="nombre" className="form-label" style={{ display: 'block', marginBottom: 6 }}>Nombre</label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              className="form-control"
              value={formData.nombre}
              onChange={handleChange}
              required
              minLength={2}
              maxLength={50}
              placeholder="Tu nombre"
            />
          </div>

          <div style={{ marginBottom: '0.85rem' }}>
            <label htmlFor="apellido" className="form-label" style={{ display: 'block', marginBottom: 6 }}>Apellido</label>
            <input
              id="apellido"
              name="apellido"
              type="text"
              className="form-control"
              value={formData.apellido}
              onChange={handleChange}
              required
              minLength={2}
              maxLength={50}
              placeholder="Tus apellidos"
            />
          </div>

          <div style={{ marginBottom: '0.85rem' }}>
            <label htmlFor="email" className="form-label" style={{ display: 'block', marginBottom: 6 }}>Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="tucorreo@dominio.com"
            />
          </div>

          <div style={{ marginBottom: '0.85rem' }}>
            <label htmlFor="password" className="form-label" style={{ display: 'block', marginBottom: 6 }}>Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              maxLength={50}
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div style={{ marginBottom: '0.85rem' }}>
            <label htmlFor="dni" className="form-label" style={{ display: 'block', marginBottom: 6 }}>DNI</label>
            <input
              id="dni"
              name="dni"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{8,12}"
              minLength={8}
              maxLength={12}
              className="form-control"
              value={formData.dni}
              onChange={handleChange}
              required
              placeholder="8-12 dígitos"
            />
          </div>

          {/*
          // Si quieres mostrar el campo Distrito como en otras pantallas:
          <div style={{ marginBottom: '0.85rem' }}>
            <label htmlFor="distrito" className="form-label" style={{ display: 'block', marginBottom: 6 }}>Distrito</label>
            <input
              id="distrito"
              name="distrito"
              type="text"
              className="form-control"
              value={formData.distrito}
              onChange={handleChange}
              minLength={3}
              maxLength={50}
              placeholder="Ej: San Borja"
            />
          </div>
          */}

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

          <button
            type="submit"
            className="btn"
            disabled={loading}
            style={{
              width: '100%',
              fontWeight: 700,
              background: loading ? '#f59f0b99' : '#f59e0b', // naranja
              color: '#fff',
              border: 'none',
            }}
          >
            {loading ? 'Registrando…' : 'Registrar'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1rem', color: '#065f46' }}>
          <Link to="/login" className="pv-link">¿Ya tienes cuenta? Inicia sesión</Link>
        </div>
      </div>
    </div>
  )
}

export default Register
