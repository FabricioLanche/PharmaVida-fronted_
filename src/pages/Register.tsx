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
    distrito: '',
    dni: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await usuariosService.register(formData)
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token)
        
        // Obtener información completa del usuario
        const userInfoResponse = await usuariosService.getMyInfo()
        const userData = {
          nombre: userInfoResponse.data.nombre,
          apellido: userInfoResponse.data.apellido,
          email: userInfoResponse.data.email,
          dni: userInfoResponse.data.dni,
          role: userInfoResponse.data.role,
          distrito: userInfoResponse.data.distrito
        }
        
        login(response.data.token, userData)
        navigate('/')
      }
    } catch (err: any) {
      let errorMessage = 'Error al registrarse'
      
      if (err.response?.status === 401) {
        errorMessage = 'El email o DNI ya están registrados'
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1>Registro</h1>
      
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nombre *</label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            minLength={2}
            maxLength={50}
          />
        </div>

        <div>
          <label>Apellido *</label>
          <input
            type="text"
            name="apellido"
            value={formData.apellido}
            onChange={handleChange}
            required
            minLength={2}
            maxLength={50}
          />
        </div>

        <div>
          <label>Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>DNI *</label>
          <input
            type="text"
            name="dni"
            value={formData.dni}
            onChange={handleChange}
            pattern="[0-9]{8,12}"
            minLength={8}
            maxLength={12}
            required
            placeholder="8-12 dígitos"
          />
        </div>

        <div>
          <label>Distrito *</label>
          <input
            type="text"
            name="distrito"
            value={formData.distrito}
            onChange={handleChange}
            required
            minLength={3}
            maxLength={50}
          />
        </div>

        <div>
          <label>Password *</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={6}
            maxLength={50}
            placeholder="Mínimo 6 caracteres"
          />
        </div>

        {error && <div>{error}</div>}

        <button type="submit" disabled={loading}>
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>
      </form>

      <div>
        <Link to="/login">¿Ya tienes cuenta? Inicia sesión</Link>
        <br />
        <Link to="/">Volver al inicio</Link>
      </div>
    </div>
  )
}

export default Register
