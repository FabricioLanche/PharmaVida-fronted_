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
        border: '1px solid #e8e8e8',
        borderRadius: '8px',
        padding: '1.25rem',
        backgroundColor: 'white',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.35rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.08)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.08)'
      }}
      >
        <h3 style={{ 
          margin: '0', 
          color: '#2c3e50',
          fontSize: '1rem',
          fontWeight: '600',
          lineHeight: '1.4'
        }}>
          {producto.nombre}
        </h3>
        
        <p style={{ 
          fontSize: '0.875rem',
          color: '#7f8c8d',
          margin: '0',
          lineHeight: '1.3'
        }}>
          {producto.tipo}
        </p>

        <p style={{ 
          fontSize: '0.95rem', 
          fontWeight: '400', 
          color: '#2c3e50',
          margin: '0.5rem 0 0 0'
        }}>
          Precio: S/ {producto.precio.toFixed(2)}
        </p>
      </div>
    </Link>
  )
}

export default ProductoCard