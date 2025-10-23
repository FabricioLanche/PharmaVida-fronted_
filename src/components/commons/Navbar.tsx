import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/AuthContext'
import { useCart } from '../../hooks/CartContext'

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const { items, itemsCount } = useCart() as any

  const role = String((user as any)?.role ?? (user as any)?.rol ?? '').toUpperCase()
  const isAdmin = role === 'ADMIN'

  const cartQty = useMemo(() => {
    if (typeof itemsCount === 'number') return itemsCount
    if (Array.isArray(items)) {
      return items.reduce((acc: number, it: any) => acc + (Number(it.cantidad) || 0), 0)
    }
    return 0
  }, [items, itemsCount])

  const [openAdmin, setOpenAdmin] = useState(false)
  const adminRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (openAdmin && adminRef.current && !adminRef.current.contains(e.target as Node)) {
        setOpenAdmin(false)
      }
    }
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpenAdmin(false) }
    document.addEventListener('click', onDocClick)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('click', onDocClick)
      document.removeEventListener('keydown', onEsc)
    }
  }, [openAdmin])

  const navClass = ({ isActive }: { isActive: boolean }) => `pv-link${isActive ? ' active' : ''}`
  const cartClass = ({ isActive }: { isActive: boolean }) => `pv-link pv-cart-link${isActive ? ' active' : ''}`

  return (
    <header className="pv-nav">
      <div className="pv-nav-inner">
        <div className="pv-left">
          <Link to="/" className="pv-brand">
            Pharma<span className="brand-strong">Vida</span>
          </Link>

          {/* Navegación principal: ahora con Ofertas al lado de Recetas */}
          <nav className="pv-nav-links">
            <NavLink to="/" className={navClass}>Inicio</NavLink>
            <NavLink to="/recetas" className={navClass}>Recetas</NavLink>
            <NavLink to="/ofertas" className={navClass}>Ofertas</NavLink>
          </nav>
        </div>

        <div className="pv-nav-right">
          <NavLink to="/carrito" className={cartClass} aria-label="Carrito">
            Carrito
            {cartQty > 0 && <span className="pv-badge">{cartQty}</span>}
          </NavLink>

          {isAuthenticated ? (
            <>
              <NavLink to="/perfil" className={navClass}>Perfil</NavLink>

              {isAdmin && (
                <div className="pv-dropdown" ref={adminRef}>
                  {/* Botón naranja sin flecha visual extra */}
                  <button
                    type="button"
                    className="pv-admin-trigger"
                    onClick={() => setOpenAdmin(v => !v)}
                    aria-haspopup="menu"
                    aria-expanded={openAdmin}
                  >
                    Admin
                  </button>

                  {openAdmin && (
                    <div className="pv-dropdown-menu" role="menu">
                      <NavLink to="/admin/productos" className="pv-dropdown-item" onClick={() => setOpenAdmin(false)}>
                        Productos
                      </NavLink>
                      <NavLink to="/admin/ofertas" className="pv-dropdown-item" onClick={() => setOpenAdmin(false)}>
                        Ofertas
                      </NavLink>
                      <NavLink to="/admin/recetas" className="pv-dropdown-item" onClick={() => setOpenAdmin(false)}>
                        Recetas
                      </NavLink>
                      <NavLink to="/admin/analitica" className="pv-dropdown-item" onClick={() => setOpenAdmin(false)}>
                        Analítica
                      </NavLink>
                    </div>
                  )}
                </div>
              )}

              <button className="btn btn-primary" onClick={logout}>Salir</button>
            </>
          ) : (
            <NavLink to="/login" className={navClass}>Iniciar sesión</NavLink>
          )}
        </div>
      </div>
    </header>
  )
}
