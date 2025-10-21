import { useState, useEffect } from 'react'
import Navbar from '../components/commons/Navbar'
import Footer from '../components/commons/Footer'
import OfertaCard from '../components/ofertas/OfertaCard'
import { ofertasService } from '../services/productos_y_ofertas/ofertasAPI'
import { type Oferta } from '../types/oferta.types'

function Ofertas() {
  const [ofertas, setOfertas] = useState<Oferta[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<'todas' | 'activas' | 'vencidas'>('activas')

  useEffect(() => {
    cargarOfertas()
  }, [])

  const cargarOfertas = async () => {
    setLoading(true)
    try {
      const response = await ofertasService.listar()
      setOfertas(response.data)
    } catch (error) {
      console.error('Error al cargar ofertas:', error)
      alert('Error al cargar ofertas')
    } finally {
      setLoading(false)
    }
  }

  const ofertasFiltradas = ofertas.filter(oferta => {
    const fechaVencimiento = new Date(oferta.fecha_vencimiento)
    const hoy = new Date()
    const estaVencida = fechaVencimiento < hoy

    if (filtro === 'activas') return !estaVencida
    if (filtro === 'vencidas') return estaVencida
    return true
  })

  const ofertasActivas = ofertas.filter(o => new Date(o.fecha_vencimiento) >= new Date()).length
  const ofertasVencidas = ofertas.filter(o => new Date(o.fecha_vencimiento) < new Date()).length

  return (
    <div>
      <Navbar />
      
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <h1 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '0.5rem' }}>
          🎁 Ofertas Especiales
        </h1>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '2rem' }}>
          Descubre nuestras mejores ofertas en productos farmacéuticos
        </p>

        {/* Estadísticas */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            backgroundColor: '#d4edda',
            border: '1px solid #c3e6cb',
            borderRadius: '8px',
            padding: '1rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#155724' }}>
              {ofertasActivas}
            </div>
            <div style={{ color: '#155724' }}>Ofertas Activas</div>
          </div>
          
          <div style={{
            backgroundColor: '#f8d7da',
            border: '1px solid #f5c6cb',
            borderRadius: '8px',
            padding: '1rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#721c24' }}>
              {ofertasVencidas}
            </div>
            <div style={{ color: '#721c24' }}>Ofertas Vencidas</div>
          </div>

          <div style={{
            backgroundColor: '#d1ecf1',
            border: '1px solid #bee5eb',
            borderRadius: '8px',
            padding: '1rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0c5460' }}>
              {ofertas.reduce((acc, o) => acc + o.detalles.length, 0)}
            </div>
            <div style={{ color: '#0c5460' }}>Productos en Oferta</div>
          </div>
        </div>

        {/* Filtros */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          marginBottom: '2rem',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => setFiltro('todas')}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: filtro === 'todas' ? '#2c3e50' : 'white',
              color: filtro === 'todas' ? 'white' : '#2c3e50',
              border: `2px solid ${filtro === 'todas' ? '#2c3e50' : '#ddd'}`,
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Todas ({ofertas.length})
          </button>
          <button
            onClick={() => setFiltro('activas')}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: filtro === 'activas' ? '#27ae60' : 'white',
              color: filtro === 'activas' ? 'white' : '#27ae60',
              border: `2px solid ${filtro === 'activas' ? '#27ae60' : '#ddd'}`,
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Activas ({ofertasActivas})
          </button>
          <button
            onClick={() => setFiltro('vencidas')}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: filtro === 'vencidas' ? '#e74c3c' : 'white',
              color: filtro === 'vencidas' ? 'white' : '#e74c3c',
              border: `2px solid ${filtro === 'vencidas' ? '#e74c3c' : '#ddd'}`,
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Vencidas ({ofertasVencidas})
          </button>
        </div>

        {/* Listado de ofertas */}
        {loading ? (
          <p style={{ textAlign: 'center', fontSize: '1.2rem' }}>Cargando ofertas...</p>
        ) : ofertasFiltradas.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.5rem'
          }}>
            {ofertasFiltradas.map(oferta => (
              <OfertaCard key={oferta.id} oferta={oferta} />
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px'
          }}>
            <p style={{ fontSize: '1.2rem', color: '#666' }}>
              No hay ofertas {filtro === 'activas' ? 'activas' : filtro === 'vencidas' ? 'vencidas' : 'disponibles'}
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default Ofertas
