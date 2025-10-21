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
    useEmail: true
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
      let errorMessage = 'Error al iniciar sesión'
      
      if (err.response?.status === 401) {
        errorMessage = 'Email/DNI o contraseña incorrectos'
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
      <h1>Login</h1>
      
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            <input
              type="radio"
              checked={formData.useEmail}
              onChange={() => setFormData({ ...formData, useEmail: true, emailOrDni: '' })}
            />
            Usar Email
          </label>
          <label>
            <input
              type="radio"
              checked={!formData.useEmail}
              onChange={() => setFormData({ ...formData, useEmail: false, emailOrDni: '' })}
            />
            Usar DNI
          </label>
        </div>

        <div>
          <label>
            {formData.useEmail ? 'Email' : 'DNI'}
          </label>
          {formData.useEmail ? (
            <input
              type="email"
              value={formData.emailOrDni}
              onChange={(e) => setFormData({ ...formData, emailOrDni: e.target.value })}
              required
            />
          ) : (
            <input
              type="text"
              value={formData.emailOrDni}
              onChange={(e) => setFormData({ ...formData, emailOrDni: e.target.value })}
              pattern="[0-9]{8,12}"
              minLength={8}
              maxLength={12}
              required
              placeholder="8-12 dígitos"
            />
          )}
        </div>

        <div>
          <label>Password</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            minLength={6}
          />
        </div>

        {error && <div>{error}</div>}

        <button type="submit" disabled={loading}>
          {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </button>
      </form>

      <div>
        <Link to="/register">¿No tienes cuenta? Regístrate</Link>
        <br />
        <Link to="/">Volver al inicio</Link>
      </div>
    </div>
  )
}

export default Login
