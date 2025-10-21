import { Link } from 'react-router-dom'
import { type Oferta } from '../../types/oferta.types'

interface OfertaCardProps {
  oferta: Oferta
}

function OfertaCard({ oferta }: OfertaCardProps) {
  const fechaVencimiento = new Date(oferta.fecha_vencimiento)
  const hoy = new Date()
  const diasRestantes = Math.ceil((fechaVencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
  const estaVencida = diasRestantes < 0
  const proximaVencer = diasRestantes <= 7 && diasRestantes >= 0

  const descuentoPromedio = oferta.detalles.reduce((acc, det) => acc + det.descuento, 0) / oferta.detalles.length

  return (
    <Link 
      to={`/oferta/${oferta.id}`}
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <div style={{
        border: estaVencida ? '2px solid #e74c3c' : '2px solid #f39c12',
        borderRadius: '8px',
        padding: '1.5rem',
        backgroundColor: estaVencida ? '#ffeaea' : 'white',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        height: '100%',
        opacity: estaVencida ? 0.7 : 1
      }}
      onMouseEnter={(e) => {
        if (!estaVencida) {
          e.currentTarget.style.transform = 'translateY(-4px)'
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(243, 156, 18, 0.3)'
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem'
        }}>
          <h3 style={{ margin: 0, color: '#2c3e50' }}>
            🎁 Oferta #{oferta.id}
          </h3>
          <div style={{
            backgroundColor: estaVencida ? '#e74c3c' : proximaVencer ? '#e67e22' : '#f39c12',
            color: 'white',
            padding: '0.25rem 0.75rem',
            borderRadius: '12px',
            fontSize: '0.85rem',
            fontWeight: 'bold'
          }}>
            {estaVencida ? '❌ Vencida' : proximaVencer ? '⏰ Por vencer' : '✨ Activa'}
          </div>
        </div>

        <div style={{
          backgroundColor: '#fff3cd',
          border: '1px solid #f39c12',
          borderRadius: '6px',
          padding: '0.75rem',
          marginBottom: '1rem'
        }}>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#856404' }}>
            <strong>📊 Descuento promedio:</strong> {descuentoPromedio.toFixed(1)}%
          </p>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>
            <strong>📦 Productos en oferta:</strong> {oferta.detalles.length}
          </p>
          <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>
            <strong>📅 Vence:</strong> {fechaVencimiento.toLocaleDateString('es-PE')}
          </p>
          {!estaVencida && (
            <p style={{ 
              margin: '0.25rem 0', 
              fontSize: '0.9rem',
              color: proximaVencer ? '#e67e22' : '#27ae60',
              fontWeight: proximaVencer ? 'bold' : 'normal'
            }}>
              <strong>⏱️ Días restantes:</strong> {diasRestantes}
            </p>
          )}
        </div>

        {!estaVencida && (
          <div style={{
            backgroundColor: '#27ae60',
            color: 'white',
            padding: '0.5rem',
            borderRadius: '4px',
            textAlign: 'center',
            fontSize: '0.9rem',
            fontWeight: 'bold'
          }}>
            👉 Ver productos en oferta
          </div>
        )}
      </div>
    </Link>
  )
}

export default OfertaCard
