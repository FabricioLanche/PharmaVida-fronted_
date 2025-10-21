import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/commons/Navbar'
import Footer from '../components/commons/Footer'
import { recetasService } from '../services/recetas_y_medicos/recetasAPI'
import { type Receta } from '../types/receta.types'

function RecetaDetalle() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [receta, setReceta] = useState<Receta | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      cargarReceta(id)
    }
  }, [id])

  const cargarReceta = async (recetaId: string) => {
    setLoading(true)
    try {
      const response = await recetasService.obtenerRecetaPorId(recetaId)
      setReceta(response.data)
    } catch (error) {
      console.error('Error al cargar receta:', error)
      alert('Error al cargar la receta')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div>
        <Navbar />
        <main>
          <p>Cargando receta...</p>
        </main>
        <Footer />
      </div>
    )
  }

  if (!receta) {
    return (
      <div>
        <Navbar />
        <main>
          <h2>Receta no encontrada</h2>
          <button onClick={() => navigate(-1)}>Volver</button>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div>
      <Navbar />
      
      <main>
        <button onClick={() => navigate(-1)}>← Volver</button>
        
        <h1>Detalle de Receta</h1>
        
        <div>
          <p><strong>ID:</strong> {receta._id}</p>
          <p><strong>DNI Paciente:</strong> {receta.pacienteDNI}</p>
          <p><strong>CMP Médico:</strong> {receta.medicoCMP}</p>
          <p><strong>Fecha Emisión:</strong> {new Date(receta.fechaEmision).toLocaleDateString()}</p>
          <p><strong>Estado:</strong> {receta.estadoValidacion}</p>
          <p><strong>Archivo PDF:</strong> {receta.archivoPDF}</p>
        </div>

        <h2>Productos Recetados</h2>
        <table border={1} style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Cantidad</th>
            </tr>
          </thead>
          <tbody>
            {receta.productos.map(producto => (
              <tr key={producto._id}>
                <td>{producto.id}</td>
                <td>{producto.nombre}</td>
                <td>{producto.cantidad}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>

      <Footer />
    </div>
  )
}

export default RecetaDetalle
