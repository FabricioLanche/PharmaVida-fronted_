import { useState, useEffect, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/AuthContext'
import { usuariosService, type UpdateUserData } from '../services/usuarios_y_compras/usuariosAPI'
import Navbar from '../components/commons/Navbar'
import Footer from '../components/commons/Footer'

function Perfil() {
  const navigate = useNavigate()
  const { user, login, logout } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState<UpdateUserData>({
    nombre: '',
    apellido: '',
    email: '',
    password: ''
  })

  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        password: ''
      })
    }
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      // Preparar datos a enviar (solo los campos modificados)
      const dataToUpdate: UpdateUserData = {}
      
      if (formData.nombre !== user?.nombre) dataToUpdate.nombre = formData.nombre
      if (formData.apellido !== user?.apellido) dataToUpdate.apellido = formData.apellido
      if (formData.email !== user?.email) dataToUpdate.email = formData.email
      if (formData.password) dataToUpdate.password = formData.password

      if (Object.keys(dataToUpdate).length === 0) {
        setError('No se detectaron cambios')
        setLoading(false)
        return
      }

      await usuariosService.updateMyUser(dataToUpdate)
      
      // Actualizar información del usuario en el contexto
      const userInfoResponse = await usuariosService.getMyInfo()
      const userData = {
        nombre: userInfoResponse.data.nombre,
        apellido: userInfoResponse.data.apellido,
        email: userInfoResponse.data.email,
        dni: userInfoResponse.data.dni,
        role: userInfoResponse.data.role,
        distrito: userInfoResponse.data.distrito
      }
      
      const currentToken = localStorage.getItem('token')
      if (currentToken) {
        login(currentToken, userData)
      }
      
      setSuccess('Información actualizada correctamente')
      setIsEditing(false)
      setFormData({ ...formData, password: '' })
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar información')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.')) {
      return
    }

    setLoading(true)
    setError('')

    try {
      await usuariosService.deleteMyUser()
      logout()
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar cuenta')
      setLoading(false)
    }
  }

  const handleCancel = () => {
    if (user) {
      setFormData({
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        password: ''
      })
    }
    setIsEditing(false)
    setError('')
    setSuccess('')
  }

  if (!user) {
    return <div>Cargando...</div>
  }

  return (
    <div>
      <Navbar />
      
      <main>
        <h1>Mi Perfil</h1>

        {error && <div style={{ color: 'red' }}>{error}</div>}
        {success && <div style={{ color: 'green' }}>{success}</div>}

        {!isEditing ? (
          <div>
            <h2>Información Personal</h2>
            <p><strong>Nombre:</strong> {user.nombre}</p>
            <p><strong>Apellido:</strong> {user.apellido}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>DNI:</strong> {user.dni}</p>
            <p><strong>Distrito:</strong> {user.distrito}</p>
            <p><strong>Rol:</strong> {user.role}</p>

            <button onClick={() => setIsEditing(true)}>Editar Información</button>
            <button onClick={handleDelete} disabled={loading}>
              {loading ? 'Eliminando...' : 'Eliminar Cuenta'}
            </button>
          </div>
        ) : (
          <div>
            <h2>Editar Información</h2>
            <form onSubmit={handleSubmit}>
              <div>
                <label>Nombre</label>
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
                <label>Apellido</label>
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
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label>Nueva Contraseña (dejar en blanco para no cambiar)</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  minLength={6}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <button type="submit" disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
              <button type="button" onClick={handleCancel}>
                Cancelar
              </button>
            </form>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default Perfil
