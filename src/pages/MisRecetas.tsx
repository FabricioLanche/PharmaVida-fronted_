import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/AuthContext'
import Navbar from '../components/commons/Navbar'
import Footer from '../components/commons/Footer'
import { recetasService } from '../services/recetas_y_medicos/recetasAPI'
import { orquestadorService } from '../services/orquestador/orquestadorAPI'
import { type Receta } from '../types/receta.types'

function MisRecetas() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [recetas, setRecetas] = useState<Receta[]>([])
  const [loading, setLoading] = useState(true)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [archivoPDF, setArchivoPDF] = useState<File | null>(null)
  const [subiendo, setSubiendo] = useState(false)

  useEffect(() => {
    cargarMisRecetas()
  }, [])

  const cargarMisRecetas = async () => {
    setLoading(true)
    try {
      const response = await recetasService.listarRecetas({ page: 1, pagesize: 100 })
      // Filtrar solo las recetas del usuario actual
      const misRecetas = response.data.items.filter(
        (receta: Receta) => receta.pacienteDNI === user?.dni
      )
      setRecetas(misRecetas)
    } catch (error) {
      console.error('Error al cargar recetas:', error)
      alert('Error al cargar recetas')
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.type === 'application/pdf') {
        setArchivoPDF(file)
      } else {
        alert('Por favor selecciona un archivo PDF')
        e.target.value = ''
      }
    }
  }

  const handleSubirReceta = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!archivoPDF) {
      alert('Por favor selecciona un archivo PDF')
      return
    }

    setSubiendo(true)
    try {
      const formData = new FormData()
      formData.append('archivoPDF', archivoPDF)

      await recetasService.subirReceta(formData)
      alert('✅ Receta subida exitosamente')
      setArchivoPDF(null)
      setMostrarFormulario(false)
      cargarMisRecetas()
    } catch (error: any) {
      alert(`❌ Error al subir receta: ${error.message}`)
    } finally {
      setSubiendo(false)
    }
  }

  const verDetalle = (id: string) => {
    navigate(`/receta/${id}`)
  }

  const eliminarReceta = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta receta?')) {
      return
    }

    try {
      await recetasService.eliminarReceta(id)
      alert('✅ Receta eliminada exitosamente')
      cargarMisRecetas()
    } catch (error: any) {
      alert(`❌ Error al eliminar receta: ${error.message}`)
    }
  }

  const validarReceta = async (id: string) => {
    try {
      await orquestadorService.validarReceta(id)
      alert('✅ Receta validada exitosamente')
      cargarMisRecetas()
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || error.response?.data?.details?.error || error.message
      alert(`❌ Error al validar receta: ${errorMsg}`)
    }
  }

  return (
    <div>
      <Navbar />
      
      <main>
        <h1>Mis Recetas</h1>
        <p>DNI: {user?.dni}</p>

        <button 
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          style={{ marginBottom: '1rem' }}
        >
          {mostrarFormulario ? 'Cancelar' : '+ Subir Nueva Receta'}
        </button>

        {mostrarFormulario && (
          <form onSubmit={handleSubirReceta} style={{ border: '1px solid #ddd', padding: '1rem', marginBottom: '2rem' }}>
            <h3>Subir Receta Médica</h3>
            <label>Archivo PDF: </label>
            <input 
              type="file" 
              accept=".pdf"
              onChange={handleFileChange}
              disabled={subiendo}
              style={{ display: 'block', marginBottom: '1rem' }}
            />
            {archivoPDF && <p>Archivo seleccionado: {archivoPDF.name}</p>}
            <button 
              type="submit" 
              disabled={!archivoPDF || subiendo}
              style={{ marginRight: '0.5rem' }}
            >
              {subiendo ? 'Subiendo...' : 'Subir Receta'}
            </button>
          </form>
        )}

        {loading ? (
          <p>Cargando recetas...</p>
        ) : recetas.length > 0 ? (
          <div>
            {recetas.map(receta => (
              <div key={receta._id} style={{ border: '1px solid #ddd', padding: '1rem', marginBottom: '1rem' }}>
                <h3>Receta ID: {receta._id}</h3>
                <p>Médico CMP: {receta.medicoCMP}</p>
                <p>Fecha Emisión: {new Date(receta.fechaEmision).toLocaleDateString()}</p>
                <p>Estado: <strong>{receta.estadoValidacion}</strong></p>
                <p>Productos: {receta.productos.length}</p>
                <button onClick={() => verDetalle(receta._id)} style={{ marginRight: '0.5rem' }}>
                  Ver Detalle
                </button>
                {receta.estadoValidacion === 'pendiente' && (
                  <button 
                    onClick={() => validarReceta(receta._id)}
                    style={{ 
                      backgroundColor: '#27ae60', 
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      cursor: 'pointer',
                      marginRight: '0.5rem'
                    }}
                  >
                    Validar Receta
                  </button>
                )}
                <button 
                  onClick={() => eliminarReceta(receta._id)}
                  style={{ 
                    backgroundColor: '#e74c3c', 
                    color: 'white', 
                    border: 'none', 
                    padding: '0.5rem 1rem',
                    cursor: 'pointer'
                  }}
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p>No tienes recetas registradas</p>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default MisRecetas
