import { Link } from 'react-router-dom'
import { type Producto } from '../../types/producto.types'

interface ProductoCardProps {
  producto: Producto
}

function ProductoCard({ producto }: ProductoCardProps) {
  return (
    <Link 
      to={`/producto/${producto.id}`}
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <div style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '1rem',
        backgroundColor: 'white',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        height: '100%'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
      >
        <h3 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50' }}>
          {producto.nombre}
        </h3>
        
        <div style={{ 
          display: 'inline-block',
          backgroundColor: '#3498db',
          color: 'white',
          padding: '0.25rem 0.5rem',
          borderRadius: '4px',
          fontSize: '0.85rem',
          marginBottom: '0.5rem'
        }}>
          {producto.tipo}
        </div>

        <p style={{ 
          fontSize: '1.5rem', 
          fontWeight: 'bold', 
          color: '#27ae60',
          margin: '0.5rem 0'
        }}>
          S/ {producto.precio.toFixed(2)}
        </p>

        <p style={{ 
          fontSize: '0.9rem',
          color: producto.stock > 0 ? '#27ae60' : '#e74c3c',
          margin: '0.5rem 0'
        }}>
          Stock: {producto.stock} unidades
        </p>

        {producto.requiere_receta && (
          <div style={{
            backgroundColor: '#f39c12',
            color: 'white',
            padding: '0.25rem 0.5rem',
            borderRadius: '4px',
            fontSize: '0.85rem',
            display: 'inline-block',
            marginTop: '0.5rem'
          }}>
            ⚕️ Requiere Receta
          </div>
        )}
      </div>
    </Link>
  )
}

export default ProductoCard
