import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/commons/Navbar'
import Footer from '../components/commons/Footer'
import { recetasService } from '../services/recetas_y_medicos/recetasAPI'
import { orquestadorService } from '../services/orquestador/orquestadorAPI'
import { type Receta, type Medico } from '../types/receta.types'

function AdminRecetas() {
  const navigate = useNavigate()
  const [seccion, setSeccion] = useState<'recetas' | 'medicos'>('recetas')
  
  // Estados para recetas
  const [recetas, setRecetas] = useState<Receta[]>([])
  const [loadingRecetas, setLoadingRecetas] = useState(false)
  const [filtroEstado, setFiltroEstado] = useState('')
  
  // Estados para médicos
  const [medicos, setMedicos] = useState<Medico[]>([])
  const [loadingMedicos, setLoadingMedicos] = useState(false)

  useEffect(() => {
    if (seccion === 'recetas') {
      cargarRecetas()
    } else {
      cargarMedicos()
    }
  }, [seccion, filtroEstado])

  const cargarRecetas = async () => {
    setLoadingRecetas(true)
    try {
      const params: any = { page: 1, pagesize: 50 }
      if (filtroEstado) params.estado = filtroEstado
      
      const response = await recetasService.listarRecetas(params)
      setRecetas(response.data.items)
    } catch (error) {
      console.error('Error al cargar recetas:', error)
      alert('Error al cargar recetas')
    } finally {
      setLoadingRecetas(false)
    }
  }

  const cargarMedicos = async () => {
    setLoadingMedicos(true)
    try {
      const response = await recetasService.listarMedicos({ page: 1, limit: 50 })
      setMedicos(response.data.items)
    } catch (error) {
      console.error('Error al cargar médicos:', error)
      alert('Error al cargar médicos')
    } finally {
      setLoadingMedicos(false)
    }
  }

  const validarReceta = async (id: string) => {
    try {
      await orquestadorService.validarReceta(id)
      alert('✅ Receta validada exitosamente')
      cargarRecetas()
    } catch (error: any) {
      alert(`❌ Error al validar receta: ${error.response?.data?.error || error.message}`)
    }
  }

  const eliminarReceta = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta receta?')) {
      return
    }

    try {
      await recetasService.eliminarReceta(id)
      alert('✅ Receta eliminada')
      cargarRecetas()
    } catch (error: any) {
      alert(`❌ Error al eliminar: ${error.message}`)
    }
  }

  return (
    <div>
      <Navbar />
      
      <main>
        <h1>Administración de Recetas y Médicos</h1>

        {/* Selector de sección */}
        <div>
          <button onClick={() => setSeccion('recetas')}>Recetas</button>
          <button onClick={() => setSeccion('medicos')}>Médicos</button>
        </div>

        {/* SECCIÓN RECETAS */}
        {seccion === 'recetas' && (
          <div>
            <h2>Gestión de Recetas</h2>
            
            <label>Filtrar por estado: </label>
            <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
              <option value="">Todas</option>
              <option value="pendiente">Pendiente</option>
              <option value="validada">Validada</option>
              <option value="rechazada">Rechazada</option>
            </select>

            {loadingRecetas ? (
              <p>Cargando recetas...</p>
            ) : (
              <table border={1} style={{ width: '100%', marginTop: '1rem' }}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>DNI Paciente</th>
                    <th>CMP Médico</th>
                    <th>Estado</th>
                    <th>Productos</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {recetas.map(receta => (
                    <tr key={receta._id}>
                      <td>{receta._id}</td>
                      <td>{receta.pacienteDNI}</td>
                      <td>{receta.medicoCMP}</td>
                      <td>{receta.estadoValidacion}</td>
                      <td>{receta.productos.length}</td>
                      <td>
                        <button onClick={() => navigate(`/receta/${receta._id}`)}>Ver</button>
                        {receta.estadoValidacion === 'pendiente' && (
                          <button 
                            onClick={() => validarReceta(receta._id)}
                            style={{ 
                              backgroundColor: '#27ae60', 
                              color: 'white',
                              marginLeft: '0.5rem',
                              padding: '0.3rem 0.8rem',
                              border: 'none',
                              cursor: 'pointer'
                            }}
                          >
                            Validar
                          </button>
                        )}
                        <button 
                          onClick={() => eliminarReceta(receta._id)}
                          style={{ 
                            backgroundColor: '#e74c3c', 
                            color: 'white', 
                            marginLeft: '0.5rem' 
                          }}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* SECCIÓN MÉDICOS */}
        {seccion === 'medicos' && (
          <div>
            <h2>Registro de Médicos</h2>

            {loadingMedicos ? (
              <p>Cargando médicos...</p>
            ) : (
              <table border={1} style={{ width: '100%', marginTop: '1rem' }}>
                <thead>
                  <tr>
                    <th>CMP</th>
                    <th>Nombre</th>
                    <th>Especialidad</th>
                    <th>Colegiatura Válida</th>
                  </tr>
                </thead>
                <tbody>
                  {medicos.map(medico => (
                    <tr key={medico._id}>
                      <td>{medico.cmp}</td>
                      <td>{medico.nombre}</td>
                      <td>{medico.especialidad}</td>
                      <td>{medico.colegiaturaValida ? 'Sí' : 'No'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default AdminRecetas
