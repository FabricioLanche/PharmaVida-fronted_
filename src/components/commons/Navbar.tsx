import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/AuthContext'
import { useCart } from '../../hooks/CartContext'

function Navbar() {
  const { user, logout, isAuthenticated } = useAuth()
  const { getTotalItems } = useCart()
  const isAdmin = user?.role === 'ADMIN'
  const totalItems = getTotalItems()

  return (
    <nav style={{ 
      backgroundColor: '#2c3e50', 
      padding: '1rem 2rem',
      marginBottom: '20px'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Logo */}
        <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '1.5rem', fontWeight: 'bold' }}>
          PharmaVida
        </Link>

        {/* Links de navegación */}
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          {/* Rutas públicas - Siempre visibles */}
          <Link to="/ofertas" style={{ color: 'white', textDecoration: 'none' }}>
            Ofertas
          </Link>
          
          <Link to="/carrito" style={{ color: 'white', textDecoration: 'none', position: 'relative' }}>
            🛒 Carrito
            {totalItems > 0 && (
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-10px',
                backgroundColor: '#e74c3c',
                color: 'white',
                borderRadius: '50%',
                padding: '2px 6px',
                fontSize: '0.75rem',
                fontWeight: 'bold'
              }}>
                {totalItems}
              </span>
            )}
          </Link>

          {/* Rutas para usuarios autenticados */}
          {isAuthenticated && (
            <>
              <Link to="/mis-compras" style={{ color: 'white', textDecoration: 'none' }}>
                Mis Compras
              </Link>
              <Link to="/recetas" style={{ color: 'white', textDecoration: 'none' }}>
                Mis Recetas
              </Link>
              <Link to="/perfil" style={{ color: 'white', textDecoration: 'none' }}>
                Perfil
              </Link>
            </>
          )}

          {/* Rutas solo para Admin */}
          {isAuthenticated && isAdmin && (
            <>
              <Link to="/admin/productos" style={{ color: '#3498db', textDecoration: 'none' }}>
                Admin Productos
              </Link>
              <Link to="/admin/recetas" style={{ color: '#3498db', textDecoration: 'none' }}>
                Admin Recetas
              </Link>
              <Link to="/admin/analitica" style={{ color: '#3498db', textDecoration: 'none' }}>
                Admin Analítica
              </Link>
            </>
          )}

          {/* Autenticación */}
          {!isAuthenticated ? (
            <>
              <Link to="/login" style={{ color: 'white', textDecoration: 'none' }}>
                Login
              </Link>
              <Link to="/register" style={{ 
                color: 'white', 
                textDecoration: 'none',
                backgroundColor: '#27ae60',
                padding: '0.5rem 1rem',
                borderRadius: '4px'
              }}>
                Registro
              </Link>
            </>
          ) : (
            <>
              <span style={{ color: 'white' }}>
                {user?.nombre} ({user?.role})
              </span>
              <button 
                onClick={logout}
                style={{
                  backgroundColor: '#e74c3c',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cerrar Sesión
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
